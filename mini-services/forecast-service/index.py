"""
Flight Monitor — TimesFM Forecast Service
==========================================

A small FastAPI service that wraps Google Research's TimesFM 2.5 (200M params)
time-series foundation model to forecast flight prices.

Endpoints:
  GET  /health              — liveness + model status
  POST /forecast            — forecast future prices from history

If TimesFM cannot be loaded (missing deps, no weights, OOM, etc.), the service
falls back to a robust statistical forecaster (STL-like decomposition) that
produces the same response shape — so callers always get a usable forecast.

Run:
    cd mini-services/forecast-service
    pip install fastapi uvicorn jax jaxlib einshape flax jaxtyping timesfm numpy
    python index.py
"""
from __future__ import annotations

import os
import sys
import time
import math
import json
import traceback
import numpy as np
from typing import List, Optional, Dict, Any

# --- Server ---
HOST = "0.0.0.0"
PORT = 3030

# --- TimesFM lazy loader ---
_TSF = None          # cached model instance
_TSF_LOAD_ERR = None # last load error
_TSF_LOAD_TRIED = False

DEFAULT_QUANTILES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]


def _try_load_timesfm():
    """Attempt to load TimesFM 2.5 (flax backend). Returns model or None."""
    global _TSF, _TSF_LOAD_ERR, _TSF_LOAD_TRIED
    if _TSF_LOAD_TRIED:
        return _TSF
    _TSF_LOAD_TRIED = True
    try:
        from timesfm.timesfm_2p5 import timesfm_2p5_flax as tflax
        from timesfm.configs import ForecastConfig

        print("[forecast] loading TimesFM 2.5 200M (flax)…", flush=True)
        t0 = time.time()
        model = tflax.TimesFM_2p5_200M_flax()

        cfg = ForecastConfig(
            max_context=512,
            max_horizon=32,
            normalize_inputs=True,
            window_size=32,
            per_core_batch_size=1,
            use_continuous_quantile_head=True,
            infer_is_positive=True,
            fix_quantile_crossing=True,
        )
        model.compile(forecast_config=cfg, dryrun=False)
        dt = time.time() - t0
        print(f"[forecast] TimesFM ready in {dt:.1f}s", flush=True)
        _TSF = model
        return _TSF
    except Exception as e:
        _TSF_LOAD_ERR = f"{type(e).__name__}: {e}"
        print(f"[forecast] TimesFM unavailable — falling back to statistical forecast. Reason: {_TSF_LOAD_ERR}", flush=True)
        traceback.print_exc()
        return None


def forecast_with_timesfm(history: List[float], horizon: int) -> Dict[str, Any]:
    """Run TimesFM forecast. Raises if model unavailable."""
    model = _try_load_timesfm()
    if model is None:
        raise RuntimeError(f"TimesFM not loaded: {_TSF_LOAD_ERR}")

    arr = np.asarray(history, dtype=np.float32)
    if arr.size < 8:
        # pad with mean if too short
        pad = np.full(8 - arr.size, float(arr.mean()) if arr.size else 0.0, dtype=np.float32)
        arr = np.concatenate([pad, arr])

    # Replace NaNs/inf
    arr = np.nan_to_num(arr, nan=float(np.nanmedian(arr)) if arr.size else 0.0,
                        posinf=float(arr.max()) if arr.size else 0.0,
                        neginf=float(arr.min()) if arr.size else 0.0)

    mu_raw, sigma_raw = model.forecast(horizon=horizon, inputs=[arr])
    mu = np.asarray(mu_raw).flatten()[:horizon]

    # sigma is shape (batch, horizon, num_quantiles) — extract bounds
    sigma = np.asarray(sigma_raw)
    if sigma.ndim == 3:
        quantiles = sigma[0]  # (horizon, num_quantiles)
    elif sigma.ndim == 2:
        quantiles = sigma
    else:
        # fallback: flatten and reshape assuming 10 quantiles
        nq = sigma.size // horizon if horizon else 1
        quantiles = sigma.reshape(horizon, nq)

    # Lower = first quantile, upper = last quantile
    lower = quantiles[:, 0].flatten()[:horizon]
    upper = quantiles[:, -1].flatten()[:horizon]

    # Make sure bounds contain mu (sometimes quantiles are wider than median)
    lower = np.minimum(lower, mu)
    upper = np.maximum(upper, mu)

    return {
        "forecast": mu.tolist(),
        "lower": lower.tolist(),
        "upper": upper.tolist(),
        "model": "timesfm-2.5-200M-flax",
    }


# --- Statistical fallback forecaster ---
# Mimics TimesFM output shape. Uses trend + weekly seasonality decomposition
# with simple OLS, plus a confidence band derived from residual std.

def forecast_statistical(history: List[float], horizon: int) -> Dict[str, Any]:
    arr = np.asarray(history, dtype=np.float64)
    n = arr.size
    if n < 3:
        # Not enough data — flat forecast
        flat = [float(arr[-1])] * horizon if n else [0.0] * horizon
        return {
            "forecast": flat,
            "lower": flat,
            "upper": flat,
            "model": "statistical-flat",
        }

    # Log transform for positivity (prices > 0)
    log_arr = np.log(np.maximum(arr, 1.0))
    t = np.arange(n, dtype=np.float64)

    # Design matrix: intercept + linear trend + weekly sine/cosine
    weekly_period = 7.0
    X = np.column_stack([
        np.ones(n),
        t,
        np.sin(2 * np.pi * t / weekly_period),
        np.cos(2 * np.pi * t / weekly_period),
    ])

    # OLS fit
    try:
        coef, residuals, rank, sv = np.linalg.lstsq(X, log_arr, rcond=None)
        fitted = X @ coef
        resid = log_arr - fitted
        sigma = float(np.std(resid)) if resid.size > 1 else 0.05
    except Exception:
        coef = np.array([log_arr.mean(), 0.0, 0.0, 0.0])
        sigma = 0.05

    # Forecast
    t_future = np.arange(n, n + horizon, dtype=np.float64)
    Xf = np.column_stack([
        np.ones(horizon),
        t_future,
        np.sin(2 * np.pi * t_future / weekly_period),
        np.cos(2 * np.pi * t_future / weekly_period),
    ])
    log_fc = Xf @ coef
    fc = np.exp(log_fc)

    # Confidence band — grows with horizon (sigma * sqrt(h))
    z = 1.28  # ~80% interval
    log_lower = log_fc - z * sigma * np.sqrt(np.arange(1, horizon + 1) * 0.3 + 1)
    log_upper = log_fc + z * sigma * np.sqrt(np.arange(1, horizon + 1) * 0.3 + 1)
    lower = np.exp(log_lower)
    upper = np.exp(log_upper)

    return {
        "forecast": fc.tolist(),
        "lower": lower.tolist(),
        "upper": upper.tolist(),
        "model": "statistical-stl-decomposition",
    }


# --- Recommendation engine ---
def build_recommendation(
    history: List[float],
    forecast: List[float],
    lower: List[float],
    upper: List[float],
    days_to_departure: Optional[int],
    lang: str = "en",
) -> Dict[str, Any]:
    """Decide buy_now / wait / monitor based on forecast trend.

    Note: The reasoning text is generated in English here. The TS API route
    has full multilingual templates (en/ru/ka/he/ar/es) and will override
    the reasoning with the user's selected language.
    """
    if not history or not forecast:
        return {
            "recommendation": "monitor",
            "confidence": 30,
            "expected_change_pct": 0.0,
            "reasoning": "אין מספיק נתונים להמלצה.",
        }

    current = float(history[-1])
    fc_arr = np.asarray(forecast)
    horizon = fc_arr.size
    if horizon == 0:
        return {
            "recommendation": "monitor",
            "confidence": 30,
            "expected_change_pct": 0.0,
            "reasoning": "אין תחזית.",
        }

    avg_fc = float(fc_arr.mean())
    min_fc = float(fc_arr.min())
    max_fc = float(fc_arr.max())
    end_fc = float(fc_arr[-1])

    expected_change_pct = ((avg_fc - current) / current) * 100.0

    # Historical stats
    h_arr = np.asarray(history, dtype=np.float64)
    h_mean = float(h_arr.mean())
    h_min = float(h_arr.min())
    h_std = float(h_arr.std())

    # Is current price already at/below historical low?
    near_low = current <= h_min * 1.03
    # Is current price significantly below historical mean?
    below_mean = current < h_mean * 0.9
    # Is forecast trending down (more than 3% below current)?
    fc_dropping = avg_fc < current * 0.97
    # Is forecast trending up?
    fc_rising = avg_fc > current * 1.03

    # Confidence: based on historical volatility relative to current price
    cv = h_std / max(h_mean, 1e-9)
    if cv < 0.08:
        base_conf = 82
    elif cv < 0.15:
        base_conf = 68
    elif cv < 0.25:
        base_conf = 54
    else:
        base_conf = 40

    # Tight forecast band = higher confidence
    band_width = float(np.mean(np.asarray(upper) - np.asarray(lower)))
    band_ratio = band_width / max(current, 1e-9)
    if band_ratio < 0.10:
        base_conf = min(95, base_conf + 8)
    elif band_ratio > 0.30:
        base_conf = max(20, base_conf - 12)

    # Days-to-departure heuristic: closer to departure = less likely to drop
    dtd = days_to_departure if days_to_departure is not None else 60
    if dtd < 21:
        # Last-minute — prices rarely drop
        if near_low or below_mean:
            rec = "buy_now"
            reasoning = f"המחיר נמוך ({current:.0f}$) ו-{dtd} ימים בלבד לטיסה. לרוב המחירים רק עולים בשלב זה — כדאי להזמין עכשיו."
            base_conf = min(95, base_conf + 8)
        elif fc_rising:
            rec = "buy_now"
            reasoning = f"התחזית צופה עליית מחיר (~{expected_change_pct:+.1f}%) ו-{dtd} ימים לטיסה — כדאי להזמין עכשיו לפני עלייה נוספת."
        else:
            rec = "monitor"
            reasoning = f"המחיר לא נמוך במיוחד, ו-{dtd} ימים לטיסה. מומלץ לעקוב — אם יורד ב-3-5 ימים הקרובים, להזמין מיד."
            base_conf = max(30, base_conf - 10)
    elif dtd < 60:
        # Sweet spot — forecasts meaningful
        if near_low:
            rec = "buy_now"
            reasoning = f"המחיר קרוב לשפל היסטורי ({current:.0f}$) ויש עוד {dtd} ימים. סיכוי נמוך לירידה משמעותית — כדאי להזמין."
            base_conf = min(92, base_conf + 5)
        elif fc_dropping:
            rec = "wait"
            reasoning = f"התחזית צופה ירידה של ~{abs(expected_change_pct):.1f}% ב-{horizon} הימים הקרובים. כדאי לחכות עוד מספר ימים — אבל לא לדחות יותר מ-{dtd//3} ימים."
            base_conf = min(85, base_conf + 3)
        elif fc_rising:
            rec = "buy_now"
            reasoning = f"התחזית צופה עלייה של ~{expected_change_pct:.1f}% והמחיר כבר לא נמוך. כדאי להזמין בקרוב לפני עלייה נוספת."
        else:
            rec = "monitor"
            reasoning = f"התחזית יציבה יחסית (שינוי {expected_change_pct:+.1f}%). יש זמן ({dtd} ימים) — כדאי להמשיך לעקוב ולהזמין אם נופל מתחת ל-{min_fc:.0f}$."
    else:
        # Far from departure — patience pays
        if fc_dropping and not near_low:
            rec = "wait"
            reasoning = f"התחזית צופה ירידה (~{abs(expected_change_pct):.1f}%) ויש עוד {dtd} ימים — בהחלט כדאי לחכות."
        elif near_low:
            rec = "buy_now"
            reasoning = f"המחיר בשפל היסטורי ({current:.0f}$). למרות שיש זמן ({dtd} ימים), שפלים כאלה נדירים — כדאי לנצל."
        else:
            rec = "monitor"
            reasoning = f"עדיין רחוק מהטיסה ({dtd} ימים). המחיר לא מיוחד כרגע — כדאי להמשיך לעקוב. רף הזמנה מומלץ: מתחת ל-{h_min:.0f}$."

    return {
        "recommendation": rec,
        "confidence": int(base_conf),
        "expected_change_pct": round(expected_change_pct, 1),
        "reasoning": reasoning,
    }


# --- HTTP server (stdlib only — no FastAPI dependency required) ---
def _json_response(status: int, body: Dict[str, Any]) -> str:
    return json.dumps(body, ensure_ascii=False)


def _parse_body(raw: bytes) -> Dict[str, Any]:
    try:
        return json.loads(raw.decode("utf-8")) if raw else {}
    except Exception:
        return {}


def handle_health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "model_loaded": _TSF is not None,
        "model_error": _TSF_LOAD_ERR,
        "load_attempted": _TSF_LOAD_TRIED,
    }


def handle_forecast(body: Dict[str, Any]) -> Dict[str, Any]:
    history_raw = body.get("history") or body.get("points") or []
    # Accept either list of numbers or list of {ts, price, ...}
    history: List[float] = []
    for item in history_raw:
        if isinstance(item, (int, float)):
            history.append(float(item))
        elif isinstance(item, dict):
            if "price" in item:
                history.append(float(item["price"]))
            elif "value" in item:
                history.append(float(item["value"]))
    if not history:
        return {"error": "history is empty or could not be parsed"}
    horizon = int(body.get("horizon", 14))
    horizon = max(1, min(60, horizon))
    route_id = body.get("routeId")
    days_to_departure = body.get("daysToDeparture")
    if isinstance(days_to_departure, str):
        try:
            days_to_departure = int(days_to_departure)
        except Exception:
            days_to_departure = None

    t0 = time.time()
    used_timesfm = False
    try:
        # Try TimesFM first
        model = _try_load_timesfm()
        if model is not None:
            result = forecast_with_timesfm(history, horizon)
            used_timesfm = True
        else:
            raise RuntimeError("TimesFM not loaded")
    except Exception as e:
        print(f"[forecast] TimesFM failed, using statistical: {e}", flush=True)
        result = forecast_statistical(history, horizon)

    lang = body.get("lang", "en")
    if lang not in ("en", "ru", "ka", "he", "ar", "es"):
        lang = "en"

    rec = build_recommendation(
        history,
        result["forecast"],
        result["lower"],
        result["upper"],
        days_to_departure,
        lang,
    )

    elapsed = time.time() - t0
    return {
        "routeId": route_id,
        "horizonDays": horizon,
        "model": result["model"],
        "forecast": result["forecast"],
        "lower": result["lower"],
        "upper": result["upper"],
        "recommendation": rec["recommendation"],
        "confidence": rec["confidence"],
        "expectedChangePct": rec["expected_change_pct"],
        "reasoning": rec["reasoning"],
        "elapsedMs": int(elapsed * 1000),
        "usedTimesFM": used_timesfm,
    }


def main():
    import http.server
    import socketserver

    # Try loading TimesFM at startup (in background thread to not block port)
    import threading
    threading.Thread(target=_try_load_timesfm, daemon=True).start()

    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            print(f"[{self.command}] {self.path} — {fmt % args}", flush=True)

        def _send_json(self, status: int, body: Dict[str, Any]):
            data = json.dumps(body, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(data)

        def do_OPTIONS(self):
            self._send_json(204, {})

        def do_GET(self):
            if self.path == "/health":
                self._send_json(200, handle_health())
            else:
                self._send_json(404, {"error": "not found"})

        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0) or 0)
            body = _parse_body(self.rfile.read(length)) if length else {}
            if self.path == "/forecast":
                try:
                    self._send_json(200, handle_forecast(body))
                except Exception as e:
                    traceback.print_exc()
                    self._send_json(500, {"error": str(e)})
            else:
                self._send_json(404, {"error": "not found"})

    socketserver.TCPServer.allow_reuse_address = True
    print(f"[forecast] listening on http://{HOST}:{PORT}", flush=True)
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()

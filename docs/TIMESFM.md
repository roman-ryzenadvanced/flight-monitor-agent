# TimesFM Integration Guide

## Overview

This project uses [TimesFM 2.5](https://github.com/google-research/timesfm) (200M parameters) from Google Research for flight price forecasting. TimesFM is a time-series foundation model that produces quantile forecasts with confidence bands.

## Architecture

```
Next.js /api/forecast route
        ↓
    fetch(localhost:3030/forecast)
        ↓
Python Forecast Service (port 3030)
        ↓
    TimesFM 2.5 (Flax/JAX backend)
        ↓
    Returns: forecast + quantile bands
        ↓
Recommendation engine (6-language reasoning)
```

## Setup

### Prerequisites

```bash
pip install timesfm jax jaxlib einshape flax jaxtyping numpy
```

### Start the Python Service

```bash
cd mini-services/forecast-service
python index.py
```

The service starts on port 3030 and loads TimesFM 2.5 at startup (takes ~2 seconds).

### Endpoints

#### `GET /health`
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_error": null,
  "load_attempted": true
}
```

#### `POST /forecast`
```json
// Request
{
  "history": [200, 210, 215, 205, 195],
  "horizon": 14,
  "lang": "es",
  "daysToDeparture": 45
}

// Response
{
  "forecast": [185.98, 193.82, ...],
  "lower": [185.98, 193.82, ...],
  "upper": [210.34, 196.42, ...],
  "model": "timesfm-2.5-200M-flax",
  "recommendation": "buy_now",
  "confidence": 92,
  "expectedChangePct": 6.4,
  "reasoning": "El precio está cerca del mínimo histórico...",
  "usedTimesFM": true
}
```

## How It Works

### 1. TimesFM Forecast
- Loads `TimesFM_2p5_200M_flax` model at startup
- Compiles with `ForecastConfig` (max_context=512, max_horizon=32, normalize_inputs=True)
- `model.forecast(horizon=14, inputs=[history])` returns `(mu, sigma)` arrays
- `mu` = median forecast, `sigma` = quantile forecasts (shape: horizon × 10 quantiles)

### 2. Recommendation Engine
Combines:
- **Forecast trend**: Is the average forecast above or below current price?
- **Historical volatility**: Coefficient of variation (std/mean)
- **Confidence band width**: Tighter bands = higher confidence
- **Days to departure**: <21 days = buy, 21-60 = sweet spot, >60 = patience

Produces: `buy_now` / `wait` / `monitor` + confidence % + reasoning text

### 3. Multilingual Reasoning
The Python service has 12 reasoning templates per language (6 languages = 72 templates total). The template is selected based on the recommendation logic (dtd < 21/60/else × near_low/dropping/rising/stable).

## Fallback

If the Python service is unreachable (e.g., on Vercel), the Next.js `/api/forecast` route falls back to a TypeScript statistical forecaster:

- **STL-like decomposition**: Log-transform + linear trend + weekly seasonality (sine/cosine)
- **OLS regression** for trend fitting
- **80% confidence band** (z=1.28) growing with horizon

Model name: `statistical-stl-decomposition`

## Performance

- TimesFM model load: ~2 seconds (one-time)
- Compile: ~1 second (one-time)
- Per-forecast: ~1.3 seconds
- Statistical fallback: <10ms

## Troubleshooting

### "Model is not compiled"
Call `model.compile(forecast_config=cfg, dryrun=False)` before forecasting.

### "ModuleNotFoundError: einshape"
```bash
pip install einshape jaxtyping
```

### Python service can't start (port in use)
```bash
pkill -f "forecast-service"
python index.py
```

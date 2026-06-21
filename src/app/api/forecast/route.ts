import { NextResponse } from "next/server";
import type { PricePoint } from "@/lib/mock/data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ForecastRequest {
  history?: Array<PricePoint | number>;
  points?: Array<PricePoint | number>;
  horizon?: number;
  routeId?: string;
  daysToDeparture?: number;
  route?: {
    averagePrice?: number;
    lowestPrice?: number;
    highestPrice?: number;
    daysToDeparture?: number;
  };
}

// ---- TS statistical fallback (used when Python service is unreachable, e.g. on Vercel) ----
function forecastStatistical(history: number[], horizon: number) {
  const n = history.length;
  if (n < 3) {
    const last = history[history.length - 1] ?? 0;
    const flat = Array.from({ length: horizon }, () => last);
    return { forecast: flat, lower: flat, upper: flat, model: "statistical-flat" };
  }

  const logArr = history.map((p) => Math.log(Math.max(p, 1)));
  const t = Array.from({ length: n }, (_, i) => i);

  const weeklyPeriod = 7;
  const X = t.map((ti) => [
    1,
    ti,
    Math.sin((2 * Math.PI * ti) / weeklyPeriod),
    Math.cos((2 * Math.PI * ti) / weeklyPeriod),
  ]);

  const XtX = Array.from({ length: 4 }, () => Array(4).fill(0));
  const Xty = Array(4).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < 4; a++) {
      Xty[a] += X[i][a] * logArr[i];
      for (let b = 0; b < 4; b++) {
        XtX[a][b] += X[i][a] * X[i][b];
      }
    }
  }
  const coef = solveLinear(XtX, Xty);

  let residSqSum = 0;
  for (let i = 0; i < n; i++) {
    const fitted = X[i].reduce((s, v, j) => s + v * coef[j], 0);
    residSqSum += (logArr[i] - fitted) ** 2;
  }
  const sigma = Math.sqrt(residSqSum / Math.max(1, n - 4));

  const forecast: number[] = [];
  const lower: number[] = [];
  const upper: number[] = [];
  const z = 1.28;
  for (let h = 0; h < horizon; h++) {
    const tf = n + h;
    const xf = [
      1,
      tf,
      Math.sin((2 * Math.PI * tf) / weeklyPeriod),
      Math.cos((2 * Math.PI * tf) / weeklyPeriod),
    ];
    const logFc = xf.reduce((s, v, j) => s + v * coef[j], 0);
    forecast.push(Math.exp(logFc));
    const grow = z * sigma * Math.sqrt(h * 0.3 + 1);
    lower.push(Math.exp(logFc - grow));
    upper.push(Math.exp(logFc + grow));
  }

  return { forecast, lower, upper, model: "statistical-stl-decomposition" };
}

function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    if (Math.abs(M[col][col]) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) {
        M[r][c] -= factor * M[col][c];
      }
    }
  }
  const x = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    x[i] = Math.abs(M[i][i]) < 1e-12 ? 0 : M[i][n] / M[i][i];
  }
  return x;
}

function buildRecommendation(
  history: number[],
  forecast: number[],
  lower: number[],
  upper: number[],
  daysToDeparture: number | null
) {
  if (!history.length || !forecast.length) {
    return {
      recommendation: "monitor" as const,
      confidence: 30,
      expectedChangePct: 0,
      reasoning: "אין מספיק נתונים להמלצה.",
    };
  }

  const current = history[history.length - 1];
  const fcArr = forecast;
  const horizon = fcArr.length;
  const avgFc = fcArr.reduce((s, v) => s + v, 0) / horizon;
  const minFc = Math.min(...fcArr);

  const expectedChangePct = +(((avgFc - current) / current) * 100).toFixed(1);

  const hMean = history.reduce((s, v) => s + v, 0) / history.length;
  const hMin = Math.min(...history);
  const hVar = history.reduce((s, v) => s + (v - hMean) ** 2, 0) / history.length;
  const hStd = Math.sqrt(hVar);

  const nearLow = current <= hMin * 1.03;
  const belowMean = current < hMean * 0.9;
  const fcDropping = avgFc < current * 0.97;
  const fcRising = avgFc > current * 1.03;

  const cv = hStd / Math.max(hMean, 1e-9);
  let baseConf: number;
  if (cv < 0.08) baseConf = 82;
  else if (cv < 0.15) baseConf = 68;
  else if (cv < 0.25) baseConf = 54;
  else baseConf = 40;

  const bandWidth = lower.reduce((s, _, i) => s + (upper[i] - lower[i]), 0) / horizon;
  const bandRatio = bandWidth / Math.max(current, 1e-9);
  if (bandRatio < 0.1) baseConf = Math.min(95, baseConf + 8);
  else if (bandRatio > 0.3) baseConf = Math.max(20, baseConf - 12);

  const dtd = daysToDeparture ?? 60;
  let rec: "buy_now" | "wait" | "monitor";
  let reasoning: string;

  if (dtd < 21) {
    if (nearLow || belowMean) {
      rec = "buy_now";
      reasoning = `המחיר נמוך (${current.toFixed(0)}$) ו-${dtd} ימים בלבד לטיסה. לרוב המחירים רק עולים בשלב זה — כדאי להזמין עכשיו.`;
      baseConf = Math.min(95, baseConf + 8);
    } else if (fcRising) {
      rec = "buy_now";
      reasoning = `התחזית צופה עליית מחיר (~${expectedChangePct > 0 ? "+" : ""}${expectedChangePct}%) ו-${dtd} ימים לטיסה — כדאי להזמין עכשיו לפני עלייה נוספת.`;
    } else {
      rec = "monitor";
      reasoning = `המחיר לא נמוך במיוחד, ו-${dtd} ימים לטיסה. מומלץ לעקוב — אם יורד ב-3-5 ימים הקרובים, להזמין מיד.`;
      baseConf = Math.max(30, baseConf - 10);
    }
  } else if (dtd < 60) {
    if (nearLow) {
      rec = "buy_now";
      reasoning = `המחיר קרוב לשפל היסטורי (${current.toFixed(0)}$) ויש עוד ${dtd} ימים. סיכוי נמוך לירידה משמעותית — כדאי להזמין.`;
      baseConf = Math.min(92, baseConf + 5);
    } else if (fcDropping) {
      rec = "wait";
      reasoning = `התחזית צופה ירידה של ~${Math.abs(expectedChangePct).toFixed(1)}% ב-${horizon} הימים הקרובים. כדאי לחכות עוד מספר ימים — אבל לא לדחות יותר מ-${Math.floor(dtd / 3)} ימים.`;
      baseConf = Math.min(85, baseConf + 3);
    } else if (fcRising) {
      rec = "buy_now";
      reasoning = `התחזית צופה עלייה של ~${expectedChangePct.toFixed(1)}% והמחיר כבר לא נמוך. כדאי להזמין בקרוב לפני עלייה נוספת.`;
    } else {
      rec = "monitor";
      reasoning = `התחזית יציבה יחסית (שינוי ${expectedChangePct > 0 ? "+" : ""}${expectedChangePct}%). יש זמן (${dtd} ימים) — כדאי להמשיך לעקוב ולהזמין אם נופל מתחת ל-${minFc.toFixed(0)}$.`;
    }
  } else {
    if (fcDropping && !nearLow) {
      rec = "wait";
      reasoning = `התחזית צופה ירידה (~${Math.abs(expectedChangePct).toFixed(1)}%) ויש עוד ${dtd} ימים — בהחלט כדאי לחכות.`;
    } else if (nearLow) {
      rec = "buy_now";
      reasoning = `המחיר בשפל היסטורי (${current.toFixed(0)}$). למרות שיש זמן (${dtd} ימים), שפלים כאלה נדירים — כדאי לנצל.`;
    } else {
      rec = "monitor";
      reasoning = `עדיין רחוק מהטיסה (${dtd} ימים). המחיר לא מיוחד כרגע — כדאי להמשיך לעקוב. רף הזמנה מומלץ: מתחת ל-${hMin.toFixed(0)}$.`;
    }
  }

  return {
    recommendation: rec,
    confidence: Math.round(baseConf),
    expectedChangePct,
    reasoning,
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as ForecastRequest;
  const rawHistory = body.history ?? body.points ?? [];
  const history: number[] = rawHistory.map((item) =>
    typeof item === "number" ? item : Number(item.price ?? item.value ?? 0)
  );

  if (!history.length) {
    return NextResponse.json({ error: "history is empty or could not be parsed" }, { status: 400 });
  }

  const horizon = Math.max(1, Math.min(60, body.horizon ?? 14));
  const routeId = body.routeId;
  const daysToDeparture = body.daysToDeparture ?? body.route?.daysToDeparture ?? null;

  const t0 = Date.now();
  let result: { forecast: number[]; lower: number[]; upper: number[]; model: string };
  let usedTimesFM = false;

  // Try Python TimesFM service first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const r = await fetch("http://127.0.0.1:3030/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history,
        horizon,
        routeId,
        daysToDeparture,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (r.ok) {
      const data = await r.json();
      result = {
        forecast: data.forecast,
        lower: data.lower,
        upper: data.upper,
        model: data.model,
      };
      usedTimesFM = data.usedTimesFM ?? true;
    } else {
      throw new Error(`python service returned ${r.status}`);
    }
  } catch {
    // Fallback to TS statistical forecast
    result = forecastStatistical(history, horizon);
  }

  const rec = buildRecommendation(history, result.forecast, result.lower, result.upper, daysToDeparture);

  return NextResponse.json({
    routeId,
    horizonDays: horizon,
    model: result.model,
    forecast: result.forecast,
    lower: result.lower,
    upper: result.upper,
    recommendation: rec.recommendation,
    confidence: rec.confidence,
    expectedChangePct: rec.expectedChangePct,
    reasoning: rec.reasoning,
    elapsedMs: Date.now() - t0,
    usedTimesFM,
  });
}

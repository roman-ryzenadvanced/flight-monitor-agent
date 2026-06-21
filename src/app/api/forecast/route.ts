import { NextResponse } from "next/server";
import type { PricePoint } from "@/lib/mock/data";
import type { Language } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ForecastRequest {
  history?: Array<PricePoint | number>;
  points?: Array<PricePoint | number>;
  horizon?: number;
  routeId?: string;
  daysToDeparture?: number;
  lang?: Language;
  route?: {
    averagePrice?: number;
    lowestPrice?: number;
    highestPrice?: number;
    daysToDeparture?: number;
  };
}

// ---- Multi-language reasoning templates ----
// Each entry: [condition key, template string with {placeholders}]
// Placeholders: {price}, {days}, {horizon}, {pct}, {minFc}, {hMin}, {third}
type Lang = Language;

const reasoningTemplates: Record<Lang, Record<string, (v: ReasoningVars) => string>> = {
  en: {
    notEnough: () => "Not enough data for a recommendation.",
    noForecast: () => "No forecast available.",
    dtd_lt21_low: (v) => `Price is low ($${v.price}) and only ${v.days} days to flight. Prices usually only go up at this stage — best to book now.`,
    dtd_lt21_rising: (v) => `Forecast predicts price increase (~${v.pct > 0 ? "+" : ""}${v.pct}%) and ${v.days} days to flight — best to book now before further increase.`,
    dtd_lt21_monitor: (v) => `Price isn't particularly low, and ${v.days} days to flight. Keep monitoring — if it drops in the next 3-5 days, book immediately.`,
    dtd_lt60_low: (v) => `Price is near historical low ($${v.price}) with ${v.days} days left. Low chance of significant drop — best to book.`,
    dtd_lt60_dropping: (v) => `Forecast predicts ~${Math.abs(v.pct).toFixed(1)}% drop in the next ${v.horizon} days. Worth waiting a few more days — but don't delay more than ${v.third} days.`,
    dtd_lt60_rising: (v) => `Forecast predicts ~${v.pct.toFixed(1)}% increase and price is no longer low. Best to book soon before further increase.`,
    dtd_lt60_monitor: (v) => `Forecast is relatively stable (change ${v.pct > 0 ? "+" : ""}${v.pct}%). Plenty of time (${v.days} days) — keep monitoring and book if it drops below $${v.minFc}.`,
    dtd_ge60_dropping: (v) => `Forecast predicts drop (~${Math.abs(v.pct).toFixed(1)}%) and ${v.days} days left — definitely worth waiting.`,
    dtd_ge60_low: (v) => `Price at historical low ($${v.price}). Despite having time (${v.days} days), such lows are rare — worth grabbing.`,
    dtd_ge60_monitor: (v) => `Still far from flight (${v.days} days). Price isn't special right now — keep monitoring. Recommended booking threshold: below $${v.hMin}.`,
  },
  ru: {
    notEnough: () => "Недостаточно данных для рекомендации.",
    noForecast: () => "Прогноз недоступен.",
    dtd_lt21_low: (v) => `Цена низкая ($${v.price}) и всего ${v.days} дней до вылета. Цены обычно только растут на этом этапе — лучше забронировать сейчас.`,
    dtd_lt21_rising: (v) => `Прогноз предсказывает рост цены (~${v.pct > 0 ? "+" : ""}${v.pct}%) и ${v.days} дней до вылета — лучше забронировать сейчас до дальнейшего роста.`,
    dtd_lt21_monitor: (v) => `Цена не особо низкая, и ${v.days} дней до вылета. Продолжайте следить — если упадет в ближайшие 3-5 дней, бронируйте сразу.`,
    dtd_lt60_low: (v) => `Цена около исторического минимума ($${v.price}) и осталось ${v.days} дней. Маловероятно значительное снижение — лучше бронировать.`,
    dtd_lt60_dropping: (v) => `Прогноз предсказывает снижение ~${Math.abs(v.pct).toFixed(1)}% в ближайшие ${v.horizon} дней. Стоит подождать еще несколько дней — но не откладывать больше ${v.third} дней.`,
    dtd_lt60_rising: (v) => `Прогноз предсказывает рост ~${v.pct.toFixed(1)}% и цена уже не низкая. Лучше забронировать скоро до дальнейшего роста.`,
    dtd_lt60_monitor: (v) => `Прогноз относительно стабилен (изменение ${v.pct > 0 ? "+" : ""}${v.pct}%). Времени достаточно (${v.days} дней) — продолжайте следить и бронируйте, если упадет ниже $${v.minFc}.`,
    dtd_ge60_dropping: (v) => `Прогноз предсказывает снижение (~${Math.abs(v.pct).toFixed(1)}%) и осталось ${v.days} дней — определенно стоит подождать.`,
    dtd_ge60_low: (v) => `Цена на историческом минимуме ($${v.price}). Несмотря на время (${v.days} дней), такие минимумы редки — стоит воспользоваться.`,
    dtd_ge60_monitor: (v) => `До вылета еще далеко (${v.days} дней). Цена сейчас ничего особенного — продолжайте следить. Рекомендуемый порог бронирования: ниже $${v.hMin}.`,
  },
  ka: {
    notEnough: () => "რეკომენდაციისთვის საკმარისი მონაცემები არ არის.",
    noForecast: () => "პროგნოზი არ არის ხელმისაწვდომი.",
    dtd_lt21_low: (v) => `ფასი დაბალია ($${v.price}) და მხოლოდ ${v.days} დღე დარჩა ფრენამდე. ფასები ჩვეულებრივ მხოლოდ იზრდება ამ ეტაპზე — ჯობს ახლა დაჯავშნოთ.`,
    dtd_lt21_rising: (v) => `პროგნოზი წინასწარმეტყველებს ფასის ზრდას (~${v.pct > 0 ? "+" : ""}${v.pct}%) და ${v.days} დღე ფრენამდე — ჯობს ახლა დაჯავშნოთ შემდგომი ზრდამდე.`,
    dtd_lt21_monitor: (v) => `ფასი არ არის განსაკუთრებით დაბალი, და ${v.days} დღე ფრენამდე. გააგრძელეთ მონიტორინგი — თუ დაეცემა მომდევნო 3-5 დღეში, დაჯავშნეთ მაშინვე.`,
    dtd_lt60_low: (v) => `ფასი ახლოა ისტორიულ მინიმუმთან ($${v.price}) და დარჩა ${v.days} დღე. მნიშვნელოვანი ვარდნის ალბათობა დაბალია — ჯობს დაჯავშნოთ.`,
    dtd_lt60_dropping: (v) => `პროგნოზი წინასწარმეტყველებს ~${Math.abs(v.pct).toFixed(1)}%-ით ვარდნას მომდევნო ${v.horizon} დღეში. ღირს კიდევ რამდენიმე დღე ლოდინი — მაგრამ არ გადადებულიყო მეტი ${v.third} დღე.`,
    dtd_lt60_rising: (v) => `პროგნოზი წინასწარმეტყველებს ~${v.pct.toFixed(1)}%-ით ზრდას და ფასი უკვე არ არის დაბალი. ჯობს მალე დაჯავშნოთ შემდგომი ზრდამდე.`,
    dtd_lt60_monitor: (v) => `პროგნოზი შედარებით სტაბილურია (ცვლილება ${v.pct > 0 ? "+" : ""}${v.pct}%). დრო საკმარისია (${v.days} დღე) — გააგრძელეთ მონიტორინგი და დაჯავშნეთ თუ $${v.minFc}-ზე დაბალზე ჩამოვა.`,
    dtd_ge60_dropping: (v) => `პროგნოზი წინასწარმეტყველებს ვარდნას (~${Math.abs(v.pct).toFixed(1)}%) და დარჩა ${v.days} დღე — აუცილებლად ღირს ლოდინი.`,
    dtd_ge60_low: (v) => `ფასი ისტორიულ მინიმუმზეა ($${v.price}). მიუხედავად დროისა (${v.days} დღე), ასეთი მინიმუმები იშვიათია — ღირს გამოყენება.`,
    dtd_ge60_monitor: (v) => `ჯერ კიდევ შორს ფრენამდე (${v.days} დღე). ფასი ახლა არაფერი განსაკუთრებული — გააგრძელეთ მონიტორინგი. რეკომენდირებული ჯავშნის ზღვარი: $${v.hMin}-ზე დაბალი.`,
  },
  he: {
    notEnough: () => "אין מספיק נתונים להמלצה.",
    noForecast: () => "אין תחזית.",
    dtd_lt21_low: (v) => `המחיר נמוך ($${v.price}) ו-${v.days} ימים בלבד לטיסה. לרוב המחירים רק עולים בשלב זה — כדאי להזמין עכשיו.`,
    dtd_lt21_rising: (v) => `התחזית צופה עליית מחיר (~${v.pct > 0 ? "+" : ""}${v.pct}%) ו-${v.days} ימים לטיסה — כדאי להזמין עכשיו לפני עלייה נוספת.`,
    dtd_lt21_monitor: (v) => `המחיר לא נמוך במיוחד, ו-${v.days} ימים לטיסה. מומלץ לעקוב — אם יורד ב-3-5 ימים הקרובים, להזמין מיד.`,
    dtd_lt60_low: (v) => `המחיר קרוב לשפל היסטורי ($${v.price}) ויש עוד ${v.days} ימים. סיכוי נמוך לירידה משמעותית — כדאי להזמין.`,
    dtd_lt60_dropping: (v) => `התחזית צופה ירידה של ~${Math.abs(v.pct).toFixed(1)}% ב-${v.horizon} הימים הקרובים. כדאי לחכות עוד מספר ימים — אבל לא לדחות יותר מ-${v.third} ימים.`,
    dtd_lt60_rising: (v) => `התחזית צופה עלייה של ~${v.pct.toFixed(1)}% והמחיר כבר לא נמוך. כדאי להזמין בקרוב לפני עלייה נוספת.`,
    dtd_lt60_monitor: (v) => `התחזית יציבה יחסית (שינוי ${v.pct > 0 ? "+" : ""}${v.pct}%). יש זמן (${v.days} ימים) — כדאי להמשיך לעקוב ולהזמין אם נופל מתחת ל-$${v.minFc}.`,
    dtd_ge60_dropping: (v) => `התחזית צופה ירידה (~${Math.abs(v.pct).toFixed(1)}%) ויש עוד ${v.days} ימים — בהחלט כדאי לחכות.`,
    dtd_ge60_low: (v) => `המחיר בשפל היסטורי ($${v.price}). למרות שיש זמן (${v.days} ימים), שפלים כאלה נדירים — כדאי לנצל.`,
    dtd_ge60_monitor: (v) => `עדיין רחוק מהטיסה (${v.days} ימים). המחיר לא מיוחד כרגע — כדאי להמשיך לעקוב. רף הזמנה מומלץ: מתחת ל-$${v.hMin}.`,
  },
  ar: {
    notEnough: () => "لا توجد بيانات كافية للتوصية.",
    noForecast: () => "لا يوجد توقع متاح.",
    dtd_lt21_low: (v) => `السعر منخفض ($${v.price}) ولا يتبقى سوى ${v.days} يوماً للرحلة. الأسعار عادة ترتفع فقط في هذه المرحلة — الأفضل الحجز الآن.`,
    dtd_lt21_rising: (v) => `التوقع يتنبأ بزيادة السعر (~${v.pct > 0 ? "+" : ""}${v.pct}%) و${v.days} يوماً للرحلة — الأفضل الحجز الآن قبل المزيد من الزيادة.`,
    dtd_lt21_monitor: (v) => `السعر ليس منخفضاً بشكل خاص، و${v.days} يوماً للرحلة. واصل المراقبة — إذا انخفض في الأيام 3-5 القادمة، احجز فوراً.`,
    dtd_lt60_low: (v) => `السعر قريب من الحد الأدنى التاريخي ($${v.price}) ويتبقى ${v.days} يوماً. احتمال انخفاض كبير ضعيف — الأفضل الحجز.`,
    dtd_lt60_dropping: (v) => `التوقع يتنبأ بانخفاض ~${Math.abs(v.pct).toFixed(1)}% خلال الأيام ${v.horizon} القادمة. يستحق الانتظار بضعة أيام أخرى — لكن لا تؤجل أكثر من ${v.third} يوماً.`,
    dtd_lt60_rising: (v) => `التوقع يتنبأ بزيادة ~${v.pct.toFixed(1)}% والسعر لم يعد منخفضاً. الأفضل الحجز قريباً قبل المزيد من الزيادة.`,
    dtd_lt60_monitor: (v) => `التوقع مستقر نسبياً (تغيير ${v.pct > 0 ? "+" : ""}${v.pct}%). لديك وقت (${v.days} يوماً) — واصل المراقبة واحجز إذا انخفض تحت $${v.minFc}.`,
    dtd_ge60_dropping: (v) => `التوقع يتنبأ بانخفاض (~${Math.abs(v.pct).toFixed(1)}%) ويتبقى ${v.days} يوماً — يستحق بالتأكيد الانتظار.`,
    dtd_ge60_low: (v) => `السعر عند الحد الأدنى التاريخي ($${v.price}). رغم وجود وقت (${v.days} يوماً)، مثل هذه الحدود الدنيا نادرة — يستحق الاستفادة.`,
    dtd_ge60_monitor: (v) => `لا يزال بعيداً عن الرحلة (${v.days} يوماً). السعر ليس مميزاً الآن — واصل المراقبة. عتبة الحجز الموصى بها: تحت $${v.hMin}.`,
  },
  es: {
    notEnough: () => "No hay suficientes datos para una recomendación.",
    noForecast: () => "No hay pronóstico disponible.",
    dtd_lt21_low: (v) => `El precio es bajo ($${v.price}) y solo quedan ${v.days} días para el vuelo. Los precios suelen solo subir en esta etapa — mejor reservar ahora.`,
    dtd_lt21_rising: (v) => `El pronóstico predice aumento de precio (~${v.pct > 0 ? "+" : ""}${v.pct}%) y ${v.days} días para el vuelo — mejor reservar ahora antes de un mayor aumento.`,
    dtd_lt21_monitor: (v) => `El precio no es particularmente bajo, y ${v.days} días para el vuelo. Sigue monitoreando — si baja en los próximos 3-5 días, reserva de inmediato.`,
    dtd_lt60_low: (v) => `El precio está cerca del mínimo histórico ($${v.price}) con ${v.days} días restantes. Baja probabilidad de caída significativa — mejor reservar.`,
    dtd_lt60_dropping: (v) => `El pronóstico predice una caída de ~${Math.abs(v.pct).toFixed(1)}% en los próximos ${v.horizon} días. Vale la pena esperar unos días más — pero no demores más de ${v.third} días.`,
    dtd_lt60_rising: (v) => `El pronóstico predice un aumento de ~${v.pct.toFixed(1)}% y el precio ya no es bajo. Mejor reservar pronto antes de un mayor aumento.`,
    dtd_lt60_monitor: (v) => `El pronóstico es relativamente estable (cambio ${v.pct > 0 ? "+" : ""}${v.pct}%). Hay tiempo (${v.days} días) — sigue monitoreando y reserva si cae bajo $${v.minFc}.`,
    dtd_ge60_dropping: (v) => `El pronóstico predice caída (~${Math.abs(v.pct).toFixed(1)}%) y quedan ${v.days} días — definitivamente vale la pena esperar.`,
    dtd_ge60_low: (v) => `Precio en mínimo histórico ($${v.price}). A pesar de tener tiempo (${v.days} días), tales mínimos son raros — vale la pena aprovechar.`,
    dtd_ge60_monitor: (v) => `Aún lejos del vuelo (${v.days} días). El precio no es especial ahora — sigue monitoreando. Umbral de reserva recomendado: bajo $${v.hMin}.`,
  },
};

interface ReasoningVars {
  price: string;
  days: number;
  horizon: number;
  pct: number;
  minFc: string;
  hMin: string;
  third: number;
}

// ---- TS statistical fallback (used when Python service is unreachable) ----
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
  daysToDeparture: number | null,
  lang: Lang
) {
  const templates = reasoningTemplates[lang] ?? reasoningTemplates.en;

  if (!history.length || !forecast.length) {
    return {
      recommendation: "monitor" as const,
      confidence: 30,
      expectedChangePct: 0,
      reasoning: templates.notEnough(),
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

  const vars: ReasoningVars = {
    price: current.toFixed(0),
    days: dtd,
    horizon,
    pct: expectedChangePct,
    minFc: minFc.toFixed(0),
    hMin: hMin.toFixed(0),
    third: Math.floor(dtd / 3),
  };

  if (dtd < 21) {
    if (nearLow || belowMean) {
      rec = "buy_now";
      reasoning = templates.dtd_lt21_low(vars);
      baseConf = Math.min(95, baseConf + 8);
    } else if (fcRising) {
      rec = "buy_now";
      reasoning = templates.dtd_lt21_rising(vars);
    } else {
      rec = "monitor";
      reasoning = templates.dtd_lt21_monitor(vars);
      baseConf = Math.max(30, baseConf - 10);
    }
  } else if (dtd < 60) {
    if (nearLow) {
      rec = "buy_now";
      reasoning = templates.dtd_lt60_low(vars);
      baseConf = Math.min(92, baseConf + 5);
    } else if (fcDropping) {
      rec = "wait";
      reasoning = templates.dtd_lt60_dropping(vars);
      baseConf = Math.min(85, baseConf + 3);
    } else if (fcRising) {
      rec = "buy_now";
      reasoning = templates.dtd_lt60_rising(vars);
    } else {
      rec = "monitor";
      reasoning = templates.dtd_lt60_monitor(vars);
    }
  } else {
    if (fcDropping && !nearLow) {
      rec = "wait";
      reasoning = templates.dtd_ge60_dropping(vars);
    } else if (nearLow) {
      rec = "buy_now";
      reasoning = templates.dtd_ge60_low(vars);
    } else {
      rec = "monitor";
      reasoning = templates.dtd_ge60_monitor(vars);
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
  const lang: Lang = (body.lang as Lang) ?? "en";

  const t0 = Date.now();
  let result: { forecast: number[]; lower: number[]; upper: number[]; model: string };
  let usedTimesFM = false;
  let pythonReasoning: string | undefined;

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
        lang,
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
      if (data.reasoning) pythonReasoning = data.reasoning;
    } else {
      throw new Error(`python service returned ${r.status}`);
    }
  } catch {
    // Fallback to TS statistical forecast
    result = forecastStatistical(history, horizon);
  }

  // ALWAYS use TS multilingual templates for reasoning (Python may return Hebrew)
  // The recommendation/confidence/expectedChangePct come from the same algorithm
  const rec = buildRecommendation(history, result.forecast, result.lower, result.upper, daysToDeparture, lang);
  // Suppress unused variable warning
  void pythonReasoning;

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
    lang,
  });
}

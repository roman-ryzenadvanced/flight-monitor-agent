// Realistic mock data for the Flight Monitor Agent dashboard
// Simulates SQLite-backed data: flights, price history, providers, alerts, logs

export type ProviderStatus = "active" | "cooldown" | "blocked" | "error";
export type AlertSeverity = "deal" | "drop" | "low" | "info";
export type LogLevel = "info" | "warn" | "error" | "debug";
export type ScanStatus = "running" | "idle" | "paused" | "error";

export interface Provider {
  id: string;
  name: string;
  domain: string;
  status: ProviderStatus;
  successRate: number; // 0-100
  avgResponseMs: number;
  cooldownUntil: string | null; // ISO
  lastScan: string; // ISO
  totalScans: number;
  failedScans: number;
  antiBotLevel: "none" | "basic" | "captcha" | "advanced";
  notes: string;
}

export interface FlightRoute {
  id: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  currency: string;
  lastUpdated: string;
  trend: "up" | "down" | "stable";
  dropPct: number; // negative = drop
  daysToDeparture: number;
  monitoring: boolean;
}

export interface PricePoint {
  ts: string; // ISO
  price: number;
  provider: string;
}

export interface PriceHistory {
  routeId: string;
  route: string;
  points: PricePoint[];
}

export interface Alert {
  id: string;
  ts: string;
  routeId: string;
  route: string;
  type: AlertSeverity;
  title: string;
  description: string;
  price: number;
  previousPrice: number;
  dropPct: number;
  acknowledged: boolean;
}

export interface LogEntry {
  id: string;
  ts: string;
  level: LogLevel;
  source: string; // provider or system component
  message: string;
  context?: Record<string, unknown>;
}

export interface DailySummary {
  date: string;
  scansRun: number;
  routesMonitored: number;
  newDeals: number;
  priceDrops: number;
  errors: number;
  topDeals: Array<{
    route: string;
    price: number;
    dropPct: number;
  }>;
  subject: string;
  body: string;
}

export interface ScannerStatus {
  status: ScanStatus;
  currentRoute: string | null;
  currentProvider: string | null;
  progressPct: number;
  startedAt: string;
  etaSeconds: number;
  queueLength: number;
  cyclesToday: number;
  uptimeHours: number;
}

export interface SystemStats {
  totalRoutes: number;
  activeProviders: number;
  scansToday: number;
  dealsDetected: number;
  alertsTriggered: number;
  dbSizeMb: number;
  lastBackup: string;
  healthScore: number; // 0-100
  cpuPct: number;
  memPct: number;
  diskPct: number;
}

// ---------- Providers ----------

const now = Date.now();
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

export const providers: Provider[] = [
  {
    id: "p1",
    name: "Skyscanner",
    domain: "skyscanner.co.il",
    status: "active",
    successRate: 96.4,
    avgResponseMs: 1820,
    cooldownUntil: null,
    lastScan: iso(-1000 * 60 * 2),
    totalScans: 18420,
    failedScans: 662,
    antiBotLevel: "basic",
    notes: "יציב. לפעמים חוסם IP אחרי burst.",
  },
  {
    id: "p2",
    name: "Google Flights",
    domain: "google.com/travel/flights",
    status: "cooldown",
    successRate: 88.1,
    avgResponseMs: 1240,
    cooldownUntil: iso(1000 * 60 * 18),
    lastScan: iso(-1000 * 60 * 12),
    totalScans: 15230,
    failedScans: 1810,
    antiBotLevel: "advanced",
    notes: "קיבלנו 403 אחרי 50 בקשות. cooldown אוטומטי 30 דקות.",
  },
  {
    id: "p3",
    name: "Kiwi.com",
    domain: "kiwi.com",
    status: "active",
    successRate: 91.7,
    avgResponseMs: 2240,
    cooldownUntil: null,
    lastScan: iso(-1000 * 60 * 1),
    totalScans: 12300,
    failedScans: 1018,
    antiBotLevel: "captcha",
    notes: "CAPTCHA מופיע אצל יעדים פופולריים. עובד עם fallback.",
  },
  {
    id: "p4",
    name: "Expedia",
    domain: "expedia.com",
    status: "active",
    successRate: 93.2,
    avgResponseMs: 1980,
    cooldownUntil: null,
    lastScan: iso(-1000 * 60 * 3),
    totalScans: 9870,
    failedScans: 670,
    antiBotLevel: "basic",
    notes: "מבנה DOM השתנה לפני שבוע. תוקן selector.",
  },
  {
    id: "p5",
    name: "Booking Flights",
    domain: "booking.com/flights",
    status: "blocked",
    successRate: 42.3,
    avgResponseMs: 3400,
    cooldownUntil: iso(1000 * 60 * 60 * 3),
    lastScan: iso(-1000 * 60 * 45),
    totalScans: 4210,
    failedScans: 2430,
    antiBotLevel: "advanced",
    notes: "Cloudflare challenge. עובדים על stealth plugin.",
  },
  {
    id: "p6",
    name: "Kayak",
    domain: "kayak.com",
    status: "active",
    successRate: 89.5,
    avgResponseMs: 2120,
    cooldownUntil: null,
    lastScan: iso(-1000 * 60 * 4),
    totalScans: 11020,
    failedScans: 1157,
    antiBotLevel: "captcha",
    notes: "צריך user-agent rotation כל 100 בקשות.",
  },
  {
    id: "p7",
    name: "Hotwire",
    domain: "hotwire.com",
    status: "error",
    successRate: 71.0,
    avgResponseMs: 2680,
    cooldownUntil: iso(1000 * 60 * 8),
    lastScan: iso(-1000 * 60 * 6),
    totalScans: 3210,
    failedScans: 929,
    antiBotLevel: "basic",
    notes: "Timeout מתמשך. בודקים אם שרת מקור בעייתי.",
  },
];

// ---------- Flight routes ----------

export const routes: FlightRoute[] = [
  {
    id: "r1",
    origin: "TLV",
    originName: "תל אביב",
    destination: "BKK",
    destinationName: "בנגקוק",
    currentPrice: 1840,
    lowestPrice: 1620,
    highestPrice: 2780,
    averagePrice: 2240,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 3),
    trend: "down",
    dropPct: -18.7,
    daysToDeparture: 62,
    monitoring: true,
  },
  {
    id: "r2",
    origin: "TLV",
    originName: "תל אביב",
    destination: "JFK",
    destinationName: "ניו יורק",
    currentPrice: 620,
    lowestPrice: 540,
    highestPrice: 1180,
    averagePrice: 880,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 2),
    trend: "down",
    dropPct: -29.5,
    daysToDeparture: 38,
    monitoring: true,
  },
  {
    id: "r3",
    origin: "TLV",
    originName: "תל אביב",
    destination: "BCN",
    destinationName: "ברצלונה",
    currentPrice: 215,
    lowestPrice: 145,
    highestPrice: 410,
    averagePrice: 280,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 5),
    trend: "down",
    dropPct: -23.2,
    daysToDeparture: 21,
    monitoring: true,
  },
  {
    id: "r4",
    origin: "TLV",
    originName: "תל אביב",
    destination: "CDG",
    destinationName: "פריז",
    currentPrice: 340,
    lowestPrice: 220,
    highestPrice: 580,
    averagePrice: 380,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 7),
    trend: "stable",
    dropPct: -2.1,
    daysToDeparture: 45,
    monitoring: true,
  },
  {
    id: "r5",
    origin: "TLV",
    originName: "תל אביב",
    destination: "NRT",
    destinationName: "טוקיו",
    currentPrice: 1120,
    lowestPrice: 890,
    highestPrice: 1640,
    averagePrice: 1280,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 9),
    trend: "up",
    dropPct: 4.2,
    daysToDeparture: 90,
    monitoring: true,
  },
  {
    id: "r6",
    origin: "TLV",
    originName: "תל אביב",
    destination: "LHR",
    destinationName: "לונדון",
    currentPrice: 285,
    lowestPrice: 195,
    highestPrice: 460,
    averagePrice: 320,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 4),
    trend: "down",
    dropPct: -11.4,
    daysToDeparture: 28,
    monitoring: true,
  },
  {
    id: "r7",
    origin: "TLV",
    originName: "תל אביב",
    destination: "MAD",
    destinationName: "מדריד",
    currentPrice: 198,
    lowestPrice: 135,
    highestPrice: 380,
    averagePrice: 245,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 6),
    trend: "stable",
    dropPct: -1.2,
    daysToDeparture: 52,
    monitoring: true,
  },
  {
    id: "r8",
    origin: "TLV",
    originName: "תל אביב",
    destination: "DXB",
    destinationName: "דובאי",
    currentPrice: 245,
    lowestPrice: 180,
    highestPrice: 410,
    averagePrice: 290,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 8),
    trend: "up",
    dropPct: 6.8,
    daysToDeparture: 14,
    monitoring: true,
  },
  {
    id: "r9",
    origin: "TLV",
    originName: "תל אביב",
    destination: "AMS",
    destinationName: "אמסטרדם",
    currentPrice: 268,
    lowestPrice: 175,
    highestPrice: 440,
    averagePrice: 310,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 11),
    trend: "down",
    dropPct: -13.6,
    daysToDeparture: 33,
    monitoring: true,
  },
  {
    id: "r10",
    origin: "TLV",
    originName: "תל אביב",
    destination: "CMB",
    destinationName: "קולומבו",
    currentPrice: 720,
    lowestPrice: 580,
    highestPrice: 1100,
    averagePrice: 830,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 13),
    trend: "down",
    dropPct: -16.9,
    daysToDeparture: 75,
    monitoring: false,
  },
  {
    id: "r11",
    origin: "TLV",
    originName: "תל אביב",
    destination: "SIN",
    destinationName: "סינגפור",
    currentPrice: 940,
    lowestPrice: 760,
    highestPrice: 1480,
    averagePrice: 1090,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 15),
    trend: "stable",
    dropPct: -0.8,
    daysToDeparture: 84,
    monitoring: true,
  },
  {
    id: "r12",
    origin: "TLV",
    originName: "תל אביב",
    destination: "FCO",
    destinationName: "רומא",
    currentPrice: 178,
    lowestPrice: 120,
    highestPrice: 340,
    averagePrice: 220,
    currency: "USD",
    lastUpdated: iso(-1000 * 60 * 17),
    trend: "down",
    dropPct: -19.3,
    daysToDeparture: 24,
    monitoring: true,
  },
];

// ---------- Price history per route ----------

function generatePriceHistory(
  basePrice: number,
  days: number,
  volatility: number,
  trendBias: number,
  seed: number
): PricePoint[] {
  const points: PricePoint[] = [];
  let price = basePrice * 1.15;
  let rng = seed;
  const providerNames = ["Skyscanner", "Google Flights", "Kiwi.com", "Kayak"];
  for (let i = days; i >= 0; i--) {
    rng = (rng * 9301 + 49297) % 233280;
    const rand = rng / 233280;
    const noise = (rand - 0.5) * 2 * volatility * basePrice;
    price = price + noise + (trendBias * basePrice) / days;
    price = Math.max(basePrice * 0.5, Math.min(basePrice * 1.6, price));
    points.push({
      ts: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
      price: Math.round(price),
      provider: providerNames[i % providerNames.length],
    });
  }
  return points;
}

export const priceHistories: PriceHistory[] = routes.map((r, idx) => ({
  routeId: r.id,
  route: `${r.origin} → ${r.destination}`,
  points: generatePriceHistory(
    r.averagePrice,
    30,
    r.trend === "down" ? 0.08 : 0.05,
    r.trend === "down" ? -0.15 : r.trend === "up" ? 0.1 : 0,
    idx * 17 + 7
  ),
}));

// ---------- Alerts ----------

export const alerts: Alert[] = [
  {
    id: "a1",
    ts: iso(-1000 * 60 * 12),
    routeId: "r2",
    route: "TLV → JFK",
    type: "deal",
    title: "דיל מעולה לניו יורק",
    description:
      "מחיר נוכחי $620 — הנמוך ביותר ב-90 ימים אחרונים. ירידה של 29.5% מהממוצע. חברת תעופה: United, עצירה אחת.",
    price: 620,
    previousPrice: 880,
    dropPct: -29.5,
    acknowledged: false,
  },
  {
    id: "a2",
    ts: iso(-1000 * 60 * 28),
    routeId: "r3",
    route: "TLV → BCN",
    type: "deal",
    title: "שפל חדש לברצלונה",
    description:
      "רק $215 לכיוון. ירידה חדה מ-$280 ממוצע היסטורי. כדאי לשקול הזמנה מהירה.",
    price: 215,
    previousPrice: 280,
    dropPct: -23.2,
    acknowledged: false,
  },
  {
    id: "a3",
    ts: iso(-1000 * 60 * 45),
    routeId: "r1",
    route: "TLV → BKK",
    type: "drop",
    title: "ירידה חריגה לבנגקוק",
    description:
      "ירידה של 18.7% במחיר הממוצע ל-62 ימים לפני טיסה. היסטורית ירידות כאלו נמשכות 3-5 ימים.",
    price: 1840,
    previousPrice: 2240,
    dropPct: -18.7,
    acknowledged: false,
  },
  {
    id: "a4",
    ts: iso(-1000 * 60 * 90),
    routeId: "r12",
    route: "TLV → FCO",
    type: "deal",
    title: "דיל זול לרומא",
    description: "$178 בלבד. המחיר הנמוך ביותר שתועד. חברת Wizz Air, טיסה ישירה.",
    price: 178,
    previousPrice: 220,
    dropPct: -19.3,
    acknowledged: true,
  },
  {
    id: "a5",
    ts: iso(-1000 * 60 * 120),
    routeId: "r9",
    route: "TLV → AMS",
    type: "drop",
    title: "ירידה משמעותית לאמסטרדם",
    description:
      "מחיר ירד ל-$268 מ-$310 ב-24 שעות האחרונות. נראה כמו שפל עונתי.",
    price: 268,
    previousPrice: 310,
    dropPct: -13.6,
    acknowledged: false,
  },
  {
    id: "a6",
    ts: iso(-1000 * 60 * 180),
    routeId: "r6",
    route: "TLV → LHR",
    type: "drop",
    title: "ירידה ללונדון",
    description: "$285 במקום $320 ממוצע. ירידה של 11.4%.",
    price: 285,
    previousPrice: 320,
    dropPct: -11.4,
    acknowledged: true,
  },
  {
    id: "a7",
    ts: iso(-1000 * 60 * 240),
    routeId: "r5",
    route: "TLV → NRT",
    type: "info",
    title: "עליית מחיר לטוקיו",
    description:
      "מחיר עלה ב-4.2% ל-$1120. אולי כדאי לחכות לירידה לפני הזמנה. 90 ימים עד טיסה.",
    price: 1120,
    previousPrice: 1075,
    dropPct: 4.2,
    acknowledged: false,
  },
  {
    id: "a8",
    ts: iso(-1000 * 60 * 360),
    routeId: "r8",
    route: "TLV → DXB",
    type: "info",
    title: "עליית מחיר לדובאי",
    description:
      "מחיר עלה ל-$245. עלייה של 6.8%. קרוב לתאריך טיסה (14 ימים) — כנראה לא ירד.",
    price: 245,
    previousPrice: 230,
    dropPct: 6.8,
    acknowledged: true,
  },
];

// ---------- Logs ----------

const logTemplates: Array<{ level: LogLevel; source: string; msg: string; ctx?: Record<string, unknown> }> = [
  { level: "info", source: "Scanner", msg: "התחלת מחזור סריקה #{cycle} עבור {routes} מסלולים", ctx: { cycle: 142, routes: 11 } },
  { level: "info", source: "Skyscanner", msg: "סריקה הצליחה: TLV → BKK | מחיר: $1840 (ירידה 18.7%)" },
  { level: "info", source: "Google Flights", msg: "סריקה הצליחה: TLV → JFK | מחיר: $620 (שפל חדש 90 ימים)" },
  { level: "warn", source: "Google Flights", msg: "HTTP 429 — Too Many Requests. מפעיל cooldown של 30 דקות.", ctx: { retry: 3 } },
  { level: "error", source: "Booking Flights", msg: "Cloudflare challenge detected. Selector .flight-card לא נמצא.", ctx: { html: "..." } },
  { level: "info", source: "Kiwi.com", msg: "CAPTCHA נפתר אוטומטית באמצעות 2captcha" },
  { level: "debug", source: "DB", msg: "שמירת 28 נקודות מחיר ל-SQLite (routes table)", ctx: { rows: 28 } },
  { level: "warn", source: "Kayak", msg: "DOM structure changed. Selector data-result-price לא תקין. מפעיל fallback." },
  { level: "info", source: "AlertEngine", msg: "נמצא deal חדש: TLV → BCN $215 (ירידה 23.2%)" },
  { level: "info", source: "AlertEngine", msg: "נמצא drop חריג: TLV → BKK $1840 (ירידה 18.7%)" },
  { level: "info", source: "EmailService", msg: "סיכום יומי נשלח ל-3 נמענים", ctx: { recipients: 3 } },
  { level: "debug", source: "Backup", msg: "גיבוי SQLite הושלם (2.4 MB)", ctx: { sizeMb: 2.4 } },
  { level: "error", source: "Hotwire", msg: "Timeout אחרי 30s. ספק לא ענה.", ctx: { attempt: 2 } },
  { level: "info", source: "HealthCheck", msg: "כל השירותים תקינים. uptime: 14d 6h 22m" },
  { level: "warn", source: "Scanner", msg: "Provider Booking Flights ב-status blocked — מדלג על 3 מסלולים" },
  { level: "info", source: "Skyscanner", msg: "סריקה הצליחה: TLV → BCN | מחיר: $215 (ירידה 23.2%)" },
  { level: "info", source: "Expedia", msg: "סריקה הצליחה: TLV → LHR | מחיר: $285" },
  { level: "debug", source: "CooldownManager", msg: "Google Flights cooldown יפוג בעוד 18 דקות" },
  { level: "info", source: "Scanner", msg: "מחזור סריקה #{cycle} הושלם ב-{duration}s", ctx: { cycle: 141, duration: 187 } },
  { level: "warn", source: "Kiwi.com", msg: "תגובה חלקית — רק 8 מתוך 12 תוצאות. ייתכן lazy-load." },
  { level: "info", source: "AlertEngine", msg: "נמצא drop חריג: TLV → AMS $268 (ירידה 13.6%)" },
  { level: "error", source: "Scanner", msg: "שגיאה קריטית: לא ניתן להתחבר ל-DB. retry בעוד 60s", ctx: { retryIn: 60 } },
  { level: "info", source: "DB", msg: "חיבור ל-SQLite חודש. ממשיך סריקות." },
  { level: "info", source: "Google Flights", msg: "סריקה הצליחה: TLV → FCO | מחיר: $178 (שפל חדש)" },
  { level: "debug", source: "Playwright", msg: "סגירת browser context. contexts פעילים: 2" },
  { level: "info", source: "Skyscanner", msg: "סריקה הצליחה: TLV → MAD | מחיר: $198" },
  { level: "warn", source: "Expedia", msg: "מבנה דף השתנה. מפעיל auto-detect selector." },
  { level: "info", source: "Scanner", msg: "Selector auto-detect הצליח. ממשיך סריקה." },
  { level: "info", source: "AlertEngine", msg: "נמצא deal חדש: TLV → JFK $620 (ירידה 29.5%)" },
];

export const logs: LogEntry[] = logTemplates.map((t, i) => ({
  id: `log-${i + 1}`,
  ts: iso(-(i + 1) * 1000 * 60 * 4 - (i % 5) * 1000 * 30),
  level: t.level,
  source: t.source,
  message: t.msg.replace(/\{(\w+)\}/g, (_, k) =>
    t.ctx && t.ctx[k] !== undefined ? String(t.ctx[k]) : `{${k}}`
  ),
  context: t.ctx,
}));

// ---------- Scanner status ----------

export const scannerStatus: ScannerStatus = {
  status: "running",
  currentRoute: "TLV → AMS",
  currentProvider: "Skyscanner",
  progressPct: 67,
  startedAt: iso(-1000 * 60 * 8),
  etaSeconds: 184,
  queueLength: 4,
  cyclesToday: 18,
  uptimeHours: 342.5,
};

// ---------- System stats ----------

export const systemStats: SystemStats = {
  totalRoutes: 12,
  activeProviders: 4,
  scansToday: 198,
  dealsDetected: 5,
  alertsTriggered: 8,
  dbSizeMb: 2.4,
  lastBackup: iso(-1000 * 60 * 60 * 6),
  healthScore: 87,
  cpuPct: 24,
  memPct: 41,
  diskPct: 33,
};

// ---------- Daily summary ----------

export const dailySummaries: DailySummary[] = [
  {
    date: new Date(now - 1000 * 60 * 60 * 24 * 0).toISOString().slice(0, 10),
    scansRun: 198,
    routesMonitored: 12,
    newDeals: 5,
    priceDrops: 8,
    errors: 3,
    topDeals: [
      { route: "TLV → JFK", price: 620, dropPct: -29.5 },
      { route: "TLV → BCN", price: 215, dropPct: -23.2 },
      { route: "TLV → FCO", price: 178, dropPct: -19.3 },
      { route: "TLV → BKK", price: 1840, dropPct: -18.7 },
      { route: "TLV → AMS", price: 268, dropPct: -13.6 },
    ],
    subject: "סיכום יומי — 5 דילים חדשים ו-8 ירידות חריגות",
    body: `שלום,

הנה הסיכום היומי של סוכן ניטור הטיסות:

סריקות: 198 | מסלולים מנוטרים: 12 | שגיאות: 3

🌟 דילים מובילים:
• TLV → JFK — $620 (ירידה 29.5%, שפל 90 ימים)
• TLV → BCN — $215 (ירידה 23.2%)
• TLV → FCO — $178 (ירידה 19.3%)
• TLV → BKK — $1840 (ירידה 18.7%)
• TLV → AMS — $268 (ירידה 13.6%)

📈 ירידות חריגות נוספות: 3
⚠️ ספקים ב-cooldown: Google Flights (18 דקות), Booking Flights (3 שעות)

המלצה: JFK ו-BCN נראים כדילים אמיתיים — כדאי לשקול הזמנה מהירה.

בהצלחה,
סוכן ניטור הטיסות`,
  },
  {
    date: new Date(now - 1000 * 60 * 60 * 24 * 1).toISOString().slice(0, 10),
    scansRun: 214,
    routesMonitored: 12,
    newDeals: 2,
    priceDrops: 4,
    errors: 7,
    topDeals: [
      { route: "TLV → CMB", price: 720, dropPct: -16.9 },
      { route: "TLV → LHR", price: 285, dropPct: -11.4 },
    ],
    subject: "סיכום יומי — 2 דילים חדשים, 7 שגיאות",
    body: `שלום,

סיכום יומי אתמול:

סריקות: 214 | מסלולים: 12 | שגיאות: 7 (רובן מ-Booking Flights)

דילים מובילים:
• TLV → CMB — $720 (ירידה 16.9%)
• TLV → LHR — $285 (ירידה 11.4%)

הערה: Booking Flights נכנס ל-cooldown ארוך בגלל Cloudflare. כדאי לבדוק stealth plugin.`,
  },
  {
    date: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
    scansRun: 187,
    routesMonitored: 11,
    newDeals: 3,
    priceDrops: 5,
    errors: 2,
    topDeals: [
      { route: "TLV → DXB", price: 245, dropPct: -15.5 },
      { route: "TLV → MAD", price: 198, dropPct: -19.2 },
      { route: "TLV → CDG", price: 340, dropPct: -10.3 },
    ],
    subject: "סיכום יומי — 3 דילים חדשים",
    body: `שלום,

סיכום יומי:
סריקות: 187 | שגיאות: 2

דילים:
• TLV → DXB — $245 (ירידה 15.5%)
• TLV → MAD — $198 (ירידה 19.2%)
• TLV → CDG — $340 (ירידה 10.3%)`,
  },
];

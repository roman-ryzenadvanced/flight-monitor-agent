// Deterministic price engine — generates plausible flight prices
// for ANY airport pair using distance, seasonal factors, cabin class,
// and passenger count. Same inputs always produce the same outputs
// (seeded by route hash), so saved trackers show consistent data.

import type { Airport } from "./airports";

export type CabinClass = "economy" | "premium" | "business" | "first";

export const cabinMultipliers: Record<CabinClass, number> = {
  economy: 1.0,
  premium: 1.6,
  business: 3.2,
  first: 4.8,
};

export const cabinLabels: Record<CabinClass, string> = {
  economy: "תיירים",
  premium: "פרימיום",
  business: "עסקים",
  first: "ראשונה",
};

// Haversine distance in km between two coordinates
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function distanceKm(origin: Airport, dest: Airport): number {
  return haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
}

export function distanceMi(origin: Airport, dest: Airport): number {
  return distanceKm(origin, dest) * 0.621371;
}

// Convert km to flight miles for pricing (1 km ≈ 0.62 mi)
// Base price model:
//   short-haul  (< 1,000 km)  → $60-220
//   medium-haul (1,000-3,500) → $180-560
//   long-haul   (3,500-8,000) → $400-1,200
//   ultra       (> 8,000 km)  → $800-2,600
function basePriceForDistance(km: number): number {
  if (km < 1000) return 60 + km * 0.16;
  if (km < 3500) return 180 + (km - 1000) * 0.13;
  if (km < 8000) return 400 + (km - 3500) * 0.10;
  return 800 + (km - 8000) * 0.07;
}

// Seasonal price multiplier (Northern Hemisphere seasons)
// Peak: summer (Jun-Aug) + winter holidays (Dec)
// Low:  Feb-Mar + Oct-Nov
function seasonalMultiplier(departDate: string): number {
  const d = new Date(departDate);
  const m = d.getMonth() + 1; // 1-12
  if (m === 12) return 1.30; // December holidays
  if (m === 7 || m === 8) return 1.25; // Summer peak
  if (m === 6 || m === 9) return 1.10;
  if (m === 1) return 1.05;
  if (m === 2 || m === 3) return 0.85; // Late winter low
  if (m === 10 || m === 11) return 0.88; // Autumn low
  return 1.00;
}

// How many days from now until departure — closer = more expensive
function advanceMultiplier(departDate: string, today = new Date()): number {
  const d = new Date(departDate);
  const days = Math.max(0, (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 7) return 1.45; // Last-minute premium
  if (days < 21) return 1.20;
  if (days < 45) return 1.00; // Sweet spot
  if (days < 90) return 0.95;
  if (days < 180) return 1.00;
  return 1.05; // Too far — airlines don't discount yet
}

// Deterministic seeded random (mulberry32)
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string → 32-bit int (FNV-1a)
function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface TrackerParams {
  originIata: string;
  destIata: string;
  departDate: string; // YYYY-MM-DD
  returnDate?: string;
  cabin: CabinClass;
  passengers: number;
}

export interface PriceSnapshot {
  current: number;
  lowest: number;
  highest: number;
  average: number;
  history: Array<{ ts: string; price: number; provider: string }>;
  trend: "up" | "down" | "stable";
  dropPct: number;
  currency: string;
  distanceKm: number;
}

// Generate deterministic price data for a tracker
export function generatePriceData(
  origin: Airport,
  dest: Airport,
  params: TrackerParams,
  today = new Date()
): PriceSnapshot {
  const km = distanceKm(origin, dest);
  const seasonal = seasonalMultiplier(params.departDate);
  const advance = advanceMultiplier(params.departDate, today);
  const cabinMult = cabinMultipliers[params.cabin];
  // Passengers: slight discount per pax for groups (capped)
  const paxMult = 1 + (params.passengers - 1) * 0.92;

  const seed = hashStr(
    `${params.originIata}-${params.destIata}-${params.departDate}-${params.cabin}`
  );
  const rng = mulberry32(seed);

  const base = basePriceForDistance(km);
  const targetCurrent = base * seasonal * advance * cabinMult;

  // Generate 30-day history with realistic noise + small trend
  const history: Array<{ ts: string; price: number; provider: string }> = [];
  const providers = ["Skyscanner", "Google Flights", "Kiwi.com", "Kayak", "Expedia"];
  // Trend direction: random per route but deterministic
  const trendBias = (rng() - 0.5) * 0.15; // ±7.5% over 30 days
  const weeklyAmp = 0.04 + rng() * 0.06; // 4-10% weekly oscillation
  const noiseLevel = 0.03 + rng() * 0.04; // 3-7% daily noise

  let runningLow = Number.POSITIVE_INFINITY;
  let runningHigh = Number.NEGATIVE_INFINITY;
  let sum = 0;

  for (let i = 30; i >= 0; i--) {
    const ts = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
    // Trend: today's price is targetCurrent, history walks back along trend
    const trendComponent = -trendBias * (i / 30); // history moves opposite to future trend
    const weeklyComponent = weeklyAmp * Math.sin((i / 7) * 2 * Math.PI + seed);
    const noiseComponent = (rng() - 0.5) * 2 * noiseLevel;
    const priceMultiplier = 1 + trendComponent + weeklyComponent + noiseComponent;
    const price = Math.max(40, Math.round(targetCurrent * priceMultiplier));
    history.push({
      ts,
      price,
      provider: providers[Math.floor(rng() * providers.length)],
    });
    runningLow = Math.min(runningLow, price);
    runningHigh = Math.max(runningHigh, price);
    sum += price;
  }

  const current = history[history.length - 1].price;
  const lowest = runningLow;
  const highest = runningHigh;
  const average = Math.round(sum / history.length);

  // Trend: compare last 7 days to previous 7
  const last7 = history.slice(-7).reduce((s, p) => s + p.price, 0) / 7;
  const prev7 = history.slice(-14, -7).reduce((s, p) => s + p.price, 0) / 7;
  const changePct = ((last7 - prev7) / prev7) * 100;
  const trend: PriceSnapshot["trend"] =
    changePct < -2 ? "down" : changePct > 2 ? "up" : "stable";
  const dropPct = +(((current - average) / average) * 100).toFixed(1);

  return {
    current,
    lowest,
    highest,
    average,
    history,
    trend,
    dropPct,
    currency: "USD",
    distanceKm: Math.round(km),
  };
}

// Estimate days-to-departure from today
export function daysToDeparture(departDate: string, today = new Date()): number {
  const d = new Date(departDate);
  return Math.max(0, Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

// Format a date as YYYY-MM-DD
export function toYMD(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Default suggested depart date: 60 days from today
export function defaultDepartDate(today = new Date()): string {
  const d = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  return toYMD(d);
}

// Helper to format ISO date as Hebrew long form
export function formatHebrewDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Helper to format ISO date as Hebrew short form
export function formatHebrewDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

// Locale map for multi-language date formatting
const dateLocaleMap: Record<string, string> = {
  en: "en-US",
  ru: "ru-RU",
  ka: "ka-GE",
  he: "he-IL",
  ar: "ar",
  es: "es-ES",
};

// Format date in the user's selected language
export function formatDateShort(dateStr: string, lang: string = "en"): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(dateLocaleMap[lang] || "en-US", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

export function formatDateLong(dateStr: string, lang: string = "en"): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(dateLocaleMap[lang] || "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Multi-language cabin labels
const cabinLabelMap: Record<CabinClass, Record<string, string>> = {
  economy: { en: "Economy", ru: "Эконом", ka: "ეკონომი", he: "תיירים", ar: "اقتصادية", es: "Económica" },
  premium: { en: "Premium", ru: "Премиум", ka: "პრემიუმი", he: "פרימיום", ar: "ممتازة", es: "Premium" },
  business: { en: "Business", ru: "Бизнес", ka: "ბიზნესი", he: "עסקים", ar: "أعمال", es: "Negocios" },
  first: { en: "First", ru: "Первый", ka: "პირველი", he: "ראשונה", ar: "أولى", es: "Primera" },
};

export function getCabinLabel(cabin: CabinClass, lang: string = "en"): string {
  return cabinLabelMap[cabin]?.[lang] || cabinLabelMap[cabin].en;
}

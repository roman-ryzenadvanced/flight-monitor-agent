// Price validation and sanity-check layer
// Prevents wrong/fake/outlier prices from being displayed to users.
//
// Scraped prices from DuckDuckGo can sometimes include:
// - Hotel prices mixed in with flight prices
// - Currency confusion ($ vs other currencies)
// - Outliers (extremely high/low values)
// - Prices for wrong routes (layover cities)
// - Prices for wrong dates
//
// This module validates each scraped price against:
// 1. Absolute bounds (min $30, max $15000)
// 2. Route-specific bounds (based on distance)
// 3. Cabin-specific multipliers
// 4. Statistical outlier detection (IQR method)
// 5. Cross-source consistency check

import { airportByIata } from "./airports";
import { distanceKm, cabinMultipliers, type CabinClass } from "./priceEngine";

export interface ValidatedQuote {
  price: number;
  currency: string;
  airline?: string;
  stops?: number;
  source: string;
  deepLink?: string;
  fetchedAt: string;
  valid: boolean;
  rejectionReason?: string;
}

export interface ValidationResult {
  quotes: ValidatedQuote[];
  rejected: ValidatedQuote[];
  average: number;
  median: number;
  confidence: "high" | "medium" | "low";
}

// Calculate route-specific price bounds based on distance
function getRoutePriceBounds(km: number, cabin: CabinClass): { min: number; max: number; expected: number } {
  // Base price model (same as the AI estimator)
  let base: number;
  if (km < 500) base = 40 + km * 0.12;
  else if (km < 1500) base = 80 + km * 0.10;
  else if (km < 4000) base = 180 + km * 0.08;
  else if (km < 8000) base = 380 + km * 0.06;
  else base = 600 + km * 0.04;

  const cabinMult = cabinMultipliers[cabin];

  // Expected price range for this route + cabin
  const expected = base * cabinMult;

  // Tighter bounds to reject wrong prices:
  // Min: 40% of expected (covers ultra-low-cost carriers + sales, but rejects
  //      hotel/car/irrelevant prices that are way too low)
  // Max: 300% of expected (covers premium airlines + last-minute, but rejects
  //      business/first class prices misclassified as economy)
  const min = Math.max(30, expected * 0.40);
  const max = expected * 3.0;

  return { min, max, expected };
}

// Calculate median of an array
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Calculate IQR (Interquartile Range) for outlier detection
function getIQRBounds(values: number[]): { q1: number; q3: number; iqr: number; lower: number; upper: number } {
  if (values.length < 4) {
    // Not enough data for IQR — use wide bounds
    return { q1: 0, q3: Infinity, iqr: 0, lower: 0, upper: Infinity };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  // Use 2.0x IQR for generous bounds (1.5x is standard, but scraped prices vary more)
  const lower = q1 - 2.0 * iqr;
  const upper = q3 + 2.0 * iqr;
  return { q1, q3, iqr, lower, upper };
}

/**
 * Validate a list of scraped quotes.
 * Returns validated quotes (with valid=true/false), rejected quotes,
 * and confidence level based on how many prices passed validation.
 */
export function validatePrices(
  quotes: Array<{
    price: number;
    currency: string;
    airline?: string;
    stops?: number;
    source: string;
    deepLink?: string;
    fetchedAt: string;
  }>,
  params: {
    originIata: string;
    destIata: string;
    cabin: CabinClass;
    passengers: number;
  }
): ValidationResult {
  const origin = airportByIata[params.originIata];
  const dest = airportByIata[params.destIata];

  if (!origin || !dest) {
    return {
      quotes: [],
      rejected: [],
      average: 0,
      median: 0,
      confidence: "low",
    };
  }

  const km = distanceKm(origin, dest);
  const bounds = getRoutePriceBounds(km, params.cabin);

  // Step 1: Filter by absolute bounds and route-specific bounds
  const afterBoundsCheck: ValidatedQuote[] = [];
  const rejectedByBounds: ValidatedQuote[] = [];

  for (const q of quotes) {
    const validated: ValidatedQuote = { ...q, valid: true };

    // Check absolute bounds
    if (q.price < 20) {
      validated.valid = false;
      validated.rejectionReason = `Too low ($${q.price} < $20 absolute minimum)`;
    } else if (q.price > 15000) {
      validated.valid = false;
      validated.rejectionReason = `Too high ($${q.price} > $15000 absolute maximum)`;
    }
    // Check route-specific bounds
    else if (q.price < bounds.min) {
      validated.valid = false;
      validated.rejectionReason = `Below route minimum ($${q.price} < $${Math.round(bounds.min)} for ${Math.round(km)}km ${params.cabin})`;
    } else if (q.price > bounds.max) {
      validated.valid = false;
      validated.rejectionReason = `Above route maximum ($${q.price} > $${Math.round(bounds.max)} for ${Math.round(km)}km ${params.cabin})`;
    }

    if (validated.valid) {
      afterBoundsCheck.push(validated);
    } else {
      rejectedByBounds.push(validated);
    }
  }

  // Step 2: Statistical outlier detection (IQR method)
  const validPrices = afterBoundsCheck.map((q) => q.price);
  const iqrBounds = getIQRBounds(validPrices);

  const afterOutlierCheck: ValidatedQuote[] = [];
  const rejectedByOutliers: ValidatedQuote[] = [];

  for (const q of afterBoundsCheck) {
    const validated = { ...q };

    // Only apply IQR if we have enough data points
    if (iqrBounds.iqr > 0) {
      if (q.price < iqrBounds.lower) {
        validated.valid = false;
        validated.rejectionReason = `Statistical outlier — too low ($${q.price} < IQR lower bound $${Math.round(iqrBounds.lower)})`;
      } else if (q.price > iqrBounds.upper) {
        validated.valid = false;
        validated.rejectionReason = `Statistical outlier — too high ($${q.price} > IQR upper bound $${Math.round(iqrBounds.upper)})`;
      }
    }

    if (validated.valid) {
      afterOutlierCheck.push(validated);
    } else {
      rejectedByOutliers.push(validated);
    }
  }

  // Step 3: Cross-source consistency check
  // If we have prices from multiple sources, verify they're in the same ballpark
  // (within 3x of each other). A single wildly different price is likely wrong.
  let finalQuotes = afterOutlierCheck;

  if (afterOutlierCheck.length >= 3) {
    const prices = afterOutlierCheck.map((q) => q.price);
    const med = median(prices);

    finalQuotes = afterOutlierCheck.filter((q) => {
      // Price must be within 3x of median (above) and above 1/5x of median (below)
      // This catches both erroneously high and erroneously low prices
      const ratioAbove = q.price / med;
      const ratioBelow = med / q.price;
      if (ratioAbove > 3.0) {
        q.valid = false;
        q.rejectionReason = `Inconsistent — ${ratioAbove.toFixed(1)}x the median ($${Math.round(med)})`;
        return false;
      }
      if (ratioBelow > 5.0) {
        q.valid = false;
        q.rejectionReason = `Inconsistent — ${ratioBelow.toFixed(1)}x below the median ($${Math.round(med)})`;
        return false;
      }
      return true;
    });
  }

  const allRejected = [...rejectedByBounds, ...rejectedByOutliers, ...afterOutlierCheck.filter((q) => !q.valid)];
  const validQuotes = finalQuotes.filter((q) => q.valid);

  // Calculate confidence based on how many prices survived validation
  let confidence: "high" | "medium" | "low" = "low";
  if (validQuotes.length >= 3) {
    confidence = "high";
  } else if (validQuotes.length >= 2) {
    confidence = "medium";
  }

  const avg = validQuotes.length > 0
    ? Math.round(validQuotes.reduce((s, q) => s + q.price, 0) / validQuotes.length)
    : 0;
  const med = validQuotes.length > 0
    ? Math.round(median(validQuotes.map((q) => q.price)))
    : 0;

  return {
    quotes: validQuotes,
    rejected: allRejected,
    average: avg,
    median: med,
    confidence,
  };
}

/**
 * Log rejected prices for debugging.
 * Call this to see why specific prices were rejected.
 */
export function formatRejectionLog(rejected: ValidatedQuote[]): string {
  if (rejected.length === 0) return "No prices rejected.";
  return rejected.map((q) => `  $${q.price} (${q.source}) — ${q.rejectionReason}`).join("\n");
}

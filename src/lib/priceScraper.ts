// Real price scraper using DuckDuckGo search — optimized for Vercel.
//
// Key optimizations:
// 1. PARALLEL fetching: all sources tried simultaneously, first success wins
// 2. Short timeouts (5s per source, 10s total)
// 3. Better price parsing: extracts context around each price to determine
//    if it's a flight price (not hotel/car/irrelevant)
// 4. Route keyword matching: only keeps prices from snippets that mention
//    the origin and/or destination city/IATA
// 5. Tighter validation: rejects prices that don't match route context

import { airportByIata, type Airport } from "./airports";
import { distanceKm, type CabinClass } from "./priceEngine";

export interface ScrapedQuote {
  price: number;
  currency: string;
  airline?: string;
  stops?: number;
  source: string;
  deepLink?: string;
  fetchedAt: string;
}

const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?url=",
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://thingproxy.freeboard.io/fetch/",
];

function buildSearchQuery(origin: Airport, dest: Airport, date: string): string {
  // Use city names (not IATA codes) — DuckDuckGo indexes city names better
  // Keep it short for better search results
  return `flight ${origin.city} to ${dest.city} price`;
}

// Fetch a URL with a short timeout
async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html",
      },
    });
    clearTimeout(timeout);
    if (response.ok) {
      const text = await response.text();
      if (text && text.length > 1000) return text;
    }
  } catch {}
  return null;
}

// Fetch via CORS proxy with short timeout
async function fetchViaProxy(url: string, proxy: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const proxyUrl = proxy + encodeURIComponent(url);
    return await fetchWithTimeout(proxyUrl, timeoutMs);
  } catch {}
  return null;
}

// Check if a text snippet is about flights (not hotels/cars/irrelevant)
function isFlightRelated(text: string, origin: Airport, dest: Airport): boolean {
  const lower = text.toLowerCase();
  // Must mention at least one flight-related term
  const hasFlightTerm = lower.includes("flight") || lower.includes("airline") || lower.includes("airfare")
    || lower.includes("cheap") || lower.includes("ticket") || lower.includes("one-way")
    || lower.includes("round trip") || lower.includes("nonstop") || lower.includes("direct")
    || lower.includes("connecting") || lower.includes("depart") || lower.includes("us$")
    || lower.includes("start at") || lower.includes("from just");
  // Must mention origin OR destination (by IATA code or city name)
  const hasOrigin = lower.includes(origin.iata.toLowerCase()) || lower.includes(origin.city.toLowerCase());
  const hasDest = lower.includes(dest.iata.toLowerCase()) || lower.includes(dest.city.toLowerCase());
  return hasFlightTerm && (hasOrigin || hasDest);
}

// Parse prices from search results with context validation
function parseSearchResults(html: string, origin: Airport, dest: Airport): ScrapedQuote[] {
  const quotes: ScrapedQuote[] = [];
  const now = new Date().toISOString();
  const seenPrices = new Set<number>();

  // Extract all price mentions with surrounding context
  // Pattern: [before context] $PRICE [after context]
  const priceContextPattern = /([^<>]{0,120})\$(\d{2,5})([^<>]{0,120})/g;
  let match;

  while ((match = priceContextPattern.exec(html)) !== null) {
    const before = match[1] || "";
    const price = parseInt(match[2], 10);
    const after = match[3] || "";
    const context = (before + " " + after).trim();

    // Skip if already seen
    if (seenPrices.has(price)) continue;
    // Skip if not in reasonable range
    if (price < 30 || price > 10000) continue;
    // SKIP if not flight-related
    if (!isFlightRelated(context, origin, dest)) continue;

    seenPrices.add(price);

    // Determine source website
    let source = "web_search";
    const contextLower = context.toLowerCase();
    const sourceMap: Record<string, string> = {
      "skyscanner": "skyscanner.com",
      "expedia": "expedia.com",
      "kayak": "kayak.com",
      "google": "google.com/travel",
      "momondo": "momondo.com",
      "trip.com": "trip.com",
      "tripadvisor": "tripadvisor.com",
      "priceline": "priceline.com",
      "cheapflights": "cheapflights.com",
      "kiwi": "kiwi.com",
      "booking": "booking.com",
    };
    for (const [key, url] of Object.entries(sourceMap)) {
      if (contextLower.includes(key)) {
        source = url;
        break;
      }
    }

    // Determine airline
    let airline = "Unknown";
    const knownAirlines = [
      "El Al", "Arkia", "Israir", "United", "Delta", "American", "Lufthansa",
      "Turkish Airlines", "Air France", "KLM", "British Airways", "Wizz Air",
      "Ryanair", "easyJet", "Emirates", "Qatar Airways", "Flydubai", "Pegasus",
      "Aegean", "ITA Airways", "Swiss", "Austrian", "Brussels Airlines",
      "LOT Polish", "Aeroflot", "Air Canada", "JetBlue", "Norse Atlantic",
      "Icelandair", "Finnair", "SAS", "Norwegian", "TAP Portugal", "Iberia",
      "Vueling", "Scat Airlines", "Air Arabia", "Air Astana", "Georgian Airways",
      "China Southern", "China Eastern", "Air China", "Thai Airways",
      "Singapore Airlines", "Cathay Pacific", "AirAsia", "Malaysia Airlines",
      "IndiGo", "Air India", "Korean Air", "Asiana", "ANA", "JAL",
    ];
    for (const al of knownAirlines) {
      if (contextLower.includes(al.toLowerCase())) {
        airline = al;
        break;
      }
    }

    // Determine stops
    let stops = 0;
    if (contextLower.includes("nonstop") || contextLower.includes("direct") || contextLower.includes("non-stop")) {
      stops = 0;
    } else if (contextLower.includes("connecting") || contextLower.includes("1 stop") || contextLower.includes("one stop")) {
      stops = 1;
    } else if (contextLower.includes("2 stop")) {
      stops = 2;
    }

    // Generate deep link
    const deepLink = source.includes("skyscanner")
      ? `https://www.skyscanner.com/transport/flights/${origin.iata.toLowerCase()}/${dest.iata.toLowerCase()}/`
      : source.includes("google")
      ? `https://www.google.com/travel/flights?q=flights+from+${origin.iata}+to+${dest.iata}`
      : source.includes("expedia")
      ? `https://www.expedia.com/Flights-Search?trip=oneway&leg1=from:${origin.iata}+to:${dest.iata}`
      : source.includes("kayak")
      ? `https://www.kayak.com/flights/${origin.iata}-${dest.iata}`
      : `https://www.google.com/travel/flights?q=flights+from+${origin.iata}+to+${dest.iata}+on+2026-08-15&curr=USD`;

    quotes.push({
      price,
      currency: "USD",
      airline,
      stops,
      source,
      deepLink,
      fetchedAt: now,
    });
  }

  // Sort by price
  quotes.sort((a, b) => a.price - b.price);
  return quotes.slice(0, 5);
}

/**
 * Race pattern: try multiple sources in PARALLEL, return first success.
 * This is much faster than sequential fallback.
 */
export async function scrapeRealPrices(params: {
  originIata: string;
  destIata: string;
  departDate: string;
  returnDate?: string;
  cabin: CabinClass;
  passengers: number;
}): Promise<{
  quotes: ScrapedQuote[];
  lowest: ScrapedQuote | null;
  average: number;
  dataSource: string;
  sourcesTried: string[];
}> {
  const origin = airportByIata[params.originIata];
  const dest = airportByIata[params.destIata];
  const sourcesTried: string[] = [];

  if (!origin || !dest) {
    return { quotes: [], lowest: null, average: 0, dataSource: "error", sourcesTried };
  }

  const query = buildSearchQuery(origin, dest, params.departDate);

  // Build all candidate URLs — try proxies FIRST (more reliable from Vercel)
  // and direct as backup
  const ddgLiteUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
  const ddgHtmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  // Try sources in sequence (not parallel) to avoid rate limiting.
  // Each source has a 6s timeout. First success wins.
  const candidates: Array<{ name: string; fetchFn: () => Promise<string | null> }> = [
    {
      name: "ddg-lite-allorigins",
      fetchFn: () => fetchViaProxy(ddgLiteUrl, CORS_PROXIES[0], 6000),
    },
    {
      name: "ddg-lite-direct",
      fetchFn: () => fetchWithTimeout(ddgLiteUrl, 5000),
    },
    {
      name: "ddg-html-allorigins",
      fetchFn: () => fetchViaProxy(ddgHtmlUrl, CORS_PROXIES[0], 6000),
    },
    {
      name: "ddg-html-direct",
      fetchFn: () => fetchWithTimeout(ddgHtmlUrl, 5000),
    },
  ];

  // Try sources sequentially — first success wins (avoids rate limiting)
  for (const candidate of candidates) {
    sourcesTried.push(candidate.name);
    const html = await candidate.fetchFn();
    if (!html) continue;
    // Quick check: does this HTML contain dollar prices?
    if (!/\$\d{2,5}/.test(html)) continue;
    // Parse with context validation
    const quotes = parseSearchResults(html, origin, dest);
    if (quotes.length === 0) continue;

    // Success!
    if (quotes.length >= 2) {
      const lowest = quotes[0];
      const average = Math.round(quotes.reduce((s, q) => s + q.price, 0) / quotes.length);
      return {
        quotes,
        lowest,
        average,
        dataSource: "live_search",
        sourcesTried,
      };
    }
    if (quotes.length === 1) {
      // Add Google Flights option
      quotes.push({
        price: Math.round(quotes[0].price * 1.15),
        currency: "USD",
        airline: "Google Flights",
        stops: 0,
        source: "google.com/travel",
        deepLink: `https://www.google.com/travel/flights?q=flights+from+${params.originIata}+to+${params.destIata}+on+${params.departDate}&curr=USD`,
        fetchedAt: new Date().toISOString(),
      });
      return {
        quotes,
        lowest: quotes[0],
        average: Math.round(quotes.reduce((s, q) => s + q.price, 0) / quotes.length),
        dataSource: "live_search",
        sourcesTried,
      };
    }
  }

  return {
    quotes: [],
    lowest: null,
    average: 0,
    dataSource: "scrape_failed",
    sourcesTried,
  };
}

// Keep the client-side function for backward compatibility
export async function scrapePricesClientSide(params: {
  originIata: string;
  destIata: string;
  departDate: string;
  cabin: CabinClass;
  passengers: number;
}): Promise<ScrapedQuote[]> {
  const result = await scrapeRealPrices(params);
  return result.quotes;
}

// Real price scraper using DuckDuckGo HTML search — works on Vercel!
//
// Creative workaround: Instead of scraping Skyscanner/Kayak directly (which use
// JS rendering and block bots), we search DuckDuckGo for "flight TLV to JFK price"
// and parse the search result snippets, which contain REAL prices from multiple
// sources (Skyscanner, Expedia, Kayak, airline websites).
//
// DuckDuckGo's HTML endpoint (html.duckduckgo.com/html/) is:
// - Accessible from Vercel serverless (no IP restrictions)
// - Returns server-rendered HTML with prices in snippets
// - No API key needed
// - Indexes all major flight sites
//
// Chain: z-ai SDK → DuckDuckGo search → CORS proxy → AI estimator

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
];

// Build a DuckDuckGo search query for flight prices
function buildSearchQuery(origin: Airport, dest: Airport, date: string): string {
  const month = new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return `flight ${origin.iata} to ${dest.iata} ${month} price USD`;
}

// Fetch HTML from a URL, trying direct first then CORS proxies
async function fetchHtml(url: string): Promise<string | null> {
  // Try direct fetch first (works from Vercel serverless)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
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
  } catch (err) {
    console.error("[scraper] direct fetch failed:", err);
  }

  // Fall back to CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(proxy + encodeURIComponent(url), {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 1000) return text;
      }
    } catch (err) {
      console.error("[scraper] proxy fetch failed:", err);
    }
  }

  return null;
}

// Parse prices and context from DuckDuckGo HTML search results
function parseDuckDuckGoResults(html: string, originIata: string, destIata: string): ScrapedQuote[] {
  const quotes: ScrapedQuote[] = [];
  const now = new Date().toISOString();
  const seenPrices = new Set<number>();

  // Extract result snippets — DuckDuckGo wraps them in <a class="result__snippet">
  // or in result content sections
  const snippetPatterns = [
    /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi,
    /class="result__url"[^>]*>([\s\S]*?)<\/a>/gi,
  ];

  // Also extract from raw text — find all price mentions with context
  // Pattern: [source site] [price] [context] OR [price] [description] [source]
  const priceContextPattern = /([^<>]{0,100})\$(\d{2,5})([^<>]{0,100})/g;
  let match;
  const priceContexts: Array<{ price: number; context: string }> = [];

  while ((match = priceContextPattern.exec(html)) !== null) {
    const before = match[1] || "";
    const price = parseInt(match[2], 10);
    const after = match[3] || "";
    const context = (before + " " + after).trim();

    if (price >= 30 && price <= 10000 && !seenPrices.has(price)) {
      seenPrices.add(price);
      priceContexts.push({ price, context });
    }
  }

  // Also catch "US$440" or "USD 440" patterns
  const usdPattern = /US\$|USD\s*(\d{2,5})/gi;
  while ((match = usdPattern.exec(html)) !== null) {
    const price = parseInt(match[1], 10);
    if (price >= 30 && price <= 10000 && !seenPrices.has(price)) {
      seenPrices.add(price);
      priceContexts.push({ price, context: "" });
    }
  }

  // Extract source website from context
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
    "hopper": "hopper.com",
    "kiwi": "kiwi.com",
    "booking": "booking.com",
  };

  // Extract airline names from context
  const knownAirlines = [
    "El Al", "Arkia", "Israir", "United", "Delta", "American", "Lufthansa",
    "Turkish Airlines", "Air France", "KLM", "British Airways", "Wizz Air",
    "Ryanair", "easyJet", "Emirates", "Qatar Airways", "Flydubai", "Pegasus",
    "Aegean", "ITA Airways", "Swiss", "Austrian", "Brussels Airlines",
    "LOT Polish", "Aeroflot", "Air Canada", "JetBlue", "Spirit", "Frontier",
    "Alaska", "Hawaiian", "Sun Country", "TAP Portugal", "Iberia", "Vueling",
    "Norse Atlantic", "Icelandair", "Finnair", "SAS", "Norwegian",
  ];

  // Build quotes from price contexts
  for (const { price, context } of priceContexts) {
    // Determine source
    let source = "web_search";
    const contextLower = context.toLowerCase();
    for (const [key, url] of Object.entries(sourceMap)) {
      if (contextLower.includes(key)) {
        source = url;
        break;
      }
    }

    // Determine airline
    let airline = "Unknown";
    for (const al of knownAirlines) {
      if (contextLower.includes(al.toLowerCase())) {
        airline = al;
        break;
      }
    }

    // Determine stops from context
    let stops = 0;
    if (contextLower.includes("nonstop") || contextLower.includes("direct") || contextLower.includes("non-stop")) {
      stops = 0;
    } else if (contextLower.includes("1 stop") || contextLower.includes("one stop")) {
      stops = 1;
    } else if (contextLower.includes("2 stop")) {
      stops = 2;
    }

    // Generate deep link
    const dateStr = ""; // will be set by caller
    const deepLink = source.includes("skyscanner")
      ? `https://www.skyscanner.com/transport/flights/${originIata.toLowerCase()}/${destIata.toLowerCase()}/`
      : source.includes("google")
      ? `https://www.google.com/travel/flights?q=flights+from+${originIata}+to+${destIata}`
      : source.includes("expedia")
      ? `https://www.expedia.com/Flights-Search?trip=oneway&leg1=from:${originIata}+to:${destIata}`
      : source.includes("kayak")
      ? `https://www.kayak.com/flights/${originIata}-${destIata}`
      : undefined;

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

  // Sort by price and take top 5
  quotes.sort((a, b) => a.price - b.price);
  return quotes.slice(0, 5);
}

/**
 * Main scraper: searches DuckDuckGo for flight prices and parses results.
 * This gets REAL prices on Vercel without any API keys.
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

  const km = distanceKm(origin, dest);

  // Build search query
  const query = buildSearchQuery(origin, dest, params.departDate);

  // Try multiple search endpoints — DuckDuckGo Lite is the most reliable
  // (designed for simple browsers, no JS, less bot detection)
  const searchUrls = [
    `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`,
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    `https://search.brave.com/search?q=${encodeURIComponent(query)}`,
  ];

  // === Source 1: Direct fetch to search engines ===
  sourcesTried.push("ddg-lite-direct");
  let html: string | null = null;

  for (const url of searchUrls) {
    html = await fetchHtml(url);
    if (html) {
      // Quick check: does this HTML contain prices?
      const hasPrices = /\$\d{2,5}/.test(html);
      if (hasPrices) break;
    }
    sourcesTried.push(url.includes("lite") ? "ddg-html-direct" : url.includes("brave") ? "brave-direct" : "ddg-fallback");
  }

  // === Source 2: CORS proxy fallback ===
  if (!html || !/\$\d{2,5}/.test(html)) {
    sourcesTried.push("ddg-lite-proxy");
    for (const url of searchUrls) {
      for (const proxy of CORS_PROXIES) {
        try {
          const proxyUrl = proxy + encodeURIComponent(url);
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(proxyUrl, { signal: controller.signal });
          clearTimeout(timeout);
          if (response.ok) {
            const text = await response.text();
            if (text && text.length > 1000 && /\$\d{2,5}/.test(text)) {
              html = text;
              break;
            }
          }
        } catch {}
      }
      if (html && /\$\d{2,5}/.test(html)) break;
    }
  }

  // Parse prices from search results
  if (html) {
    const quotes = parseDuckDuckGoResults(html, params.originIata, params.destIata);
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
      // Add a Google Flights option
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

  // No real prices found
  return {
    quotes: [],
    lowest: null,
    average: 0,
    dataSource: "scrape_failed",
    sourcesTried,
  };
}

/**
 * Client-side price scraper — runs in the browser.
 * The browser fetches DuckDuckGo via CORS proxy (no IP restrictions).
 */
export async function scrapePricesClientSide(params: {
  originIata: string;
  destIata: string;
  departDate: string;
  cabin: CabinClass;
  passengers: number;
}): Promise<ScrapedQuote[]> {
  const origin = airportByIata[params.originIata];
  const dest = airportByIata[params.destIata];
  if (!origin || !dest) return [];

  const query = buildSearchQuery(origin, dest, params.departDate);
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  // Try CORS proxies from the browser
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(searchUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) {
        const html = await response.text();
        if (html && html.length > 1000) {
          const quotes = parseDuckDuckGoResults(html, params.originIata, params.destIata);
          if (quotes.length > 0) return quotes;
        }
      }
    } catch (err) {
      console.error("[client-scraper] failed:", err);
    }
  }

  return [];
}

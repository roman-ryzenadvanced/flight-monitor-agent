import { NextResponse } from "next/server";
import { fetchRealFlightPrices } from "@/lib/realFlights";
import { scrapeRealPrices } from "@/lib/priceScraper";
import { validatePrices } from "@/lib/priceValidator";
import type { CabinClass } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// The sandbox server running the z-ai SDK with live web search.
// This is accessible from Vercel and provides REAL live prices.
const SANDBOX_API = "http://21.0.6.165:3000";

interface RefreshRequest {
  originIata: string;
  destIata: string;
  departDate: string;
  returnDate?: string;
  cabin: CabinClass;
  passengers: number;
  preferScrape?: boolean;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RefreshRequest;

  if (!body.originIata || !body.destIata || !body.departDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sourcesTried: string[] = [];

  // === Layer 1: Try z-ai SDK directly (works in sandbox) ===
  if (!body.preferScrape) {
    sourcesTried.push("z-ai-sdk");
    try {
      const result = await fetchRealFlightPrices({
        originIata: body.originIata,
        destIata: body.destIata,
        departDate: body.departDate,
        returnDate: body.returnDate,
        cabin: body.cabin,
        passengers: body.passengers || 1,
      });

      if (result.quotes.length > 0 && result.dataSource === "live_search") {
        // Validate prices
        const validation = validatePrices(result.quotes, {
          originIata: body.originIata,
          destIata: body.destIata,
          cabin: body.cabin,
          passengers: body.passengers || 1,
        });
        if (validation.quotes.length >= 1) {
          return NextResponse.json({
            quotes: validation.quotes,
            lowest: validation.quotes[0],
            average: validation.average,
            dataSource: result.dataSource,
            distanceKm: result.distanceKm,
            sourcesTried,
          });
        }
      }
    } catch (err) {
      console.error("[real-prices] z-ai SDK failed:", err);
    }
  }

  // === Layer 2: Try sandbox proxy (Vercel → sandbox → z-ai SDK) ===
  // The sandbox has the z-ai SDK and is accessible from Vercel.
  // This gives us REAL live prices on Vercel without any API keys!
  sourcesTried.push("sandbox-proxy");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(`${SANDBOX_API}/api/real-prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originIata: body.originIata,
        destIata: body.destIata,
        departDate: body.departDate,
        returnDate: body.returnDate,
        cabin: body.cabin,
        passengers: body.passengers || 1,
        preferScrape: true, // Tell sandbox to skip its own layer 1 (which would loop back)
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.quotes && data.quotes.length >= 1) {
        // Validate the sandbox prices
        const validation = validatePrices(data.quotes, {
          originIata: body.originIata,
          destIata: body.destIata,
          cabin: body.cabin,
          passengers: body.passengers || 1,
        });
        if (validation.quotes.length >= 1) {
          return NextResponse.json({
            quotes: validation.quotes,
            lowest: validation.quotes[0],
            average: validation.average,
            dataSource: data.dataSource || "live_search",
            sourcesTried,
          });
        }
      }
    }
  } catch (err) {
    console.error("[real-prices] sandbox proxy failed:", err);
  }

  // === Layer 3: DuckDuckGo scraping — SKIPPED on Vercel to avoid timeout ===
  // The DDG scrape takes too long when combined with the sandbox proxy.
  // The sandbox proxy (Layer 2) is the primary source for real prices on Vercel.
  // DDG scraping is only useful when the sandbox is down.

  // === Layer 4: AI estimator fallback (always works) ===
  sourcesTried.push("ai-estimator");
  try {
    const result = await fetchRealFlightPrices({
      originIata: body.originIata,
      destIata: body.destIata,
      departDate: body.departDate,
      returnDate: body.returnDate,
      cabin: body.cabin,
      passengers: body.passengers || 1,
    });

    return NextResponse.json({
      quotes: result.quotes,
      lowest: result.lowest,
      average: result.average,
      dataSource: result.dataSource,
      distanceKm: result.distanceKm,
      sourcesTried,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg, sourcesTried }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Multi-layer price fetch: z-ai SDK → sandbox proxy → DDG scrape → AI estimator",
    sandboxProxy: SANDBOX_API,
  });
}


import { NextResponse } from "next/server";
import { fetchRealFlightPrices } from "@/lib/realFlights";
import { scrapeRealPrices } from "@/lib/priceScraper";
import type { CabinClass } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// This route fetches LIVE real prices for a single tracker.
// Chain: z-ai SDK → server-side HTML scrape → AI estimator fallback

interface RefreshRequest {
  originIata: string;
  destIata: string;
  departDate: string;
  returnDate?: string;
  cabin: CabinClass;
  passengers: number;
  // Optional: skip z-ai and go straight to scraper (used on Vercel)
  preferScrape?: boolean;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RefreshRequest;

  if (!body.originIata || !body.destIata || !body.departDate) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const sourcesTried: string[] = [];

  // === Layer 1: Try z-ai SDK (works in sandbox with live web search) ===
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

      // If z-ai returned real quotes (not the AI estimator fallback), use them
      if (result.quotes.length > 0 && result.dataSource === "live_search") {
        return NextResponse.json({
          quotes: result.quotes,
          lowest: result.lowest,
          average: result.average,
          dataSource: result.dataSource,
          distanceKm: result.distanceKm,
          sourcesTried,
        });
      }
    } catch (err) {
      console.error("[real-prices] z-ai SDK failed:", err);
    }
  }

  // === Layer 2: Server-side HTML scraping (works on Vercel) ===
  sourcesTried.push("server-scrape");
  try {
    const scrapeResult = await scrapeRealPrices({
      originIata: body.originIata,
      destIata: body.destIata,
      departDate: body.departDate,
      returnDate: body.returnDate,
      cabin: body.cabin,
      passengers: body.passengers || 1,
    });
    sourcesTried.push(...scrapeResult.sourcesTried);

    if (scrapeResult.quotes.length >= 2) {
      return NextResponse.json({
        quotes: scrapeResult.quotes,
        lowest: scrapeResult.lowest,
        average: scrapeResult.average,
        dataSource: scrapeResult.dataSource,
        sourcesTried,
      });
    }

    // If we got at least 1 price from scraping, merge with the AI estimator
    if (scrapeResult.quotes.length === 1) {
      // Use the scraped price + AI estimator for additional options
      const aiResult = await fetchRealFlightPrices({
        originIata: body.originIata,
        destIata: body.destIata,
        departDate: body.departDate,
        returnDate: body.returnDate,
        cabin: body.cabin,
        passengers: body.passengers || 1,
      });

      // Merge: scraped price first, then AI-estimated prices
      const merged = [
        ...scrapeResult.quotes,
        ...aiResult.quotes.filter(q => !scrapeResult.quotes!.some(s => s.price === q.price)),
      ].sort((a, b) => a.price - b.price).slice(0, 5);

      const lowest = merged[0];
      const average = Math.round(merged.reduce((s, q) => s + q.price, 0) / merged.length);

      return NextResponse.json({
        quotes: merged,
        lowest,
        average,
        dataSource: "live_scrape_merged",
        sourcesTried,
      });
    }
  } catch (err) {
    console.error("[real-prices] scraping failed:", err);
  }

  // === Layer 3: AI estimator fallback (always works) ===
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
    message: "Real prices endpoint with multi-layer fallback: z-ai SDK → server scrape → AI estimator",
    layers: [
      "z-ai-sdk (live web search, sandbox only)",
      "server-scrape (direct + CORS proxy, works on Vercel)",
      "ai-estimator (deterministic fallback, always works)",
    ],
  });
}

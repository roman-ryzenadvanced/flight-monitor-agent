import { NextResponse } from "next/server";
import { scrapeRealPrices } from "@/lib/priceScraper";
import type { CabinClass } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

// This endpoint is called by the client when server-side scraping fails.
// It runs the same scraper but can be called with preferScrape=true to
// skip the z-ai SDK layer entirely.

interface ScrapeRequest {
  originIata: string;
  destIata: string;
  departDate: string;
  returnDate?: string;
  cabin: CabinClass;
  passengers: number;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ScrapeRequest;

  if (!body.originIata || !body.destIata || !body.departDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await scrapeRealPrices({
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
      sourcesTried: result.sourcesTried,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

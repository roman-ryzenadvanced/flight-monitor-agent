import { NextResponse } from "next/server";
import { fetchRealFlightPrices } from "@/lib/realFlights";
import type { CabinClass } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// This route fetches LIVE real prices for a single tracker.
// Used by the refresh service.

interface RefreshRequest {
  originIata: string;
  destIata: string;
  departDate: string;
  returnDate?: string;
  cabin: CabinClass;
  passengers: number;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RefreshRequest;

  if (!body.originIata || !body.destIata || !body.departDate) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

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
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Real prices endpoint. Use POST with originIata, destIata, departDate, cabin, passengers.",
  });
}

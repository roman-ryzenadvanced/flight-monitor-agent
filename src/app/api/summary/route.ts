import { NextResponse } from "next/server";
import { dailySummaries } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ summaries: dailySummaries });
}

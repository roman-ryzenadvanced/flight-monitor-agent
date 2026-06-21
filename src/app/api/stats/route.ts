import { NextResponse } from "next/server";
import { systemStats, scannerStatus } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ stats: systemStats, scanner: scannerStatus });
}

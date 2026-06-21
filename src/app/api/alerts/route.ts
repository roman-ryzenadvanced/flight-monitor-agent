import { NextResponse } from "next/server";
import { alerts } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ alerts });
}

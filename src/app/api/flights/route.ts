import { NextResponse } from "next/server";
import { routes } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ routes });
}

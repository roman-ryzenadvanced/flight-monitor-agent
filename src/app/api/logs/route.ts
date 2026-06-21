import { NextResponse } from "next/server";
import { logs } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const source = searchParams.get("source");
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  let filtered = logs;
  if (level && level !== "all") {
    filtered = filtered.filter((l) => l.level === level);
  }
  if (source && source !== "all") {
    filtered = filtered.filter((l) => l.source === source);
  }
  filtered = filtered.slice(0, limit);
  return NextResponse.json({ logs: filtered, total: logs.length });
}

import { NextResponse } from "next/server";
import { priceHistories, routes } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("routeId");

  if (routeId) {
    const history = priceHistories.find((h) => h.routeId === routeId);
    if (!history) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }
    return NextResponse.json({ history, route: routes.find((r) => r.id === routeId) });
  }

  return NextResponse.json({ histories: priceHistories });
}

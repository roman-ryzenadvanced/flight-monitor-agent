"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Plane,
  Clock,
  RefreshCw,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ccToFlag, airportByIata } from "@/lib/airports";
import type { Tracker } from "@/lib/trackerStore";
import type { PriceSnapshot } from "@/lib/localDb";
import { useT } from "@/lib/i18n";

interface Props {
  tracker: Tracker;
  latestSnapshot: PriceSnapshot | null;
  onRefresh?: (id: string) => Promise<void>;
  refreshing?: boolean;
}

interface DealRow {
  price: number;
  airline: string;
  source: string;
  stops: number;
  deepLink?: string;
  isLowest: boolean;
}

// Source → display info (icon/label/color)
const sourceInfo: Record<string, { label: string; color: string }> = {
  "skyscanner.com": { label: "Skyscanner", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  "skyscanner": { label: "Skyscanner", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  "google.com": { label: "Google Flights", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "google.com/travel": { label: "Google Flights", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "expedia.com": { label: "Expedia", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  "kayak.com": { label: "Kayak", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  "trip.com": { label: "Trip.com", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  "momondo.com": { label: "Momondo", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  "airhint.com": { label: "AirHint", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  "elal.com": { label: "El Al", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  "ai_estimate": { label: "AI Estimate", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
};

function getSourceInfo(source: string) {
  const normalized = source.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
  for (const [key, info] of Object.entries(sourceInfo)) {
    if (normalized.includes(key)) return info;
  }
  return { label: source, color: "bg-muted text-muted-foreground" };
}

export function FlightDealsGrid({ tracker, latestSnapshot, onRefresh, refreshing }: Props) {
  const t = useT();
  const [sortBy, setSortBy] = useState<"price" | "stops" | "airline">("price");

  const origin = airportByIata[tracker.originIata];
  const dest = airportByIata[tracker.destIata];

  const deals: DealRow[] = useMemo(() => {
    if (!latestSnapshot?.allQuotes || latestSnapshot.allQuotes.length === 0) return [];
    const lowestPrice = Math.min(...latestSnapshot.allQuotes.map((q) => q.price));
    return latestSnapshot.allQuotes.map((q) => ({
      ...q,
      isLowest: q.price === lowestPrice,
    }));
  }, [latestSnapshot]);

  const sortedDeals = useMemo(() => {
    const sorted = [...deals];
    if (sortBy === "price") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "stops") sorted.sort((a, b) => a.stops - b.stops || a.price - b.price);
    else if (sortBy === "airline") sorted.sort((a, b) => a.airline.localeCompare(b.airline));
    return sorted;
  }, [deals, sortBy]);

  if (!origin || !dest) return null;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary shrink-0" />
            <h3 className="font-semibold text-base sm:text-lg truncate">
              Flight deals · {origin.iata} → {dest.iata}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {deals.length > 0
              ? `${deals.length} options from ${new Set(deals.map((d) => d.source)).size} sources`
              : "No deals fetched yet"}
          </p>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh(tracker.id)}
            disabled={refreshing}
            className="gap-2 h-10 min-h-[44px] shrink-0"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">{refreshing ? "Fetching..." : "Refresh"}</span>
          </Button>
        )}
      </div>

      {/* Sort tabs — bigger touch targets */}
      {deals.length > 0 && (
        <div className="flex items-center gap-1 text-xs mb-3 overflow-x-auto">
          <span className="text-muted-foreground ml-1 shrink-0">Sort:</span>
          {(["price", "stops", "airline"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "px-3 py-1.5 rounded-md transition-colors capitalize min-h-[36px] flex items-center",
                sortBy === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {deals.length === 0 ? (
        <div className="py-8 text-center">
          <Plane className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-3 px-4">
            No flight deals yet. Tap "Refresh" to fetch live options.
          </p>
          {onRefresh && (
            <Button onClick={() => onRefresh(tracker.id)} disabled={refreshing} className="gap-2 h-12 min-h-[48px]">
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              {refreshing ? "Fetching..." : "Fetch live prices"}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedDeals.map((deal, i) => {
            const sInfo = getSourceInfo(deal.source);
            return (
              <motion.div
                key={`${deal.airline}-${deal.price}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                className={cn(
                  "rounded-lg border p-3 transition-all hover:shadow-sm",
                  deal.isLowest
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "bg-card hover:bg-accent/30"
                )}
              >
                {/* Mobile: stacked layout, Desktop: horizontal */}
                <div className="flex items-center gap-3">
                  {/* Price */}
                  <div className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] shrink-0">
                    <p className={cn(
                      "text-xl sm:text-2xl font-bold tabular-nums",
                      deal.isLowest && "text-emerald-600 dark:text-emerald-400"
                    )}>
                      ${deal.price}
                    </p>
                    {deal.isLowest && (
                      <Badge className="text-[9px] py-0 h-4 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> LOWEST
                      </Badge>
                    )}
                  </div>

                  {/* Airline + stops */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">{deal.airline}</p>
                      {deal.stops === 0 ? (
                        <Badge variant="outline" className="text-[9px] py-0 h-4 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shrink-0">
                          Direct
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] py-0 h-4 text-muted-foreground shrink-0">
                          {deal.stops} stop{deal.stops > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", sInfo.color)}>
                        {sInfo.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {origin.city} → {dest.city}
                      </span>
                    </div>
                  </div>

                  {/* Click-to-buy button */}
                  {deal.deepLink ? (
                    <a
                      href={deal.deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 sm:px-4 py-2.5 text-xs font-medium transition-colors min-h-[44px] min-w-[44px]"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`View deal for ${deal.airline} at $${deal.price}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">View deal</span>
                    </a>
                  ) : (
                    <span className="shrink-0 text-[10px] text-muted-foreground px-3 py-2.5">
                      No link
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer info */}
      {deals.length > 0 && (
        <div className="mt-3 pt-3 border-t text-[10px] text-muted-foreground flex items-center gap-2 flex-wrap">
          <Clock className="h-3 w-3 shrink-0" />
          <span>Updated {latestSnapshot ? new Date(latestSnapshot.ts).toLocaleString() : ""}</span>
          <span>·</span>
          <span>{deals.length} options</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Tap "View deal" to book</span>
        </div>
      )}
    </Card>
  );
}

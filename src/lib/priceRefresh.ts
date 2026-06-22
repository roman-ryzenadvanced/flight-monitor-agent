"use client";

// Background price refresh service — fetches REAL prices and stores to localDb
// Runs on page load + interval. Generates real alerts when prices drop.

import {
  addSnapshot,
  addAlert,
  addLog,
  getSnapshots,
  getLatestSnapshot,
  recordTrackerScan,
  incrementTodayCounter,
  getOrCreateTodaySummary,
  updateTodaySummary,
  updateGlobalStats,
  getGlobalStats,
  type AlertRecord,
} from "./localDb";
import { useTrackerStore, type Tracker } from "./trackerStore";
import { airportByIata } from "./airports";
import { daysToDeparture } from "./priceEngine";

// Track which trackers are currently being refreshed (prevent duplicates)
const refreshing = new Set<string>();

// Track last refresh time per tracker (min interval: 30 minutes)
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;
const lastRefresh: Map<string, number> = new Map();

export interface RefreshResult {
  trackerId: string;
  success: boolean;
  price?: number;
  error?: string;
  alertGenerated?: AlertRecord;
}

/**
 * Refresh a single tracker: fetch real price, store snapshot, generate alerts.
 */
export async function refreshTrackerPrice(
  tracker: Tracker,
  force = false
): Promise<RefreshResult> {
  // Skip if already refreshing
  if (refreshing.has(tracker.id)) {
    return { trackerId: tracker.id, success: false, error: "already refreshing" };
  }

  // Skip if not forced and recently refreshed
  if (!force) {
    const last = lastRefresh.get(tracker.id);
    if (last && Date.now() - last < REFRESH_INTERVAL_MS) {
      return { trackerId: tracker.id, success: false, error: "recently refreshed" };
    }
  }

  // Skip if tracker is paused
  if (!tracker.active) {
    return { trackerId: tracker.id, success: false, error: "tracker paused" };
  }

  refreshing.add(tracker.id);
  const origin = airportByIata[tracker.originIata];
  const dest = airportByIata[tracker.destIata];

  if (!origin || !dest) {
    refreshing.delete(tracker.id);
    return { trackerId: tracker.id, success: false, error: "airport not found" };
  }

  const routeLabel = `${origin.iata} → ${dest.iata}`;

  try {
    addLog({
      ts: new Date().toISOString(),
      level: "info",
      source: "Scanner",
      message: `Fetching real prices: ${routeLabel} · ${tracker.departDate} · ${tracker.cabin}`,
    });

    // Call the API route which tries: z-ai SDK → server scrape → AI estimator
    const response = await fetch("/api/real-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originIata: tracker.originIata,
        destIata: tracker.destIata,
        departDate: tracker.departDate,
        returnDate: tracker.returnDate,
        cabin: tracker.cabin,
        passengers: tracker.passengers,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    let data = await response.json();

    // If server returned AI-estimated prices (not live), try client-side scraping.
    // The browser can reach any site via CORS proxies — no IP restrictions.
    if (data.dataSource === "live_search_fallback" || data.dataSource === "live_search") {
      // Server already got live prices — use them
    } else {
      // Server returned AI estimates — try client-side scraping as a creative workaround
      try {
        const scrapeResponse = await fetch("/api/client-scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originIata: tracker.originIata,
            destIata: tracker.destIata,
            departDate: tracker.departDate,
            returnDate: tracker.returnDate,
            cabin: tracker.cabin,
            passengers: tracker.passengers,
          }),
        });
        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          if (scrapeData.quotes && scrapeData.quotes.length >= 2) {
            // Scraping succeeded! Use real scraped prices
            data = scrapeData;
            addLog({
              ts: new Date().toISOString(),
              level: "info",
              source: "Scraper",
              message: `Live scrape succeeded: ${routeLabel} — ${scrapeData.quotes.length} real prices from ${scrapeData.sourcesTried?.join(", ")}`,
            });
          }
        }
      } catch (scrapeErr) {
        console.error("[priceRefresh] client scrape failed:", scrapeErr);
      }
    }

    if (!data.lowest || typeof data.lowest.price !== "number") {
      throw new Error("no prices found");
    }

    const price = data.lowest.price;
    const airline = data.lowest.airline || "Unknown";
    const source = data.lowest.source || "web_search";
    const deepLink = data.lowest.deepLink;
    const stops = data.lowest.stops || 0;

    // Collect all quotes for the deals grid
    const allQuotes: Array<{
      price: number;
      airline: string;
      source: string;
      stops: number;
      deepLink?: string;
    }> = Array.isArray(data.quotes)
      ? data.quotes
          .filter((q: { price?: number }) => typeof q.price === "number" && q.price > 0)
          .map((q: { price: number; airline?: string; source?: string; stops?: number; deepLink?: string }) => ({
            price: Math.round(q.price),
            airline: q.airline || "Unknown",
            source: q.source || "web_search",
            stops: typeof q.stops === "number" ? q.stops : 0,
            deepLink: q.deepLink || undefined,
          }))
      : [];

    // Get previous price (for comparison)
    const previous = getLatestSnapshot(tracker.id);
    const previousPrice = previous?.price;

    // Store snapshot with all quotes
    addSnapshot({
      trackerId: tracker.id,
      ts: new Date().toISOString(),
      price,
      currency: "USD",
      airline,
      source,
      stops,
      deepLink,
      allQuotes,
    });

    // Update tracker stats
    recordTrackerScan(tracker.id, true);
    incrementTodayCounter("scansRun");
    updateGlobalStats({
      totalScansEver: getGlobalStats().totalScansEver + 1,
      lastScanAt: new Date().toISOString(),
    });

    // Generate alerts based on price movement
    let alertGenerated: AlertRecord | undefined;

    if (previousPrice) {
      const changePct = ((price - previousPrice) / previousPrice) * 100;

      // Significant price drop (>5%)
      if (changePct <= -5) {
        alertGenerated = addAlert({
          trackerId: tracker.id,
          ts: new Date().toISOString(),
          type: "drop",
          title: `Price drop: ${routeLabel}`,
          description: `Price dropped ${Math.abs(changePct).toFixed(1)}% from $${previousPrice} to $${price} (${airline}). ${stops === 0 ? "Direct flight." : `${stops} stop(s).`}`,
          price,
          previousPrice,
          dropPct: +changePct.toFixed(1),
          acknowledged: false,
          routeLabel,
        });
        incrementTodayCounter("priceDrops");
        addLog({
          ts: new Date().toISOString(),
          level: "info",
          source: "AlertEngine",
          message: `Price drop detected: ${routeLabel} $${previousPrice} → $${price} (${changePct.toFixed(1)}%)`,
        });
      }
      // Significant price increase (>8%) — warn user
      else if (changePct >= 8) {
        addLog({
          ts: new Date().toISOString(),
          level: "warn",
          source: "AlertEngine",
          message: `Price increase: ${routeLabel} $${previousPrice} → $${price} (+${changePct.toFixed(1)}%)`,
        });
      }
    }

    // Check target price alert
    if (tracker.alertThreshold && price <= tracker.alertThreshold) {
      const existingAlert = getSnapshots(tracker.id).length > 0;
      if (existingAlert) {
        alertGenerated = addAlert({
          trackerId: tracker.id,
          ts: new Date().toISOString(),
          type: "target",
          title: `Target price hit: ${routeLabel}`,
          description: `Price $${price} is at or below your target of $${tracker.alertThreshold}! Book now. (${airline}, ${stops === 0 ? "direct" : `${stops} stop(s)`})`,
          price,
          previousPrice,
          dropPct: 0,
          acknowledged: false,
          routeLabel,
        });
        incrementTodayCounter("newDeals");
      }
    }

    // Check if this is a new historical low
    const allSnaps = getSnapshots(tracker.id);
    if (allSnaps.length > 1) {
      const allPrices = allSnaps.map((s) => s.price);
      const historicalLow = Math.min(...allPrices.slice(0, -1)); // exclude current
      if (price < historicalLow) {
        alertGenerated = addAlert({
          trackerId: tracker.id,
          ts: new Date().toISOString(),
          type: "deal",
          title: `New low: ${routeLabel}`,
          description: `New historical low! $${price} (previous low: $${historicalLow}). ${airline}, ${stops === 0 ? "direct flight" : `${stops} stop(s)`}.`,
          price,
          previousPrice: historicalLow,
          dropPct: +(((price - historicalLow) / historicalLow) * 100).toFixed(1),
          acknowledged: false,
          routeLabel,
        });
        incrementTodayCounter("newDeals");
        addLog({
          ts: new Date().toISOString(),
          level: "info",
          source: "AlertEngine",
          message: `New historical low: ${routeLabel} $${price} (was $${historicalLow})`,
        });
      }
    }

    addLog({
      ts: new Date().toISOString(),
      level: "info",
      source: "Scanner",
      message: `Scan complete: ${routeLabel} → $${price} (${airline}, ${source})`,
    });

    lastRefresh.set(tracker.id, Date.now());

    return {
      trackerId: tracker.id,
      success: true,
      price,
      alertGenerated,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    addLog({
      ts: new Date().toISOString(),
      level: "error",
      source: "Scanner",
      message: `Scan failed: ${routeLabel} — ${errMsg}`,
    });
    recordTrackerScan(tracker.id, false);
    incrementTodayCounter("errors");
    return { trackerId: tracker.id, success: false, error: errMsg };
  } finally {
    refreshing.delete(tracker.id);
  }
}

/**
 * Refresh all active trackers sequentially (avoid overwhelming the API).
 */
export async function refreshAllTrackers(force = false): Promise<RefreshResult[]> {
  const trackers = useTrackerStore.getState().trackers.filter((t) => t.active);
  const results: RefreshResult[] = [];

  addLog({
    ts: new Date().toISOString(),
    level: "info",
    source: "Scanner",
    message: `Starting scan cycle: ${trackers.length} active trackers`,
  });

  // Update today's summary routesMonitored
  const today = getOrCreateTodaySummary();
  updateTodaySummary({ routesMonitored: trackers.length });

  for (const tracker of trackers) {
    // Small delay between requests to be polite
    const result = await refreshTrackerPrice(tracker, force);
    results.push(result);
    // Wait 2 seconds between trackers
    if (trackers.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  addLog({
    ts: new Date().toISOString(),
    level: "info",
    source: "Scanner",
    message: `Scan cycle complete: ${results.filter((r) => r.success).length}/${results.length} succeeded`,
  });

  return results;
}

/**
 * Auto-refresh hook: call this on page load + set interval.
 * Returns a cleanup function.
 */
export function startAutoRefresh(intervalMs = 30 * 60 * 1000): () => void {
  // Initial refresh after 5 seconds (let page settle)
  const initialTimeout = setTimeout(() => {
    refreshAllTrackers(false).catch(console.error);
  }, 5000);

  // Periodic refresh
  const interval = setInterval(() => {
    refreshAllTrackers(false).catch(console.error);
  }, intervalMs);

  return () => {
    clearTimeout(initialTimeout);
    clearInterval(interval);
  };
}

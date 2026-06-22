"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Radar,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Database,
  Activity,
  Heart,
  Cpu,
  HardDrive,
  MemoryStick,
  Clock,
  Mail,
  Server,
  Brain,
  Plus,
  Zap,
  Shield,
  RefreshCw,
  Github,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { ScannerPanel } from "@/components/dashboard/ScannerPanel";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { PriceHistoryChart } from "@/components/dashboard/PriceHistoryChart";
import { ForecastPanel } from "@/components/dashboard/ForecastPanel";
import { LogsViewer } from "@/components/dashboard/LogsViewer";
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard";
import { TrackerCard } from "@/components/dashboard/TrackerCard";
import { NewTrackerDialog } from "@/components/dashboard/NewTrackerDialog";
import { LanguageSwitcher } from "@/components/dashboard/LanguageSwitcher";
import { FlightDealsGrid } from "@/components/dashboard/FlightDealsGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useTrackerStore, useSelectedTracker } from "@/lib/trackerStore";
import { airportByIata } from "@/lib/airports";
import { daysToDeparture, type FlightRoute } from "@/lib/priceEngine";
import {
  getAlerts,
  getLogs,
  getSummaries,
  getRoutePriceStats,
  getTrackerStats,
  getGlobalStats,
  getSnapshots,
  getLatestSnapshot,
  acknowledgeAlert,
  type AlertRecord,
  type LogRecord,
  type DailySummaryRecord,
  type RoutePriceStats,
  type PriceSnapshot,
} from "@/lib/localDb";
import { refreshAllTrackers, refreshTrackerPrice, startAutoRefresh } from "@/lib/priceRefresh";
import type { ScannerStatus } from "@/lib/mock/data";

export default function Home() {
  const t = useT();
  // Detect if running on Vercel (production/preview) vs local sandbox.
  // Vercel sets NEXT_PUBLIC_VERCEL_ENV to "production" or "preview".
  // In the sandbox, this is undefined.
  const isDemoMode = typeof window !== "undefined"
    ? window.location.hostname.includes("vercel.app")
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

  const trackers = useTrackerStore((s) => s.trackers);
  const selectedId = useTrackerStore((s) => s.selectedId);
  const setSelected = useTrackerStore((s) => s.setSelected);
  const selectedTracker = useSelectedTracker();
  const [trackerFilter, setTrackerFilter] = useState<"all" | "active" | "paused">("all");

  // Real data from localDb
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [summaries, setSummaries] = useState<DailySummaryRecord[]>([]);
  const [routeStats, setRouteStats] = useState<Record<string, RoutePriceStats | null>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0); // force re-render

  // Reload data from localDb
  const reloadData = useCallback(() => {
    setAlerts(getAlerts());
    setLogs(getLogs());
    setSummaries(getSummaries());
    const stats: Record<string, RoutePriceStats | null> = {};
    for (const tracker of trackers) {
      stats[tracker.id] = getRoutePriceStats(tracker.id);
    }
    setRouteStats(stats);
    setTick((x) => x + 1);
  }, [trackers]);

  // Track last snapshot count to detect when new data arrives
  const lastSnapshotCountRef = useRef(0);

  // Initial load + auto-refresh
  useEffect(() => {
    reloadData();
    const cleanup = startAutoRefresh(30 * 60 * 1000); // every 30 min
    // Check for new data every 15 seconds — only reload if snapshot count changed
    const interval = setInterval(() => {
      const currentCount = getSnapshots().length;
      if (currentCount !== lastSnapshotCountRef.current) {
        lastSnapshotCountRef.current = currentCount;
        reloadData();
      }
    }, 15000);
    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [reloadData]);

  // Reload when trackers change
  useEffect(() => {
    reloadData();
  }, [trackers, reloadData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllTrackers(true);
      reloadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshOne = async (trackerId: string) => {
    const tracker = trackers.find((t) => t.id === trackerId);
    if (!tracker) return;
    await refreshTrackerPrice(tracker, true);
    reloadData();
  };

  const handleAckAlert = (id: string) => {
    acknowledgeAlert(id);
    reloadData();
  };

  // Compute stats from real data
  const activeTrackers = trackers.filter((tr) => tr.active);
  const filteredTrackers =
    trackerFilter === "all"
      ? trackers
      : trackerFilter === "active"
      ? activeTrackers
      : trackers.filter((tr) => !tr.active);

  const dealsDetected = trackers.filter((tr) => {
    const stats = routeStats[tr.id];
    return stats && stats.dropPct <= -15;
  }).length;

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const dropsCount = alerts.filter((a) => a.type === "drop").length;

  const globalStats = getGlobalStats();
  const todaySummary = summaries.find((s) => s.date === new Date().toISOString().slice(0, 10));

  const totalSnapshots = trackers.reduce((sum, tr) => {
    const stats = routeStats[tr.id];
    return sum + (stats?.history.length || 0);
  }, 0);

  // Scanner status derived from real activity
  const scannerStatus: ScannerStatus = {
    status: refreshing ? "running" : activeTrackers.length > 0 ? "idle" : "paused",
    currentRoute: null,
    currentProvider: null,
    progressPct: refreshing ? 50 : 100,
    startedAt: globalStats.scannerStartedAt,
    etaSeconds: 0,
    queueLength: activeTrackers.length,
    cyclesToday: todaySummary?.scansRun || 0,
    uptimeHours: Math.round(
      (Date.now() - new Date(globalStats.scannerStartedAt).getTime()) / (1000 * 60 * 60)
    ),
  };

  const systemStats = {
    totalRoutes: trackers.length,
    activeProviders: 1, // web search is the "provider"
    scansToday: todaySummary?.scansRun || 0,
    dealsDetected: todaySummary?.newDeals || 0,
    alertsTriggered: alerts.length,
    dbSizeMb: Math.round((JSON.stringify({ alerts, logs, summaries }).length / 1024) * 10) / 10,
    lastBackup: new Date().toISOString(),
    healthScore: 100,
    cpuPct: refreshing ? 35 : 5,
    memPct: 20,
    diskPct: 10,
  };

  const backupHoursAgo = 0;

  // Build selected tracker details
  const selectedDetails = useMemo(() => {
    if (!selectedTracker) return null;
    const origin = airportByIata[selectedTracker.originIata];
    const dest = airportByIata[selectedTracker.destIata];
    const stats = routeStats[selectedTracker.id];
    if (!origin || !dest || !stats) return null;
    return { origin, dest, stats };
  }, [selectedTracker, routeStats, tick]);

  // Latest snapshot for the selected tracker (for the deals grid)
  const [selectedSnapshot, setSelectedSnapshot] = useState<PriceSnapshot | null>(null);
  useEffect(() => {
    if (selectedTracker) {
      setSelectedSnapshot(getLatestSnapshot(selectedTracker.id));
    } else {
      setSelectedSnapshot(null);
    }
  }, [selectedTracker, tick]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Demo Mode Banner — only shown on Vercel (not in local sandbox) */}
      {isDemoMode && (
        <DemoBanner />
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Plane className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-lg leading-tight truncate">
                {t("appTitle")}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                {t("appSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="gap-1.5 h-9 sm:h-9 min-h-[40px] px-2.5"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">{refreshing ? "Scanning..." : "Refresh"}</span>
            </Button>
            <div className="hidden md:flex items-center gap-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-muted-foreground">
                {t("active")} · {t("uptime")} {scannerStatus.uptimeHours}{t("hours")}
              </span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1">
        <Tabs defaultValue="trackers" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto gap-1">
            <TabsTrigger value="trackers" className="text-xs sm:text-sm min-h-[40px]">{t("tabTrackers")}</TabsTrigger>
            <TabsTrigger value="overview" className="text-xs sm:text-sm min-h-[40px]">{t("tabOverview")}</TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs sm:text-sm min-h-[40px]">{t("tabForecast")}</TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm min-h-[40px]">{t("tabSystem")}</TabsTrigger>
          </TabsList>

          {/* ===== TRACKERS ===== */}
          <TabsContent value="trackers" className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold text-xl">{t("trackers")}</h2>
                <p className="text-sm text-muted-foreground">
                  {trackers.length} {t("savedTrackers").toLowerCase()} · {activeTrackers.length} {t("active").toLowerCase()} · {totalSnapshots} real price snapshots
                </p>
              </div>
              <NewTrackerDialog>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("newTracker")}
                </Button>
              </NewTrackerDialog>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 text-sm">
              {(["all", "active", "paused"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTrackerFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-colors min-h-[36px] flex items-center",
                    trackerFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  {f === "all" ? t("all") : f === "active" ? t("active2") : t("paused2")}
                  <span className="mr-1.5 text-[10px] opacity-70 tabular-nums">
                    {f === "all" ? trackers.length : f === "active" ? activeTrackers.length : trackers.length - activeTrackers.length}
                  </span>
                </button>
              ))}
            </div>

            {trackers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-dashed bg-card p-12 text-center"
              >
                <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className="font-semibold text-lg">{t("noTrackers")}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  {t("noTrackersDesc")}
                </p>
                <div className="mt-4">
                  <NewTrackerDialog>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t("createFirstTracker")}
                    </Button>
                  </NewTrackerDialog>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrackers.map((tracker, i) => (
                  <TrackerCard
                    key={tracker.id}
                    tracker={tracker}
                    index={i}
                    selected={selectedId === tracker.id}
                    onSelect={() => setSelected(tracker.id)}
                    onRefresh={handleRefreshOne}
                    routeStats={routeStats[tracker.id]}
                  />
                ))}
              </div>
            )}

            {/* Selected tracker details */}
            {selectedTracker && selectedDetails && (
              <div className="space-y-6">
                <PriceHistoryChart
                  history={{
                    routeId: selectedTracker.id,
                    route: `${selectedDetails.origin.iata} → ${selectedDetails.dest.iata}`,
                    points: selectedDetails.stats.history,
                  }}
                  route={{
                    id: selectedTracker.id,
                    origin: selectedDetails.origin.iata,
                    originName: selectedDetails.origin.city,
                    destination: selectedDetails.dest.iata,
                    destinationName: selectedDetails.dest.city,
                    currentPrice: selectedDetails.stats.current,
                    lowestPrice: selectedDetails.stats.lowest,
                    highestPrice: selectedDetails.stats.highest,
                    averagePrice: selectedDetails.stats.average,
                    currency: "USD",
                    lastUpdated: new Date().toISOString(),
                    trend: selectedDetails.stats.trend,
                    dropPct: selectedDetails.stats.dropPct,
                    daysToDeparture: daysToDeparture(selectedTracker.departDate),
                    monitoring: selectedTracker.active,
                  } as FlightRoute}
                />
                <ForecastPanel
                  history={{
                    routeId: selectedTracker.id,
                    route: `${selectedDetails.origin.iata} → ${selectedDetails.dest.iata}`,
                    points: selectedDetails.stats.history,
                  }}
                  route={{
                    id: selectedTracker.id,
                    origin: selectedDetails.origin.iata,
                    originName: selectedDetails.origin.city,
                    destination: selectedDetails.dest.iata,
                    destinationName: selectedDetails.dest.city,
                    currentPrice: selectedDetails.stats.current,
                    lowestPrice: selectedDetails.stats.lowest,
                    highestPrice: selectedDetails.stats.highest,
                    averagePrice: selectedDetails.stats.average,
                    currency: "USD",
                    lastUpdated: new Date().toISOString(),
                    trend: selectedDetails.stats.trend,
                    dropPct: selectedDetails.stats.dropPct,
                    daysToDeparture: daysToDeparture(selectedTracker.departDate),
                    monitoring: selectedTracker.active,
                  } as FlightRoute}
                />
                <FlightDealsGrid
                  tracker={selectedTracker}
                  latestSnapshot={selectedSnapshot}
                  onRefresh={handleRefreshOne}
                  refreshing={refreshing}
                />
              </div>
            )}
          </TabsContent>

          {/* ===== OVERVIEW ===== */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title={t("monitoredRoutes")}
                value={trackers.length}
                subtitle={`${activeTrackers.length} ${t("activeNow")}`}
                icon={Plane}
                accent="info"
                index={0}
              />
              <StatCard
                title={t("scansToday")}
                value={todaySummary?.scansRun || 0}
                subtitle={`${globalStats.totalScansEver} total`}
                icon={Radar}
                accent="default"
                index={1}
              />
              <StatCard
                title={t("dealsToday")}
                value={todaySummary?.newDeals || 0}
                subtitle={`${todaySummary?.priceDrops || 0} ${t("priceDrops")}`}
                icon={Sparkles}
                accent="success"
                index={2}
              />
              <StatCard
                title={t("activeAlerts")}
                value={activeAlerts.length}
                subtitle={`${alerts.length} ${t("total")}`}
                icon={AlertCircle}
                accent={activeAlerts.length > 3 ? "warning" : "default"}
                index={3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ScannerPanel scanner={scannerStatus} />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{t("recentAlerts")}</h3>
                    <span className="text-xs text-muted-foreground">{activeAlerts.length} {t("unacknowledged")}</span>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                      No alerts yet. Prices will be monitored automatically — you'll see alerts here when prices drop.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {alerts.slice(0, 6).map((alert, i) => (
                        <RealAlertCard key={alert.id} alert={alert} index={i} onAck={handleAckAlert} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{t("hotRoutes")}</h3>
                    <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {trackers
                      .map((tr) => ({ tracker: tr, stats: routeStats[tr.id] }))
                      .filter((x) => x.stats)
                      .sort((a, b) => (a.stats!.dropPct || 0) - (b.stats!.dropPct || 0))
                      .slice(0, 8)
                      .map(({ tracker, stats }, i) => (
                        <TrackerCard
                          key={tracker.id}
                          tracker={tracker}
                          index={i}
                          selected={selectedId === tracker.id}
                          onSelect={() => setSelected(tracker.id)}
                          routeStats={stats || undefined}
                        />
                      ))}
                    {trackers.every((tr) => !routeStats[tr.id]) && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No price data yet. Click "Refresh" to fetch live prices.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{t("systemHealth")}</h3>
                  </div>
                  <div className="space-y-3">
                    <HealthBar icon={Cpu} label={t("cpu")} value={systemStats.cpuPct} suffix="%" />
                    <HealthBar icon={MemoryStick} label={t("ram")} value={systemStats.memPct} suffix="%" />
                    <HealthBar icon={HardDrive} label={t("disk")} value={systemStats.diskPct} suffix="%" />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Database className="h-3 w-3" /> {t("dbSize")}
                        </p>
                        <p className="font-semibold text-sm tabular-nums">{systemStats.dbSizeMb} KB</p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t("lastBackup")}
                        </p>
                        <p className="font-semibold text-sm tabular-nums">{t("now")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ===== FORECAST ===== */}
          <TabsContent value="forecast" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{t("aiForecast")}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {t("aiForecastDesc")} <strong>{t("recommendation")}</strong>.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {t("realtimeProcessing")}</span>
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {t("statisticalFallback")}</span>
                    <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {t("jaxBackend")}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {trackers.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-card p-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">{t("noTrackersDesc")}</p>
              </div>
            ) : !selectedTracker || !selectedDetails ? (
              <div className="rounded-xl border bg-card p-12 text-center">
                <p className="font-semibold">{t("selectRouteForForecast")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("selectTrackerDesc")}</p>
              </div>
            ) : selectedDetails.stats.history.length < 3 ? (
              <div className="rounded-xl border bg-card p-12 text-center">
                <p className="font-semibold">Need more price data for forecast</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Only {selectedDetails.stats.history.length} snapshot(s) available. The forecast improves with more data.
                  Click "Refresh" to fetch more prices.
                </p>
                <Button className="mt-4 gap-2" onClick={() => handleRefreshOne(selectedTracker.id)}>
                  <RefreshCw className="h-4 w-4" /> Fetch prices now
                </Button>
              </div>
            ) : (
              <>
                <ForecastPanel
                  history={{
                    routeId: selectedTracker.id,
                    route: `${selectedDetails.origin.iata} → ${selectedDetails.dest.iata}`,
                    points: selectedDetails.stats.history,
                  }}
                  route={{
                    id: selectedTracker.id,
                    origin: selectedDetails.origin.iata,
                    originName: selectedDetails.origin.city,
                    destination: selectedDetails.dest.iata,
                    destinationName: selectedDetails.dest.city,
                    currentPrice: selectedDetails.stats.current,
                    lowestPrice: selectedDetails.stats.lowest,
                    highestPrice: selectedDetails.stats.highest,
                    averagePrice: selectedDetails.stats.average,
                    currency: "USD",
                    lastUpdated: new Date().toISOString(),
                    trend: selectedDetails.stats.trend,
                    dropPct: selectedDetails.stats.dropPct,
                    daysToDeparture: daysToDeparture(selectedTracker.departDate),
                    monitoring: selectedTracker.active,
                  } as FlightRoute}
                />
                <PriceHistoryChart
                  history={{
                    routeId: selectedTracker.id,
                    route: `${selectedDetails.origin.iata} → ${selectedDetails.dest.iata}`,
                    points: selectedDetails.stats.history,
                  }}
                  route={{
                    id: selectedTracker.id,
                    origin: selectedDetails.origin.iata,
                    originName: selectedDetails.origin.city,
                    destination: selectedDetails.dest.iata,
                    destinationName: selectedDetails.dest.city,
                    currentPrice: selectedDetails.stats.current,
                    lowestPrice: selectedDetails.stats.lowest,
                    highestPrice: selectedDetails.stats.highest,
                    averagePrice: selectedDetails.stats.average,
                    currency: "USD",
                    lastUpdated: new Date().toISOString(),
                    trend: selectedDetails.stats.trend,
                    dropPct: selectedDetails.stats.dropPct,
                    daysToDeparture: daysToDeparture(selectedTracker.departDate),
                    monitoring: selectedTracker.active,
                  } as FlightRoute}
                />
              </>
            )}
          </TabsContent>

          {/* ===== SYSTEM ===== */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title={t("healthScoreLabel")}
                value={`${systemStats.healthScore}%`}
                subtitle={t("ok")}
                icon={Heart}
                accent="success"
                index={0}
              />
              <StatCard
                title={t("scansToday")}
                value={systemStats.scansToday}
                subtitle={`${globalStats.totalScansEver} total`}
                icon={Radar}
                accent="info"
                index={1}
              />
              <StatCard
                title={t("dbSize")}
                value={`${systemStats.dbSizeMb} KB`}
                subtitle="localStorage"
                icon={Database}
                accent="default"
                index={2}
              />
              <StatCard
                title={t("uptime")}
                value={`${scannerStatus.uptimeHours}${t("hours")}`}
                subtitle={`${totalSnapshots} snapshots`}
                icon={Activity}
                accent="success"
                index={3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{t("systemResources")}</h3>
                </div>
                <div className="space-y-4">
                  <HealthBar icon={Cpu} label={t("cpu")} value={systemStats.cpuPct} suffix="%" />
                  <HealthBar icon={MemoryStick} label={t("ram")} value={systemStats.memPct} suffix="%" />
                  <HealthBar icon={HardDrive} label={t("disk")} value={systemStats.diskPct} suffix="%" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Database className="h-3 w-3" /> {t("dbSize")}
                    </p>
                    <p className="font-semibold text-sm tabular-nums">{systemStats.dbSizeMb} KB</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Snapshots
                    </p>
                    <p className="font-semibold text-sm tabular-nums">{totalSnapshots}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{t("recentDailySummaries")}</h3>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {summaries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Daily summaries will appear here as the scanner runs.
                    </p>
                  ) : (
                    summaries.map((s, i) => (
                      <RealDailySummaryCard key={s.date} summary={s} index={i} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                No logs yet. Activity logs will appear here when the scanner runs.
              </div>
            ) : (
              <LogsViewer logs={logs.map((l) => ({ ...l, context: undefined }))} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              {t("active")}
            </span>
            <span>·</span>
            <span>Real-time data</span>
            <span>·</span>
            <span>Live web search</span>
            <span>·</span>
            <span>localStorage DB</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Brain className="h-3 w-3" /> TimesFM 2.5
            </span>
          </div>
          <div>{new Date().toLocaleString()}</div>
        </div>
      </footer>
    </div>
  );
}

function HealthBar({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof Cpu;
  label: string;
  value: number;
  suffix?: string;
}) {
  const color = value < 50 ? "bg-emerald-500" : value < 75 ? "bg-amber-500" : "bg-rose-500";
  const textColor =
    value < 50
      ? "text-emerald-600 dark:text-emerald-400"
      : value < 75
      ? "text-amber-600 dark:text-amber-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className={cn("font-semibold tabular-nums", textColor)}>
          {value}{suffix}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Real alert card (uses AlertRecord from localDb)
function RealAlertCard({
  alert,
  index,
  onAck,
}: {
  alert: AlertRecord;
  index: number;
  onAck: (id: string) => void;
}) {
  const typeMap = {
    deal: { label: "Deal", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: Sparkles },
    drop: { label: "Drop", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30", icon: TrendingDown },
    target: { label: "Target", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: AlertCircle },
    info: { label: "Info", color: "text-muted-foreground", bg: "bg-muted", border: "border-border", icon: AlertCircle },
  };
  const tt = typeMap[alert.type];
  const Icon = tt.icon;
  const isDrop = alert.dropPct < 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn("relative rounded-xl border bg-card p-4 shadow-sm", tt.border)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tt.bg, tt.color)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", tt.bg, tt.color)}>
                  {tt.label}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(alert.ts).toLocaleString()}
                </span>
                {alert.acknowledged && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ acknowledged</span>
                )}
              </div>
              <h4 className="mt-1 font-semibold text-sm leading-tight">{alert.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{alert.routeLabel}</p>
            </div>
            <div className="text-left shrink-0">
              <p className="text-lg font-bold tabular-nums">${alert.price}</p>
              {alert.previousPrice && (
                <p className={cn(
                  "text-xs font-medium tabular-nums",
                  isDrop ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {isDrop ? "▼" : "▲"} {Math.abs(alert.dropPct)}%
                </p>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{alert.description}</p>
          {!alert.acknowledged && (
            <button
              onClick={() => onAck(alert.id)}
              className="mt-2 text-xs font-medium text-primary hover:underline"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Real daily summary card
function RealDailySummaryCard({
  summary,
  index,
}: {
  summary: DailySummaryRecord;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground font-medium">
            {new Date(summary.date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Daily summary</span>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-2">
          <div className="rounded bg-muted/50 p-1.5 text-center">
            <p className="text-sm font-bold tabular-nums">{summary.scansRun}</p>
            <p className="text-[9px] text-muted-foreground">scans</p>
          </div>
          <div className="rounded bg-muted/50 p-1.5 text-center">
            <p className="text-sm font-bold tabular-nums">{summary.routesMonitored}</p>
            <p className="text-[9px] text-muted-foreground">routes</p>
          </div>
          <div className="rounded bg-emerald-500/10 p-1.5 text-center">
            <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{summary.newDeals}</p>
            <p className="text-[9px] text-muted-foreground">deals</p>
          </div>
          <div className="rounded bg-sky-500/10 p-1.5 text-center">
            <p className="text-sm font-bold tabular-nums text-sky-600 dark:text-sky-400">{summary.priceDrops}</p>
            <p className="text-[9px] text-muted-foreground">drops</p>
          </div>
          <div className={cn("p-1.5 text-center rounded", summary.errors > 5 ? "bg-rose-500/10" : "bg-muted/50")}>
            <p className={cn("text-sm font-bold tabular-nums", summary.errors > 5 ? "text-rose-600 dark:text-rose-400" : "")}>
              {summary.errors}
            </p>
            <p className="text-[9px] text-muted-foreground">errors</p>
          </div>
        </div>
        {summary.topDeals.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Top deals</p>
            {summary.topDeals.slice(0, 3).map((deal, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-0.5">
                <span className="font-mono">{deal.route}</span>
                <span className="font-bold tabular-nums">${deal.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Demo Mode Banner — shown only on Vercel (not in local sandbox)
// Explains that prices are estimated and TimesFM forecast uses statistical fallback.
// Links to the GitHub repo for the full live experience.
function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full bg-amber-500/95 dark:bg-amber-600/95 text-amber-950 dark:text-amber-50 shadow-md"
    >
      <div className="container mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <div className="min-w-0 flex-1 text-xs sm:text-sm">
            <span className="font-bold">Demo Mode</span>
            <span className="hidden sm:inline"> — Prices are AI-estimated and forecasts use statistical fallback.</span>
            <span className="sm:hidden"> — Estimated prices.</span>
            <a
              href="https://github.com/roman-ryzenadvanced/flight-monitor-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-1.5 sm:ml-2 font-semibold underline hover:no-underline whitespace-nowrap"
            >
              <Github className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Use GitHub repo for live experience</span>
              <span className="sm:hidden">GitHub repo</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md hover:bg-amber-600/20 dark:hover:bg-amber-300/20 transition-colors min-h-[28px] min-w-[28px]"
          aria-label="Dismiss banner"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { ScannerPanel } from "@/components/dashboard/ScannerPanel";
import { ProviderCard } from "@/components/dashboard/ProviderCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { PriceHistoryChart } from "@/components/dashboard/PriceHistoryChart";
import { ForecastPanel } from "@/components/dashboard/ForecastPanel";
import { LogsViewer } from "@/components/dashboard/LogsViewer";
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard";
import { TrackerCard } from "@/components/dashboard/TrackerCard";
import { NewTrackerDialog } from "@/components/dashboard/NewTrackerDialog";
import { LanguageSwitcher } from "@/components/dashboard/LanguageSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useTrackerStore, useSelectedTracker } from "@/lib/trackerStore";
import { airportByIata } from "@/lib/airports";
import {
  generatePriceData,
  daysToDeparture,
  type PriceSnapshot,
} from "@/lib/priceEngine";
import type {
  Provider,
  Alert,
  LogEntry,
  DailySummary,
  ScannerStatus,
  SystemStats,
} from "@/lib/mock/data";

interface DashboardData {
  providers: Provider[];
  alerts: Alert[];
  logs: LogEntry[];
  summaries: DailySummary[];
  stats: SystemStats;
  scanner: ScannerStatus;
}

export default function Home() {
  const t = useT();
  const [data, setData] = useState<DashboardData | null>(null);
  const trackers = useTrackerStore((s) => s.trackers);
  const selectedId = useTrackerStore((s) => s.selectedId);
  const setSelected = useTrackerStore((s) => s.setSelected);
  const selectedTracker = useSelectedTracker();
  const [trackerFilter, setTrackerFilter] = useState<"all" | "active" | "paused">("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/providers").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
      fetch("/api/logs").then((r) => r.json()),
      fetch("/api/summary").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]).then(([providers, alerts, logs, summary, stats]) => {
      setData({
        providers: providers.providers,
        alerts: alerts.alerts,
        logs: logs.logs,
        summaries: summary.summaries,
        stats: stats.stats,
        scanner: stats.scanner,
      });
    });
  }, []);

  // Generate price data for each tracker (deterministic by route)
  const trackerPriceData = useMemo(() => {
    const map = new Map<string, PriceSnapshot>();
    for (const tracker of trackers) {
      const origin = airportByIata[tracker.originIata];
      const dest = airportByIata[tracker.destIata];
      if (!origin || !dest) continue;
      map.set(
        tracker.id,
        generatePriceData(origin, dest, {
          originIata: tracker.originIata,
          destIata: tracker.destIata,
          departDate: tracker.departDate,
          returnDate: tracker.returnDate,
          cabin: tracker.cabin,
          passengers: tracker.passengers,
        })
      );
    }
    return map;
  }, [trackers]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
            <Plane className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const activeTrackers = trackers.filter((tr) => tr.active);
  const filteredTrackers =
    trackerFilter === "all"
      ? trackers
      : trackerFilter === "active"
      ? activeTrackers
      : trackers.filter((tr) => !tr.active);

  const dealsDetected = trackers.filter((tr) => {
    const pd = trackerPriceData.get(tr.id);
    return pd && pd.dropPct <= -15;
  }).length;

  const activeAlerts = data.alerts.filter((a) => !a.acknowledged);
  const dropsCount = data.alerts.filter((a) => a.type === "drop").length;
  const activeProviders = data.providers.filter((p) => p.status === "active").length;
  const cooldownProviders = data.providers.filter((p) => p.status === "cooldown" || p.status === "blocked").length;

  const healthColor =
    data.stats.healthScore >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : data.stats.healthScore >= 60
      ? "text-amber-600 dark:text-amber-400"
      : "text-rose-600 dark:text-rose-400";

  const lastBackup = new Date(data.stats.lastBackup);
  const backupHoursAgo = Math.round((Date.now() - lastBackup.getTime()) / (1000 * 60 * 60));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Plane className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg leading-tight truncate">
                {t("appTitle")}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {t("appSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-muted-foreground">
                {t("active")} · {t("uptime")} {Math.round(data.scanner.uptimeHours / 24)}{t("days")}
              </span>
            </div>
            <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", healthColor)}>
              <Heart className="h-3 w-3" />
              <span className="tabular-nums">{data.stats.healthScore}%</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex-1">
        <Tabs defaultValue="trackers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="trackers" className="text-xs sm:text-sm">{t("tabTrackers")}</TabsTrigger>
            <TabsTrigger value="overview" className="text-xs sm:text-sm">{t("tabOverview")}</TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs sm:text-sm">{t("tabForecast")}</TabsTrigger>
            <TabsTrigger value="providers" className="text-xs sm:text-sm">{t("tabProviders")}</TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm">{t("tabSystem")}</TabsTrigger>
          </TabsList>

          {/* ===== TRACKERS ===== */}
          <TabsContent value="trackers" className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold text-xl">{t("trackers")}</h2>
                <p className="text-sm text-muted-foreground">
                  {trackers.length} {t("savedTrackers").toLowerCase()} · {activeTrackers.length} {t("active").toLowerCase()}
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
                    "px-3 py-1 rounded-md transition-colors",
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
                  />
                ))}
              </div>
            )}

            {/* Selected tracker details */}
            {selectedTracker && (
              <div className="space-y-6">
                {(() => {
                  const origin = airportByIata[selectedTracker.originIata];
                  const dest = airportByIata[selectedTracker.destIata];
                  const pd = trackerPriceData.get(selectedTracker.id);
                  if (!origin || !dest || !pd) return null;
                  const history = {
                    routeId: selectedTracker.id,
                    route: `${origin.iata} → ${dest.iata}`,
                    points: pd.history,
                  };
                  return (
                    <>
                      <PriceHistoryChart
                        history={history}
                        route={{
                          id: selectedTracker.id,
                          origin: origin.iata,
                          originName: origin.city,
                          destination: dest.iata,
                          destinationName: dest.city,
                          currentPrice: pd.current,
                          lowestPrice: pd.lowest,
                          highestPrice: pd.highest,
                          averagePrice: pd.average,
                          currency: "USD",
                          lastUpdated: new Date().toISOString(),
                          trend: pd.trend,
                          dropPct: pd.dropPct,
                          daysToDeparture: daysToDeparture(selectedTracker.departDate),
                          monitoring: selectedTracker.active,
                        }}
                      />
                      <ForecastPanel history={history} route={{
                        id: selectedTracker.id,
                        origin: origin.iata,
                        originName: origin.city,
                        destination: dest.iata,
                        destinationName: dest.city,
                        currentPrice: pd.current,
                        lowestPrice: pd.lowest,
                        highestPrice: pd.highest,
                        averagePrice: pd.average,
                        currency: "USD",
                        lastUpdated: new Date().toISOString(),
                        trend: pd.trend,
                        dropPct: pd.dropPct,
                        daysToDeparture: daysToDeparture(selectedTracker.departDate),
                        monitoring: selectedTracker.active,
                      }} />
                    </>
                  );
                })()}
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
                value={data.stats.scansToday}
                subtitle={`${data.scanner.cyclesToday} ${t("cycles")}`}
                icon={Radar}
                accent="default"
                index={1}
              />
              <StatCard
                title={t("dealsToday")}
                value={dealsDetected}
                subtitle={`${dropsCount} ${t("priceDrops")}`}
                icon={Sparkles}
                accent="success"
                trend="up"
                trendValue={t("detectingNewLows")}
                index={2}
              />
              <StatCard
                title={t("activeAlerts")}
                value={activeAlerts.length}
                subtitle={`${data.stats.alertsTriggered} ${t("total")}`}
                icon={AlertCircle}
                accent={activeAlerts.length > 3 ? "warning" : "default"}
                index={3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ScannerPanel scanner={data.scanner} />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{t("recentAlerts")}</h3>
                    <span className="text-xs text-muted-foreground">{activeAlerts.length} {t("unacknowledged")}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.alerts.slice(0, 6).map((alert, i) => (
                      <AlertCard key={alert.id} alert={alert} index={i} />
                    ))}
                  </div>
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
                      .map((tr) => ({ tracker: tr, pd: trackerPriceData.get(tr.id) }))
                      .filter((x) => x.pd)
                      .sort((a, b) => a.pd!.dropPct - b.pd!.dropPct)
                      .slice(0, 8)
                      .map(({ tracker, pd }, i) => {
                        const origin = airportByIata[tracker.originIata];
                        const dest = airportByIata[tracker.destIata];
                        if (!origin || !dest || !pd) return null;
                        return (
                          <TrackerCard
                            key={tracker.id}
                            tracker={tracker}
                            index={i}
                            selected={selectedId === tracker.id}
                            onSelect={() => setSelected(tracker.id)}
                          />
                        );
                      })}
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{t("systemHealth")}</h3>
                  </div>
                  <div className="space-y-3">
                    <HealthBar icon={Cpu} label={t("cpu")} value={data.stats.cpuPct} suffix="%" t={t} />
                    <HealthBar icon={MemoryStick} label={t("ram")} value={data.stats.memPct} suffix="%" t={t} />
                    <HealthBar icon={HardDrive} label={t("disk")} value={data.stats.diskPct} suffix="%" t={t} />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Database className="h-3 w-3" /> {t("dbSize")}
                        </p>
                        <p className="font-semibold text-sm tabular-nums">{data.stats.dbSizeMb} MB</p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t("lastBackup")}
                        </p>
                        <p className="font-semibold text-sm tabular-nums">{backupHoursAgo}{t("hourAgo")}</p>
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
                <p className="text-sm text-muted-foreground">
                  {t("noTrackersDesc")}
                </p>
              </div>
            ) : !selectedTracker ? (
              <div className="rounded-xl border bg-card p-12 text-center">
                <p className="font-semibold">{t("selectRouteForForecast")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("selectTrackerDesc")}</p>
              </div>
            ) : (
              (() => {
                const origin = airportByIata[selectedTracker.originIata];
                const dest = airportByIata[selectedTracker.destIata];
                const pd = trackerPriceData.get(selectedTracker.id);
                if (!origin || !dest || !pd) return null;
                const history = {
                  routeId: selectedTracker.id,
                  route: `${origin.iata} → ${dest.iata}`,
                  points: pd.history,
                };
                return (
                  <>
                    <ForecastPanel history={history} route={{
                      id: selectedTracker.id,
                      origin: origin.iata,
                      originName: origin.city,
                      destination: dest.iata,
                      destinationName: dest.city,
                      currentPrice: pd.current,
                      lowestPrice: pd.lowest,
                      highestPrice: pd.highest,
                      averagePrice: pd.average,
                      currency: "USD",
                      lastUpdated: new Date().toISOString(),
                      trend: pd.trend,
                      dropPct: pd.dropPct,
                      daysToDeparture: daysToDeparture(selectedTracker.departDate),
                      monitoring: selectedTracker.active,
                    }} />
                    <PriceHistoryChart
                      history={history}
                      route={{
                        id: selectedTracker.id,
                        origin: origin.iata,
                        originName: origin.city,
                        destination: dest.iata,
                        destinationName: dest.city,
                        currentPrice: pd.current,
                        lowestPrice: pd.lowest,
                        highestPrice: pd.highest,
                        averagePrice: pd.average,
                        currency: "USD",
                        lastUpdated: new Date().toISOString(),
                        trend: pd.trend,
                        dropPct: pd.dropPct,
                        daysToDeparture: daysToDeparture(selectedTracker.departDate),
                        monitoring: selectedTracker.active,
                      }}
                    />
                  </>
                );
              })()
            )}
          </TabsContent>

          {/* ===== PROVIDERS ===== */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title={t("activeProviders")}
                value={activeProviders}
                subtitle={`${t("of")} ${data.providers.length}`}
                icon={Radar}
                accent="success"
                index={0}
              />
              <StatCard
                title={t("inCooldown")}
                value={cooldownProviders}
                subtitle={t("waitingToExpire")}
                icon={Clock}
                accent="warning"
                index={1}
              />
              <StatCard
                title={t("totalScans")}
                value={data.providers.reduce((s, p) => s + p.totalScans, 0).toLocaleString()}
                subtitle={t("allTime")}
                icon={Activity}
                accent="default"
                index={2}
              />
              <StatCard
                title={t("totalFailures")}
                value={data.providers.reduce((s, p) => s + p.failedScans, 0).toLocaleString()}
                subtitle={t("antiBotStructChanges")}
                icon={AlertCircle}
                accent="danger"
                index={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.providers.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </div>
          </TabsContent>

          {/* ===== SYSTEM ===== */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title={t("healthScoreLabel")}
                value={`${data.stats.healthScore}%`}
                subtitle={data.stats.healthScore >= 80 ? t("ok") : t("needsAttention")}
                icon={Heart}
                accent={data.stats.healthScore >= 80 ? "success" : "warning"}
                index={0}
              />
              <StatCard
                title={t("scansToday")}
                value={data.stats.scansToday}
                subtitle={`${data.scanner.cyclesToday} ${t("cycles")}`}
                icon={Radar}
                accent="info"
                index={1}
              />
              <StatCard
                title={t("dbSize")}
                value={`${data.stats.dbSizeMb} MB`}
                subtitle={t("sqliteDb")}
                icon={Database}
                accent="default"
                index={2}
              />
              <StatCard
                title={t("uptime")}
                value={`${Math.floor(data.scanner.uptimeHours / 24)}${t("days")}`}
                subtitle={`${Math.round(data.scanner.uptimeHours % 24)}${t("hours")}`}
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
                  <HealthBar icon={Cpu} label={t("cpu")} value={data.stats.cpuPct} suffix="%" t={t} />
                  <HealthBar icon={MemoryStick} label={t("ram")} value={data.stats.memPct} suffix="%" t={t} />
                  <HealthBar icon={HardDrive} label={t("disk")} value={data.stats.diskPct} suffix="%" t={t} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Database className="h-3 w-3" /> {t("dbSize")}
                    </p>
                    <p className="font-semibold text-sm tabular-nums">{data.stats.dbSizeMb} MB</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t("lastBackup")}
                    </p>
                    <p className="font-semibold text-sm tabular-nums">{backupHoursAgo}{t("hourAgo")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{t("recentDailySummaries")}</h3>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {data.summaries.map((s, i) => (
                    <DailySummaryCard key={s.date} summary={s} index={i} />
                  ))}
                </div>
              </div>
            </div>

            <LogsViewer logs={data.logs} />
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
            <span>TypeScript</span>
            <span>·</span>
            <span>Playwright</span>
            <span>·</span>
            <span>SQLite</span>
            <span>·</span>
            <span>Docker</span>
            <span>·</span>
            <span>Coolify</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Brain className="h-3 w-3" /> TimesFM 2.5
            </span>
          </div>
          <div>
            {new Date().toLocaleString()}
          </div>
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
  t,
}: {
  icon: typeof Cpu;
  label: string;
  value: number;
  suffix?: string;
  t: (key: import("@/lib/i18n/translations").TranslationKey) => string;
}) {
  const color =
    value < 50 ? "bg-emerald-500" : value < 75 ? "bg-amber-500" : "bg-rose-500";
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

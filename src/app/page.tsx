"use client";

import { useEffect, useState } from "react";
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
  Shield,
  Server,
  Zap,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { ScannerPanel } from "@/components/dashboard/ScannerPanel";
import { ProviderCard } from "@/components/dashboard/ProviderCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RouteRow } from "@/components/dashboard/RouteRow";
import { PriceHistoryChart } from "@/components/dashboard/PriceHistoryChart";
import { ForecastPanel } from "@/components/dashboard/ForecastPanel";
import { LogsViewer } from "@/components/dashboard/LogsViewer";
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FlightRoute,
  Provider,
  Alert,
  LogEntry,
  DailySummary,
  ScannerStatus,
  SystemStats,
  PriceHistory,
} from "@/lib/mock/data";

interface DashboardData {
  routes: FlightRoute[];
  providers: Provider[];
  alerts: Alert[];
  logs: LogEntry[];
  summaries: DailySummary[];
  stats: SystemStats;
  scanner: ScannerStatus;
  histories: PriceHistory[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("r1");

  useEffect(() => {
    Promise.all([
      fetch("/api/flights").then((r) => r.json()),
      fetch("/api/providers").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
      fetch("/api/logs").then((r) => r.json()),
      fetch("/api/summary").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/scanner").then((r) => r.json()),
    ]).then(([flights, providers, alerts, logs, summary, stats, scanner]) => {
      const histories = scanner.histories || [];
      setData({
        routes: flights.routes,
        providers: providers.providers,
        alerts: alerts.alerts,
        logs: logs.logs,
        summaries: summary.summaries,
        stats: stats.stats,
        scanner: stats.scanner,
        histories,
      });
    });
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
            <Plane className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">טוען דאשבורד…</p>
        </div>
      </div>
    );
  }

  const selectedRoute = data.routes.find((r) => r.id === selectedRouteId)!;
  const selectedHistory = data.histories.find((h) => h.routeId === selectedRouteId)!;
  const activeAlerts = data.alerts.filter((a) => !a.acknowledged);
  const dealsCount = data.alerts.filter((a) => a.type === "deal").length;
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
                סוכן ניטור טיסות
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Flight Monitor Agent · TypeScript · Playwright · SQLite
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-muted-foreground">פעיל · uptime {Math.round(data.scanner.uptimeHours / 24)}ימים</span>
            </div>
            <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", healthColor)}>
              <Heart className="h-3 w-3" />
              <span className="tabular-nums">{data.stats.healthScore}%</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex-1">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">סקירה</TabsTrigger>
            <TabsTrigger value="routes" className="text-xs sm:text-sm">מסלולים</TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs sm:text-sm">תחזית AI</TabsTrigger>
            <TabsTrigger value="providers" className="text-xs sm:text-sm">ספקים</TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm">מערכת</TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW ===== */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title="מסלולים מנוטרים"
                value={data.stats.totalRoutes}
                subtitle={`${data.routes.filter(r => r.monitoring).length} פעילים כעת`}
                icon={Plane}
                accent="info"
                index={0}
              />
              <StatCard
                title="סריקות היום"
                value={data.stats.scansToday}
                subtitle={`${data.scanner.cyclesToday} מחזורים`}
                icon={Radar}
                accent="default"
                index={1}
              />
              <StatCard
                title="דילים היום"
                value={data.stats.dealsDetected}
                subtitle={`${dropsCount} ירידות חריגות`}
                icon={Sparkles}
                accent="success"
                trend="up"
                trendValue="מזהה שפלים חדשים"
                index={2}
              />
              <StatCard
                title="התראות פעילות"
                value={activeAlerts.length}
                subtitle={`${data.stats.alertsTriggered} סה״כ`}
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
                    <h3 className="font-semibold">התראות אחרונות</h3>
                    <span className="text-xs text-muted-foreground">{activeAlerts.length} לא מטופלות</span>
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
                    <h3 className="font-semibold">מסלולים חמים</h3>
                    <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {data.routes
                      .slice()
                      .sort((a, b) => a.dropPct - b.dropPct)
                      .slice(0, 8)
                      .map((r, i) => (
                        <RouteRow key={r.id} route={r} index={i} />
                      ))}
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">בריאות מערכת</h3>
                  </div>
                  <div className="space-y-3">
                    <HealthBar icon={Cpu} label="CPU" value={data.stats.cpuPct} suffix="%" />
                    <HealthBar icon={MemoryStick} label="RAM" value={data.stats.memPct} suffix="%" />
                    <HealthBar icon={HardDrive} label="Disk" value={data.stats.diskPct} suffix="%" />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Database className="h-3 w-3" /> גודל DB
                        </p>
                        <p className="font-semibold text-sm tabular-nums">{data.stats.dbSizeMb} MB</p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> גיבוי אחרון
                        </p>
                        <p className="font-semibold text-sm tabular-nums">לפני {backupHoursAgo}ש׳</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ===== ROUTES ===== */}
          <TabsContent value="routes" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold text-lg">מסלולים מנוטרים</h3>
                  <p className="text-sm text-muted-foreground">לחץ על מסלול להצגת היסטוריית מחירים מפורטת</p>
                </div>
                <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.routes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.origin} → {r.destination} · ${r.currentPrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.routes.map((r, i) => (
                <RouteRow
                  key={r.id}
                  route={r}
                  index={i}
                  onClick={() => setSelectedRouteId(r.id)}
                />
              ))}
            </div>

            {selectedRoute && selectedHistory && (
              <PriceHistoryChart history={selectedHistory} route={selectedRoute} />
            )}
          </TabsContent>

          {/* ===== FORECAST (TimesFM) ===== */}
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
                  <h3 className="font-semibold text-base">תחזית מחירים מונעת TimesFM</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    מודל TimesFM 2.5 (200M פרמטרים) מבית Google Research לחיזוי סדרות זמן.
                    המערכת מנתחת את היסטוריית המחירים של כל מסלול ומניבה תחזית ל-14 ימים קדימה,
                    עם רצועות בר-סמך (quantile forecasts) והמלצת פעולה: <strong>הזמן / חכה / המשך מעקב</strong>.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> עיבוד בזמן אמת</span>
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Fallback סטטיסטי</span>
                    <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> JAX backend</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-lg">בחר מסלול לתחזית</h3>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.origin} → {r.destination} · ${r.currentPrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoute && selectedHistory && (
              <>
                <ForecastPanel history={selectedHistory} route={selectedRoute} />
                <PriceHistoryChart history={selectedHistory} route={selectedRoute} />
              </>
            )}
          </TabsContent>

          {/* ===== PROVIDERS ===== */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title="ספקים פעילים"
                value={activeProviders}
                subtitle={`מתוך ${data.providers.length}`}
                icon={Radar}
                accent="success"
                index={0}
              />
              <StatCard
                title="ב-cooldown"
                value={cooldownProviders}
                subtitle="ממתינים לפקיעה"
                icon={Clock}
                accent="warning"
                index={1}
              />
              <StatCard
                title="סה״כ סריקות"
                value={data.providers.reduce((s, p) => s + p.totalScans, 0).toLocaleString()}
                subtitle="כל הזמנים"
                icon={Activity}
                accent="default"
                index={2}
              />
              <StatCard
                title="סה״כ כישלונות"
                value={data.providers.reduce((s, p) => s + p.failedScans, 0).toLocaleString()}
                subtitle="Anti-bot / structure changes"
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
                title="ציון בריאות"
                value={`${data.stats.healthScore}%`}
                subtitle={data.stats.healthScore >= 80 ? "תקין" : "דרוש תשומת לב"}
                icon={Heart}
                accent={data.stats.healthScore >= 80 ? "success" : "warning"}
                index={0}
              />
              <StatCard
                title="סריקות היום"
                value={data.stats.scansToday}
                subtitle={`${data.scanner.cyclesToday} מחזורים`}
                icon={Radar}
                accent="info"
                index={1}
              />
              <StatCard
                title="גודל DB"
                value={`${data.stats.dbSizeMb} MB`}
                subtitle="SQLite"
                icon={Database}
                accent="default"
                index={2}
              />
              <StatCard
                title="Uptime"
                value={`${Math.floor(data.scanner.uptimeHours / 24)}ימים`}
                subtitle={`${Math.round(data.scanner.uptimeHours % 24)}שעות`}
                icon={Activity}
                accent="success"
                index={3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">משאבי מערכת</h3>
                </div>
                <div className="space-y-4">
                  <HealthBar icon={Cpu} label="CPU" value={data.stats.cpuPct} suffix="%" />
                  <HealthBar icon={MemoryStick} label="RAM" value={data.stats.memPct} suffix="%" />
                  <HealthBar icon={HardDrive} label="Disk" value={data.stats.diskPct} suffix="%" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Database className="h-3 w-3" /> גודל DB
                    </p>
                    <p className="font-semibold text-sm tabular-nums">{data.stats.dbSizeMb} MB</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> גיבוי אחרון
                    </p>
                    <p className="font-semibold text-sm tabular-nums">לפני {backupHoursAgo}ש׳</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">סיכומים יומיים אחרונים</h3>
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
              פעיל
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
            {new Date().toLocaleString("he-IL")}
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
}: {
  icon: typeof Cpu;
  label: string;
  value: number;
  suffix?: string;
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

"use client";

import { motion } from "framer-motion";
import { Activity, Clock, Radar, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScannerStatus } from "@/lib/mock/data";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/translations";

const statusKeyMap: Record<ScannerStatus["status"], TranslationKey> = {
  running: "scanning",
  idle: "idle",
  paused: "paused",
  error: "errorStatus",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatUptime(hours: number, t: (k: TranslationKey) => string): string {
  const days = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  if (days > 0) return `${days} ${t("days")} ${h} ${t("hours")}`;
  return `${h} ${t("hours")}`;
}

export function ScannerPanel({ scanner }: { scanner: ScannerStatus }) {
  const t = useT();
  const isRunning = scanner.status === "running";
  const statusLabel = t(statusKeyMap[scanner.status]);

  const statusColors = {
    running: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20", bar: "bg-emerald-500" },
    idle: { dot: "bg-slate-400", text: "text-slate-500", ring: "ring-slate-400/20", bar: "bg-slate-400" },
    paused: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20", bar: "bg-amber-500" },
    error: { dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20", bar: "bg-rose-500" },
  };
  const sc = statusColors[scanner.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("relative flex h-2.5 w-2.5")}>
            {isRunning && (
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", sc.dot)} />
            )}
            <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", sc.dot)} />
          </div>
          <h3 className="font-semibold">{t("liveScanner")}</h3>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full ring-1", sc.text, sc.ring)}>
            {statusLabel}
          </span>
        </div>
        <Radar className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {isRunning && scanner.currentRoute && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("scanningNow")}</span>
            <span className="font-medium tabular-nums">{scanner.currentRoute}</span>
          </div>
        )}
        {isRunning && scanner.currentProvider && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("provider")}</span>
            <span className="font-medium">{scanner.currentProvider}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" /> {t("progress")}
          </span>
          <span className="font-medium tabular-nums">{scanner.progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn("h-full rounded-full", sc.bar)}
            initial={{ width: 0 }}
            animate={{ width: `${scanner.progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="rounded-lg bg-muted/50 p-2">
            <Timer className="h-3 w-3 mx-auto text-muted-foreground" />
            <p className="mt-0.5 text-sm font-semibold tabular-nums">
              {formatDuration(scanner.etaSeconds)}
            </p>
            <p className="text-[10px] text-muted-foreground">{t("eta")}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <Clock className="h-3 w-3 mx-auto text-muted-foreground" />
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{scanner.cyclesToday}</p>
            <p className="text-[10px] text-muted-foreground">{t("cyclesToday")}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <Activity className="h-3 w-3 mx-auto text-muted-foreground" />
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{scanner.queueLength}</p>
            <p className="text-[10px] text-muted-foreground">{t("inQueue")}</p>
          </div>
        </div>
        <div className="pt-1 text-xs text-muted-foreground flex justify-between">
          <span>{t("uptime")}</span>
          <span className="font-medium text-foreground">{formatUptime(scanner.uptimeHours, t)}</span>
        </div>
      </div>
    </motion.div>
  );
}

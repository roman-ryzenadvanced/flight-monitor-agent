"use client";

import { motion } from "framer-motion";
import { Activity, Clock, Radar, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScannerStatus } from "@/lib/mock/data";

const statusMap = {
  running: { label: "פעיל", color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" },
  idle: { label: "ממתין", color: "bg-slate-400", text: "text-slate-500", ring: "ring-slate-400/20" },
  paused: { label: "מושהה", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" },
  error: { label: "שגיאה", color: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" },
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatUptime(hours: number): string {
  const days = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  if (days > 0) return `${days} ימים ${h} שעות`;
  return `${h} שעות`;
}

export function ScannerPanel({ scanner }: { scanner: ScannerStatus }) {
  const status = statusMap[scanner.status];
  const isRunning = scanner.status === "running";

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
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", status.color)} />
            )}
            <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", status.color)} />
          </div>
          <h3 className="font-semibold">סורק לייב</h3>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full ring-1", status.text, status.ring)}>
            {status.label}
          </span>
        </div>
        <Radar className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {isRunning && scanner.currentRoute && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">סורק עכשיו</span>
            <span className="font-medium tabular-nums">{scanner.currentRoute}</span>
          </div>
        )}
        {isRunning && scanner.currentProvider && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">ספק</span>
            <span className="font-medium">{scanner.currentProvider}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" /> התקדמות
          </span>
          <span className="font-medium tabular-nums">{scanner.progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn("h-full rounded-full", status.color)}
            initial={{ width: 0 }}
            animate={{ width: `${scanner.progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="flex items-center justify-center text-muted-foreground">
              <Timer className="h-3 w-3" />
            </div>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">
              {formatDuration(scanner.etaSeconds)}
            </p>
            <p className="text-[10px] text-muted-foreground">ETA</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="flex items-center justify-center text-muted-foreground">
              <Clock className="h-3 w-3" />
            </div>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{scanner.cyclesToday}</p>
            <p className="text-[10px] text-muted-foreground">מחזורים היום</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="flex items-center justify-center text-muted-foreground">
              <Activity className="h-3 w-3" />
            </div>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{scanner.queueLength}</p>
            <p className="text-[10px] text-muted-foreground">בתור</p>
          </div>
        </div>
        <div className="pt-1 text-xs text-muted-foreground flex justify-between">
          <span>Uptime</span>
          <span className="font-medium text-foreground">{formatUptime(scanner.uptimeHours)}</span>
        </div>
      </div>
    </motion.div>
  );
}

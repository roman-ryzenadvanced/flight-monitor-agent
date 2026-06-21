"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Alert } from "@/lib/mock/data";
import { AlertOctagon, TrendingDown, Sparkles, Info, Check } from "lucide-react";

const typeMap = {
  deal: {
    label: "דיל",
    icon: Sparkles,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  drop: {
    label: "ירידה חריגה",
    icon: TrendingDown,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
  low: {
    label: "שפל חדש",
    icon: AlertOctagon,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  info: {
    label: "מידע",
    icon: Info,
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע׳`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
}

interface AlertCardProps {
  alert: Alert;
  index?: number;
  onAck?: (id: string) => void;
}

export function AlertCard({ alert, index = 0, onAck }: AlertCardProps) {
  const t = typeMap[alert.type];
  const Icon = t.icon;
  const isDrop = alert.dropPct < 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "relative rounded-xl border bg-card p-4 shadow-sm",
        t.border
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", t.bg, t.color)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", t.bg, t.color)}>
                  {t.label}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">{timeAgo(alert.ts)}</span>
                {alert.acknowledged && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <Check className="h-3 w-3" /> אושר
                  </span>
                )}
              </div>
              <h4 className="mt-1 font-semibold text-sm leading-tight">{alert.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{alert.route}</p>
            </div>
            <div className="text-left shrink-0">
              <p className="text-lg font-bold tabular-nums">
                ${alert.price}
              </p>
              <p className={cn(
                "text-xs font-medium tabular-nums",
                isDrop ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}>
                {isDrop ? "▼" : "▲"} {Math.abs(alert.dropPct)}%
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {alert.description}
          </p>
          {!alert.acknowledged && onAck && (
            <button
              onClick={() => onAck(alert.id)}
              className="mt-2 text-xs font-medium text-primary hover:underline"
            >
              סמן כמטופל
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

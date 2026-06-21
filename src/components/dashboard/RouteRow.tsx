"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FlightRoute } from "@/lib/mock/data";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  return `לפני ${hours} שע׳`;
}

const trendIcon = {
  down: { Icon: TrendingDown, color: "text-emerald-600 dark:text-emerald-400" },
  up: { Icon: TrendingUp, color: "text-rose-600 dark:text-rose-400" },
  stable: { Icon: Minus, color: "text-muted-foreground" },
};

export function RouteRow({ route, index = 0, onClick }: { route: FlightRoute; index?: number; onClick?: () => void }) {
  const { Icon, color } = trendIcon[route.trend];
  const isDrop = route.dropPct < 0;
  const isDeal = route.dropPct <= -15;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      onClick={onClick}
      className="w-full text-right rounded-lg border bg-card hover:bg-accent/50 transition-colors p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-xs",
            isDeal ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
          )}>
            {route.destination}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {route.originName} → {route.destinationName}
            </p>
            <p className="text-xs text-muted-foreground">
              {route.daysToDeparture} ימים לטיסה · עדכון {timeAgo(route.lastUpdated)}
            </p>
          </div>
        </div>
        <div className="text-left shrink-0">
          <div className="flex items-center gap-1.5 justify-end">
            <p className="font-bold tabular-nums">${route.currentPrice}</p>
            <Icon className={cn("h-3.5 w-3.5", color)} />
          </div>
          <p className={cn(
            "text-xs font-medium tabular-nums",
            isDrop ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            {isDrop ? "▼" : "▲"} {Math.abs(route.dropPct)}%
            {isDeal && <span className="mr-1">· דיל 🔥</span>}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

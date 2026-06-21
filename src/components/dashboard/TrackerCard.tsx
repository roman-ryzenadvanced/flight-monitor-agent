"use client";

import { motion } from "framer-motion";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Trash2,
  Sparkles,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ccToFlag, airportByIata } from "@/lib/airports";
import {
  daysToDeparture,
  formatDateShort,
  getCabinLabel,
  type Tracker,
} from "@/lib/priceEngine";
import { useTrackerStore } from "@/lib/trackerStore";
import { useT, useI18n } from "@/lib/i18n";
import { Sparkline } from "./Sparkline";
import type { RoutePriceStats } from "@/lib/localDb";

interface Props {
  tracker: Tracker;
  index?: number;
  selected?: boolean;
  onSelect?: () => void;
  onRefresh?: (id: string) => Promise<void>;
  routeStats?: RoutePriceStats | null;
}

const trendIcon = {
  down: { Icon: TrendingDown, color: "text-emerald-600 dark:text-emerald-400" },
  up: { Icon: TrendingUp, color: "text-rose-600 dark:text-rose-400" },
  stable: { Icon: Minus, color: "text-muted-foreground" },
};

export function TrackerCard({ tracker, index = 0, selected, onSelect, onRefresh, routeStats }: Props) {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const removeTracker = useTrackerStore((s) => s.removeTracker);
  const toggleActive = useTrackerStore((s) => s.toggleActive);

  const origin = airportByIata[tracker.originIata];
  const dest = airportByIata[tracker.destIata];

  if (!origin || !dest) return null;

  const hasData = routeStats && routeStats.history.length > 0;
  const dtd = daysToDeparture(tracker.departDate);

  // Show "no data yet" state if no snapshots
  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        layout
      >
        <Card
          className={cn(
            "relative overflow-hidden p-4 transition-all cursor-pointer hover:shadow-md",
            selected && "ring-2 ring-primary",
            !tracker.active && "opacity-60"
          )}
          onClick={onSelect}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{ccToFlag(origin.cc)}</span>
              <span className="font-mono font-bold text-sm shrink-0">{origin.iata}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xl shrink-0">{ccToFlag(dest.cc)}</span>
              <span className="font-mono font-bold text-sm shrink-0">{dest.iata}</span>
            </div>
            <Switch
              checked={tracker.active}
              onCheckedChange={() => toggleActive(tracker.id)}
              onClick={(e) => e.stopPropagation()}
              className="scale-90 sm:scale-75"
            />
          </div>
          <p className="text-xs text-muted-foreground mb-3 truncate">
            {origin.city} → {dest.city}
            {tracker.notes && <span className="text-muted-foreground/70"> · {tracker.notes}</span>}
          </p>
          <div className="flex items-center justify-between gap-2 mb-3 py-4 border-y border-dashed">
            <p className="text-sm text-muted-foreground">No price data yet</p>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 min-h-[40px] text-xs gap-1.5 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh(tracker.id);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Fetch live price</span>
                <span className="sm:hidden">Fetch</span>
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="h-3 w-3" />
                {formatDateShort(tracker.departDate, lang)}
              </span>
              <span className="shrink-0">·</span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {dtd}d
              </span>
              <span className="shrink-0">·</span>
              <span className="truncate">{getCabinLabel(tracker.cabin, lang)}</span>
              {tracker.passengers > 1 && (
                <>
                  <span className="shrink-0">·</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Users className="h-3 w-3" />
                    {tracker.passengers}
                  </span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 min-h-[36px] min-w-[36px] text-muted-foreground hover:text-rose-600 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(t("deleteConfirm"))) removeTracker(tracker.id);
              }}
              title={t("delete")}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const { Icon, color } = trendIcon[routeStats.trend];
  const isDeal = routeStats.dropPct <= -15;
  const hitsAlert =
    tracker.alertThreshold !== undefined && routeStats.current <= tracker.alertThreshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      layout
    >
      <Card
        className={cn(
          "relative overflow-hidden p-4 transition-all cursor-pointer hover:shadow-md active:scale-[0.98] sm:active:scale-100",
          selected && "ring-2 ring-primary",
          !tracker.active && "opacity-60"
        )}
        onClick={onSelect}
      >
        {isDeal && tracker.active && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
              <Sparkles className="h-3 w-3" /> {t("deal")}
            </Badge>
          </div>
        )}
        {hitsAlert && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
              <AlertCircle className="h-3 w-3" /> {t("targetHit")}
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-lg sm:text-xl shrink-0">{ccToFlag(origin.cc)}</span>
            <span className="font-mono font-bold text-sm shrink-0">{origin.iata}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-lg sm:text-xl shrink-0">{ccToFlag(dest.cc)}</span>
            <span className="font-mono font-bold text-sm shrink-0">{dest.iata}</span>
          </div>
          <Switch
            checked={tracker.active}
            onCheckedChange={() => toggleActive(tracker.id)}
            onClick={(e) => e.stopPropagation()}
            className="scale-90 sm:scale-75"
          />
        </div>

        <p className="text-xs text-muted-foreground mb-3 truncate">
          {origin.city} → {dest.city}
          {tracker.notes && <span className="text-muted-foreground/70"> · {tracker.notes}</span>}
        </p>

        <div className="flex items-end justify-between gap-2 mb-3">
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">${routeStats.current}</p>
            <p className={cn(
              "text-xs font-medium tabular-nums flex items-center gap-1",
              routeStats.dropPct < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              <Icon className="h-3 w-3 shrink-0" />
              {routeStats.dropPct < 0 ? "▼" : "▲"} {Math.abs(routeStats.dropPct)}% {t("vsAverage")}
            </p>
          </div>
          <div className="w-24 sm:w-28 h-12 shrink-0" dir="ltr">
            <Sparkline
              data={routeStats.history.map((p) => p.price)}
              color={routeStats.trend === "down" ? "#10b981" : routeStats.trend === "up" ? "#f43f5e" : "#94a3b8"}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 text-[10px] mb-3">
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-muted-foreground">{t("low")}</p>
            <p className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">${routeStats.lowest}</p>
          </div>
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-muted-foreground">{t("average")}</p>
            <p className="font-bold tabular-nums">${routeStats.average}</p>
          </div>
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-muted-foreground">{t("high")}</p>
            <p className="font-bold tabular-nums text-rose-600 dark:text-rose-400">${routeStats.highest}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3" />
              {formatDateShort(tracker.departDate, lang)}
            </span>
            <span className="shrink-0">·</span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {dtd}d
            </span>
            <span className="shrink-0">·</span>
            <span className="truncate">{getCabinLabel(tracker.cabin, lang)}</span>
            {tracker.passengers > 1 && (
              <>
                <span className="shrink-0">·</span>
                <span className="flex items-center gap-1 shrink-0">
                  <Users className="h-3 w-3" />
                  {tracker.passengers}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 min-h-[36px] min-w-[36px] text-muted-foreground hover:text-rose-600 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(t("deleteConfirm"))) removeTracker(tracker.id);
            }}
            title={t("delete")}
            aria-label={t("delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  TrendingDown,
  TrendingUp,
  Minus,
  Trash2,
  Pause,
  Play,
  Sparkles,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ccToFlag, airportByIata } from "@/lib/airports";
import {
  cabinLabels,
  daysToDeparture,
  formatHebrewDateShort,
  generatePriceData,
  type Tracker,
} from "@/lib/priceEngine";
import { useTrackerStore } from "@/lib/trackerStore";
import { Sparkline } from "./Sparkline";

interface Props {
  tracker: Tracker;
  index?: number;
  selected?: boolean;
  onSelect?: () => void;
}

const trendIcon = {
  down: { Icon: TrendingDown, color: "text-emerald-600 dark:text-emerald-400" },
  up: { Icon: TrendingUp, color: "text-rose-600 dark:text-rose-400" },
  stable: { Icon: Minus, color: "text-muted-foreground" },
};

export function TrackerCard({ tracker, index = 0, selected, onSelect }: Props) {
  const removeTracker = useTrackerStore((s) => s.removeTracker);
  const toggleActive = useTrackerStore((s) => s.toggleActive);

  const origin = airportByIata[tracker.originIata];
  const dest = airportByIata[tracker.destIata];

  const priceData = useMemo(() => {
    if (!origin || !dest) return null;
    return generatePriceData(origin, dest, {
      originIata: tracker.originIata,
      destIata: tracker.destIata,
      departDate: tracker.departDate,
      returnDate: tracker.returnDate,
      cabin: tracker.cabin,
      passengers: tracker.passengers,
    });
  }, [origin, dest, tracker]);

  if (!origin || !dest || !priceData) {
    return null;
  }

  const { Icon, color } = trendIcon[priceData.trend];
  const dtd = daysToDeparture(tracker.departDate);
  const isDeal = priceData.dropPct <= -15;
  const hitsAlert =
    tracker.alertThreshold !== undefined && priceData.current <= tracker.alertThreshold;

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
        {/* Deal badge */}
        {isDeal && tracker.active && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
              <Sparkles className="h-3 w-3" /> דיל
            </Badge>
          </div>
        )}
        {hitsAlert && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
              <AlertCircle className="h-3 w-3" /> מחיר מטרה!
            </Badge>
          </div>
        )}

        {/* Route header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{ccToFlag(origin.cc)}</span>
            <span className="font-mono font-bold text-sm shrink-0">{origin.iata}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xl shrink-0">{ccToFlag(dest.cc)}</span>
            <span className="font-mono font-bold text-sm shrink-0">{dest.iata}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Switch
              checked={tracker.active}
              onCheckedChange={() => toggleActive(tracker.id)}
              onClick={(e) => e.stopPropagation()}
              className="scale-75"
            />
          </div>
        </div>

        {/* City names */}
        <p className="text-xs text-muted-foreground mb-3 truncate">
          {origin.city} → {dest.city}
          {tracker.notes && <span className="text-muted-foreground/70"> · {tracker.notes}</span>}
        </p>

        {/* Price + trend */}
        <div className="flex items-end justify-between gap-2 mb-3">
          <div>
            <p className="text-2xl font-bold tabular-nums">
              ${priceData.current}
            </p>
            <p className={cn(
              "text-xs font-medium tabular-nums flex items-center gap-1",
              priceData.dropPct < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              <Icon className="h-3 w-3" />
              {priceData.dropPct < 0 ? "▼" : "▲"} {Math.abs(priceData.dropPct)}% מול ממוצע
            </p>
          </div>
          {/* Sparkline */}
          <div className="w-28 h-12 shrink-0" dir="ltr">
            <Sparkline
              data={priceData.history.map((p) => p.price)}
              color={priceData.trend === "down" ? "#10b981" : priceData.trend === "up" ? "#f43f5e" : "#94a3b8"}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-1 text-[10px] mb-3">
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-muted-foreground">נמוך</p>
            <p className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">${priceData.lowest}</p>
          </div>
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-muted-foreground">ממוצע</p>
            <p className="font-bold tabular-nums">${priceData.average}</p>
          </div>
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-muted-foreground">גבוה</p>
            <p className="font-bold tabular-nums text-rose-600 dark:text-rose-400">${priceData.highest}</p>
          </div>
        </div>

        {/* Meta footer */}
        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatHebrewDateShort(tracker.departDate)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {dtd} ימים
            </span>
            <span>·</span>
            <span>{cabinLabels[tracker.cabin]}</span>
            {tracker.passengers > 1 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {tracker.passengers}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-rose-600"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("למחוק את הטראקר?")) removeTracker(tracker.id);
            }}
            title="מחק"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

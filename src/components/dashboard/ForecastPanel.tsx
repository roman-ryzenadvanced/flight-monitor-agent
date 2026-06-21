"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, TrendingDown, TrendingUp, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PriceHistory, FlightRoute } from "@/lib/mock/data";

interface ForecastPoint {
  date: string;
  historical?: number;
  forecast?: number;
  lower?: number;
  upper?: number;
}

interface ForecastResult {
  points: ForecastPoint[];
  recommendation: "buy_now" | "wait" | "monitor";
  confidence: number;
  expectedChangePct: number;
  horizonDays: number;
  model: string;
  reasoning: string;
}

interface Props {
  history: PriceHistory;
  route?: FlightRoute;
}

const recommendationMap = {
  buy_now: {
    label: "כדאי להזמין עכשיו",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: Sparkles,
  },
  wait: {
    label: "כדאי לחכות",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Clock,
  },
  monitor: {
    label: "המשך מעקב",
    color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    icon: TrendingDown,
  },
};

function formatDate(ts: string): string {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

export function ForecastPanel({ history, route }: Props) {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let reqController: AbortController | null = null;

    const run = async () => {
      try {
        reqController = new AbortController();
        const r = await fetch("/api/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: history.points,
            routeId: history.routeId,
            horizon: 14,
            route: route,
          }),
          signal: reqController.signal,
        });
        if (!r.ok) throw new Error("forecast failed");
        const data = await r.json();
        if (!cancelled) {
          setForecast(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "שגיאה בתחזית");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    run();

    return () => {
      cancelled = true;
      reqController?.abort();
    };
  }, [history, route]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">תחזית מחירים — TimesFM</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              חיזוי 14 ימים קדימה · {history.route}
            </p>
          </div>
          {forecast && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Brain className="h-3 w-3" /> {forecast.model}
            </Badge>
          )}
        </div>

        {loading && (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">טוען מודל ומחשב תחזית…</p>
          </div>
        )}

        {error && !loading && (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-rose-600 dark:text-rose-400">
            <p className="text-sm">לא הצלחתי לחשב תחזית</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        )}

        {forecast && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className={cn("rounded-lg border p-3", recommendationMap[forecast.recommendation].color)}>
                <div className="flex items-center gap-2">
                  {(() => {
                    const R = recommendationMap[forecast.recommendation];
                    const Icon = R.icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  <span className="text-xs font-medium">המלצה</span>
                </div>
                <p className="mt-1 font-bold text-base">
                  {recommendationMap[forecast.recommendation].label}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">שינוי צפוי (14 ימים)</p>
                <p className={cn(
                  "mt-1 font-bold text-base tabular-nums",
                  forecast.expectedChangePct < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {forecast.expectedChangePct < 0 ? "▼" : "▲"} {Math.abs(forecast.expectedChangePct).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">רמת ביטחון</p>
                <p className="mt-1 font-bold text-base tabular-nums">{forecast.confidence}%</p>
              </div>
            </div>

            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={forecast.points}
                  margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.6 0.118 184.704)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.6 0.118 184.704)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "oklch(0.556 0 0)" }}
                    tickLine={false}
                    axisLine={{ stroke: "oklch(0.922 0 0)" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid oklch(0.922 0 0)",
                      fontSize: 12,
                      direction: "rtl",
                    }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        historical: "היסטורי",
                        forecast: "תחזית",
                        upper: "גבול עליון",
                        lower: "גבול תחתון",
                      };
                      return [`$${Math.round(value)}`, labels[name] || name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="oklch(0.6 0.118 184.704)"
                    fillOpacity={0.1}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="oklch(0.646 0.222 41.116)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="oklch(0.6 0.118 184.704)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-muted/40 border text-xs leading-relaxed">
              <p className="font-semibold mb-1 flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" /> ניתוח המודל
              </p>
              <p className="text-muted-foreground">{forecast.reasoning}</p>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}

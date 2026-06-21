"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT, useI18n } from "@/lib/i18n";
import type { PriceHistory, FlightRoute } from "@/lib/mock/data";

interface Props {
  history: PriceHistory;
  route?: FlightRoute;
}

const dateLocaleMap: Record<string, string> = {
  en: "en-US",
  ru: "ru-RU",
  ka: "ka-GE",
  he: "he-IL",
  ar: "ar",
  es: "es-ES",
};

function formatDate(ts: string, lang: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString(dateLocaleMap[lang] || "en-US", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function PriceHistoryChart({ history, route }: Props) {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const [range, setRange] = useState<"7d" | "14d" | "30d">("30d");

  const data = useMemo(() => {
    const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
    return history.points.slice(-days - 1).map((p) => ({
      date: formatDate(p.ts, lang),
      price: p.price,
      provider: p.provider,
      fullDate: new Date(p.ts).toLocaleDateString(dateLocaleMap[lang] || "en-US"),
    }));
  }, [history, range, lang]);

  const avg = route?.averagePrice ?? history.points.reduce((s, p) => s + p.price, 0) / history.points.length;
  const lowest = route?.lowestPrice ?? Math.min(...history.points.map((p) => p.price));
  const highest = route?.highestPrice ?? Math.max(...history.points.map((p) => p.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-lg">
              {t("priceHistory")} · {history.route}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("dataFromSqlite")} {history.points.length} {t("pointsCollected")}
            </p>
          </div>
          <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
            <TabsList>
              <TabsTrigger value="7d">{t("days7")}</TabsTrigger>
              <TabsTrigger value="14d">{t("days14")}</TabsTrigger>
              <TabsTrigger value="30d">{t("days30")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">{t("low")}</p>
            <p className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">${lowest}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">{t("average")}</p>
            <p className="font-bold tabular-nums">${Math.round(avg)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">{t("high")}</p>
            <p className="font-bold tabular-nums text-rose-600 dark:text-rose-400">${highest}</p>
          </div>
        </div>

        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                tickLine={false}
                axisLine={{ stroke: "oklch(0.922 0 0)" }}
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
                  direction: lang === "he" || lang === "ar" ? "rtl" : "ltr",
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value: number) => [`$${value}`, t("priceHistory").split(" ")[0]]}
                labelFormatter={(label, payload) => {
                  const p = payload?.[0]?.payload;
                  return p ? `${p.fullDate} · ${p.provider}` : label;
                }}
              />
              <ReferenceLine
                y={avg}
                stroke="oklch(0.556 0 0)"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="oklch(0.646 0.222 41.116)"
                strokeWidth={2}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}

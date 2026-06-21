"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, TrendingDown, Sparkles, AlertCircle, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailySummary } from "@/lib/mock/data";

interface Props {
  summary: DailySummary;
  index?: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
}

export function DailySummaryCard({ summary, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">{formatDate(summary.date)}</p>
            </div>
            <h4 className="mt-1 font-semibold text-sm leading-tight">{summary.subject}</h4>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">סיכום יומי</Badge>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-3">
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <ScanLine className="h-3 w-3 mx-auto text-muted-foreground" />
            <p className="mt-0.5 text-sm font-bold tabular-nums">{summary.scansRun}</p>
            <p className="text-[9px] text-muted-foreground">סריקות</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">·</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums">{summary.routesMonitored}</p>
            <p className="text-[9px] text-muted-foreground">מסלולים</p>
          </div>
          <div className="rounded-md bg-emerald-500/10 p-2 text-center">
            <Sparkles className="h-3 w-3 mx-auto text-emerald-600 dark:text-emerald-400" />
            <p className="mt-0.5 text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{summary.newDeals}</p>
            <p className="text-[9px] text-muted-foreground">דילים</p>
          </div>
          <div className="rounded-md bg-sky-500/10 p-2 text-center">
            <TrendingDown className="h-3 w-3 mx-auto text-sky-600 dark:text-sky-400" />
            <p className="mt-0.5 text-sm font-bold tabular-nums text-sky-600 dark:text-sky-400">{summary.priceDrops}</p>
            <p className="text-[9px] text-muted-foreground">ירידות</p>
          </div>
          <div className={cn("p-2 text-center rounded-md", summary.errors > 5 ? "bg-rose-500/10" : "bg-muted/50")}>
            <AlertCircle className={cn("h-3 w-3 mx-auto", summary.errors > 5 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")} />
            <p className={cn("mt-0.5 text-sm font-bold tabular-nums", summary.errors > 5 ? "text-rose-600 dark:text-rose-400" : "")}>{summary.errors}</p>
            <p className="text-[9px] text-muted-foreground">שגיאות</p>
          </div>
        </div>

        {summary.topDeals.length > 0 && (
          <div className="space-y-1 mb-3">
            <p className="text-xs font-medium text-muted-foreground">דילים מובילים</p>
            {summary.topDeals.map((deal, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0">
                <span className="font-mono">{deal.route}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold tabular-nums">${deal.price}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ▼ {Math.abs(deal.dropPct)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            גוף המייל
          </summary>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed bg-muted/30 rounded-md p-3 border" dir="rtl">
{summary.body}
          </pre>
        </details>
      </Card>
    </motion.div>
  );
}

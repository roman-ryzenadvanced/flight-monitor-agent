"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LogEntry, LogLevel } from "@/lib/mock/data";
import { Info, AlertTriangle, AlertOctagon, Bug, Search } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/translations";

const levelKeyMap: Record<LogLevel, TranslationKey> = {
  info: "info",
  warn: "warn",
  error: "errorStatus",
  debug: "debug",
};

const levelStyle: Record<LogLevel, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" },
  warn: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  error: { icon: AlertOctagon, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  debug: { icon: Bug, color: "text-muted-foreground", bg: "bg-muted" },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LogsViewer({ logs }: { logs: LogEntry[] }) {
  const t = useT();
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const sources = useMemo(() => {
    const set = new Set(logs.map((l) => l.source));
    return ["all", ...Array.from(set).sort()];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (levelFilter !== "all" && l.level !== levelFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, levelFilter, sourceFilter, search]);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-lg">{t("logs")}</h3>
          <p className="text-sm text-muted-foreground">{filtered.length} {t("recordsOf")} {logs.length}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-36 rounded-md border bg-transparent pr-7 pl-2 text-xs"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allLevels")}</SelectItem>
              <SelectItem value="info">{t("info")}</SelectItem>
              <SelectItem value="warn">{t("warn")}</SelectItem>
              <SelectItem value="error">{t("errorStatus")}</SelectItem>
              <SelectItem value="debug">{t("debug")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sources.map((s) => (
                <SelectItem key={s} value={s}>{s === "all" ? t("allSources") : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-96 rounded-md border">
        <div className="divide-y" dir="ltr">
          {filtered.map((log, idx) => {
            const L = levelStyle[log.level];
            const Icon = L.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.01, 0.3) }}
                className="flex items-start gap-2 px-3 py-2 hover:bg-accent/30 transition-colors text-left"
              >
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 mt-0.5 font-mono">
                  {formatTime(log.ts)}
                </span>
                <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded", L.bg)}>
                  <Icon className={cn("h-3 w-3", L.color)} />
                </div>
                <Badge variant="outline" className="text-[9px] py-0 h-4 shrink-0 font-mono">
                  {t(levelKeyMap[log.level])}
                </Badge>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 font-mono">
                  [{log.source}]
                </span>
                <span className="text-xs leading-relaxed break-words" dir="auto">
                  {log.message}
                </span>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("noMatchingRecords")}
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

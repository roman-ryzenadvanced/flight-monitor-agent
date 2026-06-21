"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/mock/data";

const statusMap = {
  active: { label: "פעיל", color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" },
  cooldown: { label: "Cooldown", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" },
  blocked: { label: "חסום", color: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" },
  error: { label: "שגיאה", color: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" },
};

const antiBotLabels = {
  none: "—",
  basic: "Basic",
  captcha: "CAPTCHA",
  advanced: "מתקדם",
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

function timeUntil(iso: string | null): string | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "פג";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `עוד ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `עוד ${hours} שע׳`;
  const days = Math.floor(hours / 24);
  return `עוד ${days} ימים`;
}

export function ProviderCard({ provider, index = 0 }: { provider: Provider; index?: number }) {
  const status = statusMap[provider.status];
  const cooldownLeft = timeUntil(provider.cooldownUntil);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{provider.name}</h4>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full ring-1", status.text, status.ring)}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{provider.domain}</p>
        </div>
        <span className={cn("h-2 w-2 shrink-0 rounded-full", status.color)} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-muted-foreground">אחוז הצלחה</p>
          <p className={cn("font-semibold tabular-nums", provider.successRate >= 85 ? "text-emerald-600 dark:text-emerald-400" : provider.successRate >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>
            {provider.successRate}%
          </p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-muted-foreground">זמן תגובה ממוצע</p>
          <p className="font-semibold tabular-nums">{provider.avgResponseMs}ms</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-muted-foreground">סריקות</p>
          <p className="font-semibold tabular-nums">{provider.totalScans.toLocaleString()}</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-muted-foreground">Anti-Bot</p>
          <p className="font-semibold">{antiBotLabels[provider.antiBotLevel]}</p>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>סריקה אחרונה</span>
          <span className="text-foreground">{timeAgo(provider.lastScan)}</span>
        </div>
        {cooldownLeft && (
          <div className="flex justify-between">
            <span>Cooldown נותר</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">{cooldownLeft}</span>
          </div>
        )}
      </div>

      {provider.notes && (
        <p className="mt-3 pt-2 border-t text-[11px] text-muted-foreground leading-relaxed">
          {provider.notes}
        </p>
      )}
    </motion.div>
  );
}

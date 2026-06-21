"use client";

import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { languages } from "@/lib/i18n/translations";
import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const lang = useI18n((s) => s.lang);
  const setLang = useI18n((s) => s.setLang);
  const current = languages.find((l) => l.code === lang) ?? languages[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "icon" : "sm"}
          className={cn(compact ? "h-9 w-9" : "h-9 gap-2 px-2.5")}
          title="Language"
        >
          <Globe className="h-4 w-4" />
          {!compact && (
            <span className="text-xs font-medium">{current.flag}</span>
          )}
          {!compact && (
            <span className="text-xs hidden sm:inline">{current.code.toUpperCase()}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <div className="space-y-0.5">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={cn(
                "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-accent transition-colors text-right",
                lang === l.code && "bg-accent"
              )}
              dir="ltr"
            >
              <span className="text-base shrink-0">{l.flag}</span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-medium">{l.name}</span>
                <span className="block text-[10px] text-muted-foreground">{l.englishName}</span>
              </span>
              {lang === l.code && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

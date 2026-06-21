"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, MapPin, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { airports, airportByIata, ccToFlag, regionLabels, type Airport } from "@/lib/airports";
import { useI18n } from "@/lib/i18n";
import type { Language } from "@/lib/i18n/translations";

interface Props {
  value: string; // IATA code
  onChange: (iata: string) => void;
  placeholder?: string;
  excludeIata?: string;
  className?: string;
}

const searchPlaceholderMap: Record<Language, string> = {
  en: "Search by code, city, country…",
  ru: "Поиск по коду, городу, стране…",
  ka: "ძიება კოდით, ქალაქით, ქვეყნით…",
  he: "חיפוש לפי קוד, עיר, מדינה…",
  ar: "بحث بالرمز، المدينة، الدولة…",
  es: "Buscar por código, ciudad, país…",
};

const emptyTextMap: Record<Language, string> = {
  en: "No airports found",
  ru: "Аэропорты не найдены",
  ka: "აეროპორტები ვერ მოიძებნა",
  he: "לא נמצאו נמלי תעופה",
  ar: "لم يتم العثور على مطارات",
  es: "No se encontraron aeropuertos",
};

export function AirportCombobox({
  value,
  onChange,
  placeholder,
  excludeIata,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lang = useI18n((s) => s.lang) as Language;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const defaultPlaceholderMap: Record<Language, string> = {
    en: "Select airport…",
    ru: "Выберите аэропорт…",
    ka: "აირჩიეთ აეროპორტი…",
    he: "בחר נמל תעופה…",
    ar: "اختر مطاراً…",
    es: "Seleccionar aeropuerto…",
  };
  const resolvedPlaceholder = placeholder || defaultPlaceholderMap[lang];

  const selected = value ? airportByIata[value.toUpperCase()] : undefined;

  // Auto-focus the search input when popover opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Filter airports by query (IATA, city, country, name)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = airports;
    if (excludeIata) {
      list = list.filter((a) => a.iata !== excludeIata.toUpperCase());
    }
    if (!q) return list;
    return list.filter(
      (a) =>
        a.iata.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    );
  }, [query, excludeIata]);

  // Group filtered results by region for display
  const grouped = useMemo(() => {
    const map = new Map<Airport["region"], Airport[]>();
    for (const a of filtered) {
      if (!map.has(a.region)) map.set(a.region, []);
      map.get(a.region)!.push(a);
    }
    const order: Airport["region"][] = ["ME", "EU", "AS", "NA", "SA", "AF", "OC"];
    return order
      .filter((r) => map.has(r))
      .map((r) => ({ region: r, airports: map.get(r)! }));
  }, [filtered]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setQuery("");
    }
  };

  const handleSelect = (iata: string) => {
    onChange(iata);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal h-12 min-h-[48px]", className)}
        >
          {selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{ccToFlag(selected.cc)}</span>
              <span className="font-mono font-bold text-sm shrink-0">{selected.iata}</span>
              <span className="truncate text-sm text-muted-foreground">
                {selected.city} · {selected.country}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{resolvedPlaceholder}</span>
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] max-w-[450px] p-0"
        align="start"
        sideOffset={8}
      >
        {/* Search input — fully controlled, works on all platforms */}
        <div className="flex items-center border-b px-3 py-1">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholderMap[lang]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-50 hover:opacity-100 hover:bg-accent transition-colors"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Airport list — plain scrollable div, no cmdk interference */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto overscroll-contain">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {emptyTextMap[lang]}
            </div>
          ) : (
            grouped.map(({ region, airports: list }) => (
              <div key={region}>
                <div className="sticky top-0 bg-background/95 backdrop-blur px-3 py-1.5 text-[10px] font-semibold text-muted-foreground border-b">
                  {regionLabels[region][lang]} · {regionLabels[region].en}
                </div>
                {list.map((a) => (
                  <button
                    key={a.iata}
                    onClick={() => handleSelect(a.iata)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2.5 min-h-[48px] text-left hover:bg-accent transition-colors border-b border-border/50",
                      value?.toUpperCase() === a.iata && "bg-accent"
                    )}
                    type="button"
                  >
                    <span className="text-lg shrink-0">{ccToFlag(a.cc)}</span>
                    <span className="font-mono font-bold text-xs shrink-0 w-10">{a.iata}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm truncate">{a.city}</span>
                      <span className="block text-[10px] text-muted-foreground truncate">
                        {a.country} · {a.name}
                      </span>
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value?.toUpperCase() === a.iata ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

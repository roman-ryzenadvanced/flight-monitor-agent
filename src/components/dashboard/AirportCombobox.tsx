"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, MapPin, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { airports, airportByIata, ccToFlag, regionLabels, type Airport } from "@/lib/airports";
import { useI18n } from "@/lib/i18n";
import type { Language } from "@/lib/i18n/translations";

interface Props {
  value: string; // IATA code
  onChange: (iata: string) => void;
  placeholder?: string;
  excludeIata?: string; // for destination picker — exclude origin
  className?: string;
}

export function AirportCombobox({
  value,
  onChange,
  placeholder = "בחר נמל תעופה…",
  excludeIata,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lang = useI18n((s) => s.lang) as Language;

  const selected = value ? airportByIata[value.toUpperCase()] : undefined;

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
    // Sort regions by typical user priority: ME first, then EU, AS, NA, SA, AF, OC
    const order: Airport["region"][] = ["ME", "EU", "AS", "NA", "SA", "AF", "OC"];
    return order
      .filter((r) => map.has(r))
      .map((r) => ({ region: r, airports: map.get(r)! }));
  }, [filtered]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal h-11", className)}
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
              <MapPin className="h-4 w-4" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="חיפוש לפי קוד, עיר, מדינה…"
              value={query}
              onValueChange={setQuery}
              className="h-9"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="ml-1 rounded-sm opacity-50 hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <CommandList className="max-h-72">
            <CommandEmpty>
              {lang === "he" ? "לא נמצאו נמלי תעופה" :
               lang === "ru" ? "Аэропорты не найдены" :
               lang === "ka" ? "აეროპორტები ვერ მოიძებნა" :
               lang === "ar" ? "لم يتم العثور على مطارات" :
               lang === "es" ? "No se encontraron aeropuertos" :
               "No airports found"}
            </CommandEmpty>
            {grouped.map(({ region, airports: list }) => (
              <CommandGroup
                key={region}
                heading={`${regionLabels[region][lang]} · ${regionLabels[region].en}`}
              >
                {list.map((a) => (
                  <CommandItem
                    key={a.iata}
                    value={a.iata}
                    onSelect={() => {
                      onChange(a.iata);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="gap-2"
                  >
                    <span className="text-base shrink-0">{ccToFlag(a.cc)}</span>
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
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Calendar, Users, AlertCircle, Sparkles, ArrowLeftRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { AirportCombobox } from "./AirportCombobox";
import { ccToFlag, airportByIata } from "@/lib/airports";
import {
  defaultDepartDate,
  toYMD,
  type CabinClass,
  getCabinLabel,
} from "@/lib/priceEngine";
import { useTrackerStore } from "@/lib/trackerStore";
import { useT, useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useToast } from "@/hooks/use-toast";

interface Props {
  children: React.ReactNode;
}

const cabinKeys: Record<CabinClass, TranslationKey> = {
  economy: "economy",
  premium: "premium",
  business: "business",
  first: "first",
};

export function NewTrackerDialog({ children }: Props) {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const [open, setOpen] = useState(false);
  const addTracker = useTrackerStore((s) => s.addTracker);
  const { toast } = useToast();

  const [originIata, setOriginIata] = useState("");
  const [destIata, setDestIata] = useState("");
  const [departDate, setDepartDate] = useState(defaultDepartDate());
  const [roundTrip, setRoundTrip] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [passengers, setPassengers] = useState(1);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setOriginIata("");
    setDestIata("");
    setDepartDate(defaultDepartDate());
    setRoundTrip(false);
    setReturnDate("");
    setCabin("economy");
    setPassengers(1);
    setAlertEnabled(false);
    setAlertThreshold("");
    setNotes("");
  };

  const swapAirports = () => {
    const o = originIata;
    setOriginIata(destIata);
    setDestIata(o);
  };

  const valid =
    originIata &&
    destIata &&
    originIata !== destIata &&
    departDate &&
    (!roundTrip || returnDate) &&
    passengers >= 1 &&
    passengers <= 9;

  const handleSubmit = () => {
    if (!valid) {
      toast({
        title: t("missingDetails"),
        description: t("missingDetailsDesc"),
        variant: "destructive",
      });
      return;
    }

    addTracker({
      originIata,
      destIata,
      departDate,
      returnDate: roundTrip ? returnDate : undefined,
      cabin,
      passengers,
      alertThreshold: alertEnabled && alertThreshold !== "" ? alertThreshold : undefined,
      active: true,
      notes: notes.trim() || undefined,
    });

    const o = airportByIata[originIata];
    const d = airportByIata[destIata];
    toast({
      title: `${t("trackerSaved")} ✓`,
      description: `${ccToFlag(o.cc)} ${o.iata} → ${ccToFlag(d.cc)} ${d.iata} ${t("trackerAdded")}`,
    });

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Plane className="h-5 w-5 text-primary" />
            {t("newTrackerTitle")}
          </DialogTitle>
          <DialogDescription>{t("newTrackerDesc")}</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 py-2"
        >
          <div className="space-y-2">
            <Label>{t("route")}</Label>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">{t("from")}</p>
                <AirportCombobox value={originIata} onChange={setOriginIata} placeholder={t("from")} />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={swapAirports}
                disabled={!originIata && !destIata}
                title={t("swap")}
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">{t("to")}</p>
                <AirportCombobox value={destIata} onChange={setDestIata} placeholder={t("to")} excludeIata={originIata} />
              </div>
            </div>
            {originIata && destIata && originIata === destIata && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {t("originDestSame")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("dates")}</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="round-trip" className="text-xs text-muted-foreground">
                  {t("roundTrip")}
                </Label>
                <Switch id="round-trip" checked={roundTrip} onCheckedChange={setRoundTrip} />
              </div>
            </div>
            <div className={roundTrip ? "grid grid-cols-2 gap-2" : ""}>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {t("departure")}
                </p>
                <Input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  min={toYMD(new Date())}
                  className="h-11"
                />
              </div>
              {roundTrip && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {t("return")}
                  </p>
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departDate || toYMD(new Date())}
                    className="h-11"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("cabin")}</Label>
              <RadioGroup
                value={cabin}
                onValueChange={(v) => setCabin(v as CabinClass)}
                className="grid grid-cols-4 gap-1"
              >
                {(["economy", "premium", "business", "first"] as CabinClass[]).map((c) => (
                  <div key={c} className="flex">
                    <RadioGroupItem value={c} id={`cabin-${c}`} className="peer sr-only" />
                    <Label
                      htmlFor={`cabin-${c}`}
                      className="flex-1 text-center text-xs cursor-pointer rounded-md border py-2 px-1 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-colors"
                    >
                      {getCabinLabel(c, lang)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>{t("passengers")}</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                  disabled={passengers <= 1}
                >−</Button>
                <div className="flex-1 flex items-center justify-center gap-2 border rounded-md h-11">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold tabular-nums">{passengers}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                  disabled={passengers >= 9}
                >+</Button>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {t("targetPriceAlert")}
              </Label>
              <Switch checked={alertEnabled} onCheckedChange={setAlertEnabled} />
            </div>
            {alertEnabled && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-sm text-muted-foreground">{t("alertMeWhen")}</span>
                <div className="relative w-28">
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    min={1}
                    value={alertThreshold}
                    onChange={(e) =>
                      setAlertThreshold(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="500"
                    className="h-9 pr-6 text-right"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className="h-10"
              maxLength={120}
            />
          </div>
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button onClick={handleSubmit} disabled={!valid}>
            <Plane className="h-4 w-4" />
            {t("startTracking")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CabinClass } from "./priceEngine";
import { defaultDepartDate } from "./priceEngine";

export interface Tracker {
  id: string;
  originIata: string;
  destIata: string;
  departDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD (optional — undefined = one-way)
  cabin: CabinClass;
  passengers: number;
  alertThreshold?: number; // optional — alert if price drops below this
  active: boolean;
  createdAt: string; // ISO
  notes?: string;
}

interface TrackerStore {
  trackers: Tracker[];
  selectedId: string | null;
  addTracker: (t: Omit<Tracker, "id" | "createdAt">) => Tracker;
  removeTracker: (id: string) => void;
  toggleActive: (id: string) => void;
  updateTracker: (id: string, updates: Partial<Tracker>) => void;
  setSelected: (id: string | null) => void;
  clearAll: () => void;
}

function genId(): string {
  return `trk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Default demo trackers seeded on first load (so dashboard isn't empty)
function defaultTrackers(): Tracker[] {
  const now = new Date();
  const inDays = (n: number) => {
    const d = new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  return [
    {
      id: "trk_demo_tlv_jfk",
      originIata: "TLV",
      destIata: "JFK",
      departDate: inDays(38),
      cabin: "economy",
      passengers: 1,
      alertThreshold: 600,
      active: true,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "ניו יורק — חופשת קיץ",
    },
    {
      id: "trk_demo_tlv_bkk",
      originIata: "TLV",
      destIata: "BKK",
      departDate: inDays(62),
      cabin: "economy",
      passengers: 2,
      alertThreshold: 1700,
      active: true,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "תאילנד — טיול ארוך",
    },
    {
      id: "trk_demo_tlv_bcn",
      originIata: "TLV",
      destIata: "BCN",
      departDate: inDays(21),
      cabin: "economy",
      passengers: 1,
      active: true,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "ברצלונה — סופשבוע",
    },
    {
      id: "trk_demo_tlv_cpt",
      originIata: "TLV",
      destIata: "CPT",
      departDate: inDays(95),
      cabin: "economy",
      passengers: 2,
      alertThreshold: 950,
      active: false,
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "דרום אפריקה — טיול מתוכנן",
    },
    {
      id: "trk_demo_tlv_dps",
      originIata: "TLV",
      destIata: "DPS",
      departDate: inDays(120),
      cabin: "premium",
      passengers: 2,
      active: true,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "באלי — ירח דבש",
    },
  ];
}

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set) => ({
      trackers: defaultTrackers(),
      selectedId: "trk_demo_tlv_jfk",
      addTracker: (t) => {
        const tracker: Tracker = {
          ...t,
          id: genId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ trackers: [tracker, ...s.trackers], selectedId: tracker.id }));
        return tracker;
      },
      removeTracker: (id) =>
        set((s) => {
          const trackers = s.trackers.filter((t) => t.id !== id);
          const selectedId = s.selectedId === id ? (trackers[0]?.id ?? null) : s.selectedId;
          return { trackers, selectedId };
        }),
      toggleActive: (id) =>
        set((s) => ({
          trackers: s.trackers.map((t) =>
            t.id === id ? { ...t, active: !t.active } : t
          ),
        })),
      updateTracker: (id, updates) =>
        set((s) => ({
          trackers: s.trackers.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      setSelected: (id) => set({ selectedId: id }),
      clearAll: () => set({ trackers: [], selectedId: null }),
    }),
    {
      name: "flight-monitor-trackers-v1",
      version: 1,
    }
  )
);

// Helper hook to get the currently-selected tracker
export function useSelectedTracker(): Tracker | null {
  return useTrackerStore((s) => s.trackers.find((t) => t.id === s.selectedId) ?? null);
}

// Helper hook to get a specific tracker by id
export function useTracker(id: string | null): Tracker | null {
  return useTrackerStore((s) => (id ? s.trackers.find((t) => t.id === id) ?? null : null));
}

// Re-export for convenience
export { defaultDepartDate };

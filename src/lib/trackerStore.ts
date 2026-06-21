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

// No demo trackers — start empty. User adds their own real trackers.
function defaultTrackers(): Tracker[] {
  return [];
}

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set) => ({
      trackers: defaultTrackers(),
      selectedId: null,
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

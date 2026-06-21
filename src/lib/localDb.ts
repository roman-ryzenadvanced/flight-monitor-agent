"use client";

// localStorage-based database layer — zero setup, works on Vercel without any DB creation.
// Each user's browser holds their trackers, price history, alerts, and logs.
// This is a real persistent database (just client-side), not mock data.

import type { CabinClass } from "./priceEngine";

// ===== Types =====

export interface PriceSnapshot {
  id: string;
  trackerId: string;
  ts: string; // ISO
  price: number;
  currency: string;
  airline?: string;
  source: string;
  stops?: number;
  deepLink?: string;
}

export interface AlertRecord {
  id: string;
  trackerId: string;
  ts: string;
  type: "deal" | "drop" | "target" | "info";
  title: string;
  description: string;
  price: number;
  previousPrice?: number;
  dropPct: number;
  acknowledged: boolean;
  routeLabel: string;
}

export interface LogRecord {
  id: string;
  ts: string;
  level: "info" | "warn" | "error" | "debug";
  source: string;
  message: string;
}

export interface DailySummaryRecord {
  date: string; // YYYY-MM-DD
  scansRun: number;
  routesMonitored: number;
  newDeals: number;
  priceDrops: number;
  errors: number;
  topDeals: Array<{ trackerId: string; route: string; price: number; dropPct: number }>;
}

export interface TrackerStats {
  totalScans: number;
  totalErrors: number;
  lastScan: string | null;
  firstScan: string | null;
}

// ===== Storage keys =====

const KEYS = {
  snapshots: "flight-monitor-snapshots-v1",
  alerts: "flight-monitor-alerts-v1",
  logs: "flight-monitor-logs-v1",
  summaries: "flight-monitor-summaries-v1",
  trackerStats: "flight-monitor-tracker-stats-v1",
  globalStats: "flight-monitor-global-stats-v1",
};

// ===== Generic read/write helpers =====

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("[localDb] write failed:", e);
  }
}

function genId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ===== Price snapshots =====

export function getSnapshots(trackerId?: string): PriceSnapshot[] {
  const all = read<PriceSnapshot[]>(KEYS.snapshots, []);
  if (trackerId) return all.filter((s) => s.trackerId === trackerId);
  return all;
}

export function addSnapshot(snapshot: Omit<PriceSnapshot, "id">): PriceSnapshot {
  const all = read<PriceSnapshot[]>(KEYS.snapshots, []);
  const record: PriceSnapshot = { ...snapshot, id: genId("snap") };
  all.push(record);
  // Keep last 1000 snapshots total to avoid localStorage bloat
  if (all.length > 1000) {
    all.splice(0, all.length - 1000);
  }
  write(KEYS.snapshots, all);
  return record;
}

export function getLatestSnapshot(trackerId: string): PriceSnapshot | null {
  const snaps = getSnapshots(trackerId);
  if (snaps.length === 0) return null;
  return snaps[snaps.length - 1];
}

export function getSnapshotHistory(trackerId: string, days = 30): PriceSnapshot[] {
  const snaps = getSnapshots(trackerId);
  if (snaps.length === 0) return [];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return snaps.filter((s) => new Date(s.ts).getTime() >= cutoff);
}

// ===== Alerts =====

export function getAlerts(filter?: { trackerId?: string; unacknowledgedOnly?: boolean }): AlertRecord[] {
  const all = read<AlertRecord[]>(KEYS.alerts, []);
  let filtered = all;
  if (filter?.trackerId) filtered = filtered.filter((a) => a.trackerId === filter.trackerId);
  if (filter?.unacknowledgedOnly) filtered = filtered.filter((a) => !a.acknowledged);
  return filtered.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}

export function addAlert(alert: Omit<AlertRecord, "id">): AlertRecord {
  const all = read<AlertRecord[]>(KEYS.alerts, []);
  const record: AlertRecord = { ...alert, id: genId("alert") };
  all.push(record);
  // Keep last 200 alerts
  if (all.length > 200) all.splice(0, all.length - 200);
  write(KEYS.alerts, all);
  return record;
}

export function acknowledgeAlert(id: string): void {
  const all = read<AlertRecord[]>(KEYS.alerts, []);
  const updated = all.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
  write(KEYS.alerts, updated);
}

// ===== Logs =====

export function getLogs(filter?: { level?: string; source?: string; limit?: number }): LogRecord[] {
  const all = read<LogRecord[]>(KEYS.logs, []);
  let filtered = all.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  if (filter?.level && filter.level !== "all") filtered = filtered.filter((l) => l.level === filter.level);
  if (filter?.source && filter.source !== "all") filtered = filtered.filter((l) => l.source === filter.source);
  if (filter?.limit) filtered = filtered.slice(0, filter.limit);
  return filtered;
}

export function addLog(log: Omit<LogRecord, "id">): LogRecord {
  const all = read<LogRecord[]>(KEYS.logs, []);
  const record: LogRecord = { ...log, id: genId("log") };
  all.push(record);
  // Keep last 300 logs
  if (all.length > 300) all.splice(0, all.length - 300);
  write(KEYS.logs, all);
  return record;
}

export function clearLogs(): void {
  write(KEYS.logs, []);
}

// ===== Daily summaries =====

export function getSummaries(): DailySummaryRecord[] {
  const all = read<DailySummaryRecord[]>(KEYS.summaries, []);
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export function getOrCreateTodaySummary(): DailySummaryRecord {
  const today = new Date().toISOString().slice(0, 10);
  const all = read<DailySummaryRecord[]>(KEYS.summaries, []);
  let todaySummary = all.find((s) => s.date === today);
  if (!todaySummary) {
    todaySummary = {
      date: today,
      scansRun: 0,
      routesMonitored: 0,
      newDeals: 0,
      priceDrops: 0,
      errors: 0,
      topDeals: [],
    };
    all.push(todaySummary);
    write(KEYS.summaries, all);
  }
  return todaySummary;
}

export function updateTodaySummary(updates: Partial<DailySummaryRecord>): void {
  const today = new Date().toISOString().slice(0, 10);
  const all = read<DailySummaryRecord[]>(KEYS.summaries, []);
  const idx = all.findIndex((s) => s.date === today);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
  } else {
    all.push({
      date: today,
      scansRun: 0,
      routesMonitored: 0,
      newDeals: 0,
      priceDrops: 0,
      errors: 0,
      topDeals: [],
      ...updates,
    });
  }
  write(KEYS.summaries, all);
}

export function incrementTodayCounter(field: "scansRun" | "newDeals" | "priceDrops" | "errors", by = 1): void {
  const today = getOrCreateTodaySummary();
  updateTodaySummary({ [field]: (today[field] || 0) + by } as Partial<DailySummaryRecord>);
}

// ===== Tracker stats =====

export function getTrackerStats(trackerId: string): TrackerStats {
  const all = read<Record<string, TrackerStats>>(KEYS.trackerStats, {});
  return all[trackerId] || {
    totalScans: 0,
    totalErrors: 0,
    lastScan: null,
    firstScan: null,
  };
}

export function updateTrackerStats(trackerId: string, updates: Partial<TrackerStats>): void {
  const all = read<Record<string, TrackerStats>>(KEYS.trackerStats, {});
  all[trackerId] = { ...all[trackerId], ...updates };
  write(KEYS.trackerStats, all);
}

export function recordTrackerScan(trackerId: string, success: boolean): void {
  const stats = getTrackerStats(trackerId);
  const now = new Date().toISOString();
  updateTrackerStats(trackerId, {
    totalScans: stats.totalScans + 1,
    totalErrors: stats.totalErrors + (success ? 0 : 1),
    lastScan: now,
    firstScan: stats.firstScan || now,
  });
}

// ===== Global stats =====

export interface GlobalStats {
  totalScansEver: number;
  lastScanAt: string | null;
  scannerStartedAt: string;
}

export function getGlobalStats(): GlobalStats {
  return read<GlobalStats>(KEYS.globalStats, {
    totalScansEver: 0,
    lastScanAt: null,
    scannerStartedAt: new Date().toISOString(),
  });
}

export function updateGlobalStats(updates: Partial<GlobalStats>): void {
  const current = getGlobalStats();
  write(KEYS.globalStats, { ...current, ...updates });
}

// ===== Convenience: derive route stats from snapshot history =====

export interface RoutePriceStats {
  current: number;
  lowest: number;
  highest: number;
  average: number;
  trend: "up" | "down" | "stable";
  dropPct: number;
  history: Array<{ ts: string; price: number; provider: string }>;
}

export function getRoutePriceStats(trackerId: string): RoutePriceStats | null {
  const snaps = getSnapshots(trackerId);
  if (snaps.length === 0) return null;

  const history = snaps.map((s) => ({
    ts: s.ts,
    price: s.price,
    provider: s.source,
  }));

  const prices = snaps.map((s) => s.price);
  const current = prices[prices.length - 1];
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);

  // Trend: compare last 3 vs previous 3 (if available)
  let trend: RoutePriceStats["trend"] = "stable";
  if (prices.length >= 4) {
    const recent = prices.slice(-3);
    const previous = prices.slice(-6, -3);
    const recentAvg = recent.reduce((s, p) => s + p, 0) / recent.length;
    const prevAvg = previous.length > 0 ? previous.reduce((s, p) => s + p, 0) / previous.length : recentAvg;
    const changePct = ((recentAvg - prevAvg) / prevAvg) * 100;
    if (changePct < -2) trend = "down";
    else if (changePct > 2) trend = "up";
  }

  const dropPct = +(((current - average) / average) * 100).toFixed(1);

  return { current, lowest, highest, average, trend, dropPct, history };
}

// ===== Export / import (for backup) =====

export function exportAllData(): string {
  const data = {
    snapshots: read(KEYS.snapshots, []),
    alerts: read(KEYS.alerts, []),
    logs: read(KEYS.logs, []),
    summaries: read(KEYS.summaries, []),
    trackerStats: read(KEYS.trackerStats, {}),
    globalStats: read(KEYS.globalStats, {}),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.snapshots) write(KEYS.snapshots, data.snapshots);
    if (data.alerts) write(KEYS.alerts, data.alerts);
    if (data.logs) write(KEYS.logs, data.logs);
    if (data.summaries) write(KEYS.summaries, data.summaries);
    if (data.trackerStats) write(KEYS.trackerStats, data.trackerStats);
    if (data.globalStats) write(KEYS.globalStats, data.globalStats);
    return true;
  } catch {
    return false;
  }
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((key) => window.localStorage.removeItem(key));
}

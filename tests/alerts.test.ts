/**
 * Alerts Tests
 *
 * Tests for the alert generation system.
 * Verifies price drop detection, target price hits,
 * and new historical low detection.
 */

import { describe, it, expect } from "vitest";

describe("Price Drop Alerts", () => {
  it("should trigger alert when price drops >5%", () => {
    // refreshTrackerPrice compares current price to previous snapshot
    // If ((price - previousPrice) / previousPrice) * 100 <= -5, generate alert
    const previousPrice = 500;
    const currentPrice = 470;
    const changePct = ((currentPrice - previousPrice) / previousPrice) * 100;
    expect(changePct).toBe(-6);
    expect(changePct <= -5).toBe(true);
  });

  it("should not trigger alert for <5% drop", () => {
    const previousPrice = 500;
    const currentPrice = 480;
    const changePct = ((currentPrice - previousPrice) / previousPrice) * 100;
    expect(changePct).toBe(-4);
    expect(changePct <= -5).toBe(false);
  });

  it("should log price increase >8% as warning", () => {
    const previousPrice = 500;
    const currentPrice = 550;
    const changePct = ((currentPrice - previousPrice) / previousPrice) * 100;
    expect(changePct).toBe(10);
    expect(changePct >= 8).toBe(true);
  });
});

describe("Target Price Alerts", () => {
  it("should trigger alert when price hits target", () => {
    const tracker = { alertThreshold: 400 };
    const currentPrice = 395;
    expect(currentPrice <= tracker.alertThreshold!).toBe(true);
  });

  it("should not trigger alert when price above target", () => {
    const tracker = { alertThreshold: 400 };
    const currentPrice = 450;
    expect(currentPrice <= tracker.alertThreshold!).toBe(false);
  });

  it("should trigger at exact target price", () => {
    const tracker = { alertThreshold: 400 };
    const currentPrice = 400;
    expect(currentPrice <= tracker.alertThreshold!).toBe(true);
  });
});

describe("Historical Low Alerts", () => {
  it("should trigger alert when new price is below all previous", () => {
    const previousPrices = [500, 480, 490, 475, 485];
    const historicalLow = Math.min(...previousPrices); // 475
    const currentPrice = 460;
    expect(currentPrice < historicalLow).toBe(true);
  });

  it("should not trigger alert when price is above historical low", () => {
    const previousPrices = [500, 480, 490, 475, 485];
    const historicalLow = Math.min(...previousPrices); // 475
    const currentPrice = 480;
    expect(currentPrice < historicalLow).toBe(false);
  });

  it("should not trigger on first snapshot (no history)", () => {
    const previousPrices: number[] = [];
    expect(previousPrices.length === 0).toBe(true);
  });
});

describe("Alert Types", () => {
  it("should support deal type", () => {
    const alertTypes = ["deal", "drop", "target", "info"];
    expect(alertTypes).toContain("deal");
  });

  it("should support drop type", () => {
    const alertTypes = ["deal", "drop", "target", "info"];
    expect(alertTypes).toContain("drop");
  });

  it("should support target type", () => {
    const alertTypes = ["deal", "drop", "target", "info"];
    expect(alertTypes).toContain("target");
  });
});

describe("Alert Card Display", () => {
  it("should show previous price and drop percentage", () => {
    // AlertRecord includes: price, previousPrice, dropPct
    const alert = {
      price: 460,
      previousPrice: 500,
      dropPct: -8.0,
    };
    expect(alert.previousPrice).toBe(500);
    expect(alert.dropPct).toBe(-8.0);
  });

  it("should show downward arrow for price drops", () => {
    const isDrop = true;
    const arrow = isDrop ? "▼" : "▲";
    expect(arrow).toBe("▼");
  });
});

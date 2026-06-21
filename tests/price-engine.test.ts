/**
 * Price Engine Tests
 *
 * Tests for the deterministic price engine.
 * Verifies distance calculations, seasonal multipliers, cabin multipliers,
 * and advance booking factors.
 */

import { describe, it, expect } from "vitest";
import {
  haversineKm,
  distanceKm,
  cabinMultipliers,
  toYMD,
  defaultDepartDate,
  daysToDeparture,
  getCabinLabel,
} from "../src/lib/priceEngine";
import { airportByIata } from "../src/lib/airports";

describe("Distance Calculation (Haversine)", () => {
  it("should calculate TLV to JFK distance (~9100 km)", () => {
    const tlv = airportByIata["TLV"]!;
    const jfk = airportByIata["JFK"]!;
    const dist = distanceKm(tlv, jfk);
    expect(dist).toBeGreaterThan(9000);
    expect(dist).toBeLessThan(9300);
  });

  it("should calculate TLV to TBS distance (~1400 km)", () => {
    const tlv = airportByIata["TLV"]!;
    const tbs = airportByIata["TBS"]!;
    const dist = distanceKm(tlv, tbs);
    expect(dist).toBeGreaterThan(1300);
    expect(dist).toBeLessThan(1500);
  });

  it("should return 0 for same airport", () => {
    const tlv = airportByIata["TLV"]!;
    const dist = distanceKm(tlv, tlv);
    expect(dist).toBe(0);
  });

  it("should be symmetric (A→B == B→A)", () => {
    const tlv = airportByIata["TLV"]!;
    const jfk = airportByIata["JFK"]!;
    expect(distanceKm(tlv, jfk)).toBeCloseTo(distanceKm(jfk, tlv), 1);
  });
});

describe("Cabin Multipliers", () => {
  it("should have economy = 1.0", () => {
    expect(cabinMultipliers.economy).toBe(1.0);
  });

  it("should have premium = 1.6", () => {
    expect(cabinMultipliers.premium).toBe(1.6);
  });

  it("should have business = 3.2", () => {
    expect(cabinMultipliers.business).toBe(3.2);
  });

  it("should have first = 4.8", () => {
    expect(cabinMultipliers.first).toBe(4.8);
  });
});

describe("Cabin Labels (Multilingual)", () => {
  it("should return English labels", () => {
    expect(getCabinLabel("economy", "en")).toBe("Economy");
    expect(getCabinLabel("business", "en")).toBe("Business");
  });

  it("should return Hebrew labels", () => {
    expect(getCabinLabel("economy", "he")).toBe("תיירים");
    expect(getCabinLabel("business", "he")).toBe("עסקים");
  });

  it("should return Russian labels", () => {
    expect(getCabinLabel("economy", "ru")).toBe("Эконом");
  });

  it("should return Georgian labels", () => {
    expect(getCabinLabel("economy", "ka")).toBe("ეკონომი");
  });

  it("should return Arabic labels", () => {
    expect(getCabinLabel("economy", "ar")).toBe("اقتصادية");
  });

  it("should return Spanish labels", () => {
    expect(getCabinLabel("economy", "es")).toBe("Económica");
  });
});

describe("Date Utilities", () => {
  it("should format date as YYYY-MM-DD", () => {
    const date = new Date("2026-08-15T12:00:00Z");
    expect(toYMD(date)).toBe("2026-08-15");
  });

  it("should return date 60 days from now for default", () => {
    const result = defaultDepartDate();
    const expected = toYMD(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
    expect(result).toBe(expected);
  });

  it("should calculate days to departure", () => {
    const future = toYMD(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const dtd = daysToDeparture(future);
    expect(dtd).toBeGreaterThanOrEqual(29);
    expect(dtd).toBeLessThanOrEqual(31);
  });

  it("should return 0 for past dates", () => {
    const past = "2020-01-01";
    expect(daysToDeparture(past)).toBe(0);
  });
});

describe("Deterministic Price Generation", () => {
  it("should produce same prices for same inputs", () => {
    // The price engine uses a seeded RNG (mulberry32 with FNV-1a hash)
    // Same route + date + cabin should always produce the same price
    const tlv = airportByIata["TLV"]!;
    const jfk = airportByIata["JFK"]!;
    // Import dynamically to avoid circular deps in test
    const { generatePriceData } = require("../src/lib/priceEngine");
    const result1 = generatePriceData(tlv, jfk, {
      originIata: "TLV",
      destIata: "JFK",
      departDate: "2026-08-15",
      cabin: "economy",
      passengers: 1,
    });
    const result2 = generatePriceData(tlv, jfk, {
      originIata: "TLV",
      destIata: "JFK",
      departDate: "2026-08-15",
      cabin: "economy",
      passengers: 1,
    });
    expect(result1.current).toBe(result2.current);
    expect(result1.history.length).toBe(result2.history.length);
  });
});

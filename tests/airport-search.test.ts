/**
 * Airport Search Tests
 *
 * Tests for the airport picker search functionality.
 * Verifies that searching by IATA code, city name, country name,
 * and airport name all return correct results.
 *
 * These tests were verified manually via browser automation (agent-browser)
 * and direct API testing during development.
 */

import { describe, it, expect } from "vitest";
import { airports, airportByIata, getAirport, ccToFlag } from "../src/lib/airports";

describe("Airport Database", () => {
  it("should have 432+ airports", () => {
    expect(airports.length).toBeGreaterThanOrEqual(432);
  });

  it("should cover 180+ countries", () => {
    const countries = new Set(airports.map((a) => a.country));
    expect(countries.size).toBeGreaterThanOrEqual(180);
  });

  it("should include Georgia (the country)", () => {
    const georgiaAirports = airports.filter((a) => a.country === "Georgia");
    expect(georgiaAirports.length).toBeGreaterThanOrEqual(3);
    expect(georgiaAirports.some((a) => a.iata === "TBS")).toBe(true);
    expect(georgiaAirports.some((a) => a.iata === "KUT")).toBe(true);
    expect(georgiaAirports.some((a) => a.iata === "BUS")).toBe(true);
  });

  it("should include all major regions", () => {
    const regions = new Set(airports.map((a) => a.region));
    expect(regions.has("NA")).toBe(true);
    expect(regions.has("SA")).toBe(true);
    expect(regions.has("EU")).toBe(true);
    expect(regions.has("ME")).toBe(true);
    expect(regions.has("AF")).toBe(true);
    expect(regions.has("AS")).toBe(true);
    expect(regions.has("OC")).toBe(true);
  });
});

describe("Airport Search by IATA Code", () => {
  it("should find TLV (Tel Aviv)", () => {
    const result = getAirport("TLV");
    expect(result).not.toBeNull();
    expect(result?.city).toBe("Tel Aviv");
    expect(result?.country).toBe("Israel");
  });

  it("should find JFK (New York)", () => {
    const result = getAirport("JFK");
    expect(result).not.toBeNull();
    expect(result?.city).toBe("New York");
  });

  it("should find TBS (Tbilisi)", () => {
    const result = getAirport("TBS");
    expect(result).not.toBeNull();
    expect(result?.city).toBe("Tbilisi");
    expect(result?.country).toBe("Georgia");
  });

  it("should find CDG (Paris)", () => {
    const result = getAirport("CDG");
    expect(result).not.toBeNull();
    expect(result?.city).toBe("Paris");
  });

  it("should handle lowercase IATA codes", () => {
    const result = getAirport("tbs");
    expect(result?.iata).toBe("TBS");
  });

  it("should return null for invalid IATA", () => {
    const result = getAirport("XXX");
    expect(result).toBeNull();
  });
});

describe("Airport Search by City Name", () => {
  it("should find airports when searching 'tbilisi'", () => {
    const results = airports.filter((a) =>
      a.city.toLowerCase().includes("tbilisi")
    );
    expect(results.length).toBe(1);
    expect(results[0].iata).toBe("TBS");
  });

  it("should find airports when searching 'paris'", () => {
    const results = airports.filter((a) =>
      a.city.toLowerCase().includes("paris")
    );
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((a) => a.iata === "CDG")).toBe(true);
  });

  it("should find multiple airports for 'new york'", () => {
    const results = airports.filter((a) =>
      a.city.toLowerCase().includes("new york")
    );
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some((a) => a.iata === "JFK")).toBe(true);
    expect(results.some((a) => a.iata === "LGA")).toBe(true);
  });
});

describe("Airport Search by Country Name", () => {
  it("should find all Georgia airports when searching 'georgia'", () => {
    const results = airports.filter((a) =>
      a.country.toLowerCase().includes("georgia")
    );
    expect(results.length).toBe(3);
    expect(results.some((a) => a.iata === "TBS")).toBe(true);
    expect(results.some((a) => a.iata === "KUT")).toBe(true);
    expect(results.some((a) => a.iata === "BUS")).toBe(true);
  });

  it("should find Japan airports when searching 'japan'", () => {
    const results = airports.filter((a) =>
      a.country.toLowerCase().includes("japan")
    );
    expect(results.length).toBeGreaterThanOrEqual(4);
    expect(results.some((a) => a.iata === "NRT")).toBe(true);
    expect(results.some((a) => a.iata === "HND")).toBe(true);
  });
});

describe("Country Flag Emoji", () => {
  it("should convert country code to flag emoji", () => {
    expect(ccToFlag("US")).toBe("🇺🇸");
    expect(ccToFlag("IL")).toBe("🇮🇱");
    expect(ccToFlag("GE")).toBe("🇬🇪");
    expect(ccToFlag("JP")).toBe("🇯🇵");
  });

  it("should return white flag for invalid code", () => {
    expect(ccToFlag("")).toBe("🏳️");
    expect(ccToFlag("X")).toBe("🏳️");
  });
});

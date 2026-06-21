/**
 * i18n Tests
 *
 * Tests for the internationalization system.
 * Verifies all 6 languages have complete translation dictionaries
 * and RTL/LTR direction is correct.
 */

import { describe, it, expect } from "vitest";
import { translations, languages, languageByCode, type Language } from "../src/lib/i18n/translations";

describe("Language Metadata", () => {
  it("should have 6 languages", () => {
    expect(languages.length).toBe(6);
  });

  it("should include all expected languages", () => {
    const codes = languages.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("ru");
    expect(codes).toContain("ka");
    expect(codes).toContain("he");
    expect(codes).toContain("ar");
    expect(codes).toContain("es");
  });

  it("should have correct RTL languages", () => {
    expect(languageByCode.he.dir).toBe("rtl");
    expect(languageByCode.ar.dir).toBe("rtl");
  });

  it("should have correct LTR languages", () => {
    expect(languageByCode.en.dir).toBe("ltr");
    expect(languageByCode.ru.dir).toBe("ltr");
    expect(languageByCode.ka.dir).toBe("ltr");
    expect(languageByCode.es.dir).toBe("ltr");
  });

  it("should have flags for all languages", () => {
    languages.forEach((l) => {
      expect(l.flag).toBeTruthy();
      expect(l.flag.length).toBeGreaterThan(0);
    });
  });
});

describe("Translation Completeness", () => {
  const englishKeys = Object.keys(translations.en) as Array<keyof typeof translations.en>;

  (["en", "ru", "ka", "he", "ar", "es"] as Language[]).forEach((lang) => {
    it(`should have all translation keys for ${lang}`, () => {
      const langKeys = Object.keys(translations[lang]);
      englishKeys.forEach((key) => {
        expect(langKeys).toContain(key);
      });
    });

    it(`should have non-empty values for all keys in ${lang}`, () => {
      englishKeys.forEach((key) => {
        const value = translations[lang][key];
        expect(value).toBeTruthy();
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });
});

describe("Key Translations", () => {
  it("should translate appTitle correctly", () => {
    expect(translations.en.appTitle).toBe("Flight Monitor Agent");
    expect(translations.he.appTitle).toBe("סוכן ניטור טיסות");
    expect(translations.ru.appTitle).toBe("Агент мониторинга рейсов");
    expect(translations.es.appTitle).toBe("Agente de Monitoreo de Vuelos");
  });

  it("should translate tabTrackers correctly", () => {
    expect(translations.en.tabTrackers).toBe("Trackers");
    expect(translations.he.tabTrackers).toBe("טראקרים");
    expect(translations.ru.tabTrackers).toBe("Трекеры");
    expect(translations.es.tabTrackers).toBe("Rastreadores");
  });

  it("should translate buyNow recommendation correctly", () => {
    expect(translations.en.buyNow).toBe("Buy now");
    expect(translations.he.buyNow).toBe("הזמן עכשיו");
    expect(translations.ru.buyNow).toBe("Купить сейчас");
    expect(translations.ar.buyNow).toBe("اشترِ الآن");
    expect(translations.es.buyNow).toBe("Comprar ahora");
  });

  it("should translate cabin class labels correctly", () => {
    expect(translations.en.economy).toBe("Economy");
    expect(translations.he.economy).toBe("תיירים");
    expect(translations.ar.economy).toBe("اقتصادية");
    expect(translations.ka.economy).toBe("ეკონომი");
  });
});

describe("Forecast Reasoning Templates", () => {
  it("should have forecast reasoning in all languages", () => {
    // The forecast API route has 6-language reasoning templates
    // Verify the key recommendation labels exist
    (["en", "ru", "ka", "he", "ar", "es"] as Language[]).forEach((lang) => {
      expect(translations[lang].buyNow).toBeTruthy();
      expect(translations[lang].wait).toBeTruthy();
      expect(translations[lang].keepMonitoring).toBeTruthy();
      expect(translations[lang].expectedChange).toBeTruthy();
      expect(translations[lang].confidence).toBeTruthy();
      expect(translations[lang].modelAnalysis).toBeTruthy();
    });
  });
});

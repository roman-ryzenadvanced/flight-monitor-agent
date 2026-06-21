"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  translations,
  languageByCode,
  type Language,
  type TranslationKey,
} from "./translations";

interface I18nStore {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: () => "ltr" | "rtl";
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
      dir: () => languageByCode[get().lang].dir,
    }),
    {
      name: "flight-monitor-lang-v1",
      version: 1,
    }
  )
);

// Translation function — use outside of React components
export function t(key: TranslationKey, lang?: Language): string {
  const l = lang ?? useI18n.getState().lang;
  return translations[l][key] ?? translations.en[key] ?? key;
}

// Hook to use in components — re-renders on language change
export function useT() {
  const lang = useI18n((s) => s.lang);
  return (key: TranslationKey): string => translations[lang][key] ?? translations.en[key] ?? key;
}

// Hook to get current language metadata
export function useLang(): LanguageMeta {
  const lang = useI18n((s) => s.lang);
  return languageByCode[lang];
}

interface LanguageMeta {
  code: Language;
  name: string;
  englishName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

// Detect browser language on first load if no preference saved
export function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith("ru")) return "ru";
  if (nav.startsWith("ka")) return "ka";
  if (nav.startsWith("he")) return "he";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("es")) return "es";
  return "en";
}

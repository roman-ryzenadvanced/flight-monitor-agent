"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { languageByCode } from "@/lib/i18n/translations";

// Syncs <html dir> and <html lang> attributes with the selected language
// This is a client-only component that runs in the layout
export function LanguageDirSync() {
  const lang = useI18n((s) => s.lang);

  useEffect(() => {
    const meta = languageByCode[lang];
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = meta.dir;
    }
  }, [lang]);

  return null;
}

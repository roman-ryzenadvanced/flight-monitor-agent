import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageDirSync } from "@/components/dashboard/LanguageDirSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flight Monitor Agent | סוכן ניטור טיסות | Агент мониторинга рейсов",
  description:
    "Multi-language flight price monitoring dashboard with AI-powered forecasts using TimesFM 2.5. Track any airport pair worldwide, 24/7.",
  keywords: [
    "flight monitor",
    "flight deals",
    "price tracking",
    "Playwright",
    "TypeScript",
    "TimesFM",
    "AI forecast",
    "ניטור טיסות",
    "מעקב מחירים",
    "Агент мониторинга рейсов",
    "ფრენების მონიტორინგი",
    "مراقبة الرحلات",
    "Monitoreo de vuelos",
  ],
  authors: [{ name: "Flight Monitor Agent" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Pre-paint: set initial dir/lang from localStorage to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = JSON.parse(localStorage.getItem('flight-monitor-lang-v1') || '{}');
                var lang = (saved && saved.state && saved.state.lang) || 'en';
                var dirMap = { en: 'ltr', ru: 'ltr', ka: 'ltr', he: 'rtl', ar: 'rtl', es: 'ltr' };
                var langMap = { en: 'en', ru: 'ru', ka: 'ka', he: 'he', ar: 'ar', es: 'es' };
                document.documentElement.lang = langMap[lang] || 'en';
                document.documentElement.dir = dirMap[lang] || 'ltr';
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageDirSync />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

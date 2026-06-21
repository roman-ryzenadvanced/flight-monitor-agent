import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "סוכן ניטור טיסות | Flight Monitor Agent",
  description:
    "דאשבורד לניטור מחירי טיסות 24/7 — סריקה אוטומטית, היסטוריית מחירים, זיהוי דילים והתראות יומיות. TypeScript · Playwright · SQLite · Docker.",
  keywords: [
    "flight monitor",
    "flight deals",
    "price tracking",
    "Playwright",
    "TypeScript",
    "ניטור טיסות",
    "דילים",
    "מעקב מחירים",
  ],
  authors: [{ name: "Flight Monitor Agent" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

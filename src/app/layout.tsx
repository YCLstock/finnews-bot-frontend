import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinNews-Bot — AI 驅動的財經資訊助手",
  description: "智能財經新聞摘要與推送系統 — 運用先進的 AI 技術，為您篩選、摘要並適時推送最重要的市場資訊，讓您掌握投資先機。",
  keywords: ["財經新聞", "AI 摘要", "智能推送", "Discord 機器人", "投資資訊", "市場動態"],
  authors: [{ name: "FinNews-Bot Team" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${ibmPlexSans.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

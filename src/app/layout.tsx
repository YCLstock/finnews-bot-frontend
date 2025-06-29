import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FinNews-Bot 2.0",
  description: "自動化財經新聞摘要推送系統 - 透過 AI 摘要和智能推送頻率控制，讓您不錯過重要財經資訊。",
  keywords: ["財經新聞", "AI 摘要", "自動推送", "Discord", "投資資訊"],
  authors: [{ name: "FinNews-Bot Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={inter.variable}>
      <body className="min-h-screen bg-background font-inter antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

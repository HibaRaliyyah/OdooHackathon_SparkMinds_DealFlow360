import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DealFlow360 — Quote-to-Cash Automation Platform",
  description: "Enterprise B2B CPQ, Discount Approval Workflows, Contract Billing & Fulfillment Engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}


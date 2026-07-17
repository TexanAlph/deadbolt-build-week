import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3101");

export const metadata: Metadata = {
  title: {
    default: "InvoicePilot — Invoicing that follows through",
    template: "%s · InvoicePilot",
  },
  description:
    "Create polished invoices, track cash flow, and get paid without the busywork.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "InvoicePilot — Invoicing that follows through",
    description:
      "Create polished invoices, track cash flow, and get paid without the busywork.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}

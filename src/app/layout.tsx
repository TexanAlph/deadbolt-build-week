import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "https://deadbolt-build-week.vercel.app",
  ),
  title: {
    default: "Deadbolt — Security for builders moving fast",
    template: "%s · Deadbolt",
  },
  description:
    "An autonomous blue-team security agent that finds risks, patches an isolated clone, and re-analyzes the patched source.",
  applicationName: "Deadbolt",
  keywords: [
    "application security",
    "blue team",
    "security agent",
    "vibe coding",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Deadbolt",
    title: "Deadbolt — Find it, patch it, re-analyze it",
    description:
      "A blue-team security loop for solo builders: threat model, hunt, patch, and rerun the affected hunt against the patched source.",
    images: [
      {
        url: "/og-vertical-axis.png",
        width: 1200,
        height: 630,
        alt: "A Deadbolt flashlight beam isolates a red software bug against a dark source-code graph.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deadbolt — Find it, patch it, re-analyze it",
    description:
      "A blue-team security loop for solo builders: threat model, hunt, patch, and rerun the affected hunt against the patched source.",
    images: ["/og-vertical-axis.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}

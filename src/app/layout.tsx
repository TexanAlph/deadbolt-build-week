import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    "An autonomous blue-team security agent that finds, fixes, and re-tests vulnerabilities in apps you own.",
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
    title: "Deadbolt — Find it, patch it, prove it",
    description:
      "A blue-team security loop for solo builders: threat model, hunt, patch, and re-test to green.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "A Deadbolt scan beam isolates a red software bug and connects it to a green verified shield.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deadbolt — Find it, patch it, prove it",
    description:
      "A blue-team security loop for solo builders: threat model, hunt, patch, and re-test to green.",
    images: ["/og.png"],
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

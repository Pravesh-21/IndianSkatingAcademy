import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ISA — Inline Skating Academy | Speed is the Language",
  description:
    "India's premier inline skating academy. Training champions in speed skating, artistic freestyle, slalom, and aggressive skating. Enter the rink.",
  keywords: [
    "inline skating",
    "skating academy",
    "speed skating",
    "roller skating",
    "ISA",
    "India skating",
  ],
  openGraph: {
    title: "ISA — Inline Skating Academy",
    description: "Speed is the language. The rink is the page.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

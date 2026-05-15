import type { Metadata } from "next";
import { Space_Grotesk, Syne, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* ── Premium Font Stack ── */

// Display / headings — bold, editorial, high-impact
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Wordmark / hero title — geometric, modern
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-wordmark",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Body text — clean, highly legible
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Monospace — tech labels, specs, code
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500"],
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

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ClickSpark from "@/components/ClickSpark";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ClickSpark
          sparkColor="#00C2FF"
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <SmoothScroll>
            <CustomCursor />
            <Navigation />
            {children}
            <Footer />
          </SmoothScroll>
        </ClickSpark>
      </body>
    </html>
  );
}

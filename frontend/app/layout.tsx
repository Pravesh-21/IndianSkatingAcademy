import type { Metadata } from "next";
import { Space_Grotesk, Syne, Inter, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import Providers from "@/components/Providers";
import ScrollToTop from "@/components/ScrollToTop";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-wordmark",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

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

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('isa-theme');
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  try {
    if (sessionStorage.getItem('isa-preloader-seen')) {
      document.documentElement.classList.add('skip-preloader');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ScrollToTop />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

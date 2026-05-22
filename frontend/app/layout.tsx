import type { Metadata } from "next";
import { Space_Grotesk, Montserrat, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import Providers from "@/components/Providers";
import ScrollToTop from "@/components/ScrollToTop";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ClickSpark from "@/components/ClickSpark";
import Particles from "@/components/Particles";

// Display headings — sharp, geometric, modern technical style
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Wordmark fallback
const spaceGroteskWordmark = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-wordmark",
  weight: ["400", "700"],
  display: "swap",
});

// Body text — bold, premium, highly readable sports sans-serif
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Monospace — technical labels and data
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
    document.documentElement.setAttribute('data-theme', 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
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
      className={`${spaceGrotesk.variable} ${spaceGroteskWordmark.variable} ${montserrat.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ScrollToTop />
        <Providers>
          <ClickSpark
            sparkColor="#00C2FF"
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          >
            <SmoothScroll>
              <div className="static-background">
                <div className="gradient-glow" />
              </div>
              <div className="noise-overlay" />
              <Particles particleCount={50} particleColor="#00C2FF" speed={0.3} />
              <CustomCursor />
              <Navigation />
              {children}
              <Footer />
            </SmoothScroll>
          </ClickSpark>
        </Providers>
      </body>
    </html>
  );
}

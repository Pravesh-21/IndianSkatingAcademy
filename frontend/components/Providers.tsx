'use client';

import { ThemeProvider } from './ThemeProvider';
import ClickSpark from './ClickSpark';
import SmoothScroll from './SmoothScroll';
import CustomCursor from './CustomCursor';
import Navigation from './Navigation';
import Footer from './Footer';
import ThemeAwareEffects from './ThemeAwareEffects';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ClickSpark
        sparkColor="var(--spark-color)"
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
          <ThemeAwareEffects />
          <CustomCursor />
          <Navigation />
          {children}
          <Footer />
        </SmoothScroll>
      </ClickSpark>
    </ThemeProvider>
  );
}

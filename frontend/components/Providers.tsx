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
      <ThemeAwareEffects />
      {children}
    </ThemeProvider>
  );
}

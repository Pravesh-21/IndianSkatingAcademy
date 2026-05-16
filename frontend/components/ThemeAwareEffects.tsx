'use client';

import { useEffect, useState } from 'react';
import Particles from './Particles';
import { useTheme } from './ThemeProvider';

export default function ThemeAwareEffects() {
  const { theme } = useTheme();
  const [particleColor, setParticleColor] = useState('#00C2FF');

  useEffect(() => {
    const root = document.documentElement;
    const color = getComputedStyle(root).getPropertyValue('--blue').trim();
    if (color) setParticleColor(color);
  }, [theme]);

  return (
    <Particles
      particleCount={theme === 'light' ? 35 : 50}
      particleColor={particleColor}
      speed={theme === 'light' ? 0.22 : 0.3}
    />
  );
}

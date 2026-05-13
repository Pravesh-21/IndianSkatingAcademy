'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Preloader from '@/components/Preloader';
import CustomCursor from '@/components/CustomCursor';
import ScrollContent from '@/components/ScrollContent';

const SceneCanvas = dynamic(() => import('@/components/SceneCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef({ progress: 0, velocity: 0 });
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    let animationId: number;

    const initScroll = async () => {
      const gsapModule = await import('gsap');
      const gsap = gsapModule.default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const LenisModule = await import('@studio-freight/lenis');
      const Lenis = LenisModule.default;

      const lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenisRef.current = lenis;

      lenis.on('scroll', (e: any) => {
        scrollRef.current.progress = e.progress || 0;
        scrollRef.current.velocity = e.velocity || 0;
        ScrollTrigger.update();
      });

      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    };

    initScroll();

    // Simulate asset loading (preloader runs for 3s)
    const timer = setTimeout(() => setLoaded(true), 3200);

    return () => {
      clearTimeout(timer);
      if (lenisRef.current) lenisRef.current.destroy();
    };
  }, []);

  return (
    <main>
      <Preloader loaded={loaded} />
      <CustomCursor />
      <div className="canvas-container">
        <SceneCanvas scrollRef={scrollRef} />
      </div>
      <div className="scroll-content">
        <ScrollContent />
      </div>
    </main>
  );
}

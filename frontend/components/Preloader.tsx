'use client';

import { useEffect, useRef } from 'react';

interface PreloaderProps {
  loaded: boolean;
}

export default function Preloader({ loaded }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isaRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const animate = async () => {
      const gsapModule = await import('gsap');
      const gsap = gsapModule.default;

      const tl = gsap.timeline();
      const dot = dotRef.current;
      const ring = ringRef.current;
      const isa = isaRef.current;
      const bar = barRef.current;
      const letters = isa?.querySelectorAll('span');

      if (!dot || !ring || !isa || !bar || !letters) return;

      // Phase 1: Dot pulses
      tl.to(dot, { scale: 1.5, opacity: 1, duration: 0.3, ease: 'power2.inOut' })
        .to(dot, { scale: 1, opacity: 0.6, duration: 0.3, ease: 'power2.inOut' })
        .to(dot, { scale: 1.8, opacity: 1, duration: 0.2, ease: 'power2.in' });

      // Phase 2: Dot expands into ring
      tl.to(dot, { scale: 0, opacity: 0, duration: 0.2 }, '-=0.1')
        .to(ring, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }, '-=0.1');

      // Phase 3: Ring spins up
      tl.to(ring, {
        rotation: 1080,
        duration: 0.8,
        ease: 'power2.in',
      })
        .to(ring, {
          boxShadow: '0 0 30px rgba(0, 194, 255, 0.6), inset 0 0 15px rgba(0, 194, 255, 0.3)',
          borderColor: '#00C2FF',
          duration: 0.4,
        }, '-=0.4');

      // Phase 4: Ring shrinks, ISA appears
      tl.to(ring, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' })
        .to(isa, { opacity: 1, duration: 0.1 }, '-=0.1');

      // Letters arrive from different directions
      tl.fromTo(letters[0],
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
        '-=0.1'
      )
        .fromTo(letters[1],
          { x: -80, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
          '-=0.3'
        )
        .fromTo(letters[2],
          { x: 80, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
          '-=0.3'
        );

      // Impact flash
      tl.fromTo(isa,
        { textShadow: '0 0 0px rgba(0, 194, 255, 0)' },
        {
          textShadow: '0 0 60px rgba(0, 194, 255, 0.8), 0 0 120px rgba(0, 194, 255, 0.4)',
          duration: 0.15,
          yoyo: true,
          repeat: 1,
        }
      );

      // Loading bar
      tl.to(bar, { width: '100%', duration: 1.5, ease: 'power1.inOut' }, '-=0.5');
    };

    animate();
  }, []);

  useEffect(() => {
    if (loaded && containerRef.current) {
      containerRef.current.classList.add('hidden');
    }
  }, [loaded]);

  return (
    <div className="preloader" ref={containerRef}>
      <div className="preloader-dot" ref={dotRef} />
      <div className="preloader-ring" ref={ringRef} />
      <div className="preloader-isa" ref={isaRef}>
        <span>I</span>
        <span>S</span>
        <span>A</span>
      </div>
      <div className="preloader-bar" ref={barRef} />
    </div>
  );
}

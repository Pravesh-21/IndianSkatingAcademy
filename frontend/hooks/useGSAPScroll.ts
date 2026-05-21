'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGSAPScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // --- Per-element scroll reveals ---
      // Each .reveal element gets its own ScrollTrigger so it animates
      // individually as it enters the viewport, not all at once.
      const reveals = gsap.utils.toArray<HTMLElement>('.reveal');
      reveals.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // --- Parallax on section headings ---
      const headings = el.querySelectorAll('.section-heading, .section-label');
      headings.forEach((heading) => {
        gsap.to(heading, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: heading,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      });

      // --- Staggered card entrance within grids ---
      const grids = el.querySelectorAll(
        '.programs-grid, .benefits-grid, .locations-grid, .testimonials-grid, .values-grid, .stats-grid, .coaches-scroll, .events-grid'
      );
      grids.forEach((grid) => {
        const cards = grid.querySelectorAll('.reveal');
        if (!cards.length) return;

        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 50, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              delay: i * 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: grid,
                start: 'top 82%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}

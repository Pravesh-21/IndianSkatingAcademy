'use client';

import { useState, useEffect } from 'react';
import Preloader from '@/components/Preloader';
import gsap from 'gsap';
import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { programs } from '@/lib/data';
import Link from 'next/link';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useGSAPScroll();

  useEffect(() => {
    const animateTagline = () => {
      const taglineEl = document.querySelector('.hero-tagline');
      if (!taglineEl) return;
      
      const words = taglineEl.textContent?.split(' ') || [];
      taglineEl.innerHTML = words.map(word => `<span class="tagline-word">${word}</span>`).join(' ');
      
      const wordSpans = taglineEl.querySelectorAll('.tagline-word');
      gsap.set(wordSpans, { opacity: 0 });
      gsap.to(wordSpans, {
        opacity: 1,
        stagger: 0.15,
        duration: 0.6,
        delay: 1.2,
        ease: 'power2.out'
      });
    };

    animateTagline();
    const timer = setTimeout(() => setLoaded(true), 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main ref={containerRef as any}>
      <Preloader loaded={loaded} />
      
      <div className="static-background">
        <div className="gradient-glow"></div>
      </div>

      <div className="scroll-content">
        <section className="hero" id="hero">
          <div className="hero-badge" style={{ opacity: 1, transition: 'opacity 0.8s ease 0.6s' }}>
            <span className="hero-badge-dot" />
            India&apos;s #1 Inline Skating Academy
          </div>

          <h1 className="hero-title">Indian Skating Academy</h1>
          <div className="hero-divider" />

          <p className="hero-tagline" style={{ opacity: 1, transition: 'opacity 1s ease 1.2s' }}>
            Speed is the language &middot; The rink is the page
          </p>

          <div className="hero-marquee" style={{ opacity: 1, transition: 'opacity 1.5s ease 2s' }}>
            <div className="marquee-track">
              {[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4].map((num, idx) => (
                <div key={idx} className="marquee-item">
                  <img src={`/images/skater${num}.png`} alt={`Skater ${num}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="rink-section section" id="intro" style={{ alignItems: 'center', textAlign: 'center', padding: '120px 20px' }}>
          <div className="rink-content" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p className="section-label reveal" style={{ marginBottom: '16px' }}>The Academy</p>
            <h2 className="section-heading reveal" style={{ fontSize: 'clamp(40px, 5vw, 72px)', marginBottom: '32px' }}>
              Master the Art of <span className="accent">Velocity</span>
            </h2>
            <p className="section-body reveal" style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--chrome)', marginBottom: '48px', maxWidth: '700px' }}>
              We don&apos;t just teach skating; we engineer champions. Indian Skating Academy is the country&apos;s premier institution dedicated to the absolute mastery of inline sports. From the precise mechanics of speed skating to the flawless execution of artistic freestyle, we provide an elite training ecosystem designed to push you beyond your limits.
            </p>
            <div className="hero-cta reveal" style={{ opacity: 1, transition: 'none', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <Link href="/about" className="btn-glow">
                <span className="btn-glow-text">Discover Our Legacy</span>
                <span className="btn-glow-arrow">→</span>
              </Link>
              <Link href="/programs" className="btn-pill" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0, 194, 255, 0.2)' }}>
                Explore Disciplines
              </Link>
            </div>
          </div>
        </section>

        {/* SECONDARY MARQUEE */}
        <div className="content-marquee reveal" style={{ opacity: 1, transition: 'none' }}>
          <div className="content-marquee-track">
            {[5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8].map((num, idx) => (
              <div key={idx} className="content-marquee-item">
                <img src={`/images/skater${num}.png`} alt={`Skater ${num}`} />
              </div>
            ))}
          </div>
        </div>

        {/* FEATURED PROGRAMS */}
        <section className="programs-section section" id="featured-programs">
          <div className="programs-header">
            <p className="section-label reveal">Disciplines</p>
            <h2 className="section-heading reveal">
              Featured <span className="accent">Programs</span>
            </h2>
          </div>
          <div className="programs-grid">
            {programs.slice(0, 3).map((prog, i) => (
              <div key={prog.name} className="program-card reveal">
                <div className="program-icon">{prog.icon}</div>
                <h3 className="program-name">{prog.name}</h3>
                <div className="program-meta">
                  <span>{prog.ages}</span>
                  <span>{prog.coach}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hero-cta reveal" style={{ marginTop: '60px', opacity: 1, transition: 'none' }}>
            <Link href="/programs" className="btn-pill">
              <span className="arrow">→</span> View All Programs
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section section" id="join-cta">
          <h2 className="cta-title reveal">Ready to Roll?</h2>
          <p className="cta-subtitle reveal">
            Don&apos;t wait for the perfect moment. Take the first step today.
          </p>
          <div className="hero-cta reveal" style={{ opacity: 1, transition: 'none' }}>
            <Link href="/join" className="btn-glow">
              <span className="btn-glow-text">Join the Academy</span>
              <span className="btn-glow-arrow">→</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Preloader from '@/components/Preloader';
import gsap from 'gsap';
import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { programs, coaches } from '@/lib/data';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const containerRef = useGSAPScroll();

  useEffect(() => {
    // Listen for hard refresh keyboard shortcuts to clear the seen flag
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        sessionStorage.removeItem('isa-preloader-seen');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const hasSeenBefore = sessionStorage.getItem('isa-preloader-seen');
    const showPreloader = !hasSeenBefore;
    
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
        delay: showPreloader ? 1.2 : 0.5,
        ease: 'power2.out'
      });
    };

    if (!showPreloader) {
      setLoaded(true);
      animateTagline();
    } else {
      animateTagline();
      const timer = setTimeout(() => {
        setLoaded(true);
        sessionStorage.setItem('isa-preloader-seen', 'true');
      }, 3200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main ref={containerRef as any}>
      <Preloader loaded={loaded} />

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

          <div className="hero-cta reveal" style={{ opacity: 1, transition: 'none', display: 'flex', gap: '20px', marginTop: '48px' }}>
            <Link href="/join" className="btn-pill" data-cursor-hover>Start Training</Link>
            <a href="#featured-programs" className="btn-pill btn-pill--outline" data-cursor-hover>View Programs</a>
          </div>

          <div className="hero-marquee" style={{ opacity: 1, transition: 'opacity 1.5s ease 2s' }}>
            <div className="marquee-track">
              {[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4].map((num, idx) => (
                <div key={idx} className="marquee-item">
                  <img src={`/images/skater${num}.png`} alt={`Skater ${num}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-mouse">
              <div className="scroll-wheel" />
            </div>
            <span>Scroll to explore</span>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="rink-section section" id="intro" style={{ padding: '0' }}>
          <div className="rink-content full-width" style={{ padding: '120px 20px' }}>
            <p className="section-label reveal" style={{ marginBottom: '16px' }}>The Academy</p>
            <h2 className="section-heading reveal" style={{ fontSize: 'clamp(40px, 5vw, 72px)', marginBottom: '16px' }}>
              Master the Art of <span className="accent">Velocity</span>
            </h2>
            <p className="section-subheading reveal" style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '14px', 
              color: 'var(--blue)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em', 
              marginBottom: '32px',
              fontWeight: '600'
            }}>
              Redefining Excellence in Inline Sports
            </p>
            <p className="section-body reveal" style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
              We don&apos;t just teach skating; we engineer champions. Indian Skating Academy is the country&apos;s premier institution dedicated to the absolute mastery of inline sports. From the precise mechanics of speed skating to the flawless execution of artistic freestyle, we provide an elite training ecosystem designed to push you beyond your limits. Whether you are stepping onto the rink for the first time or aiming for international podiums, our world-class coaching staff is committed to your journey of speed, agility, and grace.
            </p>
            <div className="hero-cta reveal" style={{ opacity: 1, transition: 'none', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <Link href="/about" className="btn-pill" data-cursor-hover>
                <span>Discover Our Legacy</span>
                <span className="btn-pill-arrow">→</span>
              </Link>

              <Link href="/programs" className="btn-pill btn-pill--outline" data-cursor-hover>
                <span>Explore Disciplines</span>
                <span className="btn-pill-arrow">→</span>
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
            {programs.slice(0, 4).map((prog, i) => {
              const coach = coaches.find(c => c.name === prog.coach);
              return (
                <div 
                  key={prog.name} 
                  className="program-card reveal" 
                  onClick={() => setSelectedProgram(prog)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="program-icon">{prog.icon}</div>
                  <h3 className="program-name">{prog.name}</h3>
                  <div className="program-meta">
                    <span>{prog.ages}</span>
                    <div className="program-instructor">
                      {coach?.image && (
                        <img src={coach.image} alt={coach.name} className="coach-avatar-tiny" />
                      )}
                      <span>{prog.coach}</span>
                    </div>
                  </div>
                  <div className="program-action">Explore Discipline</div>
                </div>
              );
            })}
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

      <AnimatePresence>
        {selectedProgram && (
          <motion.div 
            className="program-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProgram(null)}
          >
            <motion.div 
              className="program-expanded-card"
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="card-close" onClick={() => setSelectedProgram(null)}>×</button>
              
              <div className="expanded-left">
                <img 
                  src={coaches.find(c => c.name === selectedProgram.coach)?.image} 
                  alt={selectedProgram.coach} 
                  className="expanded-coach-img"
                />
                <div className="coach-overlay-info">
                  <h4>{selectedProgram.coach}</h4>
                  <p>{coaches.find(c => c.name === selectedProgram.coach)?.role}</p>
                </div>
              </div>
              
              <div className="expanded-right">
                <div className="expanded-badge">{selectedProgram.ages}</div>
                <h2 className="expanded-title">{selectedProgram.name}</h2>
                <div className="expanded-divider" />
                
                <p className="expanded-bio">
                  {coaches.find(c => c.name === selectedProgram.coach)?.bio}
                </p>
                
                <div className="expanded-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Target Group</span>
                    <span className="meta-value">{selectedProgram.ages}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Certification</span>
                    <span className="meta-value">ISA Gold Level</span>
                  </div>
                </div>
                
                <Link href="/join" className="btn-pill" style={{ marginTop: '32px', width: '100%', justifyContent: 'center' }}>
                  Register for Batch
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { benefits, stats, testimonials } from '@/lib/data';
import AnimatedCounter from '@/components/AnimatedCounter';
import { AnimatePresence, motion } from 'framer-motion';

const importanceMap: Record<string, string> = {
  'Balance & Core': 'Skating requires constant micro-adjustments, which naturally builds stabilization muscles that are often neglected in other sports. This foundational strength improves posture and reduces injury risk in daily life.',
  'Heart Health': 'As a low-impact high-intensity aerobic exercise, skating provides the same cardiovascular benefits as running but with 50% less joint impact. It is the perfect long-term fitness solution for athletes of all ages.',
  'Agility & Reflexes': 'Navigating a rink at high speeds sharpens spatial awareness and neurological response times. These cognitive benefits translate directly to improved academic performance and professional focus.',
  'Mental Focus': 'The discipline required to master complex maneuvers builds grit and emotional resilience. Our athletes learn to view challenges as puzzles to be solved, fostering a growth mindset that lasts a lifetime.'
};

export default function About() {
  const containerRef = useGSAPScroll();
  const [selectedBenefit, setSelectedBenefit] = useState<any>(null);

  return (
    <main className="page-wrapper about-page" ref={containerRef as any}>
      {/* ABOUT / RINK */}
      <section className="rink-section section" id="about">
        <div className="rink-grid">
          <div className="rink-image-wrapper reveal">
            <img src="/images/skater5.png" alt="Indian Skating Academy Action" />
          </div>
          <div className="rink-content">
            <p className="section-label reveal">About ISA</p>
            <h2 className="section-heading reveal">
              India&apos;s Premier<br /><span className="accent">Inline Skating</span> Academy
            </h2>
            <p className="section-body reveal">
              Founded with a singular vision — to transform inline skating from a recreational activity
              into a competitive discipline of national pride. ISA trains athletes across speed, artistic,
              slalom, and aggressive skating with world-class coaching and infrastructure.
            </p>
            <p className="section-body reveal">
              From grassroots programs for children to elite competitive training, we build champions
              who represent India on the global stage.
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="values-section section" id="values">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <p className="section-label reveal">Our DNA</p>
            <h2 className="section-heading reveal">Core <span className="accent">Values</span></h2>
          </div>
          <div className="values-grid">
            <div className="value-card reveal" data-number="01">
              <span className="value-icon">💎</span>
              <h3 className="value-title">Excellence</h3>
              <p className="value-desc">We engineer champions through precision mechanics and elite training methodology, never settling for anything less than podium performance.</p>
            </div>
            <div className="value-card reveal" data-number="02">
              <span className="value-icon">🛡️</span>
              <h3 className="value-title">Integrity</h3>
              <p className="value-desc">Character is our foundation. We cultivate sportsmanship and fair play, building athletes who are role models on and off the rink.</p>
            </div>
            <div className="value-card reveal" data-number="03">
              <span className="value-icon">🤝</span>
              <h3 className="value-title">Community</h3>
              <p className="value-desc">ISA is a global family. We foster a culture of mutual respect and collective growth, supporting every skater’s unique journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section section" id="benefits">
        <div className="benefits-header">
          <p className="section-label reveal">Why Skate?</p>
          <h2 className="section-heading reveal">
            Beyond the <span className="accent">Rink</span>
          </h2>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit, i) => (
            <div 
              key={benefit.title} 
              className="benefit-card reveal"
              onClick={() => setSelectedBenefit(benefit)}
            >
              <span className="benefit-number">0{i + 1}</span>
              <div className="benefit-icon">{benefit.icon}</div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-desc">{benefit.desc}</p>
              <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--blue)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Learn More →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="achievements-section section" id="achievements">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p className="section-label reveal">Track Record</p>
          <h2 className="section-heading reveal">
            Built on <span className="accent">Excellence</span>
          </h2>
        </div>
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={stat.label} className="stat-item reveal">
              <div className="stat-number">
                <AnimatedCounter target={stat.number} suffix={stat.suffix} />
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedBenefit && (
          <motion.div 
            className="benefit-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBenefit(null)}
          >
            <motion.div 
              className="benefit-expanded-card"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="card-close" onClick={() => setSelectedBenefit(null)}>×</button>
              
              <span className="benefit-expanded-icon">{selectedBenefit.icon}</span>
              <h2 className="benefit-expanded-title">{selectedBenefit.title}</h2>
              <p className="benefit-expanded-desc">{selectedBenefit.desc}</p>
              
              <div className="benefit-importance">
                <h4>Why it matters</h4>
                <p>{importanceMap[selectedBenefit.title]}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* TESTIMONIALS */}
      <section className="testimonials-section section" id="testimonials">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <p className="section-label reveal">Success Stories</p>
            <h2 className="section-heading reveal">Hear From Our <span className="accent">Champions</span></h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={t.author} className="testimonial-card reveal">
                <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">&quot;{t.text}&quot;</p>
                <div className="testimonial-author">— {t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

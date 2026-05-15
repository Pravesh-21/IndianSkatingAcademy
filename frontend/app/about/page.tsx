'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { benefits, stats } from '@/lib/data';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function AboutPage() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      {/* ABOUT / RINK */}
      {/* ABOUT / RINK */}
      <section className="rink-section section" id="about">
        <div className="rink-grid">
          <div className="rink-image-wrapper reveal">
            <img src="/about-skater.png" alt="Indian Skating Academy Action" />
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
            <div key={benefit.title} className="benefit-card reveal">
              <span className="benefit-number">0{i + 1}</span>
              <div className="benefit-icon">{benefit.icon}</div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-desc">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="achievements-section section" id="achievements">
        <p className="section-label reveal">Track Record</p>
        <h2 className="section-heading reveal">
          Built on <span className="accent">Excellence</span>
        </h2>
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
    </main>
  );
}

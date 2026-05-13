'use client';

import { useEffect, useRef, useState } from 'react';

const programs = [
  { icon: '⚡', name: 'Speed Skating', ages: 'Ages 8–25', coach: 'Coach Arjun Mehta', days: 'Mon · Wed · Fri' },
  { icon: '🎭', name: 'Artistic Freestyle', ages: 'Ages 6–18', coach: 'Coach Priya Sharma', days: 'Tue · Thu · Sat' },
  { icon: '🔀', name: 'Slalom', ages: 'Ages 10–22', coach: 'Coach Vikram Singh', days: 'Mon · Wed · Sat' },
  { icon: '🔥', name: 'Aggressive / Stunt', ages: 'Ages 12–25', coach: 'Coach Ravi Kumar', days: 'Tue · Fri · Sun' },
];

const stats = [
  { number: 247, label: 'Athletes Trained' },
  { number: 63, label: 'National Medals' },
  { number: 12, label: 'State Champions' },
  { number: 8, label: 'Years of Excellence' },
];

const coaches = [
  { initials: 'AM', name: 'Arjun Mehta', role: 'Head Coach · Speed Skating', bio: 'Former national champion with 15 years of competitive experience. Trained 40+ state-level athletes.' },
  { initials: 'PS', name: 'Priya Sharma', role: 'Lead · Artistic Freestyle', bio: 'International medalist and choreographer. Specializes in artistic expression and technical precision.' },
  { initials: 'VS', name: 'Vikram Singh', role: 'Senior Coach · Slalom', bio: 'Asia-level slalom champion. Pioneer of modern slalom techniques in Indian competitive skating.' },
];

function useAnimateOnScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const children = el.querySelectorAll('.reveal');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
}

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const overshoot = progress < 0.85 ? 0 : Math.sin((progress - 0.85) * 20) * (1 - progress) * 3;
            const value = Math.round(target * eased + overshoot);
            setCount(value);
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(target);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function ScrollContent() {
  const aboutRef = useAnimateOnScroll();
  const programsRef = useAnimateOnScroll();
  const achievementsRef = useAnimateOnScroll();
  const coachesRef = useAnimateOnScroll();
  const ctaRef = useAnimateOnScroll();

  return (
    <>
      {/* NAVIGATION */}
      <nav className="nav">
        <a href="#hero" className="nav-logo">ISA</a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#programs">Programs</a>
          <a href="#join">Join</a>
        </div>
      </nav>

      {/* SCROLL INDICATOR */}
      <div className="scroll-indicator">
        <span className="scroll-indicator-text">Scroll</span>
        <div className="scroll-indicator-arrow" />
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <h1 className="hero-title">ISA</h1>
        <div className="hero-line" style={{ width: '120px', transition: 'width 1.5s ease 0.8s' }} />
        <p className="hero-tagline" style={{ opacity: 1, transition: 'opacity 1s ease 1.2s' }}>
          Speed is the language. The rink is the page.
        </p>
        <div className="hero-cta" style={{ opacity: 1, transition: 'opacity 1s ease 1.8s' }}>
          <button className="btn-pill" id="enter-rink">
            <span className="arrow">→</span> Enter the Rink
          </button>
        </div>
      </section>

      {/* SPACER for wheel + bearing flythrough */}
      <div className="section-spacer" aria-hidden="true" />

      {/* ABOUT / RINK */}
      <section className="rink-section" id="about" ref={aboutRef}>
        <div className="rink-content">
          <p className="section-label reveal" style={{ transitionDelay: '0.1s' }}>About ISA</p>
          <h2 className="section-heading reveal" style={{ transitionDelay: '0.2s' }}>
            India&apos;s Premier<br /><span className="accent">Inline Skating</span> Academy
          </h2>
          <p className="section-body reveal" style={{ transitionDelay: '0.35s' }}>
            Founded with a singular vision — to transform inline skating from a recreational activity
            into a competitive discipline of national pride. ISA trains athletes across speed, artistic,
            slalom, and aggressive skating with world-class coaching and infrastructure.
          </p>
          <p className="section-body reveal" style={{ transitionDelay: '0.45s' }}>
            From grassroots programs for children to elite competitive training, we build champions
            who represent India on the global stage.
          </p>
          <button className="btn-pill reveal" style={{ transitionDelay: '0.55s' }} id="learn-more">
            <span className="arrow">→</span> Learn More
          </button>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="programs-section" id="programs" ref={programsRef}>
        <div className="programs-header">
          <p className="section-label reveal">Disciplines</p>
          <h2 className="section-heading reveal" style={{ transitionDelay: '0.1s' }}>
            Choose Your <span className="accent">Path</span>
          </h2>
        </div>
        <div className="programs-grid">
          {programs.map((prog, i) => (
            <div
              key={prog.name}
              className="program-card reveal"
              style={{ transitionDelay: `${0.15 + i * 0.1}s` }}
              id={`program-${i}`}
            >
              <div className="program-icon">{prog.icon}</div>
              <h3 className="program-name">{prog.name}</h3>
              <div className="program-meta">
                <span>{prog.ages}</span>
                <span>{prog.coach}</span>
                <span>{prog.days}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="achievements-section" id="achievements" ref={achievementsRef}>
        <p className="section-label reveal">Track Record</p>
        <h2 className="section-heading reveal" style={{ transitionDelay: '0.1s' }}>
          Built on <span className="accent">Excellence</span>
        </h2>
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="stat-item reveal"
              style={{ transitionDelay: `${0.2 + i * 0.12}s` }}
            >
              <div className="stat-number">
                <AnimatedCounter target={stat.number} />
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COACHES */}
      <section className="coaches-section" id="coaches" ref={coachesRef}>
        <p className="section-label reveal">The Team</p>
        <h2 className="section-heading reveal" style={{ transitionDelay: '0.1s' }}>
          Meet the <span className="accent">Coaches</span>
        </h2>
        <div className="coaches-scroll">
          {coaches.map((coach, i) => (
            <div
              key={coach.name}
              className="coach-card reveal"
              style={{ transitionDelay: `${0.2 + i * 0.15}s` }}
              id={`coach-${i}`}
            >
              <div className="coach-image">
                <div className="coach-avatar">{coach.initials}</div>
              </div>
              <div className="coach-info">
                <h3 className="coach-name">{coach.name}</h3>
                <p className="coach-role">{coach.role}</p>
                <p className="coach-bio">{coach.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="join" ref={ctaRef}>
        <h2 className="cta-title reveal">Join the Rink</h2>
        <p className="cta-subtitle reveal" style={{ transitionDelay: '0.15s' }}>
          Begin your journey. Lace up and roll with India&apos;s best.
        </p>
        <form className="cta-form reveal" style={{ transitionDelay: '0.3s' }} onSubmit={(e) => e.preventDefault()}>
          <input className="form-input" type="text" placeholder="Your Name" id="form-name" required />
          <input className="form-input" type="number" placeholder="Age" id="form-age" required />
          <input className="form-input full-width" type="tel" placeholder="Phone Number" id="form-phone" required />
          <select className="form-select full-width" id="form-interest" defaultValue="">
            <option value="" disabled>Select Discipline</option>
            <option value="speed">Speed Skating</option>
            <option value="artistic">Artistic Freestyle</option>
            <option value="slalom">Slalom</option>
            <option value="aggressive">Aggressive / Stunt</option>
          </select>
          <button type="submit" className="btn-submit" id="submit-form">
            → Lace Up
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="footer">
        <div className="footer-logo">ISA</div>
        <div className="footer-wheel" />
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#programs">Programs</a>
          <a href="#coaches">Coaches</a>
          <a href="#join">Join</a>
        </div>
        <p className="footer-copy">© 2024 Inline Skating Academy. All rights reserved.</p>
      </footer>
    </>
  );
}

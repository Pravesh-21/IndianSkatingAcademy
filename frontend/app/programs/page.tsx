'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { programs, coaches } from '@/lib/data';

export default function ProgramsPage() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      {/* PROGRAMS */}
      <section className="programs-section section" id="programs">
        <div className="programs-header">
          <p className="section-label reveal">Disciplines</p>
          <h2 className="section-heading reveal">
            Choose Your <span className="accent">Path</span>
          </h2>
        </div>
        <div className="programs-grid">
          {programs.map((prog, i) => (
            <div key={prog.name} className="program-card reveal">
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

      {/* COACHES */}
      <section className="coaches-section section" id="coaches">
        <p className="section-label reveal">The Team</p>
        <h2 className="section-heading reveal">
          Meet the <span className="accent">Coaches</span>
        </h2>
        <div className="coaches-scroll">
          {coaches.map((coach, i) => (
            <div key={coach.name} className="coach-card reveal">
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
    </main>
  );
}

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
          {programs.map((prog, i) => {
            const coach = coaches.find(c => c.name === prog.coach);
            return (
              <div key={prog.name} className="program-card reveal">
                <div className="program-icon">{prog.icon}</div>
                <h3 className="program-name">{prog.name}</h3>
                <div className="program-meta">
                  <span>{prog.ages}</span>
                  <div className="coach-preview" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    {coach?.image && (
                      <div className="coach-thumb" style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--blue-glow)' }}>
                        <img src={coach.image} alt={coach.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <span style={{ margin: 0 }}>{prog.coach}</span>
                  </div>
                  <span>{prog.days}</span>
                </div>
                <div className="program-action">View Schedule</div>
              </div>
            );
          })}
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
                {coach.image ? (
                  <img src={coach.image} alt={coach.name} className="coach-portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="coach-avatar">{coach.initials}</div>
                )}
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

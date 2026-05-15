'use client';

import { useState } from 'react';
import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { programs, coaches } from '@/lib/data';
import { AnimatePresence, motion } from 'framer-motion';

export default function Programs() {
  const containerRef = useGSAPScroll();
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

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
              <div 
                key={prog.name} 
                className="program-card reveal" 
                onClick={() => setSelectedProgram({ ...prog, coach })}
                data-cursor-hover
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
                  src={selectedProgram.coach?.image} 
                  alt={selectedProgram.coach?.name} 
                  className="expanded-coach-img"
                />
                <div className="coach-overlay-info">
                  <h4>{selectedProgram.coach?.name}</h4>
                  <p>{selectedProgram.coach?.role}</p>
                </div>
              </div>
              
              <div className="expanded-right">
                <div className="expanded-badge">{selectedProgram.ages}</div>
                <h2 className="expanded-title">{selectedProgram.name}</h2>
                <div className="expanded-divider" />
                
                <p className="expanded-bio">
                  {selectedProgram.coach?.bio}
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
                
                <button className="btn-pill" style={{ marginTop: '32px', width: '100%', justifyContent: 'center' }}>
                  Register for Batch <span className="arrow">→</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

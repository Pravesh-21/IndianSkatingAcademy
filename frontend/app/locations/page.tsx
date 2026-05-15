'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { locations } from '@/lib/data';

export default function Locations() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      {/* LOCATIONS */}
      <section className="locations-section section" id="locations">
        <div className="locations-header">
          <p className="section-label reveal">Where We Skate</p>
          <h2 className="section-heading reveal">
            World-Class <span className="accent">Facilities</span>
          </h2>
        </div>
        <div className="locations-grid">
          {locations.map((loc, i) => (
            <div key={loc.name} className="location-card reveal">
              <span className="location-type">{loc.type}</span>
              <h3 className="location-name">{loc.name}</h3>
              <p className="location-desc">{loc.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

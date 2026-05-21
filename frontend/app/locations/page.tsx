'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { locations } from '@/lib/data';

export default function LocationsPage() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      {/* Page Hero */}
      <section className="page-hero">
        <p className="section-label reveal">Where We Skate</p>
        <h2 className="section-heading reveal">
          World-Class <span className="accent">Facilities</span>
        </h2>
        <p className="page-hero-subtitle reveal">
          Train at premium venues designed for every skill level and discipline.
        </p>
      </section>

      {/* Locations Grid */}
      <section className="section" id="locations" style={{ paddingTop: 0 }}>
        <div className="locations-grid">
          {locations.map((loc) => (
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

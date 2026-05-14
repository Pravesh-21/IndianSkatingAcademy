'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { locations, testimonials } from '@/lib/data';

export default function LocationsPage() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      {/* LOCATIONS */}
      <section className="locations-section section" id="locations">
        <p className="section-label reveal">Where We Skate</p>
        <h2 className="section-heading reveal">
          World-Class <span className="accent">Facilities</span>
        </h2>
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

      {/* TESTIMONIALS */}
      <section className="testimonials-section section" id="testimonials">
        <p className="section-label reveal">Community</p>
        <h2 className="section-heading reveal">
          Hear From Our <span className="accent">Champions</span>
        </h2>
        <div className="testimonials-grid">
          {testimonials.map((test, i) => (
            <div key={test.author} className="testimonial-card reveal">
              <div className="stars">{'★'.repeat(test.rating)}</div>
              <p className="testimonial-text">&quot;{test.text}&quot;</p>
              <p className="testimonial-author">— {test.author}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

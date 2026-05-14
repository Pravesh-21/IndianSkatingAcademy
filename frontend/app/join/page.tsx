'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';

export default function JoinPage() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      {/* CTA */}
      <section className="cta-section section" id="join">
        <h2 className="cta-title reveal">Join the Rink</h2>
        <p className="cta-subtitle reveal">
          Begin your journey. Lace up and roll with India&apos;s best.
        </p>
        <form className="cta-form reveal" onSubmit={(e) => e.preventDefault()}>
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
    </main>
  );
}

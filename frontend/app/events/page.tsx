'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';

export default function Events() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      <section className="section" id="events">
        <p className="section-label reveal">What&apos;s Happening</p>
        <h2 className="section-heading reveal">
          Upcoming <span className="accent">Events</span>
        </h2>
        <div className="reveal" style={{ marginTop: '40px', color: 'var(--chrome)', fontSize: '18px' }}>
          Stay tuned for upcoming races, workshops, and academy events.
        </div>
      </section>
    </main>
  );
}

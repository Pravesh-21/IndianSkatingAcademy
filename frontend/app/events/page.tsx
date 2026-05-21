'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import { events } from '@/lib/data';

export default function EventsPage() {
  const containerRef = useGSAPScroll();

  const upcoming = events.filter(e => e.status === 'upcoming');
  const past = events.filter(e => e.status === 'past');

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      {/* Page Hero */}
      <section className="page-hero">
        <p className="section-label reveal">What&apos;s Happening</p>
        <h2 className="section-heading reveal">
          Upcoming <span className="accent">Events</span>
        </h2>
        <p className="page-hero-subtitle reveal">
          Races, workshops, and academy events — stay in the loop.
        </p>
      </section>

      {/* Upcoming Events */}
      <section className="section" id="upcoming-events" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p className="section-label reveal">Coming Up</p>
            <h2 className="section-heading reveal">
              Don&apos;t <span className="accent">Miss Out</span>
            </h2>
          </div>
          <div className="events-grid">
            {upcoming.map((event) => (
              <div key={event.title} className="event-card reveal">
                <div className="event-badge event-badge--upcoming">
                  <span className="event-badge-dot" />
                  Upcoming
                </div>
                <span className="event-date">{event.date}</span>
                <h3 className="event-title">{event.title}</h3>
                <p className="event-desc">{event.desc}</p>
                <span className="event-location">{event.location}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="section" id="past-events" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p className="section-label reveal">Archive</p>
            <h2 className="section-heading reveal">
              Past <span className="accent">Events</span>
            </h2>
          </div>
          <div className="events-grid">
            {past.map((event) => (
              <div key={event.title} className="event-card reveal">
                <div className="event-badge event-badge--past">
                  Completed
                </div>
                <span className="event-date">{event.date}</span>
                <h3 className="event-title">{event.title}</h3>
                <p className="event-desc">{event.desc}</p>
                <span className="event-location">{event.location}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

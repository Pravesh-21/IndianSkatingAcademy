'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';

export default function GalleryPage() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      <section className="section" id="gallery">
        <p className="section-label reveal">Our Moments</p>
        <h2 className="section-heading reveal">
          Academy <span className="accent">Gallery</span>
        </h2>
        <div className="reveal" style={{ marginTop: '40px', color: 'var(--chrome)', fontSize: '18px' }}>
          Capturing the spirit of skating. Photos and videos coming soon.
        </div>
      </section>
    </main>
  );
}

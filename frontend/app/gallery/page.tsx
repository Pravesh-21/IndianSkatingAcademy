'use client';

import { useGSAPScroll } from '@/hooks/useGSAPScroll';
import CircularGallery from '@/components/CircularGallery';

export default function GalleryPage() {
  const containerRef = useGSAPScroll();

  return (
    <main className="page-wrapper" ref={containerRef as any}>
      <section className="section" id="gallery" style={{ paddingBottom: 0, paddingTop: '0px', textAlign: 'center', marginTop: '-50px' }}>
        <p className="section-label reveal">Our Moments</p>
        <h2 className="section-heading reveal">
          Academy <span className="accent">Gallery</span>
        </h2>
        <p className="reveal" style={{ color: 'var(--chrome)', marginTop: '10px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Explore the energy and discipline at Indian Skating Academy. Scroll or drag to navigate through our 3D moments.
        </p>
      </section>

      <section className="reveal" style={{ height: '85vh', position: 'relative', marginTop: '-20px' }}>
        <CircularGallery 
          bend={1}
          textColor="#00C2FF" 
          borderRadius={0.05} 
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </section>

      <section className="reveal" style={{ height: '85vh', position: 'relative', marginTop: '40px' }}>
        <CircularGallery 
          bend={-1}
          textColor="#00C2FF" 
          borderRadius={0.05} 
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </section>

      <section className="reveal" style={{ height: '85vh', position: 'relative', marginTop: '40px' }}>
        <CircularGallery 
          bend={2}
          textColor="#00C2FF" 
          borderRadius={0.05} 
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </section>

      <section className="reveal" style={{ height: '85vh', position: 'relative', marginTop: '40px' }}>
        <CircularGallery 
          bend={-2}
          textColor="#00C2FF" 
          borderRadius={0.05} 
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </section>
      
    </main>
  );
}

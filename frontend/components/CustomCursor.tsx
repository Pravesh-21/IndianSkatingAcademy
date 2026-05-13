'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<SVGSVGElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  let wheelRotation = useRef(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    const wheel = wheelRef.current;
    if (!cursor || !wheel) return;

    const onMouseMove = (e: MouseEvent) => {
      velocity.current.x = e.clientX - target.current.x;
      velocity.current.y = e.clientY - target.current.y;
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('a, button, .program-card, .coach-card, .btn-pill, .btn-submit, .sound-toggle')) {
        setIsHovering(true);
        cursor.classList.add('hovering');
      }
    };

    const onMouseOut = () => {
      setIsHovering(false);
      cursor.classList.remove('hovering');
    };

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;

      // Calculate tilt based on velocity
      const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
      const tiltX = (velocity.current.y / 10) * Math.min(speed / 5, 1);
      const tiltY = -(velocity.current.x / 10) * Math.min(speed / 5, 1);

      // Rotate wheel based on velocity
      wheelRotation.current += speed * 0.5;

      cursor.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px)`;
      wheel.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${wheelRotation.current}deg)`;

      // Dampen velocity
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <div className="custom-cursor" ref={cursorRef}>
      <svg
        ref={wheelRef}
        width="40"
        height="40"
        viewBox="0 0 40 40"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: isHovering ? 'drop-shadow(0 0 12px #00C2FF)' : 'drop-shadow(0 0 6px rgba(0, 194, 255, 0.5))',
          transition: 'filter 0.3s ease',
        }}
      >
        {/* Outer wheel rim */}
        <circle cx="20" cy="20" r="18" fill="none" stroke="#00C2FF" strokeWidth="2" opacity="0.8" />
        
        {/* Wheel spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x1 = 20 + Math.cos(angle) * 8;
          const y1 = 20 + Math.sin(angle) * 8;
          const x2 = 20 + Math.cos(angle) * 16;
          const y2 = 20 + Math.sin(angle) * 16;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#00C2FF"
              strokeWidth="1.5"
              opacity="0.6"
            />
          );
        })}

        {/* Inner bearing circle */}
        <circle cx="20" cy="20" r="6" fill="none" stroke="#00C2FF" strokeWidth="1.5" opacity="0.9" />
        <circle cx="20" cy="20" r="3" fill="#00C2FF" opacity="0.7" />

        {/* Glow effect */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="#00C2FF"
          strokeWidth="1"
          opacity="0.2"
          style={{
            animation: 'wheelPulse 2s ease-in-out infinite',
          }}
        />
      </svg>

      <style>{`
        @keyframes wheelPulse {
          0%, 100% { r: 18px; opacity: 0.2; }
          50% { r: 20px; opacity: 0.05; }
        }
      `}</style>
    </div>
  );
}

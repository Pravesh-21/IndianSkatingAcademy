'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;   // 0→1, decremented each frame
  maxLife: number;
  size: number;
  hue: number;    // per-particle hue offset for colour variety
}

type CursorMode = 'default' | 'hover' | 'text' | 'drag';

// ─── Constants ────────────────────────────────────────────────────────────────
const SPRING        = 0.16;
const DAMPING       = 0.72;
const MAX_PARTICLES = 100;
const BASE_HUE      = 194;   // cyan-ish (#00C2FF ≈ hsl(194,100%,50%))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hslParticle(hue: number, alpha: number) {
  return `hsla(${hue}, 100%, 60%, ${alpha})`;
}

function detectMode(el: Element | null): CursorMode {
  if (!el) return 'default';
  const t = el as HTMLElement;
  if (t.closest('input[type="text"], input[type="email"], input[type="search"], textarea, [contenteditable]'))
    return 'text';
  if (t.closest('a, button, .program-card, .coach-card, .btn-pill, .btn-submit, .sound-toggle, [role="button"], label'))
    return 'hover';
  return 'default';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomCursor() {
  // DOM refs
  const cursorRef  = useRef<HTMLDivElement>(null);
  const ringRef    = useRef<HTMLDivElement>(null);
  const ring2Ref   = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  // Motion state (plain refs – no re-render needed)
  const dotPos       = useRef({ x: -200, y: -200 });
  const ringPos      = useRef({ x: -200, y: -200 });
  const ringVel      = useRef({ x: 0, y: 0 });
  const mouseVel     = useRef({ x: 0, y: 0 });
  const lastMouse    = useRef({ x: -200, y: -200 });
  const particles    = useRef<Particle[]>([]);
  const particleId   = useRef(0);
  const rafRef       = useRef<number>(0);
  const rot1         = useRef(0);   // outer ring rotation
  const rot2         = useRef(0);   // inner ring counter-rotation
  const idleTime     = useRef(0);   // frames since last movement
  const magnetTarget = useRef<{ x: number; y: number } | null>(null);
  const modeRef      = useRef<CursorMode>('default');

  // React state – only for things that affect JSX
  const [mode, setMode] = useState<CursorMode>('default');
  const [visible, setVisible] = useState(false);

  // ── Click burst ─────────────────────────────────────────────────────────────
  function spawnBurst(x: number, y: number) {
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const mag   = 2 + Math.random() * 4;
      particles.current.push({
        id: particleId.current++,
        x, y,
        vx: Math.cos(angle) * mag,
        vy: Math.sin(angle) * mag,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        size: 1.5 + Math.random() * 3,
        hue: BASE_HUE + (Math.random() - 0.5) * 40,
      });
    }
  }

  // ── Magnetic pull toward nearest interactive element ────────────────────────
  function updateMagnet(mx: number, my: number): { x: number; y: number } | null {
    const RADIUS = 60;
    let best: { x: number; y: number } | null = null;
    let bestDist = RADIUS;

    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      const r   = (el as HTMLElement).getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const d   = Math.hypot(mx - cx, my - cy);
      if (d < bestDist) { bestDist = d; best = { x: cx, y: cy }; }
    });

    return best;
  }

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    const ring2  = ring2Ref.current;
    const canvas = canvasRef.current;
    if (!cursor || !ring || !ring2 || !canvas) return;

    const ctx = canvas.getContext('2d')!;

    // Canvas sizing
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // ── Mouse move ────────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const { clientX: mx, clientY: my } = e;
      mouseVel.current.x = mx - lastMouse.current.x;
      mouseVel.current.y = my - lastMouse.current.y;
      lastMouse.current  = { x: mx, y: my };
      idleTime.current   = 0;

      // Magnet
      const mag = updateMagnet(mx, my);
      magnetTarget.current = mag;

      // Pull dot toward magnet, else follow exactly
      dotPos.current = mag
        ? { x: mx + (mag.x - mx) * 0.25, y: my + (mag.y - my) * 0.25 }
        : { x: mx, y: my };

      // Spawn trail particles
      const speed = Math.hypot(mouseVel.current.x, mouseVel.current.y);
      if (speed > 2.5) {
        const count = Math.min(Math.floor(speed / 6) + 1, 5);
        for (let i = 0; i < count; i++) {
          const angle = Math.atan2(mouseVel.current.y, mouseVel.current.x)
                        + (Math.random() - 0.5) * 1.4;
          const m = Math.random() * speed * 0.22;
          particles.current.push({
            id: particleId.current++,
            x: mx + (Math.random() - 0.5) * 8,
            y: my + (Math.random() - 0.5) * 8,
            vx: -Math.cos(angle) * m * 0.55 + (Math.random() - 0.5),
            vy: -Math.sin(angle) * m * 0.55 + (Math.random() - 0.5),
            life: 1,
            maxLife: 0.5 + Math.random() * 0.5,
            size: 1 + Math.random() * 2.5,
            hue: BASE_HUE + (Math.random() - 0.5) * 50,
          });
        }
        if (particles.current.length > MAX_PARTICLES)
          particles.current = particles.current.slice(-MAX_PARTICLES);
      }
    };

    // ── Mode detection ────────────────────────────────────────────────────────
    const onMouseOver = (e: MouseEvent) => {
      const m = detectMode(e.target as Element);
      if (m !== modeRef.current) { modeRef.current = m; setMode(m); }
    };
    const onMouseOut = (e: MouseEvent) => {
      // Only reset if leaving the element type entirely
      const m = detectMode((e.relatedTarget as Element) ?? null);
      if (m !== modeRef.current) { modeRef.current = m; setMode(m); }
    };

    // ── Click burst ───────────────────────────────────────────────────────────
    const onClick = (e: MouseEvent) => spawnBurst(e.clientX, e.clientY);

    // ── Visibility ────────────────────────────────────────────────────────────
    const onEnter = () => setVisible(true);
    const onLeave = () => {
      setVisible(false);
      dotPos.current = { x: -200, y: -200 };
    };

    // ── Animation loop ────────────────────────────────────────────────────────
    const animate = () => {
      idleTime.current++;

      // Spring physics for outer ring
      const dx = dotPos.current.x - ringPos.current.x;
      const dy = dotPos.current.y - ringPos.current.y;
      ringVel.current.x = (ringVel.current.x + dx * SPRING) * DAMPING;
      ringVel.current.y = (ringVel.current.y + dy * SPRING) * DAMPING;
      ringPos.current.x += ringVel.current.x;
      ringPos.current.y += ringVel.current.y;

      // Velocity-derived values
      const speed  = Math.hypot(ringVel.current.x, ringVel.current.y);
      const vAngle = Math.atan2(ringVel.current.y, ringVel.current.x) * (180 / Math.PI);

      // Rotation: outer clockwise, inner counter
      rot1.current +=  speed * 2.8;
      rot2.current -=  speed * 1.8;

      // Idle pulse scale (breathe when still)
      const idlePulse = idleTime.current > 60
        ? 1 + Math.sin(idleTime.current * 0.04) * 0.07
        : 1;

      // Squish/stretch: elongate along motion axis
      const stretch = Math.min(1 + speed * 0.025, 1.35);
      const squish  = 1 / stretch;

      // ── Position inner dot
      cursor.style.transform = `translate(${dotPos.current.x}px,${dotPos.current.y}px)`;

      // ── Position outer ring (squish-stretch + idle pulse)
      ring.style.transform =
        `translate(${ringPos.current.x}px,${ringPos.current.y}px)` +
        ` rotate(${vAngle}deg)` +
        ` scale(${stretch * idlePulse},${squish * idlePulse})` +
        ` rotate(${rot1.current}deg)`;

      // ── Position inner counter-ring
      ring2.style.transform =
        `translate(${ringPos.current.x}px,${ringPos.current.y}px)` +
        ` rotate(${rot2.current}deg)` +
        ` scale(${idlePulse})`;

      // ── Canvas: particle trail ─────────────────────────────────────────────
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life > 0);

      for (const p of particles.current) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.life -= 0.032 / p.maxLife;

        const alpha = Math.max(0, p.life);
        const sz    = p.size * alpha;

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = hslParticle(p.hue, alpha * 0.9);
        ctx.fill();

        // Soft glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 3.5);
        grd.addColorStop(0, hslParticle(p.hue, alpha * 0.35));
        grd.addColorStop(1, hslParticle(p.hue, 0));
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('click',      onClick);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout',  onMouseOut);
    document.documentElement.addEventListener('mouseenter', onEnter);
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('click',      onClick);
      window.removeEventListener('resize',     resize);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout',  onMouseOut);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Derived visual config ──────────────────────────────────────────────────
  const isHover = mode === 'hover';
  const isText  = mode === 'text';

  const dotSize = isHover ? 0 : isText ? 2 : 6;
  const ringSize1 = isHover ? 60 : 40;
  const ringSize2 = isHover ? 34 : 22;

  return (
    <>
      {/* ── Particle trail canvas ───────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998,
                 opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}
      />

      {/* ── Inner precision dot ─────────────────────────────────────────── */}
      <div ref={cursorRef} style={{
        position: 'fixed', top: 0, left: 0, width: 0, height: 0,
        pointerEvents: 'none', zIndex: 10001, willChange: 'transform',
        opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
      }}>
        {/* Text mode: thin blinking caret */}
        {isText ? (
          <div style={{
            position: 'absolute',
            width: 2,
            height: 18,
            borderRadius: 1,
            backgroundColor: '#00C2FF',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px 2px rgba(0,194,255,0.9)',
            animation: 'caretBlink 1s step-end infinite',
          }}/>
        ) : (
          <div style={{
            position: 'absolute',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: isHover ? 'transparent' : '#00C2FF',
            border: isHover ? '2px solid #00C2FF' : 'none',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), background-color 0.2s',
            boxShadow: isHover
              ? '0 0 24px 6px rgba(0,194,255,0.55)'
              : '0 0 10px 3px rgba(0,194,255,0.85)',
          }}/>
        )}
      </div>

      {/* ── Outer lagged ring (squishes & rotates) ───────────────────────── */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, width: 0, height: 0,
        pointerEvents: 'none', zIndex: 10000, willChange: 'transform',
        opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
      }}>
        <svg
          width={ringSize1} height={ringSize1}
          viewBox="0 0 60 60"
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            filter: isHover
              ? 'drop-shadow(0 0 18px rgba(0,194,255,0.95))'
              : 'drop-shadow(0 0 6px rgba(0,194,255,0.5))',
          }}
        >
          {/* Outer rim */}
          <circle cx="30" cy="30" r="28" fill="none" stroke="#00C2FF"
            strokeWidth={isHover ? 2 : 1.2}
            opacity={isHover ? 1 : 0.65}
            strokeDasharray={isHover ? '5 3' : '8 4'}
          />

          {/* 16 spokes — finer detail */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const inner = isHover ? 12 : 9;
            const outer = isHover ? 24 : 21;
            return (
              <line key={i}
                x1={30 + Math.cos(angle) * inner} y1={30 + Math.sin(angle) * inner}
                x2={30 + Math.cos(angle) * outer} y2={30 + Math.sin(angle) * outer}
                stroke="#00C2FF"
                strokeWidth={i % 4 === 0 ? 1.6 : 0.7}
                opacity={i % 4 === 0 ? 0.95 : 0.35}
              />
            );
          })}

          {/* Diagonal crosshair ticks on rim */}
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line key={`tick-${i}`}
                x1={30 + Math.cos(rad) * 26} y1={30 + Math.sin(rad) * 26}
                x2={30 + Math.cos(rad) * 29} y2={30 + Math.sin(rad) * 29}
                stroke="#00C2FF" strokeWidth="2.5" opacity="0.95"
              />
            );
          })}

          {/* Ripple ring (animated) */}
          <circle cx="30" cy="30" r="28" fill="none"
            stroke="#00C2FF" strokeWidth="1.5" opacity="0"
            style={{ animation: 'ripple 2.2s ease-out infinite' }}
          />
        </svg>
      </div>

      {/* ── Inner counter-rotating ring ──────────────────────────────────── */}
      <div ref={ring2Ref} style={{
        position: 'fixed', top: 0, left: 0, width: 0, height: 0,
        pointerEvents: 'none', zIndex: 9999, willChange: 'transform',
        opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
      }}>
        <svg
          width={ringSize2} height={ringSize2}
          viewBox="0 0 34 34"
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            filter: 'drop-shadow(0 0 4px rgba(0,194,255,0.4))',
          }}
        >
          {/* Dashed inner ring */}
          <circle cx="17" cy="17" r="14" fill="none"
            stroke="#00C2FF" strokeWidth="1"
            strokeDasharray="3 5"
            opacity={isHover ? 0.9 : 0.45}
          />

          {/* Bearing hub */}
          <circle cx="17" cy="17" r={isHover ? 6 : 4.5}
            fill="none" stroke="#00C2FF" strokeWidth="1.2" opacity="0.8"
          />
          <circle cx="17" cy="17" r={isHover ? 3 : 2}
            fill="#00C2FF" opacity={isHover ? 1 : 0.65}
          />

          {/* 4 micro spokes */}
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line key={`s2-${i}`}
                x1={17 + Math.cos(rad) * (isHover ? 7 : 5.5)}
                y1={17 + Math.sin(rad) * (isHover ? 7 : 5.5)}
                x2={17 + Math.cos(rad) * 12}
                y2={17 + Math.sin(rad) * 12}
                stroke="#00C2FF" strokeWidth="0.8" opacity="0.55"
              />
            );
          })}
        </svg>
      </div>

      <style>{`
        * { cursor: none !important; }

        @keyframes ripple {
          0%   { r: 28px; opacity: 0.55; stroke-width: 2px; }
          100% { r: 44px; opacity: 0;   stroke-width: 0px; }
        }

        @keyframes caretBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </>
  );
}
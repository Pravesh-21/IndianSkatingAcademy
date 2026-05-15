'use client';

import { useEffect, useRef } from 'react';

interface PreloaderProps {
  loaded: boolean;
}

export default function Preloader({ loaded }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const counterRef   = useRef<HTMLSpanElement>(null);
  const barFillRef   = useRef<HTMLDivElement>(null);
  const hasAnimated  = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    const W      = canvas.width  = window.innerWidth;
    const H      = canvas.height = window.innerHeight;

    // ── Palette ──────────────────────────────────────────────────────────────
    const CYAN      = '#00C2FF';
    const BG        = '#020810';

    // ── Geometry ─────────────────────────────────────────────────────────────
    const WHEEL_R   = Math.min(52, W * 0.075);
    const SPOKE_N   = 8;
    const BEARING_R = WHEEL_R * 0.16;

    // Ground line — the wheel rolls ON TOP of this line
    const GROUND_Y  = H * 0.54;
    // Wheel center sits exactly on the ground
    const WHEEL_CY  = GROUND_Y;

    // ISA rendered big on an offscreen canvas; wheel reveals it by rolling over
    const FONT_SIZE = Math.min(H * 0.20, W * 0.20, 180);

    // ── Offscreen: stamp canvas (the "ink" that gets revealed) ───────────────
    // We pre-render "ISA" onto a dedicated canvas, then use it as a texture
    // that gets revealed left-to-right as the wheel passes over.
    const stampCanvas = document.createElement('canvas');
    stampCanvas.width  = W;
    stampCanvas.height = H;
    const sCtx = stampCanvas.getContext('2d')!;

    // Where the ISA text will be centered vertically around the ground line
    const TEXT_Y = GROUND_Y;

    // Measure and place "ISA" centered horizontally
    sCtx.font      = `900 ${FONT_SIZE}px 'Orbitron', sans-serif`;
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';

    // Draw ISA on stamp canvas — thick, glowing
    // Shadow layers for the ink-on-surface feel
    sCtx.shadowColor = CYAN;
    sCtx.shadowBlur  = 28;
    sCtx.fillStyle   = CYAN;
    sCtx.fillText('ISA', W / 2, TEXT_Y);

    sCtx.shadowBlur  = 8;
    sCtx.fillStyle   = '#ffffff';
    sCtx.fillText('ISA', W / 2, TEXT_Y);

    // ── Measure where the ISA text actually starts and ends ───────────────────
    ctx.font = `900 ${FONT_SIZE}px 'Orbitron', sans-serif`;
    const metrics    = ctx.measureText('ISA');
    const textLeft   = W / 2 - metrics.width / 2;
    const textRight  = W / 2 + metrics.width / 2;

    // Wheel starts before the text and ends after
    const START_X    = textLeft - WHEEL_R * 3;
    const END_X      = textRight + WHEEL_R * 3;
    const TOTAL_DIST = END_X - START_X;

    // ── Travel timing ─────────────────────────────────────────────────────────
    const TOTAL_MS     = 4800;
    const PHASE_INTRO  = 0.08;   // wheel appears, then starts rolling
    const PHASE_ROLL   = 0.80;   // rolling across ISA
    const PHASE_SETTLE = 1.00;   // coasts to stop

    // ── Easing ───────────────────────────────────────────────────────────────
    const easeInOut = (t: number) => t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOut3  = (t: number) => 1 - Math.pow(1 - t, 3);
    const clamp     = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
    const remap     = (v: number, a: number, b: number, c: number, d: number) =>
      c + (d - c) * clamp((v - a) / (b - a), 0, 1);

    // ── Stars (static) ────────────────────────────────────────────────────────
    const STARS = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (GROUND_Y - WHEEL_R * 3.5),
      r: Math.random() * 1.0 + 0.15,
      a: Math.random() * 0.35 + 0.06,
    }));

    // ── Dust particles ────────────────────────────────────────────────────────
    interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; }
    const particles: Particle[] = [];

    const spawnDust = (wx: number) => {
      if (Math.random() > 0.45) return;
      particles.push({
        x: wx + (Math.random() - 0.5) * WHEEL_R * 0.6,
        y: GROUND_Y + WHEEL_R,
        vx: -(Math.random() * 0.8 + 0.1),
        vy: -(Math.random() * 0.9 + 0.1),
        life: 1, max: 40 + Math.random() * 30,
        r: Math.random() * 2 + 0.3,
      });
    };

    const tickParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy *= 0.94;
        p.life -= 1 / p.max;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,194,255,${p.life * 0.4})`;
        ctx.fill();
      }
    };

    // ── Draw wheel ────────────────────────────────────────────────────────────
    const drawWheel = (cx: number, cy: number, rot: number, alpha: number, glow: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);

      // Halo
      if (glow > 0) {
        const g = ctx.createRadialGradient(0, 0, WHEEL_R * 0.4, 0, 0, WHEEL_R * 2.2);
        g.addColorStop(0,   `rgba(0,194,255,${0.18 * glow})`);
        g.addColorStop(1,   'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, WHEEL_R * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tread segments (rotate with wheel)
      ctx.save();
      ctx.rotate(rot);
      for (let i = 0; i < 14; i++) {
        ctx.save();
        ctx.rotate((i / 14) * Math.PI * 2);
        ctx.strokeStyle = `rgba(0,194,255,${0.28 + glow * 0.12})`;
        ctx.lineWidth   = 5;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, WHEEL_R - 3, -Math.PI / 18, Math.PI / 18);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // Outer rim
      ctx.shadowColor = CYAN;
      ctx.shadowBlur  = 8 + 16 * glow;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth   = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, WHEEL_R, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = `rgba(0,194,255,0.35)`;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(0, 0, WHEEL_R * 0.54, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes
      ctx.save();
      ctx.rotate(rot);
      for (let i = 0; i < SPOKE_N; i++) {
        const a = (i / SPOKE_N) * Math.PI * 2;
        ctx.shadowColor = CYAN;
        ctx.shadowBlur  = 3 + 7 * glow;
        ctx.strokeStyle = `rgba(0,194,255,${0.6 + 0.3 * glow})`;
        ctx.lineWidth   = 1.3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * BEARING_R * 1.4, Math.sin(a) * BEARING_R * 1.4);
        ctx.lineTo(Math.cos(a) * WHEEL_R * 0.51,  Math.sin(a) * WHEEL_R * 0.51);
        ctx.stroke();
      }
      ctx.restore();

      // Bearing
      ctx.shadowColor = CYAN;
      ctx.shadowBlur  = 14 + 10 * glow;
      ctx.fillStyle   = CYAN;
      ctx.beginPath();
      ctx.arc(0, 0, BEARING_R, 0, Math.PI * 2);
      ctx.fill();

      // Void
      ctx.shadowBlur = 0;
      ctx.fillStyle  = BG;
      ctx.beginPath();
      ctx.arc(0, 0, BEARING_R * 0.42, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // ── Draw ground surface ───────────────────────────────────────────────────
    const drawSurface = (revealUpTo: number) => {
      // Full ground line (faint)
      ctx.strokeStyle = 'rgba(0,194,255,0.08)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + WHEEL_R);
      ctx.lineTo(W, GROUND_Y + WHEEL_R);
      ctx.stroke();

      // Revealed trail (left of wheel) — brighter
      if (revealUpTo > 0) {
        const g = ctx.createLinearGradient(0, 0, revealUpTo, 0);
        g.addColorStop(0,   'rgba(0,194,255,0.04)');
        g.addColorStop(0.7, 'rgba(0,194,255,0.18)');
        g.addColorStop(1,   'rgba(0,194,255,0.55)');
        ctx.strokeStyle = g;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(0,          GROUND_Y + WHEEL_R);
        ctx.lineTo(revealUpTo, GROUND_Y + WHEEL_R);
        ctx.stroke();
      }
    };

    // ── Reveal ISA: clip to left of wheelX ───────────────────────────────────
    // The key trick: we draw the stampCanvas but clip it to a rectangle
    // that grows as the wheel moves right — so ISA appears only where
    // the wheel has already passed, as if the tread inked it.
    const drawRevealedISA = (revealUpTo: number, fadeIn: number) => {
      if (revealUpTo <= textLeft - WHEEL_R * 0.5) return;

      ctx.save();
      ctx.globalAlpha = fadeIn;

      // Clip: only show pixels left of where the wheel contact point is
      // The contact zone leads by half a wheel-radius for a "just printed" feel
      const clipRight = revealUpTo + WHEEL_R * 0.5;
      ctx.beginPath();
      ctx.rect(0, 0, clipRight, H);
      ctx.clip();

      ctx.drawImage(stampCanvas, 0, 0);
      ctx.restore();
    };

    // ── Motion streaks ────────────────────────────────────────────────────────
    const drawStreaks = (wx: number, speed: number) => {
      if (speed < 0.3) return;
      for (let i = 0; i < 7; i++) {
        const len   = WHEEL_R * (0.4 + Math.random() * 0.5);
        const off   = (i + 1) * WHEEL_R * 0.25;
        const yOff  = (Math.random() - 0.5) * WHEEL_R * 0.55;
        const alpha = (1 - i / 7) * speed * 0.16;
        ctx.strokeStyle = `rgba(0,194,255,${alpha})`;
        ctx.lineWidth   = 0.8 + (7 - i) * 0.15;
        ctx.beginPath();
        ctx.moveTo(wx - off,       WHEEL_CY + yOff);
        ctx.lineTo(wx - off - len, WHEEL_CY + yOff);
        ctx.stroke();
      }
    };

    // ── Main render loop ──────────────────────────────────────────────────────
    let animId: number;
    let t0: number | null = null;

    const frame = (now: number) => {
      if (!t0) t0 = now;
      const progress = Math.min((now - t0) / TOTAL_MS, 1);

      ctx.clearRect(0, 0, W, H);

      // Stars
      STARS.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,194,255,${s.a})`;
        ctx.fill();
      });

      // ── Derive wheel state ──────────────────────────────────────────────
      let wx: number, wy: number, rot: number, wAlpha = 1, glow = 0, speed = 0;

      if (progress < PHASE_INTRO) {
        // Wheel fades/drops in from top before rolling
        const t  = remap(progress, 0, PHASE_INTRO, 0, 1);
        const et = easeOut3(t);
        wx       = START_X;
        wy       = WHEEL_CY - (1 - et) * WHEEL_R * 2;
        rot      = 0;
        wAlpha   = et;
        glow     = 0;

      } else if (progress < PHASE_ROLL) {
        // Rolling across the surface left → right
        const t  = remap(progress, PHASE_INTRO, PHASE_ROLL, 0, 1);
        const et = easeInOut(t);
        wx       = START_X + TOTAL_DIST * et;
        wy       = WHEEL_CY;
        rot      = (wx - START_X) / WHEEL_R;
        speed    = 1 - Math.abs(et - 0.5) * 0.4;   // fastest in middle
        glow     = clamp(remap(t, 0.6, 1.0, 0, 1), 0, 1);
        spawnDust(wx);

      } else {
        // Settled / coast stop
        const t  = remap(progress, PHASE_ROLL, 1, 0, 1);
        const overshoot = Math.sin(t * Math.PI * 2.2) * (1 - t) * 8;
        wx       = END_X + overshoot;
        wy       = WHEEL_CY;
        rot      = (END_X - START_X) / WHEEL_R;
        glow     = 1;
        speed    = 0;
      }

      // Surface + reveal
      drawSurface(wx);
      // ISA reveals wherever wheel has passed (during roll phase)
      const isaReveal = progress >= PHASE_INTRO ? wx : textLeft - WHEEL_R * 2;
      const isaFadeIn = clamp(remap(progress, PHASE_INTRO, PHASE_INTRO + 0.05, 0, 1), 0, 1);
      drawRevealedISA(isaReveal, isaFadeIn);

      // Streaks, dust, wheel on top
      drawStreaks(wx, speed);
      tickParticles();
      drawWheel(wx, wy, rot, wAlpha, glow);

      // Counter + bar
      const pct = Math.round(progress * 100);
      if (counterRef.current) counterRef.current.textContent = String(pct).padStart(3, '0');
      if (barFillRef.current) barFillRef.current.style.width = `${pct}%`;

      if (progress < 1) animId = requestAnimationFrame(frame);
    };

    // Wait for Orbitron font to load before first frame
    document.fonts.load(`900 ${FONT_SIZE}px 'Orbitron'`).then(() => {
      // Re-render stamp canvas now that font is guaranteed loaded
      sCtx.clearRect(0, 0, W, H);
      sCtx.font         = `900 ${FONT_SIZE}px 'Orbitron', sans-serif`;
      sCtx.textAlign    = 'center';
      sCtx.textBaseline = 'middle';
      sCtx.shadowColor  = CYAN;
      sCtx.shadowBlur   = 32;
      sCtx.fillStyle    = CYAN;
      sCtx.fillText('ISA', W / 2, TEXT_Y);
      sCtx.shadowBlur   = 10;
      sCtx.fillStyle    = '#ffffff';
      sCtx.fillText('ISA', W / 2, TEXT_Y);

      animId = requestAnimationFrame(frame);
    });

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Exit ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      const { default: gsap } = await import('gsap');
      const el = containerRef.current;
      if (!el) return;
      gsap.to(el, {
        opacity: 0, y: -20, filter: 'blur(10px)',
        duration: 0.75, ease: 'power2.inOut',
        onComplete() { el.style.display = 'none'; },
      });
    })();
  }, [loaded]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Share+Tech+Mono&display=swap');

        .pl {
          position: fixed; inset: 0; z-index: 9999;
          background: #020810; overflow: hidden;
        }
        .pl::before {
          content: ''; position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,194,255,0.009) 3px, rgba(0,194,255,0.009) 4px
          );
          pointer-events: none; z-index: 1;
        }
        .pl canvas { position: absolute; inset: 0; }

        /* Corner brackets */
        .plc {
          position: absolute; width: 26px; height: 26px;
          pointer-events: none; z-index: 2;
        }
        .plc::before, .plc::after {
          content: ''; position: absolute;
          background: rgba(0,194,255,0.4);
        }
        .plc::before { width: 2px; height: 100%; top: 0; }
        .plc::after  { width: 100%; height: 2px; top: 0; }
        .plc-tl { top: 22px; left: 22px; }
        .plc-tr { top: 22px; right: 22px; transform: scaleX(-1); }
        .plc-bl { bottom: 22px; left: 22px; transform: scaleY(-1); }
        .plc-br { bottom: 22px; right: 22px; transform: scale(-1,-1); }

        /* Side labels */
        .pl-side {
          position: absolute; top: 50%;
          font-family: 'Share Tech Mono', monospace;
          font-size: 8px; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(0,194,255,0.16); writing-mode: vertical-rl;
          pointer-events: none; z-index: 2;
        }
        .pl-side-l { left: 24px; transform: translateY(-50%) rotate(180deg); }
        .pl-side-r { right: 24px; transform: translateY(-50%); }

        /* Footer */
        .pl-footer {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          width: min(360px, 78vw); display: flex; flex-direction: column;
          gap: 9px; z-index: 2;
        }
        .pl-meta { display: flex; justify-content: space-between; align-items: baseline; }
        .pl-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase;
          color: rgba(0,194,255,0.26);
        }
        .pl-counter {
          font-family: 'Orbitron', sans-serif;
          font-size: 12px; font-weight: 900;
          color: #00C2FF; letter-spacing: 0.06em;
        }
        .pl-track {
          width: 100%; height: 2px;
          background: rgba(0,194,255,0.07); position: relative;
        }
        .pl-fill {
          height: 100%; width: 0%;
          background: linear-gradient(90deg, rgba(0,194,255,0.1), #00C2FF);
          box-shadow: 0 0 10px #00C2FF, 0 0 22px rgba(0,194,255,0.22);
          position: relative; transition: width 0.04s linear;
        }
        .pl-fill::after {
          content: ''; position: absolute;
          right: -2px; top: 50%; transform: translateY(-50%);
          width: 5px; height: 5px; border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 7px #00C2FF, 0 0 16px #00C2FF;
        }
      `}</style>

      <div className="pl" ref={containerRef}>
        <canvas ref={canvasRef} />

        <div className="plc plc-tl" />
        <div className="plc plc-tr" />
        <div className="plc plc-bl" />
        <div className="plc plc-br" />

        <span className="pl-side pl-side-l">Rolling · Surface</span>
        <span className="pl-side pl-side-r">Indian Skating Academy · Nagpur</span>

        <div className="pl-footer">
          <div className="pl-meta">
            <span className="pl-label">Initializing</span>
            <span className="pl-counter" ref={counterRef}>000</span>
          </div>
          <div className="pl-track">
            <div className="pl-fill" ref={barFillRef} />
          </div>
        </div>
      </div>
    </>
  );
}
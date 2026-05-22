'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface PreloaderProps {
  loaded: boolean;
}

// ─── Pure helpers ────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const remap = (v: number, a: number, b: number, c: number, d: number) =>
  c + (d - c) * clamp((v - a) / (b - a), 0, 1);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

// ─── Component ───────────────────────────────────────────────────────────────
export default function Preloader({ loaded }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const rpmRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const torqueRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const [shouldRender, setShouldRender] = useState(true);

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__isaPreloaderSeen) {
      setShouldRender(false);
      document.documentElement.classList.add('skip-preloader');
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        if (typeof window !== 'undefined') {
          delete (window as any).__isaPreloaderSeen;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── CANVAS ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shouldRender) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    // ── Strict palette: blue · white · gray ─────────────────────────────────
    const C_CYAN = '#00C8FF';            // primary electric blue
    const C_CYAN2 = 'rgba(0,200,255,';   // with alpha suffix
    const C_WHITE = 'rgba(232,248,255,'; // near-white with alpha suffix
    const C_STEEL = 'rgba(100,160,210,'; // steel blue-gray
    const C_DSTEEL = 'rgba(40,70,110,';   // dark steel
    const BG = '#04060C';

    // ── Geometry ─────────────────────────────────────────────────────────────
    const WHEEL_R = Math.min(68, W * 0.09);
    const TIRE_W = WHEEL_R * 0.155;      // thickness of tire band
    const TIRE_MID = WHEEL_R - TIRE_W / 2; // arc radius for mid of tire
    const SPOKE_N = 6;
    const BEARING_R = WHEEL_R * 0.13;
    const GROUND_Y = H * 0.52;
    const FONT_SIZE = WHEEL_R * 2.4;

    // ── Phase constants ──────────────────────────────────────────────────────
    const TOTAL_MS = 4000;
    const PH_GRID = 0.18;   // hex grid crystallises
    const PH_MAT = 0.34;   // wheel materialises as wireframe
    const PH_SPIN = 0.52;   // solidifies & spins up
    const PH_ROLL = 0.82;   // rolls across, stamps ISA
    const PH_SETL = 0.95;   // overshoot / settle
    // 0.95 → 1.0 : idle glow pulse

    const STATUS = ['GRID.INIT', 'BRG.CAL', 'RPM.SPINUP', 'SURFACE.ENG', 'STAMP.EXE', 'ISA.READY'];

    // ── Stamp canvas (ISA text, blue/white only) ─────────────────────────────
    const stampCanvas = document.createElement('canvas');
    stampCanvas.width = W; stampCanvas.height = H;
    const sCtx = stampCanvas.getContext('2d')!;

    sCtx.font = `900 ${FONT_SIZE}px 'Orbitron', sans-serif`;
    const met = sCtx.measureText('ISA');
    const textLeft = W / 2 - met.width / 2;
    const textRight = W / 2 + met.width / 2;
    const START_X = textLeft - WHEEL_R * 3.5;
    const END_X = textRight + WHEEL_R * 3.5;
    const TOTAL_DIST = END_X - START_X;

    const renderStamp = () => {
      sCtx.clearRect(0, 0, W, H);
      sCtx.font = `900 ${FONT_SIZE}px 'Orbitron', sans-serif`;
      sCtx.textAlign = 'center'; sCtx.textBaseline = 'middle';
      // Wide blue halo
      sCtx.shadowColor = C_CYAN; sCtx.shadowBlur = 52;
      sCtx.fillStyle = C_CYAN;
      sCtx.fillText('ISA', W / 2, GROUND_Y);
      // Bright blue body
      sCtx.shadowBlur = 18;
      sCtx.fillText('ISA', W / 2, GROUND_Y);
      // White-blue core
      sCtx.shadowBlur = 5;
      sCtx.fillStyle = C_WHITE + '0.96)';
      sCtx.fillText('ISA', W / 2, GROUND_Y);
    };

    // ── Hex grid ─────────────────────────────────────────────────────────────
    const HEX = 30;
    const HEX_W = HEX * Math.sqrt(3);
    const HEX_H = HEX * 2;
    const cols = Math.ceil(W / HEX_W) + 2;
    const rows = Math.ceil(H / (HEX_H * 0.75)) + 2;

    interface HexCell { x: number; y: number; delay: number }
    const hexCells: HexCell[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = c * HEX_W + (r % 2 === 0 ? 0 : HEX_W / 2) - HEX_W;
        const y = r * HEX_H * 0.75 - HEX_H;
        const dist = Math.hypot(x - W / 2, y - H / 2);
        hexCells.push({ x, y, delay: dist / (Math.max(W, H) * 0.7) });
      }

    const drawHex = (x: number, y: number, size: number, a: number) => {
      if (a <= 0) return;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(ang);
        const py = y + size * Math.sin(ang);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = C_CYAN2 + (a * 0.11) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.fillStyle = C_CYAN2 + (a * 0.018) + ')';
      ctx.fill();
    };

    const drawHexGrid = (t: number, maxA: number) => {
      hexCells.forEach(h => {
        const lt = clamp((t - h.delay) / 0.4, 0, 1);
        drawHex(h.x, h.y, HEX * 0.9, easeOutCubic(lt) * maxA);
      });
    };

    // ── Blueprint wireframe wheel ─────────────────────────────────────────────
    const drawWireframe = (cx: number, cy: number, a: number) => {
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(cx, cy);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = C_CYAN2 + '0.65)';
      ctx.lineWidth = 0.8;
      [1, 0.75, 0.52, 0.25].forEach(f => {
        ctx.beginPath(); ctx.arc(0, 0, WHEEL_R * f, 0, Math.PI * 2); ctx.stroke();
      });
      for (let i = 0; i < SPOKE_N * 2; i++) {
        const ang = (i / (SPOKE_N * 2)) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * BEARING_R * 2.2, Math.sin(ang) * BEARING_R * 2.2);
        ctx.lineTo(Math.cos(ang) * WHEEL_R * 0.73, Math.sin(ang) * WHEEL_R * 0.73);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    };

    // ── Blueprint annotations ─────────────────────────────────────────────────
    const drawAnnotations = (cx: number, cy: number, a: number, rot: number) => {
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a * 0.42;
      ctx.translate(cx, cy);
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 0.5;
      [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach(ang => {
        const ca = Math.cos(ang + rot), sa = Math.sin(ang + rot);
        ctx.strokeStyle = C_CYAN2 + '0.5)';
        ctx.beginPath();
        ctx.moveTo(ca * WHEEL_R * 1.4, sa * WHEEL_R * 1.4);
        ctx.lineTo(ca * WHEEL_R * 2.0, sa * WHEEL_R * 2.0);
        ctx.stroke();
        const pc = Math.cos(ang + rot + Math.PI / 2), ps = Math.sin(ang + rot + Math.PI / 2);
        const tx = ca * WHEEL_R * 2.0, ty = sa * WHEEL_R * 2.0;
        ctx.beginPath();
        ctx.moveTo(tx - pc * 5, ty - ps * 5);
        ctx.lineTo(tx + pc * 5, ty + ps * 5);
        ctx.stroke();
      });
      ctx.strokeStyle = C_CYAN2 + '0.18)';
      ctx.beginPath();
      ctx.moveTo(-WHEEL_R * 2.5, 0); ctx.lineTo(WHEEL_R * 2.5, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    // ── WHEEL — rounded skating wheel design ──────────────────────────────────
    //   Looks like a proper urethane inline-skate / roller wheel:
    //   thick tire band (no sharp teeth), curved tapered spokes, clean hub.
    const drawWheel = (
      cx: number, cy: number, rot: number,
      alpha: number, glow: number,
      blur: number        // 0–1 spin-blur intensity
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);

      // ── Outer halo ──────────────────────────────────────────────────────────
      if (glow > 0) {
        const hR = WHEEL_R * (2.0 + blur * 1.4);
        const hg = ctx.createRadialGradient(0, 0, WHEEL_R * 0.6, 0, 0, hR);
        hg.addColorStop(0, C_CYAN2 + (0.22 * glow) + ')');
        hg.addColorStop(0.5, C_CYAN2 + (0.06 * glow) + ')');
        hg.addColorStop(1, 'transparent');
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(0, 0, hR, 0, Math.PI * 2); ctx.fill();
      }

      // ── Spin-blur ghost rings ────────────────────────────────────────────────
      if (blur > 0.06) {
        for (let i = 1; i <= 5; i++) {
          ctx.strokeStyle = C_CYAN2 + (blur * 0.055 * (6 - i) / 5) + ')';
          ctx.lineWidth = i * 3.5;
          ctx.beginPath(); ctx.arc(0, 0, TIRE_MID, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // ── TIRE BAND — thick rounded ring (the urethane wheel body) ────────────
      // Step 1: draw solid tire fill so it looks like a physical band
      const tireGrad = ctx.createRadialGradient(0, 0, TIRE_MID - TIRE_W * 0.5, 0, 0, TIRE_MID + TIRE_W * 0.5);
      tireGrad.addColorStop(0, C_DSTEEL + '0.6)');
      tireGrad.addColorStop(0.45, C_CYAN2 + (0.25 + 0.25 * glow) + ')');
      tireGrad.addColorStop(0.8, C_CYAN2 + (0.6 + 0.3 * glow) + ')');
      tireGrad.addColorStop(1, C_WHITE + '0.1)');
      ctx.strokeStyle = C_CYAN; // overridden by gradient approach below
      // Draw via donut: outer circle filled, inner masked out
      ctx.beginPath();
      ctx.arc(0, 0, WHEEL_R + 1, 0, Math.PI * 2);
      ctx.arc(0, 0, WHEEL_R - TIRE_W, 0, Math.PI * 2, true); // hole
      ctx.fillStyle = tireGrad;
      ctx.fill();

      // Step 2: bright outer edge line
      ctx.shadowColor = C_CYAN;
      ctx.shadowBlur = 8 + 18 * glow;
      ctx.strokeStyle = C_CYAN2 + (0.75 + 0.25 * glow) + ')';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(0, 0, WHEEL_R, 0, Math.PI * 2); ctx.stroke();

      // Step 3: inner tire edge (lighter rim groove)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = C_CYAN2 + '0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, WHEEL_R - TIRE_W + 1, 0, Math.PI * 2); ctx.stroke();

      // Step 4: TREAD SEGMENTS — rounded arc blocks that rotate with wheel
      //   Replaces gear teeth entirely. Short rounded arcs = soft tread pattern.
      ctx.save();
      ctx.rotate(rot);
      const TREAD_N = 18;
      const treadSlot = (Math.PI * 2) / TREAD_N;
      const treadLen = treadSlot * 0.62; // 62% coverage → visible gaps between blocks
      for (let i = 0; i < TREAD_N; i++) {
        const startA = i * treadSlot - treadLen / 2;
        ctx.lineCap = 'round'; // ← round caps = natural, not blade-like
        ctx.strokeStyle = C_CYAN2 + (0.55 + 0.3 * glow) + ')';
        ctx.shadowColor = C_CYAN;
        ctx.shadowBlur = 3 + 8 * glow;
        ctx.lineWidth = TIRE_W * 0.78; // wide = tire looks thick
        ctx.beginPath();
        ctx.arc(0, 0, TIRE_MID, startA, startA + treadLen);
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
      ctx.restore();

      // ── Inner structural ring ────────────────────────────────────────────────
      ctx.shadowBlur = 0;
      ctx.strokeStyle = C_STEEL + '0.3)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(0, 0, WHEEL_R * 0.65, 0, Math.PI * 2); ctx.stroke();

      // ── CURVED SPOKES ────────────────────────────────────────────────────────
      //   Use quadratic bezier arcs instead of straight lines → natural wheel feel
      ctx.save();
      ctx.rotate(rot);
      for (let i = 0; i < SPOKE_N; i++) {
        const ang = (i / SPOKE_N) * Math.PI * 2;
        const cos = Math.cos(ang), sin = Math.sin(ang);
        // Hub end (wide) and rim end (narrow) of the spoke
        const hx = cos * (BEARING_R * 2.2), hy = sin * (BEARING_R * 2.2);
        const rx = cos * (WHEEL_R - TIRE_W - 2), ry = sin * (WHEEL_R - TIRE_W - 2);
        // Control point: perpendicular offset for gentle curve
        const perp = Math.PI / (SPOKE_N * 1.5);
        const cpAng = ang + perp;
        const cpR = WHEEL_R * 0.38;
        const cpx = Math.cos(cpAng) * cpR, cpy = Math.sin(cpAng) * cpR;

        // Spoke tapers: thick near hub, thin at rim — simulate with lineWidth 
        ctx.shadowColor = C_CYAN;
        ctx.shadowBlur = 4 + 10 * glow;
        ctx.strokeStyle = C_CYAN2 + (0.7 + 0.25 * glow) + ')';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.quadraticCurveTo(cpx, cpy, rx, ry);
        ctx.stroke();

        // Thin centre line on spoke (gives depth / two-tone feel)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = C_WHITE + '0.3)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.quadraticCurveTo(cpx, cpy, rx, ry);
        ctx.stroke();
        ctx.lineCap = 'butt';
      }
      ctx.restore();

      // ── Hub disc ─────────────────────────────────────────────────────────────
      ctx.shadowColor = C_CYAN;
      ctx.shadowBlur = 14 + 10 * glow;
      const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, BEARING_R * 2.0);
      hubGrad.addColorStop(0, C_WHITE + '0.9)');
      hubGrad.addColorStop(0.5, C_CYAN2 + '0.7)');
      hubGrad.addColorStop(1, C_DSTEEL + '0.5)');
      ctx.fillStyle = hubGrad;
      ctx.beginPath(); ctx.arc(0, 0, BEARING_R * 2.0, 0, Math.PI * 2); ctx.fill();

      // Hub ring
      ctx.strokeStyle = C_CYAN2 + (0.5 + 0.4 * glow) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, BEARING_R * 2.0, 0, Math.PI * 2); ctx.stroke();

      // Center bearing point
      ctx.shadowBlur = 0;
      ctx.fillStyle = BG;
      ctx.beginPath(); ctx.arc(0, 0, BEARING_R * 0.5, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    };

    // ── Particle system — all blue/white/gray, no orange ─────────────────────
    interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; type: 'spark' | 'dust' }
    const particles: Particle[] = [];

    const spawnParticles = (wx: number) => {
      if (Math.random() > 0.55) return;
      const ang = Math.PI + (Math.random() - 0.5) * Math.PI * 0.85;
      const speed = Math.random() * 3 + 0.7;
      particles.push({
        x: wx + (Math.random() - 0.5) * WHEEL_R * 0.4,
        y: GROUND_Y + WHEEL_R * 0.5,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 0.6,
        life: 1, maxLife: 20 + Math.random() * 30,
        r: Math.random() * 1.4 + 0.3,
        type: Math.random() > 0.5 ? 'spark' : 'dust',
      });
    };

    const tickParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.11; p.vx *= 0.97;
        p.life -= 1 / p.maxLife;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        if (p.type === 'spark') {
          // Pure Electric Cyan-White spark trail
          ctx.strokeStyle = C_WHITE + (p.life * 0.38) + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3.5, p.y - p.vy * 3.5);
          ctx.stroke();
          ctx.fillStyle = C_CYAN2 + (p.life * 0.95) + ')';
        } else {
          // Steel-gray dust
          ctx.fillStyle = C_STEEL + (p.life * 0.4) + ')';
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ── Ground surface ────────────────────────────────────────────────────────
    const drawSurface = (revealX: number) => {
      // Tick grid
      const step = WHEEL_R * 1.6;
      ctx.strokeStyle = C_CYAN2 + '0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y + WHEEL_R * 0.75);
        ctx.lineTo(x, GROUND_Y + WHEEL_R * 1.25);
        ctx.stroke();
      }

      // Faint base line
      ctx.strokeStyle = C_CYAN2 + '0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + WHEEL_R);
      ctx.lineTo(W, GROUND_Y + WHEEL_R);
      ctx.stroke();

      // Revealed trail — blue only, no heat tinting
      if (revealX > 0) {
        const g = ctx.createLinearGradient(0, 0, revealX, 0);
        g.addColorStop(0, C_CYAN2 + '0.03)');
        g.addColorStop(0.5, C_CYAN2 + '0.12)');
        g.addColorStop(0.88, C_CYAN2 + '0.42)');
        g.addColorStop(1, C_WHITE + '0.7)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.shadowColor = C_CYAN;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + WHEEL_R);
        ctx.lineTo(revealX, GROUND_Y + WHEEL_R);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    // ── ISA reveal ────────────────────────────────────────────────────────────
    const drawISA = (revealX: number, fadeIn: number) => {
      if (revealX <= textLeft - WHEEL_R || fadeIn <= 0) return;
      ctx.save();
      ctx.globalAlpha = fadeIn;
      ctx.beginPath();
      ctx.rect(0, 0, revealX + WHEEL_R * 0.65, H);
      ctx.clip();
      ctx.drawImage(stampCanvas, 0, 0);
      ctx.restore();
    };

    // ── Motion streaks — blue/gray only ──────────────────────────────────────
    const drawStreaks = (wx: number, speed: number) => {
      if (speed < 0.15) return;
      for (let i = 0; i < 10; i++) {
        const len = WHEEL_R * (0.4 + Math.random() * 0.65);
        const off = (i + 1) * WHEEL_R * 0.27;
        const yOff = (Math.random() - 0.5) * WHEEL_R * 0.7;
        const a = (1 - i / 10) * speed * 0.18;
        ctx.strokeStyle = i < 4
          ? C_WHITE + a + ')'
          : C_CYAN2 + a + ')';
        ctx.lineWidth = 0.7 + (10 - i) * 0.10;
        ctx.beginPath();
        ctx.moveTo(wx - off, GROUND_Y + yOff);
        ctx.lineTo(wx - off - len, GROUND_Y + yOff);
        ctx.stroke();
      }
    };

    // ── Scan sweep ───────────────────────────────────────────────────────────
    const drawScanSweep = (prog: number) => {
      if (prog < 0.04 || prog > 0.42) return;
      const t = remap(prog, 0.04, 0.42, 0, 1);
      const y = t * H;
      const sg = ctx.createLinearGradient(0, y - 70, 0, y + 5);
      sg.addColorStop(0, 'transparent');
      sg.addColorStop(0.75, C_CYAN2 + '0.03)');
      sg.addColorStop(1, C_CYAN2 + '0.14)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, y - 70, W, 75);
    };

    // ── Stars ─────────────────────────────────────────────────────────────────
    const STARS = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.44,
      r: Math.random() * 0.85 + 0.1, a: Math.random() * 0.2 + 0.04,
    }));

    // ── MAIN LOOP ─────────────────────────────────────────────────────────────
    let animId: number;
    let t0: number | null = null;

    const frame = (now: number) => {
      if (!t0) t0 = now;
      const prog = Math.min((now - t0) / TOTAL_MS, 1);

      ctx.clearRect(0, 0, W, H);

      // Stars
      const starA = clamp(remap(prog, 0, 0.14, 0, 1), 0, 1);
      STARS.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = C_CYAN2 + (s.a * starA) + ')';
        ctx.fill();
      });

      drawScanSweep(prog);

      const gridA = clamp(remap(prog, 0, PH_GRID, 0, 1), 0, 1) *
        clamp(remap(prog, 0.72, 0.94, 1, 0.28), 0, 1);
      drawHexGrid(prog, gridA);

      // ── Derive wheel state ────────────────────────────────────────────────
      let wx = START_X, wy = GROUND_Y;
      let solidA = 0, glow = 0, blur = 0, speed = 0, rot = 0;

      if (prog < PH_GRID) {
        solidA = 0;

      } else if (prog < PH_MAT) {
        // Wireframe drops in
        const t = remap(prog, PH_GRID, PH_MAT, 0, 1);
        const et = easeOutCubic(t);
        wx = START_X; wy = GROUND_Y - (1 - et) * WHEEL_R * 2.8;
        const wfA = et * clamp(remap(prog, PH_MAT * 0.85, PH_MAT, 1, 0), 0, 1);
        drawAnnotations(START_X, GROUND_Y, et * 0.75, 0);
        drawWireframe(wx, wy, wfA);
        glow = et * 0.22; solidA = 0;

      } else if (prog < PH_SPIN) {
        // Solidifies & spins up
        const t = remap(prog, PH_MAT, PH_SPIN, 0, 1);
        wx = START_X; wy = GROUND_Y;
        rot = easeInOutQuart(t) * Math.PI * 14;
        solidA = 1;
        glow = t * 0.5;
        blur = clamp(remap(t, 0.3, 0.72, 0, 1), 0, 1) *
          clamp(remap(t, 0.72, 1, 1, 0), 0, 1);
        drawAnnotations(wx, wy, (1 - t) * 0.65, rot);

      } else if (prog < PH_ROLL) {
        // Roll across surface, stamp ISA
        const t = remap(prog, PH_SPIN, PH_ROLL, 0, 1);
        const et = t < 0.08
          ? easeInOutQuart(t / 0.08) * 0.04
          : 0.04 + easeInOutQuart((t - 0.08) / 0.92) * 0.96;
        wx = START_X + TOTAL_DIST * et;
        wy = GROUND_Y;
        rot = (wx - START_X) / WHEEL_R;
        speed = clamp(1 - Math.abs(et - 0.5) * 1.3, 0, 1);
        solidA = 1;
        glow = 0.65;
        blur = 0;
        spawnParticles(wx);

      } else if (prog < PH_SETL) {
        // Overshoot settle
        const t = remap(prog, PH_ROLL, PH_SETL, 0, 1);
        const over = Math.sin(t * Math.PI * 2.6) * (1 - t) * 11;
        wx = END_X + over; wy = GROUND_Y;
        rot = (END_X - START_X) / WHEEL_R;
        solidA = 1; glow = 1;

      } else {
        // Idle glow pulse
        const t = remap(prog, PH_SETL, 1, 0, 1);
        wx = END_X; wy = GROUND_Y;
        rot = (END_X - START_X) / WHEEL_R;
        solidA = 1;
        glow = 0.72 + Math.sin(t * Math.PI * 7) * 0.28;
      }

      // Surface + ISA reveal
      const revealX = prog >= PH_SPIN ? wx : -WHEEL_R * 2;
      const isaFadeIn = clamp(remap(prog, PH_SPIN, PH_SPIN + 0.04, 0, 1), 0, 1);
      drawSurface(revealX);
      drawISA(revealX, isaFadeIn);

      if (prog >= PH_SPIN && prog < PH_SETL) drawStreaks(wx, speed);
      tickParticles();

      if (solidA > 0) drawWheel(wx, wy, rot, solidA, glow, blur);

      // ── DOM telemetry ─────────────────────────────────────────────────────
      const pct = Math.round(prog * 100);
      if (counterRef.current) counterRef.current.textContent = String(pct).padStart(3, '0');
      if (barFillRef.current) barFillRef.current.style.width = `${pct}%`;

      if (rpmRef.current) {
        const rpm = Math.round(
          clamp(remap(prog, PH_MAT, PH_SPIN, 0, 8400), 0, 8400) *
          clamp(remap(prog, PH_ROLL, PH_SETL, 1, 0.08), 0, 1)
        );
        rpmRef.current.textContent = String(rpm).padStart(5, '0');
      }
      if (velRef.current) {
        const vel = (
          clamp(remap(prog, PH_SPIN, PH_ROLL, 0, 48.5), 0, 48.5) *
          clamp(remap(prog, PH_ROLL, PH_SETL, 1, 0), 0, 1)
        ).toFixed(1);
        velRef.current.textContent = vel;
      }
      if (torqueRef.current) {
        const trq = Math.round(
          clamp(remap(prog, PH_MAT, PH_SPIN, 0, 318), 0, 318) *
          clamp(remap(prog, PH_ROLL * 0.85, PH_SETL, 1, 0.18), 0, 1)
        );
        torqueRef.current.textContent = String(trq).padStart(3, '0');
      }
      if (statusRef.current) {
        const idx = Math.floor(prog * STATUS.length);
        statusRef.current.textContent = STATUS[Math.min(idx, STATUS.length - 1)];
      }

      if (prog < 1) animId = requestAnimationFrame(frame);
    };

    document.fonts.load(`900 ${FONT_SIZE}px 'Orbitron'`).then(() => {
      renderStamp();
      animId = requestAnimationFrame(frame);
    });

    return () => cancelAnimationFrame(animId);
  }, [shouldRender]);

  // ── EXIT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    if (typeof window !== 'undefined') {
      (window as any).__isaPreloaderSeen = true;
    }
    (async () => {
      const { default: gsap } = await import('gsap');
      const el = containerRef.current;
      if (!el) return;
      gsap.to(el, {
        opacity: 0, y: -28, filter: 'blur(14px)',
        duration: 0.9, ease: 'power3.inOut',
        onComplete() { el.style.display = 'none'; },
      });
    })();
  }, [loaded]);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;500;600;700&display=swap');

        html.skip-preloader .pl-root { display: none !important; }

        .pl-root {
          position: fixed; inset: 0;
          background: #04060C;
          z-index: 9999; overflow: hidden; cursor: wait;
          font-family: 'Share Tech Mono', monospace;
        }

        /* Animated scanlines */
        .pl-root::before {
          content: ''; position: absolute; inset: 0; z-index: 20;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,200,255,0.007) 2px, rgba(0,200,255,0.007) 3px
          );
          pointer-events: none;
          animation: pl-scan 6s linear infinite;
        }
        @keyframes pl-scan {
          from { background-position: 0 0; }
          to   { background-position: 0 96px; }
        }

        /* Vignette */
        .pl-root::after {
          content: ''; position: absolute; inset: 0; z-index: 19;
          background: radial-gradient(ellipse 76% 66% at 50% 50%, transparent 32%, rgba(4,6,12,0.68) 100%);
          pointer-events: none;
        }

        .pl-canvas { position: absolute; inset: 0; z-index: 1; }

        /* ── Corner brackets ── */
        .pl-corner {
          position: absolute; width: 36px; height: 36px;
          pointer-events: none; z-index: 25;
          animation: pl-bracket 3.4s ease-in-out infinite;
        }
        .pl-corner::before, .pl-corner::after {
          content: ''; position: absolute; background: rgba(0,200,255,0.48);
        }
        .pl-corner::before { width: 1.5px; height: 100%; top: 0; }
        .pl-corner::after  { width: 100%; height: 1.5px; top: 0; }
        .pl-corner--tl { top: 22px; left: 22px; }
        .pl-corner--tr { top: 22px; right: 22px; transform: scaleX(-1); }
        .pl-corner--bl { bottom: 22px; left: 22px; transform: scaleY(-1); }
        .pl-corner--br { bottom: 22px; right: 22px; transform: scale(-1,-1); }
        @keyframes pl-bracket { 0%,100% { opacity:.5; } 50% { opacity:1; } }

        /* ── Top bar ── */
        .pl-topbar {
          position: absolute; top: 20px; left: 72px; right: 72px;
          display: flex; justify-content: space-between; align-items: center;
          z-index: 25;
          animation: pl-fade-down 0.7s 0.15s ease-out both;
        }
        @keyframes pl-fade-down {
          from { opacity:0; transform: translateY(-10px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .pl-brand {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.38em; text-transform: uppercase;
          color: rgba(0,200,255,0.38);
        }
        .pl-brand b { color: rgba(0,200,255,0.82); font-weight: 700; }
        .pl-sysid   { font-size: 8px; letter-spacing: 0.18em; color: rgba(0,200,255,0.18); }

        /* ── Telemetry panels ── */
        .pl-telem {
          position: absolute; top: 66px;
          display: flex; flex-direction: column; gap: 12px;
          z-index: 25;
          animation: pl-fade-left 0.6s 0.35s ease-out both;
        }
        .pl-telem--l { left: 26px; }
        .pl-telem--r { right: 26px; align-items: flex-end; animation-name: pl-fade-right; }
        @keyframes pl-fade-left  { from { opacity:0; transform: translateX(-14px); } to { opacity:1; transform:none; } }
        @keyframes pl-fade-right { from { opacity:0; transform: translateX( 14px); } to { opacity:1; transform:none; } }

        .pl-metric         { display: flex; flex-direction: column; gap: 3px; }
        .pl-metric__label  { font-size: 7px; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(0,200,255,0.2); }
        .pl-metric__val    {
          font-family: 'Orbitron', sans-serif;
          font-size: 17px; font-weight: 700;
          color: rgba(0,200,255,0.76); letter-spacing: 0.04em;
          text-shadow: 0 0 22px rgba(0,200,255,0.42);
        }
        .pl-metric__unit   { font-size: 7px; color: rgba(0,200,255,0.28); letter-spacing: 0.14em; margin-left: 2px; }
        .pl-metric__status {
          font-family: 'Orbitron', sans-serif;
          font-size: 8.5px; font-weight: 600;
          color: rgba(0,200,255,0.76); letter-spacing: 0.06em;
          text-shadow: 0 0 14px rgba(0,200,255,0.45);
          animation: pl-blink 1.4s step-end infinite;
        }
        @keyframes pl-blink { 0%,100% { opacity:1; } 50% { opacity:.45; } }
        .pl-divider { width: 44px; height: 1px; background: rgba(0,200,255,0.09); }

        /* ── Side labels ── */
        .pl-side {
          position: absolute; top: 50%;
          font-size: 7px; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(0,200,255,0.1); writing-mode: vertical-rl;
          pointer-events: none; z-index: 25;
        }
        .pl-side--l { left: 14px; transform: translateY(-50%) rotate(180deg); }
        .pl-side--r { right: 14px; transform: translateY(-50%); }

        /* ── Footer ── */
        .pl-footer {
          position: absolute; bottom: 30px;
          left: 50%; transform: translateX(-50%);
          width: min(420px, 82vw);
          display: flex; flex-direction: column; gap: 10px;
          z-index: 25;
          animation: pl-fade-up 0.7s 0.25s ease-out both;
        }
        @keyframes pl-fade-up {
          from { opacity:0; transform: translateX(-50%) translateY(12px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }
        .pl-footer__row { display: flex; justify-content: space-between; align-items: center; }
        .pl-init-label  {
          font-size: 7.5px; letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(0,200,255,0.22);
          display: flex; align-items: center; gap: 7px;
        }
        .pl-init-label::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: rgba(0,200,255,0.68);
          animation: pl-dot 1.3s ease-in-out infinite;
        }
        @keyframes pl-dot { 0%,100% { opacity:.28; transform:scale(.7); } 50% { opacity:1; transform:scale(1.2); } }

        .pl-counter {
          font-family: 'Orbitron', sans-serif;
          font-size: 12px; font-weight: 900;
          color: #00C8FF; letter-spacing: 0.07em;
          text-shadow: 0 0 18px rgba(0,200,255,0.7), 0 0 40px rgba(0,200,255,0.2);
        }
        .pl-counter::after { content: '%'; font-size: 8px; margin-left: 1px; opacity: .5; }

        .pl-track {
          width: 100%; height: 1px;
          background: rgba(0,200,255,0.08); position: relative;
        }
        .pl-track::before {
          content: ''; position: absolute; inset: 0;
          background: repeating-linear-gradient(90deg,
            rgba(0,200,255,0.04) 0, rgba(0,200,255,0.04) 1px,
            transparent 1px, transparent 14px);
        }
        .pl-fill {
          height: 100%; width: 0%;
          background: linear-gradient(90deg, rgba(0,200,255,0.08), #00C8FF);
          box-shadow: 0 0 10px rgba(0,200,255,0.88), 0 0 28px rgba(0,200,255,0.28);
          transition: width 0.04s linear; position: relative;
        }
        .pl-fill::after {
          content: ''; position: absolute;
          right: -4px; top: 50%; transform: translateY(-50%);
          width: 7px; height: 7px; border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 8px #00C8FF, 0 0 22px #00C8FF, 0 0 44px rgba(0,200,255,0.3);
        }
        .pl-ticks { display: flex; justify-content: space-between; margin-top: 5px; }
        .pl-tick  { width: 1px; height: 3px; background: rgba(0,200,255,0.13); }
        .pl-tick:nth-child(5n+1) { height: 5px; background: rgba(0,200,255,0.27); }
      `}</style>

      {shouldRender && (
        <div className="pl-root" ref={containerRef}>
          <canvas className="pl-canvas" ref={canvasRef} />

          <div className="pl-corner pl-corner--tl" />
          <div className="pl-corner pl-corner--tr" />
          <div className="pl-corner pl-corner--bl" />
          <div className="pl-corner pl-corner--br" />

          <div className="pl-topbar">
            <div className="pl-brand">Indian Skating Academy · <b>ISA</b></div>
            <div className="pl-sysid">SYS_ID: ISA-NGP-2025 ◆ v4.2.1</div>
          </div>

          <div className="pl-telem pl-telem--l">
            <div className="pl-metric">
              <div className="pl-metric__label">Wheel RPM</div>
              <div className="pl-metric__val">
                <span ref={rpmRef}>00000</span>
                <span className="pl-metric__unit">rpm</span>
              </div>
            </div>
            <div className="pl-divider" />
            <div className="pl-metric">
              <div className="pl-metric__label">Surface Vel</div>
              <div className="pl-metric__val">
                <span ref={velRef}>00.0</span>
                <span className="pl-metric__unit">m/s</span>
              </div>
            </div>
          </div>

          <div className="pl-telem pl-telem--r">
            <div className="pl-metric" style={{ alignItems: 'flex-end' }}>
              <div className="pl-metric__label">Torque</div>
              <div className="pl-metric__val">
                <span ref={torqueRef}>000</span>
                <span className="pl-metric__unit">N·m</span>
              </div>
            </div>
            <div className="pl-divider" />
            <div className="pl-metric" style={{ alignItems: 'flex-end' }}>
              <div className="pl-metric__label">Status</div>
              <span className="pl-metric__status" ref={statusRef}>GRID.INIT</span>
            </div>
          </div>

          <span className="pl-side pl-side--l">System Boot · Precision Rolling · Surface Stamp</span>
          <span className="pl-side pl-side--r">Indian Skating Academy · Nagpur · ISA-NGP-001</span>

          <div className="pl-footer">
            <div className="pl-footer__row">
              <span className="pl-init-label">Initializing surface systems</span>
              <span className="pl-counter" ref={counterRef}>000</span>
            </div>
            <div className="pl-track">
              <div className="pl-fill" ref={barFillRef} />
            </div>
            <div className="pl-ticks">
              {Array.from({ length: 22 }, (_, i) => <div key={i} className="pl-tick" />)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
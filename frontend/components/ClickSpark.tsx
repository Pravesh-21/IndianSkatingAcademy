'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children?: React.ReactNode;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = '#ffffff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | undefined>(undefined);

  const createParticles = useCallback((x: number, y: number) => {
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount;
      const velocity = (Math.random() * 2 + 1) * (sparkRadius / 10);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * sparkSize + 2,
        alpha: 1,
        life: 1
      });
    }
  }, [sparkCount, sparkRadius, sparkSize]);

  const animate = useCallback(function loop(time: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95; // Friction
      p.vy *= 0.95;
      p.life -= 1000 / (60 * duration);
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        particlesRef.current.splice(index, 1);
        return;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = sparkColor;
      
      // Draw diamond-like spark
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.size);
      ctx.lineTo(p.x + p.size / 2, p.y);
      ctx.lineTo(p.x, p.y + p.size);
      ctx.lineTo(p.x - p.size / 2, p.y);
      ctx.closePath();
      ctx.fill();
      
      // Add a glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = sparkColor;
      ctx.restore();
    });

    requestRef.current = requestAnimationFrame(loop);
  }, [sparkColor, duration]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    const handleClick = (e: MouseEvent) => {
      createParticles(e.clientX, e.clientY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousedown', handleClick);
    handleResize();

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleClick);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [createParticles, animate]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 999999
        }}
      />
      {children}
    </>
  );
};

export default ClickSpark;

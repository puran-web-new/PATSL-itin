'use client';

import { useEffect, useRef } from 'react';

type Dot = { x: number; y: number; r: number; phase: number; speed: number; hue: 'g' | 'w' };
type Streak = { x: number; y: number; len: number; speed: number; hue: string };

/**
 * Hex-offset dot grid (density increasing left-to-right) with occasional
 * falling "data pulse" streak lines — the animated backdrop behind the
 * Meridian homepage hero. Pure canvas + rAF, no dependencies.
 */
export default function HeroParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dots: Dot[] = [];
    let streaks: Streak[] = [];
    let rafId = 0;
    let streakInterval: ReturnType<typeof setInterval>;
    let t = 0;

    const buildGrid = () => {
      dots = [];
      const spacing = 34;
      const rowH = spacing * 0.86;
      let row = 0;
      for (let y = -rowH; y < H + rowH; y += rowH) {
        const offset = row % 2 === 0 ? 0 : spacing / 2;
        for (let x = -spacing; x < W + spacing; x += spacing) {
          const xr = x / W;
          const density = 0.35 + xr * 0.5;
          if (Math.random() < density) {
            dots.push({
              x: x + offset,
              y,
              r: Math.random() * 1.4 + 0.5,
              phase: Math.random() * Math.PI * 2,
              speed: 0.4 + Math.random() * 0.8,
              hue: Math.random() < 0.18 ? 'g' : 'w',
            });
          }
        }
        row++;
      }
    };

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildGrid();
    };

    const spawnStreak = () => {
      streaks.push({
        x: Math.random() * W * 0.6 + W * 0.2,
        y: -20,
        len: 60 + Math.random() * 60,
        speed: 3 + Math.random() * 2.5,
        hue: Math.random() < 0.5 ? '29,233,194' : '57,224,138',
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;
      for (const d of dots) {
        const alpha = 0.15 + (Math.sin(t * d.speed + d.phase) * 0.5 + 0.5) * 0.55;
        const dx = Math.cos(t * 0.3 + d.phase) * 1.4;
        const dy = Math.sin(t * 0.3 + d.phase) * 1.4;
        ctx.beginPath();
        ctx.arc(d.x + dx, d.y + dy, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.hue === 'g' ? `rgba(57,224,138,${alpha})` : `rgba(180,220,225,${alpha * 0.8})`;
        ctx.fill();
      }
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        const grad = ctx.createLinearGradient(s.x, s.y - s.len, s.x, s.y);
        grad.addColorStop(0, `rgba(${s.hue},0)`);
        grad.addColorStop(1, `rgba(${s.hue},0.9)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - s.len);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        s.y += s.speed;
        if (s.y - s.len > H) streaks.splice(i, 1);
      }
      rafId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    streakInterval = setInterval(spawnStreak, 1400);
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(streakInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1] h-full w-full" aria-hidden />;
}

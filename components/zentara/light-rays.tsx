"use client";

import { useEffect, useRef } from "react";

/**
 * Raios de luz (estilo "Light Rays") em canvas 2D, sem dependências.
 * Fica fixo atrás do conteúdo, com opacidade baixa. Respeita prefers-reduced-motion.
 */
export function LightRays({ color = "139,92,246", opacity = 0.22, rays = 9 }: { color?: string; opacity?: number; rays?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seeds = Array.from({ length: rays }, (_, i) => ({
      angle: -0.55 + (1.1 * i) / Math.max(1, rays - 1) + (Math.sin(i * 12.9898) * 0.04),
      width: 0.05 + ((i * 37) % 10) / 160,
      speed: 0.25 + ((i * 53) % 10) / 40,
      phase: i * 1.7,
    }));
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const ox = w / 2;
      const oy = -h * 0.12;
      const len = Math.hypot(w, h) * 1.2;
      ctx.globalCompositeOperation = "lighter";
      for (const r of seeds) {
        const a = r.angle + Math.sin(t * 0.00018 * r.speed + r.phase) * 0.06;
        const pulse = 0.55 + 0.45 * Math.sin(t * 0.0006 * r.speed + r.phase);
        const spread = r.width;
        const g = ctx.createLinearGradient(ox, oy, ox + Math.sin(a) * len, oy + Math.cos(a) * len);
        g.addColorStop(0, `rgba(${color},${0.9 * pulse})`);
        g.addColorStop(0.6, `rgba(${color},${0.25 * pulse})`);
        g.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.sin(a - spread) * len, oy + Math.cos(a - spread) * len);
        ctx.lineTo(ox + Math.sin(a + spread) * len, oy + Math.cos(a + spread) * len);
        ctx.closePath();
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [color, rays]);

  return (
    <div aria-hidden="true" data-testid="zentara-fundo" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.35),transparent_60%)]" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full blur-[2px]" style={{ opacity }} />
    </div>
  );
}

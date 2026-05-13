import { useEffect, useRef, memo } from 'react';

/**
 * FloatingElements — Canvas-based ambient particle layer.
 * Replaces the old DOM-heavy Framer Motion particles with a single
 * lightweight canvas that renders soft glowing orbs and connection lines,
 * similar to Apple's subtle product page depth layers.
 *
 * Safe to use on any page. No API/store/hook dependencies.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  hue: number;
}

function createParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x:     Math.random() * w,
    y:     Math.random() * h,
    vx:    (Math.random() - 0.5) * 0.35,
    vy:    (Math.random() - 0.5) * 0.25,
    r:     Math.random() * 2.2 + 0.8,
    alpha: Math.random() * 0.5 + 0.1,
    hue:   Math.random() < 0.6 ? 236 : 198,  // indigo or cyan
  }));
}

const MAX_DIST = 140;

function drawFrame(ctx: CanvasRenderingContext2D, particles: Particle[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);

  // Update positions
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  }

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST) {
        const lineAlpha = (1 - dist / MAX_DIST) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `hsla(236, 80%, 68%, ${lineAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Draw glowing nodes
  for (const p of particles) {
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
    grd.addColorStop(0,   `hsla(${p.hue}, 90%, 70%, ${p.alpha})`);
    grd.addColorStop(0.5, `hsla(${p.hue}, 80%, 58%, ${p.alpha * 0.4})`);
    grd.addColorStop(1,   `hsla(${p.hue}, 70%, 50%, 0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha * 1.4})`;
    ctx.fill();
  }
}

function FloatingElementsBase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = createParticles(canvas.width, canvas.height, 55);
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      drawFrame(ctx, particles, canvas.width, canvas.height);
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.55 }}
      aria-hidden
    />
  );
}

export const FloatingElements = memo(FloatingElementsBase);

/* ── Lightweight SVG Neural Network (for panels / cards) ── */
export const NeuralNetwork = memo(function NeuralNetworkBase() {
  const nodes = [
    { x: 50, y: 20 }, { x: 20, y: 42 }, { x: 80, y: 38 },
    { x: 36, y: 66 }, { x: 64, y: 70 }, { x: 50, y: 88 },
  ];
  const pairs = nodes.flatMap((a, i) =>
    nodes.slice(i + 1)
      .filter(b => {
        const dx = a.x - b.x, dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy) < 38;
      })
      .map((b, j) => ({ x1: `${a.x}%`, y1: `${a.y}%`, x2: `${b.x}%`, y2: `${b.y}%`, key: `${i}-${j}` }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15" aria-hidden>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#6366f1" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        {pairs.map(l => (
          <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="url(#ng)" strokeWidth="0.6" opacity="0.7" />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r="1.6" fill="#818cf8" />
        ))}
      </svg>
    </div>
  );
});

export default FloatingElements;

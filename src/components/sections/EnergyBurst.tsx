'use client';

import { m, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Scroll-driven canvas animation. Four stages keyed off the section's own
 * scroll progress:
 *
 *   0.00–0.20  pulsing dot emitting expanding rings
 *   0.20–0.50  rings shatter into particles, the tin fades in
 *   0.50–0.80  tin holds while particles orbit it like electrons
 *   0.80–1.00  flash, then particles reassemble into the wordmark
 *
 * Plain Canvas 2D and arithmetic — no animation library in the loop.
 */

const ACCENT = { r: 149, g: 97, b: 233 };
const LIGHT = { r: 183, g: 141, b: 255 };
const WHITE = { r: 255, g: 255, b: 255 };
const BG = '#201b24';

// A clean tin, not the marketing composite: hero.png has ingredient callouts
// baked in, which read as clutter once the artwork is spinning.
const CAN_SRC = 'https://loopenergy.ru/images/%D0%92%D0%90%D0%99%D0%9B%D0%95%D0%A2-%D0%A1%D0%9F%D0%9B%D0%AD%D0%A8.png?v=mt21jjez';

type Ring = { radius: number; maxRadius: number; alpha: number; width: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  angle?: number;
  radius?: number;
  speed?: number;
};

type TextParticle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  r: number;
  g: number;
  b: number;
};

const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

export function EnergyBurst() {
  const t = useTranslations('energy_burst');
  const reducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const progressRef = useRef(0);
  const visibleRef = useRef(false);
  const [hintVisible, setHintVisible] = useState(true);

  /** Budgets scale with the device — a phone GPU should not draw 280 sprites. */
  const budgetRef = useRef({ burst: 280, orbital: 60, text: 400 });
  /** CSS-pixel size. All drawing maths uses this, never canvas.width. */
  const sizeRef = useRef({ w: 0, h: 0 });

  const stateRef = useRef({
    rings: [] as Ring[],
    ringTimer: 0,
    particles: [] as Particle[],
    burstSpawned: false,
    orbitals: [] as Particle[],
    orbitalsSpawned: false,
    textParticles: [] as TextParticle[],
    textSpawned: false,
    canImage: null as HTMLImageElement | null,
    canRotation: 0,
    frame: 0,
    fpsFrames: 0,
    fpsSince: 0,
    lowFpsStreak: 0,
  });

  // ── Canvas sizing ──────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      sizeRef.current = { w, h };

      // setTransform, not scale: scale multiplies and would compound on resize.
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = w < 768;
      budgetRef.current = mobile
        ? { burst: 120, orbital: 30, text: 200 }
        : { burst: 280, orbital: 60, text: 400 };
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Scroll progress ────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      progressRef.current = Math.max(0, Math.min(1, -rect.top / scrollable));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hint disappears the moment the visitor takes the cue.
  useEffect(() => {
    const hide = () => setHintVisible(false);
    window.addEventListener('scroll', hide, { once: true, passive: true });
    return () => window.removeEventListener('scroll', hide);
  }, []);

  // ── Spawners ───────────────────────────────────────────────────────────
  const spawnBurst = useCallback((cx: number, cy: number) => {
    return Array.from({ length: budgetRef.current.burst }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const life = 60 + Math.random() * 80;
      const t2 = Math.random();

      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 1.5 + Math.random() * 3,
        r: mix(ACCENT.r, LIGHT.r, t2),
        g: mix(ACCENT.g, LIGHT.g, t2),
        b: mix(ACCENT.b, LIGHT.b, t2),
        alpha: 0.8 + Math.random() * 0.2,
      };
    });
  }, []);

  const spawnOrbitals = useCallback((cx: number, cy: number) => {
    const count = budgetRef.current.orbital;

    return Array.from({ length: count }, (_, i) => {
      const radius = 140 + Math.random() * 120;
      const angle = (i / count) * Math.PI * 2;
      const t2 = Math.random();

      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        life: Infinity,
        maxLife: Infinity,
        size: 1 + Math.random() * 2.5,
        r: mix(ACCENT.r, WHITE.r, t2 * 0.5),
        g: mix(ACCENT.g, WHITE.g, t2 * 0.5),
        b: mix(ACCENT.b, WHITE.b, t2 * 0.5),
        alpha: 0.4 + Math.random() * 0.6,
        angle,
        radius,
        speed: (0.008 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1),
      };
    });
  }, []);

  /** Rasterises the wordmark offscreen and samples opaque pixels as targets. */
  const spawnTextParticles = useCallback((w: number, h: number, cy: number) => {
    const off = document.createElement('canvas');
    off.width = Math.round(w);
    off.height = Math.round(h);

    const octx = off.getContext('2d');
    if (!octx) return [];

    const fontSize = Math.min(w / 8, 80);
    octx.font = `900 ${fontSize}px Montserrat, system-ui, sans-serif`;
    octx.fillStyle = '#fff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText('LOOP ENERGY', w / 2, cy);

    const { data } = octx.getImageData(0, 0, off.width, off.height);
    const targets: { tx: number; ty: number }[] = [];

    for (let y = 0; y < off.height; y += 4) {
      for (let x = 0; x < off.width; x += 4) {
        if (data[(y * off.width + x) * 4 + 3] > 128) targets.push({ tx: x, ty: y });
      }
    }

    // Even sampling beats a shuffle: it keeps letters legible at low budgets.
    const budget = budgetRef.current.text;
    const stride = Math.max(1, Math.floor(targets.length / budget));
    const picked = targets.filter((_, i) => i % stride === 0).slice(0, budget);

    return picked.map(({ tx, ty }) => {
      const t2 = Math.random();
      return {
        x: w / 2 + (Math.random() - 0.5) * w,
        y: cy + (Math.random() - 0.5) * h,
        tx,
        ty,
        vx: 0,
        vy: 0,
        size: 1 + Math.random() * 2,
        alpha: 0,
        r: mix(ACCENT.r, WHITE.r, t2),
        g: mix(ACCENT.g, WHITE.g, t2),
        b: mix(ACCENT.b, WHITE.b, t2),
      };
    });
  }, []);

  // ── Frame ──────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    rafRef.current = requestAnimationFrame(draw);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Off-screen: keep the loop alive but skip the work.
    if (!visibleRef.current) return;

    const s = stateRef.current;
    const { w, h } = sizeRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const p = progressRef.current;

    s.frame += 1;

    // Sustained low frame rate: halve the budgets once, then stop measuring.
    s.fpsFrames += 1;
    const now = performance.now();
    if (!s.fpsSince) s.fpsSince = now;
    if (now - s.fpsSince >= 1000) {
      const fps = (s.fpsFrames * 1000) / (now - s.fpsSince);
      s.fpsFrames = 0;
      s.fpsSince = now;

      if (fps < 30) {
        s.lowFpsStreak += 1;
        if (s.lowFpsStreak === 3) {
          s.particles = s.particles.slice(0, 80);
          s.orbitals = s.orbitals.slice(0, 20);
          budgetRef.current = { burst: 80, orbital: 20, text: 160 };
        }
      } else {
        s.lowFpsStreak = 0;
      }
    }

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    // Scrolling back up rewinds the sequence instead of leaving it spent.
    if (p < 0.18 && s.burstSpawned) {
      s.burstSpawned = false;
      s.particles = [];
    }
    if (p < 0.48 && s.orbitalsSpawned) {
      s.orbitalsSpawned = false;
      s.orbitals = [];
    }
    if (p < 0.82 && s.textSpawned) {
      s.textSpawned = false;
      s.textParticles = [];
    }

    // ── Stage 1: pulsing core, emitting rings ──
    if (p < 0.5) {
      const stage = Math.min(1, p / 0.2);
      const pulse = Math.sin(s.frame * 0.08) * 0.5 + 0.5;
      const dot = (8 + pulse * 12) * (1 - stage * 0.5);
      const alpha = 0.6 + pulse * 0.4;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, dot * 4);
      glow.addColorStop(0, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${alpha * 0.4})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(cx, cy, dot, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${LIGHT.r},${LIGHT.g},${LIGHT.b},${alpha})`;
      ctx.fill();

      s.ringTimer += 1;
      if (s.ringTimer >= Math.max(8, 30 - stage * 22)) {
        s.ringTimer = 0;
        s.rings.push({ radius: 0, maxRadius: Math.min(cx, cy) * 1.8, alpha: 0.8, width: 2 + Math.random() * 2 });
      }
    }

    s.rings = s.rings.filter((ring) => ring.alpha > 0.01);
    for (const ring of s.rings) {
      ring.radius += 4 + (ring.radius / ring.maxRadius) * 8;
      ring.alpha *= 0.94;

      ctx.beginPath();
      ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${ring.alpha})`;
      ctx.lineWidth = ring.width;
      ctx.stroke();
    }

    // ── Stage 2: burst, then the tin resolves out of it ──
    if (p >= 0.18 && !s.burstSpawned) {
      s.particles = spawnBurst(cx, cy);
      s.burstSpawned = true;
    }

    if (p >= 0.2) {
      const stage = Math.min(1, (p - 0.2) / 0.3);

      s.particles = s.particles.filter((pt) => pt.life > 0);
      for (const pt of s.particles) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.97;
        pt.vy *= 0.97;
        pt.life -= 1;

        const a = (pt.life / pt.maxLife) * pt.alpha;
        const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size * 3);
        glow.addColorStop(0, `rgba(${pt.r},${pt.g},${pt.b},${a * 0.6})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pt.r},${pt.g},${pt.b},${a})`;
        ctx.fill();
      }

      if (s.canImage && p < 0.8) {
        const held = p >= 0.5;
        const alpha = held ? 1 : Math.min(1, stage * 2.5);
        const scale = held ? 1 : 0.3 + stage * 0.7;
        const size = Math.min(w, h) * 0.55 * scale;
        s.canRotation += held ? 0.004 : 0.003;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(s.canRotation);

        const pulse = Math.sin(s.frame * 0.05) * 0.5 + 0.5;
        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.9);
        halo.addColorStop(0, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(held ? 0.2 + pulse * 0.15 : alpha * 0.35)})`);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(-size, -size, size * 2, size * 2);

        ctx.drawImage(s.canImage, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }

    // ── Stage 3: electrons on elliptical orbits ──
    if (p >= 0.48 && !s.orbitalsSpawned) {
      s.orbitals = spawnOrbitals(cx, cy);
      s.orbitalsSpawned = true;
    }

    if (p >= 0.5 && p < 0.82) {
      const stage = Math.min(1, (p - 0.5) / 0.3);

      s.orbitals.forEach((pt, index) => {
        if (pt.angle === undefined || pt.speed === undefined || pt.radius === undefined) return;
        pt.angle += pt.speed;

        pt.x = cx + Math.cos(pt.angle) * pt.radius;
        // Flattened ellipse reads as an orbit tilted away from the viewer.
        pt.y = cy + Math.sin(pt.angle) * pt.radius * 0.35;

        const depth = (Math.sin(pt.angle) + 1) / 2;
        const size = pt.size * (0.5 + depth * 0.5);
        const alpha = pt.alpha * (0.3 + depth * 0.7) * Math.min(1, stage * 3);

        if (index % 8 === 0) {
          ctx.font = `${size * 8}px system-ui, sans-serif`;
          ctx.fillStyle = `rgba(${pt.r},${pt.g},${pt.b},${alpha})`;
          ctx.fillText('⚡', pt.x - size * 4, pt.y + size * 3);
          return;
        }

        const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size * 4);
        glow.addColorStop(0, `rgba(${pt.r},${pt.g},${pt.b},${alpha * 0.8})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pt.r},${pt.g},${pt.b},${alpha})`;
        ctx.fill();
      });
    }

    // ── Stage 4: flash, then the wordmark assembles ──
    if (p >= 0.8) {
      const stage = Math.min(1, (p - 0.8) / 0.2);
      const flash = Math.max(0, stage < 0.3 ? stage / 0.3 : 1 - (stage - 0.3) / 0.7);

      if (s.canImage && stage < 1) {
        const alpha = 1 - stage;
        if (alpha > 0) {
          const size = Math.min(w, h) * 0.55;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(cx, cy);
          ctx.rotate(s.canRotation);
          ctx.drawImage(s.canImage, -size / 2, -size / 2, size, size);
          ctx.restore();
        }
      }

      if (flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flash * 0.55})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (stage > 0.25 && !s.textSpawned) {
        s.textParticles = spawnTextParticles(w, h, cy);
        s.textSpawned = true;
      }

      if (s.textSpawned) {
        const assembled = Math.min(1, (stage - 0.25) / 0.75);

        for (const tp of s.textParticles) {
          tp.vx += (tp.tx - tp.x) * 0.12;
          tp.vy += (tp.ty - tp.y) * 0.12;
          tp.vx *= 0.75;
          tp.vy *= 0.75;
          tp.x += tp.vx;
          tp.y += tp.vy;
          tp.alpha = Math.min(1, assembled * 2);

          const glow = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tp.size * 2);
          glow.addColorStop(0, `rgba(${tp.r},${tp.g},${tp.b},${tp.alpha})`);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, tp.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [spawnBurst, spawnOrbitals, spawnTextParticles]);

  // ── Run only while the section is on screen ────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;

        // Fetch the tin only once the section is close — loading it on mount
        // would compete with the hero image for the LCP.
        if (entry.isIntersecting && !stateRef.current.canImage) {
          const img = new Image();
          // No crossOrigin: loopenergy.ru sends no CORS header, so the request
          // would fail outright. We only drawImage, never read pixels back.
          img.src = CAN_SRC;
          img.onload = () => {
            stateRef.current.canImage = img;
          };
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw, reducedMotion]);

  if (reducedMotion) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center" aria-label={t('aria_label')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CAN_SRC}
          alt={t('still_alt')}
          className="max-h-[60vh] w-[min(420px,80vw)] object-contain"
        />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      aria-label={t('aria_label')}
      className="relative h-[300vh] md:h-[400vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />

        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-fluid-xs font-semibold uppercase tracking-[0.2em] text-w-50"
          animate={hintVisible ? { opacity: [0.4, 0.85, 0.4], y: [0, 6, 0] } : { opacity: 0 }}
          transition={
            hintVisible
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        >
          {t('scroll_hint')}
          <ChevronDown className="h-6 w-6" aria-hidden="true" />
        </m.div>
      </div>
    </section>
  );
}

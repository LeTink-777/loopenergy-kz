'use client';

import { m, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useHydrated } from '@/hooks/useHydrated';

/**
 * Scroll-driven canvas sequence. Five stages, keyed off this section's own
 * scroll progress rather than a clock, so the visitor drives the playhead:
 *
 *   0.00–0.20  the sealed tin hovers and turns
 *   0.20–0.50  it splits down the middle — lid up, base down
 *   0.50–0.65  a pouch rises out of the gap
 *   0.65–0.85  the pouch detonates into a particle burst
 *   0.85–1.00  the particles settle into the LOOP ENERGY wordmark
 *
 * Every particle is a pure function of progress — no integrated velocity, no
 * decrementing lifetimes. Scrubbing backwards rewinds exactly, a fast scroll
 * lands on the same frame as a slow one, and nothing is half-spent by the time
 * the visitor arrives. Only the idle shimmer reads the clock.
 *
 * Canvas 2D and arithmetic only — no animation library inside the frame loop.
 */

const BG = '#201b24';
const ACCENT = { r: 149, g: 97, b: 233 };
const LIGHT = { r: 183, g: 141, b: 255 };
const WHITE = { r: 255, g: 255, b: 255 };

const CAN_SRC = '/assets/brand/can-hero.webp';

// Stage boundaries live together so the timeline reads in one place.
const SPLIT_IN = 0.2;
const POUCH_IN = 0.5;
const BURST_IN = 0.65;
const WORD_IN = 0.85;

type Particle = {
  ox: number;
  oy: number;
  angle: number;
  /** Reach at full spread, as a fraction of the frame's short side. */
  speed: number;
  drift: number;
  size: number;
  twinkle: number;
  sprite: HTMLCanvasElement;
};

type TextParticle = {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  /** Staggers arrival so the wordmark condenses instead of snapping. */
  delay: number;
  size: number;
  twinkle: number;
  sprite: HTMLCanvasElement;
};

type Rgb = { r: number; g: number; b: number };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
/** Lands just past the target and settles back — reads as mass, not tweening. */
const easeOutBack = (t: number) => 1 + 2.1 * (t - 1) ** 3 + 1.1 * (t - 1) ** 2;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * One radial-gradient blob, rasterised once. Building a gradient per particle
 * per frame is what actually costs frames at several hundred sprites; a
 * `drawImage` of a pre-baked sprite is a blit. The hard-ish core keeps letter
 * strokes crisp — a pure falloff turns the smaller line of the wordmark to mush.
 */
const SPRITE_HALF = 32;
/** A burst wants bloom; the wordmark wants legible strokes. */
const BURST_SCALE = 8;
const WORD_SCALE = 4;

function glowSprite({ r, g, b }: Rgb) {
  const c = document.createElement('canvas');
  c.width = SPRITE_HALF * 2;
  c.height = SPRITE_HALF * 2;

  const ctx = c.getContext('2d');
  if (!ctx) return c;

  const grd = ctx.createRadialGradient(SPRITE_HALF, SPRITE_HALF, 0, SPRITE_HALF, SPRITE_HALF, SPRITE_HALF);
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grd.addColorStop(0.3, `rgba(${r},${g},${b},0.95)`);
  grd.addColorStop(0.44, `rgba(${r},${g},${b},0.3)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

/** Eight sprites spanning `from`→`to`, so a swarm varies in hue for free. */
function spritePalette(from: Rgb, to: Rgb) {
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    return glowSprite({
      r: Math.round(mix(from.r, to.r, t)),
      g: Math.round(mix(from.g, to.g, t)),
      b: Math.round(mix(from.b, to.b, t)),
    });
  });
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/** Cap height of the wordmark's top line. Both the sampled raster and the
 *  crisp reveal derive every offset from this, so they cannot drift apart. */
const wordmarkUnit = (w: number, h: number) => Math.min(w * 0.26, h * 0.3, 210);

/**
 * Draws the wordmark the way the brand sets it — LOOP in white over ENERGY in
 * accent. `alpha` of 0 is the particle-only state, 1 the resolved logo.
 */
function drawWordmark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  unit: number,
  family: string,
  alpha: number,
  glow = true,
) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // The offscreen pass samples this by alpha, and a bloom would fatten every
  // glyph into a fuzzy halo of targets — so it only glows on screen.
  if (glow) {
    ctx.shadowColor = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${0.75 * alpha})`;
    ctx.shadowBlur = unit * 0.3;
  }

  ctx.font = `900 ${unit}px ${family}`;
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.fillText('LOOP', cx, cy - unit * 0.34);

  ctx.font = `900 ${unit * 0.44}px ${family}`;
  ctx.fillStyle = `rgba(${LIGHT.r},${LIGHT.g},${LIGHT.b},${alpha})`;
  ctx.fillText('ENERGY', cx, cy + unit * 0.46);
  ctx.restore();
}

/** `roundRect` only landed in Safari 16.4, and the fallback is four arcs. */
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function CanAnimation() {
  const t = useTranslations('can_animation');
  const reducedMotion = useReducedMotion();
  // The server cannot know the motion preference, so it always renders the
  // canvas. Swapping to the still before hydration would mismatch that HTML and
  // make React discard the tree; the section sits below the fold, so the
  // collapse to a still costs no visible shift.
  const hydrated = useHydrated();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const progressRef = useRef(0);
  const visibleRef = useRef(false);
  const [hintVisible, setHintVisible] = useState(true);

  /** Budgets scale with the device — a phone GPU should not draw 320 sprites. */
  const budgetRef = useRef({ burst: 340, text: 900, sparks: 22 });
  /** CSS-pixel size. Every drawing maths uses this, never `canvas.width`. */
  const sizeRef = useRef({ w: 0, h: 0 });
  /**
   * The canvas `font` shorthand is parsed by the canvas, not by CSS, so it
   * cannot resolve `var(--font-montserrat)`. Resolve the stack off the DOM once
   * and hand the canvas a literal family list.
   */
  const familyRef = useRef('Montserrat, system-ui, sans-serif');

  const stateRef = useRef({
    canImage: null as HTMLImageElement | null,
    frame: 0,
    spin: 0,
    spinLock: 0,
    spinLocked: false,
    burst: [] as Particle[],
    burstSpawned: false,
    word: [] as TextParticle[],
    wordSpawned: false,
    burstPalette: [] as HTMLCanvasElement[],
    wordPalette: [] as HTMLCanvasElement[],
    fpsFrames: 0,
    fpsSince: 0,
    lowFpsStreak: 0,
  });

  // ── Sprite palettes and the resolved font stack ────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    s.burstPalette = spritePalette(ACCENT, LIGHT);
    s.wordPalette = spritePalette(LIGHT, WHITE);

    const host = canvasRef.current ?? document.body;
    const family = window.getComputedStyle(host).fontFamily;
    if (family) familyRef.current = family;
  }, []);

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

      // Both swarms are laid out in the old frame's pixels — drop them so the
      // next frame re-derives them at the new size.
      const s = stateRef.current;
      s.wordSpawned = false;
      s.word = [];
      s.burstSpawned = false;
      s.burst = [];

      budgetRef.current =
        w < 768 ? { burst: 160, text: 420, sparks: 12 } : { burst: 340, text: 900, sparks: 22 };
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

      progressRef.current = clamp01(-rect.top / scrollable);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The hint disappears the moment the visitor takes the cue.
  useEffect(() => {
    const hide = () => setHintVisible(false);
    window.addEventListener('scroll', hide, { once: true, passive: true });
    return () => window.removeEventListener('scroll', hide);
  }, []);

  // ── Spawners ───────────────────────────────────────────────────────────

  /** The pouch shreds: particles start inside its silhouette, not at a point. */
  const spawnBurst = useCallback((cx: number, cy: number, pw: number, ph: number) => {
    const palette = stateRef.current.burstPalette;
    if (!palette.length) return [];

    return Array.from({ length: budgetRef.current.burst }, () => ({
      ox: cx + (Math.random() - 0.5) * pw,
      oy: cy + (Math.random() - 0.5) * ph,
      angle: Math.random() * Math.PI * 2,
      // Skewed so most of the swarm stays in frame and a few outrun it.
      speed: 0.14 + Math.random() ** 1.6 * 0.72,
      drift: (Math.random() - 0.25) * 0.12,
      size: 1.6 + Math.random() * 3.4,
      twinkle: Math.random() * Math.PI * 2,
      sprite: pick(palette),
    }));
  }, []);

  /** Rasterises the wordmark offscreen and samples opaque pixels as targets. */
  const spawnWordParticles = useCallback((w: number, h: number, cy: number) => {
    const palette = stateRef.current.wordPalette;
    if (!palette.length) return [];

    // Half-scale sampling: a quarter of the pixels to read back, and the
    // 2px lattice it implies is finer than the particles anyway.
    const scale = 0.5;
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.round(w * scale));
    off.height = Math.max(1, Math.round(h * scale));

    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return [];

    drawWordmark(octx, off.width / 2, cy * scale, wordmarkUnit(w, h) * scale, familyRef.current, 1, false);

    const { data } = octx.getImageData(0, 0, off.width, off.height);
    const targets: { tx: number; ty: number }[] = [];

    for (let y = 0; y < off.height; y += 2) {
      for (let x = 0; x < off.width; x += 2) {
        if (data[(y * off.width + x) * 4 + 3] > 128) targets.push({ tx: x / scale, ty: y / scale });
      }
    }
    if (!targets.length) return [];

    // Even sampling beats a shuffle: it keeps the letters legible at low
    // budgets, where a random subset leaves holes in the strokes.
    // A fractional stride, so a budget that does not divide the target count
    // still spends all of it — flooring to 1 would blow past the budget.
    const stride = Math.max(1, targets.length / budgetRef.current.text);
    const picked: { tx: number; ty: number }[] = [];
    for (let i = 0; i < targets.length; i += stride) picked.push(targets[Math.floor(i)]);

    return picked.map(({ tx, ty }) => {
      // They fly in from beyond the rim, the way the burst left the frame.
      const angle = Math.random() * Math.PI * 2;
      const reach = 0.62 + Math.random() * 0.5;

      return {
        sx: w / 2 + Math.cos(angle) * w * reach,
        sy: cy + Math.sin(angle) * h * reach,
        tx,
        ty,
        delay: Math.random() * 0.42,
        size: 1.1 + Math.random() * 1.5,
        twinkle: Math.random() * Math.PI * 2,
        sprite: pick(palette),
      };
    });
  }, []);

  // ── Frame ──────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    rafRef.current = requestAnimationFrame(draw);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Off screen: keep the loop alive but skip the work.
    if (!visibleRef.current) return;

    const s = stateRef.current;
    const { w, h } = sizeRef.current;
    if (!w || !h) return;

    const cx = w / 2;
    const cy = h / 2;
    const p = progressRef.current;
    const unit = Math.min(w, h);
    const canSize = unit * 0.62;
    // Sprite radii are authored in desktop pixels. Left unscaled, a phone gets
    // the same 40px blobs across a third of the width, and the swarm reads as
    // a handful of smudges instead of a spray.
    const sizeScale = Math.min(1.15, Math.max(0.5, unit / 900));

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
          budgetRef.current = { burst: 110, text: 320, sparks: 8 };
          s.burstSpawned = false;
          s.burst = [];
          s.wordSpawned = false;
          s.word = [];
        }
      } else {
        s.lowFpsStreak = 0;
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    // Scrolling back up rewinds the sequence instead of leaving it spent.
    if (p < SPLIT_IN && s.spinLocked) s.spinLocked = false;

    // ── Stages 1–2: the tin hovers, turns, then splits ────────────────────
    // Both halves are the same image under one rotated transform, so at
    // separation 0 they reassemble seamlessly and stage 1 needs no special case.
    const splitT = easeInOut(clamp01((p - SPLIT_IN) / (POUCH_IN - SPLIT_IN)));
    // Once the pouch is out the halves keep drifting clear of the frame.
    const driftT = easeOut(clamp01((p - POUCH_IN) / (BURST_IN - POUCH_IN)));
    const tinAlpha = clamp01(p / 0.05) * (1 - clamp01((p - 0.56) / 0.1));

    // The tin also recedes as it opens, which is what buys the halves room to
    // separate without either of them sliding off the top or bottom edge.
    const drawn = canSize * mix(mix(0.86, 1, clamp01(p / 0.06)), 0.78, splitT);
    const gap = canSize * (0.34 * splitT + 0.5 * driftT);

    if (s.canImage && tinAlpha > 0.01) {
      if (p < SPLIT_IN) {
        s.spin += 0.004;
      } else if (!s.spinLocked) {
        s.spinLock = s.spin;
        s.spinLocked = true;
      }

      // The spin unwinds to level over the first sliver of the split, so the
      // tin cracks along a horizontal seam rather than a tumbling one.
      const rot = p < SPLIT_IN ? s.spin : s.spinLock * (1 - easeOut(clamp01((p - SPLIT_IN) / 0.08)));

      const bob = Math.sin(s.frame * 0.02) * unit * 0.012 * (1 - splitT);

      ctx.save();
      ctx.translate(cx, cy + bob);
      ctx.rotate(rot);
      ctx.globalAlpha = tinAlpha;

      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, canSize * 0.95);
      const pulse = Math.sin(s.frame * 0.045) * 0.5 + 0.5;
      halo.addColorStop(0, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${0.18 + pulse * 0.12})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(-canSize, -canSize, canSize * 2, canSize * 2);

      if (gap < 0.5) {
        // Whole tin: no clip, so no antialiased hairline down the middle.
        ctx.drawImage(s.canImage, -drawn / 2, -drawn / 2, drawn, drawn);
      } else {
        // Each half is clipped to its own half of the *artwork*, not to a half
        // of the frame. Clipping in frame space shows the band between the two
        // cut edges twice — once in each half — which reads as a broken image.
        // Both rects still live in the tin's rotated space, which is why the
        // seam tilts with whatever spin is left to unwind.
        ctx.save();
        ctx.beginPath();
        ctx.rect(-w * 2, -h * 2, w * 4, h * 2 - gap);
        ctx.clip();
        ctx.drawImage(s.canImage, -drawn / 2, -gap - drawn / 2, drawn, drawn);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.rect(-w * 2, gap, w * 4, h * 2);
        ctx.clip();
        ctx.drawImage(s.canImage, -drawn / 2, gap - drawn / 2, drawn, drawn);
        ctx.restore();
      }

      // What the tin is holding, leaking out of the gap as it opens.
      if (splitT > 0.01) {
        ctx.globalCompositeOperation = 'lighter';

        // A lit edge on each cut face. Without it the two halves read as a
        // picture that failed to load rather than an object sliced open.
        const edgeW = drawn * 0.92;
        const edgeH = Math.max(1.5, unit * 0.004);
        const edge = ctx.createLinearGradient(-edgeW / 2, 0, edgeW / 2, 0);
        edge.addColorStop(0, 'rgba(183,141,255,0)');
        edge.addColorStop(0.5, `rgba(${WHITE.r},${WHITE.g},${WHITE.b},${0.85 * splitT})`);
        edge.addColorStop(1, 'rgba(183,141,255,0)');
        ctx.fillStyle = edge;
        ctx.fillRect(-edgeW / 2, -gap - edgeH, edgeW, edgeH);
        ctx.fillRect(-edgeW / 2, gap, edgeW, edgeH);

        const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, canSize * 0.75 * splitT);
        bloom.addColorStop(0, `rgba(${LIGHT.r},${LIGHT.g},${LIGHT.b},${0.5 * splitT})`);
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(-canSize, -canSize, canSize * 2, canSize * 2);

        // Sparks escaping the gap. Positions are a function of frame and index,
        // so they cost no state and rewind for free when the visitor scrolls up.
        const sparks = s.burstPalette.length ? budgetRef.current.sparks : 0;
        for (let i = 0; i < sparks; i += 1) {
          const seed = Math.sin(i * 12.9898) * 43758.5453;
          const jitter = seed - Math.floor(seed);
          const phase = ((s.frame * 0.012 + i / sparks) % 1 + 1) % 1;
          const dir = i % 2 === 0 ? -1 : 1;
          const sx = (jitter - 0.5) * edgeW * 0.85;
          const sy = dir * (gap * 0.15 + phase * gap * 0.85);
          const a = (1 - phase) * splitT * 0.9;
          const r = unit * 0.006 * (0.5 + jitter);

          ctx.globalAlpha = tinAlpha * a;
          ctx.drawImage(s.burstPalette[i % s.burstPalette.length], sx - r * 4, sy - r * 4, r * 8, r * 8);
        }
        ctx.globalAlpha = tinAlpha;
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // ── Stage 3: the pouch rises out of the gap ───────────────────────────
    const pouchW = unit * 0.19;
    const pouchH = unit * 0.33;

    if (p >= POUCH_IN && p < BURST_IN) {
      const stage = clamp01((p - POUCH_IN) / (BURST_IN - POUCH_IN));
      const rise = easeOut(stage);
      const tilt = Math.sin(s.frame * 0.03) * 0.05 * (1 - rise * 0.6);

      ctx.save();
      ctx.translate(cx, cy + unit * 0.14 * (1 - rise));
      ctx.rotate(tilt);
      ctx.scale(mix(0.35, 1, rise), mix(0.35, 1, rise));
      ctx.globalAlpha = clamp01(stage * 3);

      ctx.shadowColor = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.65)`;
      ctx.shadowBlur = unit * 0.06;

      const body = ctx.createLinearGradient(-pouchW / 2, -pouchH / 2, pouchW / 2, pouchH / 2);
      body.addColorStop(0, `rgb(${LIGHT.r},${LIGHT.g},${LIGHT.b})`);
      body.addColorStop(0.55, `rgb(${ACCENT.r},${ACCENT.g},${ACCENT.b})`);
      body.addColorStop(1, 'rgb(95,54,160)');

      roundRectPath(ctx, -pouchW / 2, -pouchH / 2, pouchW, pouchH, pouchW * 0.22);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crimped top seam, the way a real sachet is sealed.
      ctx.save();
      roundRectPath(ctx, -pouchW / 2, -pouchH / 2, pouchW, pouchH, pouchW * 0.22);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(-pouchW / 2, -pouchH / 2, pouchW, pouchH * 0.12);
      ctx.fillRect(-pouchW / 2, pouchH * 0.38, pouchW, pouchH * 0.12);

      // Sheen sweeping across the face.
      const sheenX = Math.sin(s.frame * 0.02) * pouchW * 0.3;
      const sheen = ctx.createLinearGradient(sheenX - pouchW * 0.3, -pouchH / 2, sheenX + pouchW * 0.3, pouchH / 2);
      sheen.addColorStop(0, 'rgba(255,255,255,0)');
      sheen.addColorStop(0.5, 'rgba(255,255,255,0.22)');
      sheen.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(-pouchW / 2, -pouchH / 2, pouchW, pouchH);
      ctx.restore();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${pouchW * 0.3}px ${familyRef.current}`;
      ctx.fillText('LOOP', 0, -pouchH * 0.08);
      ctx.font = `700 ${pouchW * 0.16}px ${familyRef.current}`;
      ctx.fillText('ENERGY', 0, pouchH * 0.06);

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // ── Stage 4: the pouch detonates ──────────────────────────────────────
    // Overlaps stage 5 slightly, so the burst is still fading while the
    // wordmark starts pulling itself together out of it.
    if (p >= BURST_IN && p < WORD_IN + 0.07) {
      const stage = clamp01((p - BURST_IN) / (WORD_IN - BURST_IN));

      if (!s.burstSpawned) {
        s.burst = spawnBurst(cx, cy, pouchW, pouchH);
        s.burstSpawned = true;
      }

      if (stage < 0.14) {
        const flash = 1 - stage / 0.14;
        ctx.fillStyle = `rgba(255,255,255,${flash * 0.65})`;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = 'lighter';

      // Shockwave.
      if (stage < 0.6) {
        const ring = easeOut(stage / 0.6);
        ctx.beginPath();
        ctx.arc(cx, cy, unit * 0.95 * ring, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${LIGHT.r},${LIGHT.g},${LIGHT.b},${(1 - ring) * 0.75})`;
        ctx.lineWidth = unit * 0.016 * (1 - ring) + 1;
        ctx.stroke();
      }

      const spread = easeOut(stage);
      // Hands the frame over to the wordmark rather than cutting to it.
      const handoff = 1 - clamp01((p - WORD_IN) / 0.07);
      const fade = (1 - stage ** 1.7) * clamp01(stage * 12) * handoff;

      for (const pt of s.burst) {
        const travel = pt.speed * unit * spread;
        const x = pt.ox + Math.cos(pt.angle) * travel;
        const y = pt.oy + Math.sin(pt.angle) * travel + pt.drift * unit * stage * stage;

        const a = fade * (0.78 + 0.22 * Math.sin(s.frame * 0.16 + pt.twinkle));
        if (a < 0.02) continue;

        const d = pt.size * BURST_SCALE * sizeScale;
        ctx.globalAlpha = a;
        ctx.drawImage(pt.sprite, x - d / 2, y - d / 2, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    } else if (s.burstSpawned && p < BURST_IN) {
      s.burstSpawned = false;
      s.burst = [];
    }

    // ── Stage 5: the swarm settles into the wordmark ──────────────────────
    if (p >= WORD_IN) {
      const stage = clamp01((p - WORD_IN) / (1 - WORD_IN));

      if (!s.wordSpawned) {
        s.word = spawnWordParticles(w, h, cy);
        s.wordSpawned = true;
      }

      // The swarm is home well before the end, which leaves the last stretch
      // to resolve it into the mark instead of stopping on a cloud of dots —
      // several hundred sprites will never be as legible as the letterforms.
      const SETTLE = 0.82;
      const reveal = clamp01((stage - 0.46) / 0.42);

      ctx.globalCompositeOperation = 'lighter';

      for (const tp of s.word) {
        const local = clamp01((stage - tp.delay) / (SETTLE - tp.delay));
        if (local <= 0) continue;

        const k = easeOutBack(local);
        const x = mix(tp.sx, tp.tx, k);
        const y = mix(tp.sy, tp.ty, k);

        // They dim as the letters take over, so the mark stays clean rather
        // than blown out by the swarm sitting on top of it.
        ctx.globalAlpha =
          clamp01(local * 3) *
          (1 - reveal * 0.55) *
          (0.82 + 0.18 * Math.sin(s.frame * 0.05 + tp.twinkle));

        const d = tp.size * WORD_SCALE * sizeScale;
        ctx.drawImage(tp.sprite, x - d / 2, y - d / 2, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (reveal > 0) {
        drawWordmark(ctx, cx, cy, wordmarkUnit(w, h), familyRef.current, reveal);
      }
    } else if (s.wordSpawned) {
      s.wordSpawned = false;
      s.word = [];
    }
  }, [spawnBurst, spawnWordParticles]);

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
          img.src = CAN_SRC;
          img.decoding = 'async';
          img.onload = () => {
            stateRef.current.canImage = img;
          };
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);

    // The wordmark is sampled from rendered text, so it has to wait for
    // Montserrat — fallback metrics would sample a different shape.
    document.fonts?.ready.then(() => {
      // Re-sample against the real face, not the fallback metrics.
      stateRef.current.wordSpawned = false;
      stateRef.current.word = [];
    });

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw, reducedMotion]);

  if (hydrated && reducedMotion) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center" aria-label={t('aria_label')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CAN_SRC}
          alt={t('still_alt')}
          width={1200}
          height={1200}
          className="max-h-[60vh] w-[min(420px,80vw)] object-contain"
        />
      </section>
    );
  }

  return (
    <section ref={containerRef} aria-label={t('aria_label')} className="relative h-[300vh] md:h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />

        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-fluid-xs font-semibold uppercase tracking-[0.2em] text-w-50"
          animate={hintVisible ? { opacity: [0.4, 0.85, 0.4], y: [0, 6, 0] } : { opacity: 0 }}
          transition={hintVisible ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        >
          {t('scroll_hint')}
          <ChevronDown className="h-6 w-6" aria-hidden="true" />
        </m.div>
      </div>
    </section>
  );
}

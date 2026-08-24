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
/**
 * The brand's own render sequence. Only 0-109 ship: stage 1 turns the sealed
 * tin (0-29) and stage 2 opens it (30-109); everything after that is drawn,
 * not filmed, so frames 110-180 would be 1.1MB nobody downloads for nothing.
 *
 * The site these came from composited them into a 2480x1670 canvas and drew a
 * 835px source crop out of it. These files are already the cropped artwork at
 * 820x820, so that source rect would run 217px past their right edge and cut
 * the tin — the whole frame is drawn instead.
 */
const FRAME_FIRST_OPEN = 30;
/** The whole sequence now: the tin opens and releases its own sachet. */
const FRAME_LAST = 180;
/** Where the sachet detonates. */
const BURST_FRAME = 130;

/**
 * Where the sachet sits at the moment it goes, in 0..1 of the drawn artwork.
 * Measured off frame 130 rather than assumed: (380, 462) of the 820px frame at
 * 76x66 — up and left of the middle, and about 9% of it, not a third.
 */
const SACHET_AT_BURST = { x: 380 / 820, y: 462 / 820, w: 76 / 820, h: 66 / 820 };

const FRAME_SRC = (n: number) => `/animation/frames/energy_web__${String(n).padStart(5, '0')}.webp`;
const LOGO_SRC = '/assets/brand/logo.svg';

/** The sequence occupies the first 85% of the scroll; the wordmark the rest. */
const FRAMES_END = 0.85;
/** Progress at which the sachet detonates, read off BURST_FRAME. */
const BURST_IN = (BURST_FRAME / FRAME_LAST) * FRAMES_END;
const WORD_IN = FRAMES_END;

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
const BURST_SCALE = 5;
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

/**
 * Where the wordmark sits, in CSS pixels. The offscreen pass the particles aim
 * at and the crisp reveal both derive from this, so they cannot drift apart.
 */
function logoRect(w: number, h: number, cy: number, logo: HTMLImageElement) {
  const width = Math.min(w * 0.62, h * 1.2, 860);
  const ratio = logo.naturalHeight / logo.naturalWidth || 42 / 83;
  const height = width * ratio;
  return { x: w / 2 - width / 2, y: cy - height / 2, w: width, h: height };
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
  const budgetRef = useRef({ burst: 800, text: 900, sparks: 22 });
  /** CSS-pixel size. Every drawing maths uses this, never `canvas.width`. */
  const sizeRef = useRef({ w: 0, h: 0 });
  const stateRef = useRef({
    frames: [] as HTMLImageElement[],
    framesReady: 0,
    logoImage: null as HTMLImageElement | null,
    frame: 0,
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

  // ── Sprite palettes ────────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    s.burstPalette = spritePalette(ACCENT, LIGHT);
    s.wordPalette = spritePalette(LIGHT, WHITE);
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
        w < 768 ? { burst: 400, text: 420, sparks: 12 } : { burst: 800, text: 900, sparks: 22 };
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
      // 1.15 so a few land just outside the outline — a clean rectangle of
      // particles reads as a rectangle, not as something coming apart.
      ox: cx + (Math.random() - 0.5) * pw * 1.15,
      oy: cy + (Math.random() - 0.5) * ph * 1.15,
      angle: Math.random() * Math.PI * 2,
      // Skewed so most of the swarm stays in frame and a few outrun it.
      speed: 0.2 + Math.random() ** 1.5 * 0.95,
      drift: (Math.random() - 0.25) * 0.12,
      size: 2 + Math.random() * 3,
      twinkle: Math.random() * Math.PI * 2,
      sprite: pick(palette),
    }));
  }, []);

  /** Rasterises the lockup offscreen and samples its opaque pixels as targets. */
  const spawnWordParticles = useCallback(
    (w: number, h: number, cy: number, seeds: { x: number; y: number }[]) => {
    const { wordPalette: palette, logoImage } = stateRef.current;
    if (!palette.length || !logoImage) return [];

    // Half-scale sampling: a quarter of the pixels to read back, and the 2px
    // lattice it implies is finer than the particles drawn on top of it.
    const scale = 0.5;
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.round(w * scale));
    off.height = Math.max(1, Math.round(h * scale));

    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return [];

    const box = logoRect(w, h, cy, logoImage);
    octx.drawImage(logoImage, box.x * scale, box.y * scale, box.w * scale, box.h * scale);

    const { data } = octx.getImageData(0, 0, off.width, off.height);
    const targets: { tx: number; ty: number }[] = [];

    for (let y = 0; y < off.height; y += 2) {
      for (let x = 0; x < off.width; x += 2) {
        if (data[(y * off.width + x) * 4 + 3] > 128) targets.push({ tx: x / scale, ty: y / scale });
      }
    }
    if (!targets.length) return [];

    // A fractional stride, so a budget that does not divide the target count
    // still spends all of it — flooring to 1 would blow past the budget.
    const stride = Math.max(1, targets.length / budgetRef.current.text);
    const picked: { tx: number; ty: number }[] = [];
    for (let i = 0; i < targets.length; i += stride) picked.push(targets[Math.floor(i)]);

    return picked.map(({ tx, ty }, i) => {
      // Start where the burst actually left off, so the swarm carries on rather
      // than being replaced by a second one flying in from off-screen. Falls
      // back to the rim only if the burst never ran (a deep link straight to
      // the end of the section).
      const from = seeds.length ? seeds[i % seeds.length] : null;
      const angle = Math.random() * Math.PI * 2;
      const reach = 0.62 + Math.random() * 0.5;

      return {
        sx: from ? from.x : w / 2 + Math.cos(angle) * w * reach,
        sy: from ? from.y : cy + Math.sin(angle) * h * reach,
        tx,
        ty,
        delay: Math.random() * 0.42,
        size: 1.1 + Math.random() * 1.5,
        twinkle: Math.random() * Math.PI * 2,
        sprite: pick(palette),
      };
    });
    },
    [],
  );

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
          budgetRef.current = { burst: 260, text: 320, sparks: 8 };
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

    // ── The sequence: the tin opens and releases its own sachet ───────────
    const frame = Math.round(clamp01(p / FRAMES_END) * FRAME_LAST);

    // Frames run up to the detonation and then stop for good — after the flash
    // there is nothing of the tin left to show.
    const tinAlpha = clamp01(p / 0.03);

    // Where the sachet is at the moment it goes, so the blast starts there
    // rather than in the middle of the canvas.
    const drawn = Math.min(w, h) * 0.85;
    const originX = cx - drawn / 2;
    const originY = cy - drawn / 2;
    const burstX = originX + SACHET_AT_BURST.x * drawn;
    const burstY = originY + SACHET_AT_BURST.y * drawn;

    if (frame < BURST_FRAME && s.frames.length) {
      // Hold the nearest frame that has arrived rather than blanking: at 181
      // frames some are still in flight when a fast scroll reaches them, and a
      // neighbour is a far smaller artefact than an empty canvas.
      let img: HTMLImageElement | undefined = s.frames[frame];
      if (!img?.complete || !img.naturalWidth) {
        img = undefined;
        for (let k = 1; k <= 20 && !img; k += 1) {
          const back = s.frames[frame - k];
          const fwd = s.frames[frame + k];
          if (back?.complete && back.naturalWidth) img = back;
          else if (fwd?.complete && fwd.naturalWidth) img = fwd;
        }
      }

      if (img) {
        ctx.save();
        ctx.globalAlpha = tinAlpha;
        ctx.drawImage(img, originX, originY, drawn, drawn);
        ctx.restore();
      }
    }

    // ── Stage 4: the pouch detonates ──────────────────────────────────────
    // Overlaps stage 5 slightly, so the burst is still fading while the
    // wordmark starts pulling itself together out of it.
    if (p >= BURST_IN && p < WORD_IN + 0.07) {
      const stage = clamp01((p - BURST_IN) / (WORD_IN - BURST_IN));

      if (!s.burstSpawned) {
        // Sized to the sachet as it looks at the moment it goes.
        s.burst = spawnBurst(burstX, burstY, drawn * SACHET_AT_BURST.w, drawn * SACHET_AT_BURST.h);
        s.burstSpawned = true;
      }

      // Full white while the sachet is destroyed, then out. The frames stop and
      // the particles start on the same frame; this is what hides that join, and
      // by the time it clears there is nothing where the sachet was.
      if (stage < 0.13) {
        const alpha = stage < 0.08 ? 1 : 1 - easeInOut((stage - 0.08) / 0.05);
        ctx.fillStyle = `rgba(255,255,255,${clamp01(alpha)})`;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = 'lighter';

      // Shockwave.
      if (stage < 0.6) {
        const ring = easeOut(stage / 0.6);
        ctx.beginPath();
        ctx.arc(burstX, burstY, unit * 0.95 * ring, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${LIGHT.r},${LIGHT.g},${LIGHT.b},${(1 - ring) * 0.75})`;
        ctx.lineWidth = unit * 0.016 * (1 - ring) + 1;
        ctx.stroke();
      }

      const spread = easeOut(stage);
      // Hands the frame over to the wordmark rather than cutting to it.
      const handoff = 1 - clamp01((p - WORD_IN) / 0.07);
      const fade = (1 - stage ** 3.2) * clamp01(stage * 12) * handoff;

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
        // Freeze the burst where it is at the handover and let the wordmark
        // pull those exact points into place.
        const spread = easeOut(1);
        const seeds = s.burst.map((pt) => ({
          x: pt.ox + Math.cos(pt.angle) * pt.speed * unit * spread,
          y: pt.oy + Math.sin(pt.angle) * pt.speed * unit * spread + pt.drift * unit,
        }));
        s.word = spawnWordParticles(w, h, cy, seeds);
        // Only latch once it actually produced targets, so a frame drawn
        // before the lockup has loaded retries instead of staying empty.
        s.wordSpawned = s.word.length > 0;
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

      if (reveal > 0 && s.logoImage) {
        const box = logoRect(w, h, cy, s.logoImage);
        ctx.save();
        ctx.globalAlpha = reveal;
        // Two tight passes rather than one wide one: at a large blur radius the
        // shadow stops following the letterforms and reads as a purple box.
        ctx.shadowColor = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.85)`;
        ctx.shadowBlur = box.h * 0.1;
        ctx.drawImage(s.logoImage, box.x, box.y, box.w, box.h);
        ctx.drawImage(s.logoImage, box.x, box.y, box.w, box.h);
        ctx.restore();
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

        // Fetch the artwork only once the section is close — loading it on
        // mount would compete with the hero image for the LCP.
        if (entry.isIntersecting && !stateRef.current.frames.length) {
          const load = (src: string, onto: 'logoImage') => {
            const img = new Image();
            img.src = src;
            img.decoding = 'async';
            img.onload = () => {
              stateRef.current[onto] = img;
              // The lockup decides where the wordmark particles aim, so a swarm
              // built before it arrived has to be thrown away.
              if (onto === 'logoImage') {
                stateRef.current.wordSpawned = false;
                stateRef.current.word = [];
              }
            };
          };
          load(LOGO_SRC, 'logoImage');

          // Phones decode every second frame: half the bytes and half the
          // decoded bitmaps in memory, and at 60fps the doubled step is not
          // visible on a scroll-driven sequence.
          const st = window.innerWidth < 768 ? 2 : 1;
          const s2 = stateRef.current;
          // Only what is drawn: playback stops at the detonation, so fetching
            // 131-180 would be ~1.2MB no visitor ever sees.
            s2.frames = new Array(BURST_FRAME + 1);
          const grab = (n: number) => {
            if (s2.frames[n]) return;
            const img = new Image();
            img.decoding = 'async';
            s2.frames[n] = img;
            img.onload = () => {
              s2.framesReady += 1;
            };
            img.src = FRAME_SRC(n);
          };
          // Stage 1 first so the sealed tin is there the moment it is needed.
          for (let n = 0; n < FRAME_FIRST_OPEN; n += st) grab(n);
          for (let n = FRAME_FIRST_OPEN; n <= BURST_FRAME; n += st) grab(n);
          if (st > 1) grab(BURST_FRAME);
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

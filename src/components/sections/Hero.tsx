'use client';

import { m } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { EASE, springPop } from '@/components/ui/motion';
import { IMG } from '@/lib/constants';

const FEATURES = [
  { key: 'form', image: IMG.feature1 },
  { key: 'taste', image: IMG.feature2 },
  { key: 'health', image: IMG.feature3 },
] as const;

/** Splits a line into words so the headline can reveal word by word. */
function Words({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <>
      {text.split(' ').map((word, index) => (
        <m.span
          key={`${word}-${index}`}
          className={`inline-block max-w-full break-words ${className ?? ''}`}
          initial={{ opacity: 0, y: '0.4em' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: delay + index * 0.045 }}
        >
          {word}
          <span>&nbsp;</span>
        </m.span>
      ))}
    </>
  );
}

export function Hero() {
  const t = useTranslations('hero');
  const { floatAnimation, floatTransition, hoverScale, tapPress, hoverLift } = useUniversalMotion();

  return (
    <section
      id="hero"
      className="hero-shell relative isolate overflow-hidden pb-fluid-xl pt-[calc(var(--header-h)+var(--space-2xl))]"
    >
      {/* Decorative brand wave, slowly breathing behind the content. */}
      <m.div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[clamp(360px,60vw,820px)]"
        initial={{ scale: 1 }}
        style={{ opacity: 'clamp(0.35, (100vw - 320px) / 900, 0.75)' }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
        aria-hidden="true"
      >
        <Image
          src={IMG.waves}
          alt=""
          fill
          priority
          quality={40}
          sizes="100vw"
          className="object-cover object-top"
        />
      </m.div>

      <div
        className="pointer-events-none absolute left-1/2 top-[-160px] -z-10 h-[clamp(280px,45vw,520px)] w-[min(820px,130vw)] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(149,97,233,0.32), transparent 68%)' }}
        aria-hidden="true"
      />

      <div className="container-content">
        <div className="grid-2col">
          <div className="min-w-0 text-center lg:text-left">
            <m.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.06 }}
              className="inline-flex items-center gap-2 rounded-pill border border-accent/35 bg-accent/12 px-4 py-2 text-fluid-xs font-bold uppercase tracking-[0.16em] text-accent-light backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t('badge')}
            </m.span>

            <h1 className="h1 mt-6 [perspective:800px]">
              <span className="block">
                <Words text={t('titleLine1')} delay={0.14} />
              </span>
              <span className="block">
                <Words text={t('titleAccent')} delay={0.26} className="text-gradient italic" />
              </span>
              <span className="block">
                <Words text={t('titleLine2')} delay={0.38} />
              </span>
            </h1>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
              className="mx-auto mt-fluid-sm max-w-[52ch] text-fluid-md text-w-70 lg:mx-0"
            >
              {t('subtitle')}
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
              className="mt-fluid-lg flex flex-wrap justify-center gap-fluid-xs lg:justify-start"
            >
              <m.a
                href="#products"
                whileHover={hoverScale}
                whileTap={tapPress}
                transition={springPop}
                className="group inline-flex items-center justify-center gap-2 rounded-pill bg-accent-grad px-7 py-4 text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow"
              >
                {t('ctaPrimary')}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </m.a>

              <m.a
                href="#product"
                whileHover={hoverScale}
                whileTap={tapPress}
                transition={springPop}
                className="inline-flex items-center justify-center rounded-pill border border-w-15 bg-white/[0.03] px-7 py-4 text-fluid-sm font-bold uppercase tracking-wide text-w-80 backdrop-blur-sm transition-colors hover:border-accent/45 hover:text-white"
              >
                {t('ctaGhost')}
              </m.a>
            </m.div>
          </div>

          <m.div
            className="relative mx-auto w-[min(480px,100%)]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            <m.div
              className="relative aspect-square w-full"
              animate={floatAnimation}
              transition={floatTransition}
            >
              <Image
                src={IMG.hero}
                alt="LOOP Energy"
                fill
                priority
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 480px"
                className="object-contain drop-shadow-[0_40px_70px_rgba(0,0,0,0.55)]"
              />
            </m.div>
          </m.div>
        </div>

        <m.ul
          className="grid-auto-sm mt-fluid-2xl"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.7 } } }}
        >
          {FEATURES.map((feature) => (
            <m.li
              key={feature.key}
              variants={{
                hidden: { opacity: 0, y: 34 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 260, damping: 24 },
                },
              }}
            >
              <m.div
                whileHover={
                  hoverLift && { ...hoverLift, boxShadow: '0 24px 60px -20px rgba(149, 97, 233, 0.2)' }
                }
                transition={{ duration: 0.35, ease: EASE }}
                className="purple-ring flex h-full items-center gap-4 p-4 sm:flex-col sm:items-start sm:p-6"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/[0.05] sm:h-20 sm:w-20">
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 64px, 96px"
                    className="object-contain p-2"
                  />
                </div>
                <div>
                  <h2 className="h3 uppercase tracking-tight">{t(`features.${feature.key}.title`)}</h2>
                  <p className="mt-1.5 text-fluid-sm leading-relaxed text-w-70">
                    {t(`features.${feature.key}.desc`)}
                  </p>
                </div>
              </m.div>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  );
}

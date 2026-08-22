'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { EASE, springPop } from './motion';

const STORAGE_KEY = 'le_age_confirmed';

/**
 * One-time 18+ confirmation, remembered in localStorage.
 *
 * The gate is server-rendered so a first-time visitor sees it in the very first
 * paint. Returning visitors never see it either: an inline script in the layout
 * adds `.age-ok` to `<html>` before paint, CSS hides the gate, and the effect
 * below then removes it from the DOM.
 */
export function AgeGate() {
  const t = useTranslations('age_gate');
  const [phase, setPhase] = useState<'pending' | 'open' | 'closed'>('pending');

  useEffect(() => {
    let confirmed = false;
    try {
      confirmed = window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // Private mode or blocked storage — show the gate rather than skipping it.
    }
    setPhase(confirmed ? 'closed' : 'open');
  }, []);

  useEffect(() => {
    if (phase !== 'open') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore — the gate simply reappears next visit.
    }
    setPhase('closed');
  };

  const decline = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <AnimatePresence initial={false}>
      {phase !== 'closed' ? (
        <m.div
          key="age-gate"
          data-age-gate=""
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain px-fluid-sm py-fluid-md"
          exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE } }}
        >
          <div className="absolute inset-0 bg-[#15111a]/95 backdrop-blur-md" />

          <m.div
            className="purple-ring purple-ring-blur relative my-auto w-full max-w-lg px-fluid-md py-fluid-lg text-center"
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={springPop}
          >
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
              aria-hidden="true"
            />

            <p className="text-fluid-md font-black uppercase tracking-[0.2em] text-white">
              LOOP<span className="text-accent-light">&nbsp;Energy</span>
            </p>

            <p className="mt-fluid-md text-fluid-xs font-bold uppercase tracking-[0.2em] text-accent-light">
              {t('subtitle')}
            </p>

            <h2 id="age-gate-title" className="mt-fluid-2xs text-fluid-2xl font-extrabold uppercase leading-tight">
              {t('title')}
            </h2>

            <p className="mx-auto mt-fluid-xs max-w-md text-fluid-sm text-w-70">{t('description')}</p>

            <div className="mt-fluid-md flex flex-wrap justify-center gap-fluid-xs">
              <m.button
                type="button"
                onClick={confirm}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springPop}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center whitespace-nowrap rounded-pill bg-accent-grad px-fluid-md text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow"
              >
                {t('yes')}
              </m.button>

              <m.button
                type="button"
                onClick={decline}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springPop}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center whitespace-nowrap rounded-pill border border-w-15 px-fluid-md text-fluid-sm font-bold uppercase tracking-wide text-w-70 transition-colors hover:border-accent/40 hover:text-white"
              >
                {t('no')}
              </m.button>
            </div>

            <p className="mt-fluid-sm text-fluid-xs text-w-50">{t('note')}</p>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

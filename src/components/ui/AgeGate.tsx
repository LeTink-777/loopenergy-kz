'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { EASE, springPop } from './motion';

const STORAGE_KEY = 'le_age_confirmed';

/** One-time 18+ confirmation, remembered in localStorage. */
export function AgeGate() {
  const t = useTranslations('ageGate');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== '1') setOpen(true);
    } catch {
      // Private mode or blocked storage — show the gate rather than skipping it.
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore — the gate simply reappears next visit.
    }
    setOpen(false);
  };

  const decline = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="age-gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE } }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <div className="absolute inset-0 bg-[#15111a]/85 backdrop-blur-2xl" />

          <motion.div
            className="purple-ring purple-ring-blur relative w-full max-w-lg px-6 py-10 text-center sm:px-10"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ ...springPop, delay: 0.05 }}
          >
            <motion.div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <p className="text-xl font-black uppercase tracking-[0.24em] text-white">
              LOOP<span className="text-accent-light"> Energy</span>
            </p>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-accent-light">
              {t('title')}
            </p>

            <h2 id="age-gate-title" className="mt-3 text-3xl font-extrabold uppercase leading-tight">
              {t('question')}
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm text-w-70">{t('subtitle')}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <motion.button
                type="button"
                onClick={confirm}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springPop}
                className="rounded-pill bg-accent-grad px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-glow"
              >
                {t('yes')}
              </motion.button>

              <motion.button
                type="button"
                onClick={decline}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springPop}
                className="rounded-pill border border-w-15 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-w-70 transition-colors hover:border-accent/40 hover:text-white"
              >
                {t('no')}
              </motion.button>
            </div>

            <p className="mt-6 text-xs text-w-50">{t('note')}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

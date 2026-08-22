'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Mail, MessageCircle, Phone, Send, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { EASE, springPop } from '@/components/ui/motion';
import { CONTACTS } from '@/lib/constants';

export function ContactWidget() {
  const t = useTranslations('contact');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="contact-panel"
            role="dialog"
            aria-label={t('title')}
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="purple-ring purple-ring-blur w-[min(92vw,340px)] origin-bottom-right overflow-hidden !bg-[#241e2b]/95 p-5 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold uppercase tracking-tight">{t('title')}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="grid h-7 w-7 place-items-center rounded-pill border border-w-10 text-w-50 transition-colors hover:text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <motion.div
              className="mt-4 space-y-4"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
            >
              <motion.section
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-light">
                  {t('consumersTitle')}
                </p>
                <p className="mt-1 text-xs text-w-50">{t('consumersDesc')}</p>
                <a
                  href={CONTACTS.consumerTelegram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 flex items-center gap-2.5 rounded-2xl border border-w-10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-w-80 transition-colors hover:border-accent/40 hover:text-white"
                >
                  <Send className="h-4 w-4 text-accent-light" aria-hidden="true" />
                  {CONTACTS.consumerTelegram.label}
                </a>
              </motion.section>

              <motion.section
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-light">
                  {t('wholesaleTitle')}
                </p>
                <p className="mt-1 text-xs text-w-50">{t('wholesaleDesc')}</p>

                <div className="mt-2.5 space-y-2">
                  <a
                    href={CONTACTS.phone.href}
                    className="flex items-center gap-2.5 rounded-2xl border border-w-10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-w-80 transition-colors hover:border-accent/40 hover:text-white"
                  >
                    <Phone className="h-4 w-4 text-accent-light" aria-hidden="true" />
                    {CONTACTS.phone.label}
                  </a>
                  <a
                    href={CONTACTS.email.href}
                    className="flex items-center gap-2.5 rounded-2xl border border-w-10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-w-80 transition-colors hover:border-accent/40 hover:text-white"
                  >
                    <Mail className="h-4 w-4 text-accent-light" aria-hidden="true" />
                    {CONTACTS.email.label}
                  </a>
                  <a
                    href={CONTACTS.wholesaleTelegram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-2xl border border-w-10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-w-80 transition-colors hover:border-accent/40 hover:text-white"
                  >
                    <Send className="h-4 w-4 text-accent-light" aria-hidden="true" />
                    {CONTACTS.wholesaleTelegram.label}
                  </a>
                </div>
              </motion.section>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={springPop}
        className="inline-flex items-center gap-2.5 rounded-pill border border-accent/25 bg-[#241e2b]/85 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_18px_44px_-18px_rgba(149,97,233,0.75)] backdrop-blur-xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'x' : 'phone'}
            initial={{ opacity: 0, rotate: -80, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 80, scale: 0.6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="grid place-items-center text-accent-light"
          >
            {open ? <X className="h-[18px] w-[18px]" /> : <MessageCircle className="h-[18px] w-[18px]" />}
          </motion.span>
        </AnimatePresence>
        <span className="hidden xs:inline">{t('button')}</span>
      </motion.button>
    </div>
  );
}

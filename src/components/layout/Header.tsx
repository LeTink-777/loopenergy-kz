'use client';

import { AnimatePresence, m, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { EASE, springPop } from '@/components/ui/motion';
import { NAV_LINKS } from '@/lib/constants';

/** Nav item whose underline wipes in from the left on hover/focus. */
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <m.a
      href={href}
      initial="rest"
      animate="rest"
      whileHover="active"
      whileFocus="active"
      className="relative block px-3 py-2 text-sm font-medium text-w-70"
      variants={{ rest: { color: 'rgba(255,255,255,0.7)' }, active: { color: '#ffffff' } }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      {label}
      <m.span
        className="absolute inset-x-3 bottom-1 block h-px origin-left bg-accent-light"
        variants={{ rest: { scaleX: 0 }, active: { scaleX: 1 } }}
        transition={{ duration: 0.32, ease: EASE }}
      />
    </m.a>
  );
}

export function Header() {
  const t = useTranslations();
  const { scrollYProgress, scrollY } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <m.div
        className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-accent-grad"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <m.header
        className="fixed inset-x-4 top-3 z-[60] mx-auto max-w-content"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      >
        <m.nav
          aria-label={t('common.menu')}
          className="flex items-center justify-between gap-4 rounded-[22px] border px-4 py-3 md:px-6"
          animate={{
            backgroundColor: scrolled ? 'rgba(32, 27, 36, 0.85)' : 'rgba(32, 27, 36, 0.28)',
            borderColor: scrolled ? 'rgba(149, 97, 233, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            backdropFilter: scrolled ? 'blur(20px)' : 'blur(6px)',
            boxShadow: scrolled ? '0 18px 48px -28px rgba(0,0,0,0.9)' : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <a
            href="#hero"
            className="shrink-0 text-base font-black uppercase tracking-[0.14em] md:text-lg"
            onClick={() => setMenuOpen(false)}
          >
            LOOP<span className="text-accent-light"> Energy</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.key}>
                <NavLink href={link.href} label={t(`nav.${link.key}`)} />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher className="hidden xs:flex" />

            <m.a
              href="#products"
              aria-label={t('common.cart')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={springPop}
              className="relative grid h-10 w-10 place-items-center rounded-pill border border-w-10 bg-white/[0.04] text-w-80 transition-colors hover:border-accent/40 hover:text-white"
            >
              <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
            </m.a>

            <m.button
              type="button"
              aria-label={menuOpen ? t('common.close') : t('common.openMenu')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              whileTap={{ scale: 0.92 }}
              transition={springPop}
              className="grid h-10 w-10 place-items-center rounded-pill border border-w-10 bg-white/[0.04] text-white lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={menuOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="grid place-items-center"
                >
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </m.span>
              </AnimatePresence>
            </m.button>
          </div>
        </m.nav>
      </m.header>

      <AnimatePresence>
        {menuOpen ? (
          <m.div
            key="mobile-menu"
            className="fixed inset-0 z-[55] flex flex-col justify-center bg-[#1a151f]/95 px-6 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <m.ul
              className="flex flex-col gap-2"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
              }}
            >
              {NAV_LINKS.map((link) => (
                <m.li
                  key={link.key}
                  variants={{
                    hidden: { opacity: 0, x: -24 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
                  }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-w-10 py-4 text-2xl font-extrabold uppercase tracking-tight text-white"
                  >
                    {t(`nav.${link.key}`)}
                  </a>
                </m.li>
              ))}
            </m.ul>

            <m.div
              className="mt-10 flex items-center justify-between gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4, ease: EASE } }}
              exit={{ opacity: 0 }}
            >
              <LanguageSwitcher />
              <a
                href="#b2b"
                onClick={() => setMenuOpen(false)}
                className="rounded-pill bg-accent-grad px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-glow"
              >
                {t('nav.partnership')}
              </a>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

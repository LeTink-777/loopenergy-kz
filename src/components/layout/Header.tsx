'use client';

import { AnimatePresence, m, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { CartIcon } from '@/components/cart/CartIcon';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Link } from '@/i18n/navigation';
import { EASE, springPop } from '@/components/ui/motion';
import { NAV_LINKS } from '@/lib/constants';

/** Nav item whose underline wipes in from the left on hover/focus. */
function NavLink({ href, label }: { href: string; label: string }) {
  const isRoute = href.startsWith('/');
  const Component = isRoute ? m.create(Link) : m.a;

  return (
    <Component
      href={href}
      initial="rest"
      animate="rest"
      whileHover="active"
      whileFocus="active"
      className="relative flex min-h-[44px] items-center whitespace-nowrap px-2.5 py-2 text-fluid-sm font-medium text-w-70"
      variants={{ rest: { color: 'rgba(255,255,255,0.7)' }, active: { color: '#ffffff' } }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      {label}
      <m.span
        className="absolute inset-x-2.5 bottom-1.5 block h-px origin-left bg-accent-light"
        variants={{ rest: { scaleX: 0 }, active: { scaleX: 1 } }}
        transition={{ duration: 0.32, ease: EASE }}
      />
    </Component>
  );
}

export function Header() {
  const t = useTranslations('header');
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
        className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-accent-grad"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <m.header
        className="site-header fixed inset-x-0 z-[60] mx-auto w-full max-w-content"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      >
        <nav
          aria-label={t('nav.home')}
          data-scrolled={scrolled ? 'true' : 'false'}
          className="header-glass flex items-center justify-between gap-fluid-xs px-fluid-sm py-fluid-xs"
        >
          <Link
            href="/"
            className="site-wordmark inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap text-fluid-md font-black uppercase tracking-[0.12em]"
            onClick={() => setMenuOpen(false)}
          >
            LOOP<span className="text-accent-light">&nbsp;Energy</span>
          </Link>

          <ul className="hidden items-center gap-1 nav:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.key}>
                <NavLink href={link.href} label={t(`nav.${link.key}`)} />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher className="hidden xs:flex" />

            <CartIcon />

            <m.button
              type="button"
              aria-label={menuOpen ? t('menu_close') : t('menu_open')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              whileTap={{ scale: 0.92 }}
              transition={springPop}
              className="grid h-11 w-11 place-items-center rounded-pill border border-w-10 bg-white/[0.04] text-white nav:hidden"
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
        </nav>
      </m.header>

      <AnimatePresence>
        {menuOpen ? (
          <m.div
            key="mobile-menu"
            className="fixed inset-0 z-[55] flex flex-col justify-center overflow-y-auto bg-[#1a151f]/95 py-fluid-2xl backdrop-blur-2xl safe-px nav:hidden"
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
                  {link.href.startsWith('/') ? (
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-w-10 py-fluid-sm text-fluid-2xl font-extrabold uppercase tracking-tight text-white"
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-w-10 py-fluid-sm text-fluid-2xl font-extrabold uppercase tracking-tight text-white"
                    >
                      {t(`nav.${link.key}`)}
                    </a>
                  )}
                </m.li>
              ))}
            </m.ul>

            <m.div
              className="mt-fluid-xl flex flex-wrap items-center justify-between gap-fluid-sm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4, ease: EASE } }}
              exit={{ opacity: 0 }}
            >
              <LanguageSwitcher />
              <Link
                href="/wholesale"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-[48px] items-center rounded-pill bg-accent-grad px-6 text-fluid-xs font-bold uppercase tracking-wide text-white shadow-glow"
              >
                {t('nav.partnership')}
              </Link>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

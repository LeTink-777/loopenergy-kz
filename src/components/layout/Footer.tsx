'use client';

import { m } from 'framer-motion';
import { Mail, Phone, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';

import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { fadeUp, springPop } from '@/components/ui/motion';
import { CONTACTS, FOOTER_LINKS, SITE, SOCIALS } from '@/lib/constants';

const TELEGRAM_PATH =
  'M22 4.5 2.7 11.9c-1 .4-1 1.8.1 2.1l4.7 1.4 1.8 5.4c.3.8 1.3 1 1.9.4l2.6-2.6 4.8 3.5c.7.5 1.7.1 1.9-.7L23.7 5.7c.2-.9-.7-1.6-1.7-1.2Z';

function SocialGlyph({ name }: { name: string }) {
  if (name === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d={TELEGRAM_PATH} />
      </svg>
    );
  }

  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M14.2 3h2.6c.3 2 1.5 3.4 3.7 3.7v2.6c-1.4.1-2.7-.3-3.9-1v5.9a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.7a3.2 3.2 0 1 0 2.3 3.1V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Internal routes need the locale-aware Link; hash targets stay plain anchors. */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    'inline-flex min-h-[44px] items-center text-fluid-sm text-w-70 transition-colors hover:text-accent-light';

  return href.startsWith('/') ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function Footer() {
  const t = useTranslations();
  const { reducedMotion } = useUniversalMotion();
  // Rendered on the server at request time, so the notice never goes stale.
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-w-10 bg-[#1c1720]">
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 h-80 opacity-60"
        style={{
          background: 'radial-gradient(60% 100% at 50% 100%, rgba(149,97,233,0.22), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="container-content relative pb-safe-cta pt-fluid-2xl">
        <RevealGroup className="grid-footer">
          <Reveal variants={fadeUp} className="lg:col-span-1">
            <p className="text-fluid-lg font-black uppercase tracking-[0.14em]">
              LOOP<span className="text-accent-light">&nbsp;Energy</span>
            </p>
            <p className="mt-4 max-w-xs text-fluid-sm leading-relaxed text-w-70">{t('footer.tagline')}</p>
            <span className="footer-kz-badge mt-fluid-sm">
              {/* Framer Motion rather than a CSS keyframe, so the pulse follows the
                  same reduced-motion rule as every other animation on the site. */}
              <m.span
                className="footer-kz-dot"
                aria-hidden="true"
                animate={reducedMotion ? undefined : { opacity: [1, 0.5, 1], scale: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {t('footer.distributor_badge')}
            </span>
          </Reveal>

          <Reveal variants={fadeUp}>
            <h3 className="text-fluid-xs font-bold uppercase tracking-[0.2em] text-w-50">
              {t('footer.nav_title')}
            </h3>
            <ul className="mt-fluid-xs">
              {FOOTER_LINKS.map((link) => (
                <li key={link.key}>
                  <FooterLink href={link.href}>{t(`header.nav.${link.key}`)}</FooterLink>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variants={fadeUp}>
            <h3 className="text-fluid-xs font-bold uppercase tracking-[0.2em] text-w-50">
              {t('footer.contacts_title')}
            </h3>
            <ul className="mt-fluid-xs text-fluid-sm">
              <li>
                <a
                  href={CONTACTS.phone.href}
                  className="flex min-h-[44px] items-center gap-2 break-all text-w-70 transition-colors hover:text-accent-light"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {CONTACTS.phone.label}
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.email.href}
                  className="flex min-h-[44px] items-center gap-2 break-all text-w-70 transition-colors hover:text-accent-light"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {CONTACTS.email.label}
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.wholesaleTelegram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center gap-2 break-all text-w-70 transition-colors hover:text-accent-light"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {CONTACTS.wholesaleTelegram.label}
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal variants={fadeUp}>
            <h3 className="text-fluid-xs font-bold uppercase tracking-[0.2em] text-w-50">
              {t('footer.socials_title')}
            </h3>
            <div className="mt-fluid-xs flex flex-wrap gap-fluid-2xs">
              {SOCIALS.map((social) => (
                <m.a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  transition={springPop}
                  className="grid h-12 w-12 place-items-center rounded-pill border border-[#9561e9]/30 bg-[#2a2330] text-white transition-[border-color,box-shadow] duration-300 hover:border-[#9561e9] hover:shadow-[0_0_12px_rgba(149,97,233,0.4)]"
                >
                  <SocialGlyph name={social.key} />
                </m.a>
              ))}
            </div>

            <p className="mt-5 text-fluid-xs text-w-50">
              {t('footer.mirror')}{' '}
              <a
                href={`https://${SITE.mirror}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent transition-colors hover:text-accent-light hover:underline"
              >
                {SITE.mirror}
              </a>
            </p>
          </Reveal>
        </RevealGroup>

        <Reveal className="mt-fluid-xl border-t border-w-10 pt-fluid-md">
          <div className="flex flex-col gap-fluid-sm text-fluid-xs text-w-50 md:flex-row md:items-center md:justify-between">
            <p>
              © {year} {t('footer.copyright')}
            </p>
            <p className="flex items-center gap-2">
              <span className="grid h-6 min-w-[34px] place-items-center rounded-pill border border-accent/35 px-1.5 font-bold text-accent-light">
                21+
              </span>
              <span className="max-w-xl">{t('footer.age_warning')}</span>
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}

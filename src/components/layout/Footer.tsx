'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { fadeUp, springPop } from '@/components/ui/motion';
import { CONTACTS, NAV_LINKS, SITE, SOCIALS } from '@/lib/constants';

const TELEGRAM_PATH =
  'M22 4.5 2.7 11.9c-1 .4-1 1.8.1 2.1l4.7 1.4 1.8 5.4c.3.8 1.3 1 1.9.4l2.6-2.6 4.8 3.5c.7.5 1.7.1 1.9-.7L23.7 5.7c.2-.9-.7-1.6-1.7-1.2Z';

function SocialGlyph({ name }: { name: string }) {
  if (name === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px]">
        <path d={TELEGRAM_PATH} />
      </svg>
    );
  }

  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (name === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
        <rect x="2.5" y="5" width="19" height="14" rx="4.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10.5 9.3v5.4l4.6-2.7-4.6-2.7Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        d="M14.2 3h2.6c.3 2 1.5 3.4 3.7 3.7v2.6c-1.4.1-2.7-.3-3.9-1v5.9a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.7a3.2 3.2 0 1 0 2.3 3.1V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations();
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

      <div className="container-content relative py-14 md:py-20">
        <RevealGroup className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <Reveal variants={fadeUp} className="lg:col-span-1">
            <p className="text-lg font-black uppercase tracking-[0.14em]">
              LOOP<span className="text-accent-light"> Energy</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-w-70">{t('footer.tagline')}</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent/10 px-3.5 py-2 text-[11px] font-bold uppercase leading-snug tracking-[0.12em] text-accent-light">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light" />
              {t('footer.distributor')}
            </span>
          </Reveal>

          <Reveal variants={fadeUp}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-w-50">
              {t('footer.navTitle')}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-sm text-w-70 transition-colors hover:text-accent-light"
                  >
                    {t(`nav.${link.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variants={fadeUp}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-w-50">
              {t('footer.contactsTitle')}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={CONTACTS.phone.href}
                  className="inline-flex items-center gap-2 text-w-70 transition-colors hover:text-accent-light"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {CONTACTS.phone.label}
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.email.href}
                  className="inline-flex items-center gap-2 text-w-70 transition-colors hover:text-accent-light"
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
                  className="inline-flex items-center gap-2 text-w-70 transition-colors hover:text-accent-light"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {CONTACTS.wholesaleTelegram.label}
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal variants={fadeUp}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-w-50">
              {t('footer.socialsTitle')}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {SOCIALS.map((social) => (
                <motion.a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  transition={springPop}
                  className="grid h-11 w-11 place-items-center rounded-pill border border-w-10 bg-white/[0.04] text-w-70 transition-colors hover:border-accent/45 hover:text-accent-light"
                >
                  <SocialGlyph name={social.key} />
                </motion.a>
              ))}
            </div>

            <p className="mt-5 text-xs text-w-50">
              {t('footer.mirror')}{' '}
              <span className="font-semibold text-w-70">{SITE.mirror}</span>
            </p>
          </Reveal>
        </RevealGroup>

        <Reveal className="mt-12 border-t border-w-10 pt-7">
          <div className="flex flex-col gap-4 text-xs text-w-50 md:flex-row md:items-center md:justify-between">
            <p>
              © {year} {SITE.name}. {t('footer.rights')}.
            </p>
            <p className="flex items-center gap-2">
              <span className="grid h-6 min-w-[34px] place-items-center rounded-pill border border-accent/35 px-1.5 font-bold text-accent-light">
                18+
              </span>
              <span className="max-w-xl">{t('footer.warning')}</span>
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}

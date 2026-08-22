'use client';

import { m } from 'framer-motion';
import { BadgeCheck, Download, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { PageHeader } from '@/components/layout/PageHeader';
import { RevealGroup } from '@/components/ui/Reveal';
import { fadeUp, springPop } from '@/components/ui/motion';
import type { Content } from '@/lib/content';

export function CertificatesList() {
  const t = useTranslations('certificates');
  const { hoverScale, tapPress } = useUniversalMotion();
  const items = t.raw('items') as Content['certificates']['items'];

  return (
    <>
      <PageHeader title={t('h1')} accent={t('h1_accent')} subline={t('subline')} />

      <RevealGroup className="mt-fluid-lg">
        <m.p
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-pill border border-emerald-300/35 bg-emerald-400/10 px-4 py-2 text-fluid-sm font-semibold text-emerald-200"
        >
          <BadgeCheck className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {t('legal_badge')}
        </m.p>
      </RevealGroup>

      <RevealGroup stagger={0.1} className="grid-auto-md mt-fluid-lg">
        {items.map((doc) => (
          <m.article
            key={doc.file}
            variants={fadeUp}
            className={`purple-ring flex h-full flex-col p-fluid-md ${
              doc.important ? 'ring-1 ring-emerald-300/25' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-light">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <span
                className={`rounded-pill px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider ${
                  doc.important
                    ? 'bg-emerald-400/15 text-emerald-200'
                    : 'border border-w-15 text-w-70'
                }`}
              >
                {doc.badge}
              </span>
            </div>

            <h2 className="mt-fluid-sm text-fluid-md font-bold uppercase tracking-tight">{doc.title}</h2>
            <p className="mt-2 flex-1 text-fluid-sm leading-relaxed text-w-70">{doc.description}</p>

            <m.a
              href={doc.file}
              download
              whileHover={hoverScale}
              whileTap={tapPress}
              transition={springPop}
              className="btn btn-md btn-primary mt-fluid-md w-full uppercase tracking-wide"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('download_cta')}
            </m.a>
          </m.article>
        ))}
      </RevealGroup>
    </>
  );
}

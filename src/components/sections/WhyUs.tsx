'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { WhyIcon } from '@/components/ui/WhyIcon';
import { EASE, fadeUp, fromSide } from '@/components/ui/motion';
import { IMG } from '@/lib/constants';
import type { Content } from '@/lib/content';

export function WhyUs() {
  const t = useTranslations('why_us');
  const items = t.raw('items') as Content['why_us']['items'];

  return (
    <section id="why" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <div className="grid-2col">
          <Reveal variants={fromSide('left')}>
            <div className="relative mx-auto w-full max-w-[540px]">
              <m.div
                className="pointer-events-none absolute inset-0 -z-10"
                animate={{ scale: [1, 1.03, 1], opacity: [0.65, 0.9, 0.65] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                <Image src={IMG.whyBg} alt="" fill sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 520px" className="object-contain" />
              </m.div>

              <m.div
                className="relative aspect-square w-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src={IMG.why}
                  alt={t('h2')}
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 520px"
                  className="object-contain drop-shadow-[0_32px_60px_rgba(0,0,0,0.5)]"
                />
              </m.div>
            </div>
          </Reveal>

          <RevealGroup>
            <SectionHeading
              badge={t('badge')}
              title={t('h2')}
              accent={t('h2_accent')}
              subtitle={t('subline')}
              align="left"
            />

            <ul className="mt-8 flex flex-col gap-2">
              {items.map((item) => (
                <m.li key={item.key} variants={fadeUp}>
                  <m.div
                    className="group flex items-start gap-4 rounded-3xl border border-transparent px-4 py-4 sm:px-5"
                    initial="rest"
                    whileHover="active"
                    animate="rest"
                    variants={{
                      rest: { backgroundColor: 'rgba(255,255,255,0)', borderColor: 'rgba(255,255,255,0)' },
                      active: {
                        backgroundColor: 'rgba(149,97,233,0.08)',
                        borderColor: 'rgba(149,97,233,0.25)',
                      },
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <m.span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-light"
                      variants={{ rest: { rotate: 0, scale: 1 }, active: { rotate: -6, scale: 1.06 } }}
                      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                    >
                      <WhyIcon name={item.key} className="h-[26px] w-[26px]" />
                    </m.span>

                    <div>
                      <h3 className="h3 uppercase tracking-tight">{item.title}</h3>
                      <p className="mt-1 text-fluid-sm leading-relaxed text-w-70">
                        {item.description}
                      </p>
                    </div>
                  </m.div>
                </m.li>
              ))}
            </ul>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

'use client';

import { m } from 'framer-motion';
import { Download, ShoppingBag, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeUp, springPop } from '@/components/ui/motion';
import type { Content } from '@/lib/content';

type Page = Content['wholesale_page'];
/** `as const` gives each entry a distinct literal type; the columns need the shared shape. */
type Reason = { num: string; side: string; title: string; description: string };

/** Everything on this page is transcribed from the distributor's B2B sheet. */
export function WholesalePitch() {
  const t = useTranslations('wholesale_page');
  const { hoverScale, tapPress } = useUniversalMotion();

  const reasons = t.raw('reasons') as readonly Reason[];
  const marketing = t.raw('marketing') as Page['marketing'];
  const downloads = t.raw('downloads') as Page['downloads'];

  const buyer = reasons.filter((r) => r.side === 'buyer');
  const seller = reasons.filter((r) => r.side === 'seller');

  const column = (title: string, Icon: typeof ShoppingBag, list: readonly Reason[]) => (
    <div>
      <h2 className="flex items-center gap-2.5 text-fluid-md font-bold uppercase tracking-tight">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-light">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {title}
      </h2>

      <ul className="mt-4 flex flex-col gap-4">
        {list.map((reason) => (
          <m.li key={reason.num} variants={fadeUp} className="purple-ring p-fluid-md">
            <span className="text-fluid-2xl font-black leading-none text-white/15">{reason.num}</span>
            <h3 className="mt-2 text-fluid-base font-bold uppercase tracking-tight">{reason.title}</h3>
            <p className="mt-2 text-fluid-sm leading-relaxed text-w-70">{reason.description}</p>
          </m.li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <section className="section-pad pt-0">
        <div className="container-content">
          <RevealGroup>
            <SectionHeading title={t('h1')} accent={t('h1_accent')} subtitle={t('subline')} as="h1" align="left" />
            <div className="mt-fluid-lg grid gap-fluid-lg lg:grid-cols-2">
              {column(t('buyer_title'), ShoppingBag, buyer)}
              {column(t('seller_title'), Store, seller)}
            </div>
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container-content">
          <RevealGroup>
            <SectionHeading title={t('marketing_title')} accent={t('marketing_accent')} align="left" />
            <ul className="grid-auto-sm mt-fluid-lg">
              {marketing.map((item) => (
                <m.li key={item.num} variants={fadeUp} className="purple-ring h-full p-fluid-md">
                  <span className="text-fluid-2xl font-black leading-none text-accent-light/30">{item.num}</span>
                  <h3 className="mt-2 text-fluid-base font-bold uppercase tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-fluid-sm leading-relaxed text-w-70">{item.description}</p>
                </m.li>
              ))}
            </ul>
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container-content">
          <RevealGroup>
            <SectionHeading title={t('palette_title')} subtitle={t('palette_text')} align="left" />
            {/* The sheet is portrait, so it is centred at a readable height
                rather than stretched to the container — full width made this
                one section 1600px tall. */}
            <Reveal as="div" className="purple-ring mt-fluid-lg overflow-hidden bg-[#2a2330] p-fluid-md">
              <Image
                src="/assets/brand/flavors-palette.webp"
                alt={t('palette_title')}
                width={490}
                height={682}
                sizes="(max-width: 640px) 88vw, 480px"
                className="mx-auto h-auto w-full max-w-[480px] rounded-xl"
              />
            </Reveal>
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container-content">
          <RevealGroup>
            <SectionHeading title={t('merch_title')} subtitle={t('merch_text')} align="left" />
            <div className="mt-fluid-lg grid gap-fluid-md sm:grid-cols-2">
              {[
                { src: '/assets/brand/merch-stand.webp', alt: t('merch_stand_alt') },
                { src: '/assets/brand/merch-tentcard.webp', alt: t('merch_tent_alt') },
              ].map((shot) => (
                {/* The two shots have different aspect ratios now they are
                    cropped to their subjects, so the frame sets the shape and
                    the product is centred inside it. */}
                <Reveal key={shot.src} as="div" className="purple-ring overflow-hidden bg-[#2a2330]">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={905}
                    height={824}
                    sizes="(max-width: 640px) 92vw, 45vw"
                    className="aspect-[4/3] h-full w-full object-contain p-fluid-sm"
                  />
                </Reveal>
              ))}
            </div>
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container-content">
          <RevealGroup>
            <SectionHeading title={t('downloads_title')} align="left" />
            <ul className="grid-auto-sm mt-fluid-lg">
              {downloads.map((doc) => (
                <m.li key={doc.file} variants={fadeUp}>
                  <m.a
                    href={doc.file}
                    download
                    whileHover={hoverScale}
                    whileTap={tapPress}
                    transition={springPop}
                    className="purple-ring flex h-full items-center gap-3 p-fluid-md"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-light">
                      <Download className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-fluid-sm font-semibold text-white">{doc.title}</span>
                      <span className="block text-fluid-xs text-w-50">{t('download_cta')}</span>
                    </span>
                  </m.a>
                </m.li>
              ))}
            </ul>
          </RevealGroup>
        </div>
      </section>
    </>
  );
}

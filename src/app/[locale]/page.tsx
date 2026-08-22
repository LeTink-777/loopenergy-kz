import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { Audience } from '@/components/sections/Audience';
import { B2BTeaser } from '@/components/sections/B2BTeaser';
import { CanAnimation } from '@/components/sections/CanAnimation';
import { FAQ } from '@/components/sections/FAQ';
import { Hero } from '@/components/sections/Hero';
import { HowToUse } from '@/components/sections/HowToUse';
import { ProductInfo } from '@/components/sections/ProductInfo';
import { Products } from '@/components/sections/Products';
import { Stats } from '@/components/sections/Stats';
import { TrustBar } from '@/components/sections/TrustBar';
import { WhyUs } from '@/components/sections/WhyUs';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/content';
import { buildJsonLd } from '@/lib/seo';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(resolved);

  return (
    <>
      <script
        type="application/ld+json"
        // Content is authored in src/lib/content.ts, never user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(resolved)) }}
      />
      <Hero />
      <CanAnimation />
      <TrustBar />
      <Stats />
      <ProductInfo />
      <WhyUs />
      <Products />
      <HowToUse />
      <Audience />
      <FAQ />
      <B2BTeaser />
    </>
  );
}

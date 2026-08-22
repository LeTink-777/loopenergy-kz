import { setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Stats />
    </>
  );
}

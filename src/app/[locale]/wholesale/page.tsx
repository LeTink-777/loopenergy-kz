import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { B2B } from '@/components/sections/B2B';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  return pageMetadata(resolved, 'wholesale', '/wholesale');
}

export default async function WholesalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(resolved);

  return (
    <div className="pt-[calc(var(--header-h)+var(--space-md))]">
      <B2B headingLevel="h1" />
    </div>
  );
}

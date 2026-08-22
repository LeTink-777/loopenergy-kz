import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CartView } from '@/components/cart/CartView';
import { PageHeader } from '@/components/layout/PageHeader';
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
  // A personal cart has nothing to index.
  return { ...pageMetadata(resolved, 'cart', '/cart'), robots: { index: false, follow: true } };
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(resolved);

  const t = await getTranslations({ locale: resolved, namespace: 'cart' });

  return (
    <div className="section-pad pt-[calc(var(--header-h)+var(--space-xl))]">
      <div className="container-content">
        <PageHeader title={t('h1')} />
        <div className="mt-fluid-lg">
          <CartView />
        </div>
      </div>
    </div>
  );
}

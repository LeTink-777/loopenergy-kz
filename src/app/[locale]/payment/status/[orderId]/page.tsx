import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { PaymentStatus } from '@/components/payment/PaymentStatus';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  return { ...pageMetadata(resolved, 'payment_status', '/payment'), robots: { index: false, follow: false } };
}

export default async function PaymentStatusPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(resolved);

  const t = await getTranslations({ locale: resolved, namespace: 'payment_status' });

  return (
    <div className="section-pad pt-[calc(var(--header-h)+var(--space-xl))]">
      <div className="container-content">
        <PageHeader title={t('h1')} accent={t('h1_accent')} subline={t('subline')} />
        <div className="mx-auto mt-fluid-lg max-w-xl">
          <PaymentStatus orderId={orderId} />
        </div>
      </div>
    </div>
  );
}

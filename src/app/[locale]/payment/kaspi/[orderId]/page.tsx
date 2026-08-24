import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { KaspiPayment } from '@/components/payment/KaspiPayment';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/content';
import { getOrder, supabaseReady } from '@/lib/orders';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  return { ...pageMetadata(resolved, 'kaspi_payment', '/payment'), robots: { index: false, follow: false } };
}

export default async function KaspiPaymentPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(resolved);

  // The summary is read on the server so the amount cannot be edited by the
  // person who is about to pay it.
  if (!supabaseReady()) notFound();
  const order = await getOrder(orderId);
  if (!order) notFound();

  const t = await getTranslations({ locale: resolved, namespace: 'kaspi_payment' });

  return (
    <div className="section-pad pt-[calc(var(--header-h)+var(--space-xl))]">
      <div className="container-content">
        <PageHeader title={t('h1')} accent={t('h1_accent')} subline={t('subline')} />
        <div className="mt-fluid-lg">
          <KaspiPayment
            orderId={order.id}
            orderNumber={order.order_number}
            total={order.total_amount}
            createdAt={order.created_at}
          />
        </div>
      </div>
    </div>
  );
}

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
  searchParams,
}: {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: Promise<{ total?: string }>;
}) {
  const { locale, orderId } = await params;
  const { total: totalParam } = await searchParams;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(resolved);

  // Read from the database when there is one, so the amount cannot be edited
  // by the person about to pay it. Without a database the link carries it —
  // the figure is only a prompt for what to type into Kaspi, and the shop
  // checks the real amount against the order before confirming anything.
  const order = supabaseReady() ? await getOrder(orderId) : null;
  const total = order?.total_amount ?? Number(totalParam);
  if (!Number.isFinite(total) || total <= 0) notFound();

  const t = await getTranslations({ locale: resolved, namespace: 'kaspi_payment' });

  return (
    <div className="section-pad pt-[calc(var(--header-h)+var(--space-xl))]">
      <div className="container-content">
        <PageHeader title={t('h1')} accent={t('h1_accent')} subline={t('subline')} />
        <div className="mt-fluid-lg">
          <KaspiPayment
            orderId={order?.id ?? orderId}
            orderNumber={order?.order_number ?? 0}
            total={total}
            createdAt={order?.created_at ?? new Date().toISOString()}
            tracked={Boolean(order)}
          />
        </div>
      </div>
    </div>
  );
}

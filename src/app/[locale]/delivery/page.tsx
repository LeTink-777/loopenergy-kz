import type { Metadata } from 'next';
import { CreditCard, MapPin, Store, Timer } from 'lucide-react';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
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
  return pageMetadata(resolved, 'delivery', '/delivery');
}

export default async function DeliveryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(resolved);

  const t = await getTranslations({ locale: resolved, namespace: 'delivery' });

  const blocks = [
    { Icon: MapPin, title: t('cities_title'), lines: [t('cities_text')] },
    { Icon: Timer, title: t('terms_title'), lines: [t('terms_text')] },
    { Icon: Store, title: t('pickup_title'), lines: [t('pickup_text')] },
    { Icon: CreditCard, title: t('payment_title'), lines: [t('payment_text')] },
  ];

  return (
    <div className="section-pad pt-[calc(var(--header-h)+var(--space-xl))]">
      <div className="container-content">
        <PageHeader title={t('h1')} accent={t('h1_accent')} subline={t('subline')} />

        <RevealGroup stagger={0.08} className="grid-auto-sm mt-fluid-xl">
          {blocks.map(({ Icon, title, lines }) => (
            <Reveal key={title} as="div" className="h-full">
              <div className="purple-ring h-full p-fluid-md">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-light">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-fluid-sm text-fluid-md font-bold uppercase tracking-tight">{title}</h2>
                <ul className="mt-fluid-xs flex flex-col gap-1.5 text-fluid-sm leading-relaxed text-w-70">
                  {lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}

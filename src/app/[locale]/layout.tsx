import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { AgeGate } from '@/components/ui/AgeGate';
import { ContactWidget } from '@/components/layout/ContactWidget';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { routing } from '@/i18n/routing';
import { SITE } from '@/lib/constants';

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-montserrat',
  preload: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(SITE.url),
    title: t('title'),
    description: t('description'),
    applicationName: SITE.name,
    keywords: [
      'LOOP Energy',
      'кофеиновые паучи',
      'кофеин пауштары',
      'энергетик Казахстан',
      'паучи без никотина',
      'loopenergy.kz',
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: { ru: '/ru', kk: '/kz' },
    },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: locale === 'kz' ? 'kk_KZ' : 'ru_RU',
      url: `${SITE.url}/${locale}`,
      title: t('title'),
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#201b24',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html lang={locale === 'kz' ? 'kk' : 'ru'} className={montserrat.variable}>
      <head>
        <link rel="preconnect" href="https://loopenergy.ru" />
        <link rel="dns-prefetch" href="https://loopenergy.ru" />
      </head>
      <body className="min-h-screen bg-bg text-white antialiased">
        <NextIntlClientProvider>
          <AgeGate />
          <Header />
          <main id="top">{children}</main>
          <Footer />
          <ContactWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

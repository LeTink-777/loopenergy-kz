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
import { StickyCta } from '@/components/layout/StickyCta';
import { MotionProvider } from '@/components/ui/MotionProvider';
import { routing } from '@/i18n/routing';
import { SITE } from '@/lib/constants';

// Variable Montserrat: one file per subset covers 400-900 instead of six static
// instances, which roughly halves the font bytes on the critical path.
const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-montserrat',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
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
        {/* Runs before first paint so returning visitors never flash the age gate. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('le_age_confirmed')==='1')document.documentElement.classList.add('age-ok')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen bg-bg text-white antialiased">
        <NextIntlClientProvider>
          <MotionProvider>
            <AgeGate />
            <Header />
            <main id="top">{children}</main>
            <Footer />
            <ContactWidget />
            <StickyCta />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Answers } from '@/components/sections/Answers';
import { Audience } from '@/components/sections/Audience';
import { B2B } from '@/components/sections/B2B';
import { FAQ } from '@/components/sections/FAQ';
import { Hero } from '@/components/sections/Hero';
import { HowToUse } from '@/components/sections/HowToUse';
import { ProductInfo } from '@/components/sections/ProductInfo';
import { Products } from '@/components/sections/Products';
import { Stats } from '@/components/sections/Stats';
import { WhyUs } from '@/components/sections/WhyUs';
import { FAQ_KEYS, PRODUCTS, SITE } from '@/lib/constants';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  // Structured data so the FAQ and catalogue are eligible for rich results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE.url}#organization`,
        name: SITE.name,
        url: SITE.url,
        description: t('meta.description'),
        areaServed: { '@type': 'Country', name: 'Kazakhstan' },
        sameAs: [
          'https://t.me/loop_energy',
          'https://instagram.com/loopenergy.official',
          'https://youtube.com/@loop_energy',
          'https://tiktok.com/@loopenergy.official',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_KEYS.map((key) => ({
          '@type': 'Question',
          name: t(`faq.items.${key}.q`),
          acceptedAnswer: { '@type': 'Answer', text: t(`faq.items.${key}.a`) },
        })),
      },
      {
        '@type': 'ItemList',
        name: t('products.title'),
        itemListElement: PRODUCTS.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: t(`products.items.${product.key}.name`),
            description: t(`products.items.${product.key}.desc`),
            image: product.image,
            brand: { '@type': 'Brand', name: 'LOOP Energy' },
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'KZT',
              availability: 'https://schema.org/InStock',
              url: `${SITE.url}/${locale}#products`,
            },
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Content is fully authored here, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Stats />
      <ProductInfo />
      <WhyUs />
      <Products />
      <HowToUse />
      <Audience />
      <Answers />
      <FAQ />
      <B2B />
    </>
  );
}

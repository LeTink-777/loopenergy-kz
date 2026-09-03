import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { ProductDetail } from '@/components/shop/ProductDetail';
import { routing } from '@/i18n/routing';
import { SITE } from '@/lib/constants';
import type { Locale } from '@/lib/content';
import { getProduct, visibleProducts, t as pick } from '@/lib/products';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => visibleProducts.map((product) => ({ locale, slug: product.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  const product = getProduct(slug);
  if (!product || product.hidden) return {};

  const name = pick(product.name, resolved);
  const description = pick(product.description, resolved);
  const path = `/shop/${slug}`;

  return {
    title: name,
    description,
    alternates: {
      canonical: `/${resolved}${path}`,
      languages: { ru: `/ru${path}`, kk: `/kz${path}`, 'x-default': `/ru${path}` },
    },
    openGraph: {
      type: 'website',
      url: `${SITE.url}/${resolved}${path}`,
      title: name,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: name }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved: Locale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(resolved);

  const product = getProduct(slug);
  // Withdrawn products answer 404 rather than quietly still selling.
  if (!product || product.hidden) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pick(product.name, resolved),
    description: pick(product.description, resolved),
    image: product.image,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'LOOP Energy' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KZT',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE.url}/${resolved}/shop/${product.slug}`,
    },
  };

  return (
    <div className="section-pad pt-[calc(var(--header-h)+var(--space-xl))]">
      <script
        type="application/ld+json"
        // Authored from src/lib/products.ts, never user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </div>
  );
}

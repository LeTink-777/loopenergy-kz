export const SITE = {
  name: 'LOOP Energy KZ',
  domain: 'loopenergy.kz',
  mirror: 'loop-energy.kz',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://loopenergy.kz',
} as const;

const ORIGIN = 'https://loopenergy.ru';

/** Brand assets are served from the manufacturer's CDN and optimised by next/image. */
export const IMG = {
  waves: `${ORIGIN}/images/home/bg-waves.png`,
  hero: `${ORIGIN}/images/home/hero.png`,
  why: `${ORIGIN}/images/home/why.png`,
  whyBg: `${ORIGIN}/images/home/why-bg.png`,
  feature1: `${ORIGIN}/images/home/feature-1.png`,
  feature2: `${ORIGIN}/images/home/feature-2.png`,
  feature3: `${ORIGIN}/images/home/feature-3.png`,
} as const;

/** Cyrillic filenames on the origin need percent-encoding before next/image sees them. */
const productImage = (file: string) => `${ORIGIN}/images/${encodeURIComponent(file)}`;

/**
 * Artwork only — every word and the price live in `src/lib/content.ts`,
 * keyed by the same `id`.
 */
export const PRODUCT_IMAGES: Record<string, string> = {
  'big-kit': `${ORIGIN}/images/big/drip.png`,
  'big-jar': productImage('Большаябанка.png'),
  'kiwi-fresh': productImage('КИВИ-ФРЭШ.png'),
  'creamy-blush': productImage('КРИМИ-БЛАШ.png'),
};

/** Kept for structured data, which needs an id → image map at build time. */
export const PRODUCTS = Object.entries(PRODUCT_IMAGES).map(([id, image]) => ({ id, image }));

/** `/`-prefixed entries are locale-aware routes; `#` entries scroll the homepage. */
export const NAV_LINKS = [
  { key: 'shop', href: '/shop' },
  { key: 'about', href: '/#product' },
  { key: 'delivery', href: '/delivery' },
  { key: 'wholesale', href: '/wholesale' },
  { key: 'faq', href: '/#faq' },
] as const;

/** The footer has room for the secondary pages the header bar cannot fit. */
export const FOOTER_LINKS = [
  ...NAV_LINKS,
  { key: 'certificates', href: '/certificates' },
] as const;

export const SOCIALS = [
  { key: 'telegram', label: 'Telegram', href: 'https://t.me/Pouches_kz' },
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/loop.energy.kz' },
  { key: 'tiktok', label: 'TikTok', href: 'https://tiktok.com/@loopenergy.official' },
] as const;

/**
 * One Telegram handle serves both retail and wholesale — there is no separate
 * wholesale account yet, and pointing at a handle that does not exist is worse
 * than sharing one that does.
 */
export const CONTACTS = {
  consumerTelegram: { label: '@Pouches_kz', href: 'https://t.me/Pouches_kz' },
  wholesaleTelegram: { label: '@Pouches_kz', href: 'https://t.me/Pouches_kz' },
  phone: { label: '+7 708 775 22 31', href: 'tel:+77087752231' },
  email: { label: 'info@loopenergy.kz', href: 'mailto:info@loopenergy.kz' },
} as const;

/** Icon name → the item `key` used in `content.why_us.items`. */
export const WHY_ICON_ORDER = ['noNicotine', 'noSugar', 'energy', 'taste', 'legal', 'portable'] as const;

export const formatTenge = (value: number) =>
  `${new Intl.NumberFormat('ru-RU').format(value).replace(/ /g, ' ')} ₸`;

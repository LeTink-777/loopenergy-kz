import type { Locale } from './content';

export type Localized = { ru: string; kz: string };

export interface Flavor {
  id: string;
  name: Localized;
  /** Hex swatch shown in the picker. */
  color: string;
  inStock: boolean;
}

export interface Strength {
  id: string;
  label: Localized;
  /** Caffeine per pouch. */
  mg: number;
}

export interface Product {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  description: Localized;
  image: string;
  images: string[];
  /** Kazakhstani tenge. */
  price: number;
  oldPrice?: number;
  badge?: Localized;
  flavors: Flavor[];
  strength: Strength[];
  inStock: boolean;
  isHit?: boolean;
  isNew?: boolean;
  category: 'kit' | 'jar' | 'single';
  caffeine: number;
  pouches: number;
}

const ORIGIN = 'https://loopenergy.ru';
const V = '?v=mt21jjez';

const STRENGTHS: Strength[] = [
  { id: 'soft', label: { ru: 'Мягкий', kz: 'Жұмсақ' }, mg: 30 },
  { id: 'medium', label: { ru: 'Средний', kz: 'Орташа' }, mg: 50 },
  { id: 'strong', label: { ru: 'Сильный', kz: 'Күшті' }, mg: 75 },
];

/**
 * Catalogue. Product copy lives here rather than in `content.ts` because each
 * entry is data first — slug, stock, variants — with localised labels attached.
 */
export const products: Product[] = [
  {
    id: 'big-kit',
    slug: 'bolshoy-komplekt',
    name: { ru: 'Большой комплект', kz: 'Үлкен жиынтық' },
    tagline: {
      ru: 'Попробуй все вкусы и найди свой',
      kz: 'Барлық дәмді көріп, өзіңдікін тап',
    },
    description: {
      ru: 'Идеальный старт — 15 вкусов, 5 крепостей. Не знаешь с чего начать? Начни с этого.',
      kz: 'Тамаша бастама — 15 дәм, 5 күш. Қайдан бастарыңды білмейсің бе? Осыдан баста.',
    },
    image: `${ORIGIN}/images/big/drip.png${V}`,
    images: [`${ORIGIN}/images/big/drip.png${V}`],
    price: 4990,
    oldPrice: 6990,
    badge: { ru: 'Выгодно', kz: 'Тиімді' },
    flavors: [],
    strength: [],
    inStock: true,
    category: 'kit',
    caffeine: 50,
    pouches: 150,
  },
  {
    id: 'big-jar',
    slug: 'bolshaya-banka',
    name: { ru: 'Большая банка', kz: 'Үлкен банка' },
    tagline: {
      ru: 'Максимальный запас — минимальная цена за пауч',
      kz: 'Максималды қор — паушқа минималды баға',
    },
    description: {
      ru: 'Твой любимый вкус оптом. 9 вкусов, 3 крепости — выбирай и заказывай с запасом.',
      kz: 'Сүйікті дәміңді үнемдей сатып ал. 9 дәм, 3 күш — таңда және қорға тапсырыс бер.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('Большаябанка.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('Большаябанка.png')}${V}`],
    price: 2490,
    badge: { ru: 'Популярное', kz: 'Танымал' },
    flavors: [],
    strength: [],
    inStock: true,
    category: 'jar',
    caffeine: 50,
    pouches: 60,
  },
  {
    id: 'kiwi-fresh',
    slug: 'kivi-fresh',
    name: { ru: 'КИВИ ФРЭШ', kz: 'КИВИ ФРЭШ' },
    tagline: {
      ru: 'Как укус в спелый киви — просыпаешься сразу',
      kz: 'Піскен киви тістегендей — бірден оянасың',
    },
    description: {
      ru: 'Яркий тропический вкус с первой секунды. Хит среди тех кто попробовал.',
      kz: 'Бірінші секунттан жарқын тропикалық дәм. Татып көргендердің хиті.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('КИВИ-ФРЭШ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('КИВИ-ФРЭШ.png')}${V}`],
    price: 890,
    badge: { ru: 'Хит', kz: 'Хит' },
    flavors: [
      { id: 'kiwi', name: { ru: 'Киви Фрэш', kz: 'Киви Фрэш' }, color: '#7CB342', inStock: true },
    ],
    strength: STRENGTHS,
    inStock: true,
    isHit: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
  },
  {
    id: 'creamy-blush',
    slug: 'krimi-blash',
    name: { ru: 'КРИМИ БЛАШ', kz: 'КРИМИ БЛАШ' },
    tagline: {
      ru: 'Мягкий сливочный — для тех кто не любит резкое',
      kz: 'Жұмсақ кремді — күрт дәмді ұнатпайтындарға',
    },
    description: {
      ru: 'Нежный вкус который не перебивает. Энергия без агрессии.',
      kz: 'Басып кетпейтін нәзік дәм. Агрессиясыз энергия.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('КРИМИ-БЛАШ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('КРИМИ-БЛАШ.png')}${V}`],
    price: 890,
    badge: { ru: 'Новинка', kz: 'Жаңалық' },
    flavors: [
      { id: 'cream', name: { ru: 'Крими Блаш', kz: 'Крими Блаш' }, color: '#F8BBD0', inStock: true },
    ],
    strength: STRENGTHS,
    inStock: true,
    isNew: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

/** Picks the active locale out of a `{ ru, kz }` field. */
export const t = (field: Localized, locale: Locale) => field[locale];

/** Same category first, then anything else, capped at three. */
export const relatedProducts = (slug: string, limit = 3) => {
  const current = getProduct(slug);
  if (!current) return products.slice(0, limit);

  const others = products.filter((p) => p.slug !== slug);
  const sameCategory = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);

  return [...sameCategory, ...rest].slice(0, limit);
};

export const CATEGORY_IDS = ['all', 'kit', 'jar', 'single'] as const;
export const STRENGTH_IDS = ['all', 'soft', 'medium', 'strong'] as const;
export const SORT_IDS = ['popular', 'price-asc', 'price-desc', 'new'] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];
export type StrengthId = (typeof STRENGTH_IDS)[number];
export type SortId = (typeof SORT_IDS)[number];

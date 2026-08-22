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
  /** Kazakhstani tenge — the only price shown to customers. */
  price: number;
  /** Source price on the Russian brand site, kept for repricing. */
  priceRub?: number;
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

/** Every single-flavour tin ships in the same three strengths. */
const STRENGTHS: Strength[] = [
  { id: 'soft', label: { ru: 'Мягкий', kz: 'Жұмсақ' }, mg: 30 },
  { id: 'medium', label: { ru: 'Средний', kz: 'Орташа' }, mg: 50 },
  { id: 'strong', label: { ru: 'Сильный', kz: 'Күшті' }, mg: 75 },
];

/**
 * Catalogue mirrored from loopenergy.ru. Product copy lives here rather than in
 * `content.ts` because each entry is data first — slug, stock, variants — with
 * localised labels attached. Tenge prices are the rouble list converted at 5:1.
 */
export const products: Product[] = [
  {
    id: 'big-kit',
    slug: 'bolshoy-komplekt',
    name: { ru: 'Большой комплект', kz: 'Үлкен жиынтық' },
    tagline: { ru: '+15 вкусов, +5 крепостей', kz: '+15 дәм, +5 күш' },
    description: {
      ru: 'Попробуй все вкусы и найди свой — 15 вкусов и 5 уровней крепости в одном наборе.',
      kz: 'Барлық дәмді тауып, өзіңдікін тап — 15 дәм және 5 күш деңгейі.',
    },
    image: `${ORIGIN}/images/big/drip.png${V}`,
    images: [`${ORIGIN}/images/big/drip.png${V}`],
    price: 24950,
    priceRub: 4990,
    badge: { ru: '+15 +5', kz: '+15 +5' },
    inStock: true,
    category: 'kit',
    caffeine: 50,
    pouches: 150,
    flavors: [],
    strength: [],
  },
  {
    id: 'showbox',
    slug: 'showbox',
    name: { ru: 'Шоубокс', kz: 'Шоубокс' },
    tagline: { ru: 'Весь ассортимент в одной коробке', kz: 'Барлық ассортимент бір қорапта' },
    description: {
      ru: 'Максимальный набор для тех кто хочет попробовать абсолютно всё.',
      kz: 'Барлығын татып көргісі келетіндерге арналған максималды жиынтық.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('Бокс.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('Бокс.png')}${V}`],
    price: 37500,
    priceRub: 7500,
    badge: { ru: 'ХИТ', kz: 'ХИТ' },
    inStock: true,
    isHit: true,
    category: 'kit',
    caffeine: 50,
    pouches: 240,
    flavors: [],
    strength: [],
  },
  {
    id: 'kiwi-fresh',
    slug: 'kiwifresh',
    name: { ru: 'КИВИ ФРЭШ', kz: 'КИВИ ФРЭШ' },
    tagline: { ru: 'Яркий тропический — просыпаешься сразу', kz: 'Жарқын тропикалық — бірден оянасың' },
    description: {
      ru: 'Сочный киви с освежающим послевкусием. Хит среди тех кто попробовал.',
      kz: 'Жаңартатын дәммен шырынды киви. Татып көргендердің хиті.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('КИВИ-ФРЭШ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('КИВИ-ФРЭШ.png')}${V}`],
    price: 1995,
    priceRub: 399,
    badge: { ru: 'NEW', kz: 'NEW' },
    inStock: true,
    isNew: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'kiwi', name: { ru: 'Киви Фрэш', kz: 'Киви Фрэш' }, color: '#7CB342', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'creamy-blush',
    slug: 'creamyblash',
    name: { ru: 'КРИМИ БЛАШ', kz: 'КРИМИ БЛАШ' },
    tagline: { ru: 'Нежный сливочный — энергия без агрессии', kz: 'Нәзік кремді — агрессиясыз энергия' },
    description: {
      ru: 'Мягкий вкус который не перебивает. Для тех кто не любит резкое.',
      kz: 'Басып кетпейтін жұмсақ дәм. Күрт дәмді ұнатпайтындарға.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('КРИМИ-БЛАШ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('КРИМИ-БЛАШ.png')}${V}`],
    price: 1995,
    priceRub: 399,
    badge: { ru: 'NEW', kz: 'NEW' },
    inStock: true,
    isNew: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'cream', name: { ru: 'Крими Блаш', kz: 'Крими Блаш' }, color: '#F8BBD0', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'sour-blast',
    slug: 'sourblast',
    name: { ru: 'СОУР БЛАСТ', kz: 'СОУР БЛАСТ' },
    tagline: { ru: 'Кислотный взрыв — не для слабаков', kz: 'Қышқыл жарылыс — әлсіздерге емес' },
    description: {
      ru: 'Резкая кислинка с взрывным послевкусием. Самый яркий вкус в линейке.',
      kz: 'Жарылыс дәмімен күрт қышқылдық. Желідегі ең жарқын дәм.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('СОУР-БЛАСТ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('СОУР-БЛАСТ.png')}${V}`],
    price: 1995,
    priceRub: 399,
    badge: { ru: 'NEW', kz: 'NEW' },
    inStock: true,
    isNew: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'sour', name: { ru: 'Соур Бласт', kz: 'Соур Бласт' }, color: '#CDDC39', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'frosty-berries',
    slug: 'frostyberries',
    name: { ru: 'ФРОСТИ БЭЙРИС', kz: 'ФРОСТИ БЭЙРИС' },
    tagline: { ru: 'Ледяные ягоды — холодный заряд', kz: 'Мұзды жидектер — суық заряд' },
    description: {
      ru: 'Смесь лесных ягод с ледяным охлаждающим эффектом.',
      kz: 'Мұзды салқындату әсерімен орман жидектерінің қоспасы.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ФРОСТИ-БЭЙРИС.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ФРОСТИ-БЭЙРИС.png')}${V}`],
    price: 1995,
    priceRub: 399,
    badge: { ru: 'NEW', kz: 'NEW' },
    inStock: true,
    isNew: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'berry', name: { ru: 'Фрости Бэйрис', kz: 'Фрости Бэйрис' }, color: '#7B1FA2', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'ice-baby',
    slug: 'icebaby',
    name: { ru: 'АЙС БЭЙБИ', kz: 'АЙС БЭЙБИ' },
    tagline: { ru: 'Чистый лёд — максимальная свежесть', kz: 'Таза мұз — максималды сергектік' },
    description: {
      ru: 'Мята и лёд. Самый освежающий в линейке.',
      kz: 'Жалбыз және мұз. Желідегі ең жаңартатын.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('АЙС-БЭЙБИ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('АЙС-БЭЙБИ.png')}${V}`],
    price: 1995,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'ice', name: { ru: 'Айс Бэйби', kz: 'Айс Бэйби' }, color: '#B3E5FC', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'bikini-bottom',
    slug: 'bikinibottom',
    name: { ru: 'БИКИНИ БОТТОМ', kz: 'БИКИНИ БОТТОМ' },
    tagline: { ru: 'Тропический коктейль под солнцем', kz: 'Күн астындағы тропикалық коктейль' },
    description: {
      ru: 'Экзотический фруктовый микс — как отпуск в банке.',
      kz: 'Экзотикалық жеміс миксі — банкадағы демалыс сияқты.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('БИКИНИ-БОТТОМ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('БИКИНИ-БОТТОМ.png')}${V}`],
    price: 1995,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'tropical', name: { ru: 'Бикини Боттом', kz: 'Бикини Боттом' }, color: '#FF9800', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'blue-gem',
    slug: 'bluegem',
    name: { ru: 'БЛЮ ГЕМ', kz: 'БЛЮ ГЕМ' },
    tagline: { ru: 'Синяя малина — редкий вкус', kz: 'Көк таңқурай — сирек дәм' },
    description: {
      ru: 'Насыщенная синяя малина с лёгкой кислинкой.',
      kz: 'Жеңіл қышқылдықпен қаныққан көк таңқурай.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('БЛЮ-ГЕМ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('БЛЮ-ГЕМ.png')}${V}`],
    price: 1995,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'blue', name: { ru: 'Блю Гем', kz: 'Блю Гем' }, color: '#1565C0', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'violet-splash',
    slug: 'violetsplash',
    name: { ru: 'ВАЙЛЕТ СПЛЭШ', kz: 'ВАЙЛЕТ СПЛЭШ' },
    tagline: { ru: 'Фиолетовый виноград — сладко и мощно', kz: 'Күлгін жүзім — тәтті және қуатты' },
    description: {
      ru: 'Спелый виноград с фиолетовым взрывом вкуса.',
      kz: 'Дәм күлгін жарылысымен пісіп жетілген жүзім.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ВАЙЛЕТ-СПЛЭШ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ВАЙЛЕТ-СПЛЭШ.png')}${V}`],
    price: 1995,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'violet', name: { ru: 'Вайлет Сплэш', kz: 'Вайлет Сплэш' }, color: '#9C27B0', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'vinograd',
    slug: 'vinograd',
    name: { ru: 'ВИНОГРАД', kz: 'ЖҮЗІМ' },
    tagline: { ru: 'Классический виноград — просто и вкусно', kz: 'Классикалық жүзім — қарапайым және дәмді' },
    description: {
      ru: 'Натуральный виноградный вкус без лишнего.',
      kz: 'Артық нәрсесіз натуралды жүзім дәмі.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ВИНОГРАД.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ВИНОГРАД.png')}${V}`],
    price: 1995,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'grape', name: { ru: 'Виноград', kz: 'Жүзім' }, color: '#6A1B9A', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'limezilla',
    slug: 'limezilla',
    name: { ru: 'ЛАЙМЗИЛЛА', kz: 'ЛАЙМЗИЛЛА' },
    tagline: { ru: 'Лайм атакует — кислота на максимум', kz: 'Лайм шабуылдайды — қышқылдық максимумда' },
    description: {
      ru: 'Концентрированный лайм — для тех кто любит острые ощущения.',
      kz: 'Шоғырланған лайм — күшті сезімді ұнататындарға.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ЛАЙМЗИЛЛА.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ЛАЙМЗИЛЛА.png')}${V}`],
    price: 1995,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'lime', name: { ru: 'Лаймзилла', kz: 'Лаймзилла' }, color: '#8BC34A', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'peach-beach',
    slug: 'peachbeach',
    name: { ru: 'ПИЧ БИЧ', kz: 'ПИЧ БИЧ' },
    tagline: { ru: 'Персик на пляже — сладко и легко', kz: 'Жағажайдағы шабдалы — тәтті және жеңіл' },
    description: {
      ru: 'Сочный персик с лёгкой летней ноткой.',
      kz: 'Жеңіл жазғы нотамен шырынды шабдалы.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ПИЧ-БИЧ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ПИЧ-БИЧ.png')}${V}`],
    price: 1995,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'peach', name: { ru: 'Пич Бич', kz: 'Пич Бич' }, color: '#FFAB91', inStock: true },
    ],
    strength: STRENGTHS,
  },
  {
    id: 'sicilian-drip',
    slug: 'siciliandrip',
    name: { ru: 'СИЦИЛИАН ДРИП', kz: 'СИЦИЛИАН ДРИП' },
    tagline: { ru: 'Сицилийский лимон — средиземноморская свежесть', kz: 'Сицилиялық лимон — Жерорта теңізі сергектігі' },
    description: {
      ru: 'Настоящий южный лимон — яркий, кислый, незабываемый.',
      kz: 'Шынайы оңтүстік лимон — жарқын, қышқыл, ұмытылмас.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('СИЦИЛИАН-ДРИП.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('СИЦИЛИАН-ДРИП.png')}${V}`],
    price: 1995,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 50,
    pouches: 20,
    flavors: [
      { id: 'lemon', name: { ru: 'Сицилиан Дрип', kz: 'Сицилиан Дрип' }, color: '#FDD835', inStock: true },
    ],
    strength: STRENGTHS,
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

export const ALL_CATEGORIES = ['kit', 'jar', 'single'] as const;
export type ProductCategory = (typeof ALL_CATEGORIES)[number];

/**
 * Only categories that actually have stock become filter chips — otherwise the
 * catalogue offers a filter that can only ever return nothing.
 */
export const CATEGORY_IDS = [
  'all',
  ...ALL_CATEGORIES.filter((c) => products.some((p) => p.category === c)),
] as const;

export const STRENGTH_IDS = ['all', 'soft', 'medium', 'strong'] as const;
export const SORT_IDS = ['popular', 'price-asc', 'price-desc', 'new'] as const;

export type CategoryId = 'all' | ProductCategory;
export type StrengthId = (typeof STRENGTH_IDS)[number];
export type SortId = (typeof SORT_IDS)[number];

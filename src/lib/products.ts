import type { Locale } from './content';

export type Localized = { ru: string; kz: string };

export interface Flavor {
  id: string;
  name: Localized;
  /** Hex swatch shown in the picker. */
  color: string;
  inStock: boolean;
}

export const ALL_CATEGORIES = ['set', 'single'] as const;
export type ProductCategory = (typeof ALL_CATEGORIES)[number];

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
  inStock: boolean;
  isHit?: boolean;
  isNew?: boolean;
  category: ProductCategory;
  /** Milligrams per pouch. The official leaflet states 100 mg. */
  caffeine: number;
  pouches: number;
  /** Kept in the catalogue so existing carts and past orders still resolve,
   *  but not offered anywhere a customer can reach. */
  hidden?: boolean;
}

const ORIGIN = 'https://loopenergy.ru';
const V = '?v=mt21jjez';

/**
 * Catalogue transcribed from the distributor's official B2C flavour sheet
 * (`public/assets/brand/b2c-full.png`): twelve tins, each 100 mg per pouch,
 * twenty pouches per tin. Taglines are the flavour descriptors printed under
 * each brand name on that sheet.
 */
export const products: Product[] = [
  {
    id: 'big-kit',
    slug: 'bolshoy-komplekt',
    name: { ru: 'Большой комплект', kz: 'Үлкен жиынтық' },
    tagline: { ru: '+15 вкусов — найди свой', kz: '+15 дәм — өзіңдікін тап' },
    description: {
      ru: 'В банке LOOP Energy 20 паучей — столько же энергии, сколько в 20 банках обычного энергетика. Зачем платить в 10 раз больше?',
      kz: 'LOOP Energy банкасында 20 пауш бар — кәдімгі энергетиктің 20 банкасындай энергия. Неге 10 есе көп төлейсіз?',
    },
    image: `${ORIGIN}/images/big/drip.png${V}`,
    images: [`${ORIGIN}/images/big/drip.png${V}`],
    price: 24950,
    oldPrice: 34950,
    priceRub: 4990,
    badge: { ru: '+15 +5', kz: '+15 +5' },
    inStock: true,
    category: 'set',
    caffeine: 100,
    pouches: 150,
    flavors: [],
    hidden: true,
  },
  {
    id: 'showbox',
    slug: 'showbox',
    name: { ru: 'Шоубокс', kz: 'Шоубокс' },
    tagline: { ru: 'Весь ассортимент в одной коробке', kz: 'Барлық ассортимент бір қорапта' },
    description: {
      ru: 'Максимальный набор — все вкусы сразу. Для тех кто хочет попробовать абсолютно всё.',
      kz: 'Максималды жиынтық — барлық дәмдер, барлық күштер. Барлығын татып көргісі келетіндерге.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('Бокс.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('Бокс.png')}${V}`],
    price: 37500,
    priceRub: 7500,
    badge: { ru: 'ХИТ', kz: 'ХИТ' },
    inStock: true,
    isHit: true,
    category: 'set',
    caffeine: 100,
    pouches: 240,
    flavors: [],
  },
  {
    id: 'violet-splash',
    slug: 'violet-splash',
    name: { ru: 'ВАЙЛЕТ СПЛЭШ', kz: 'ВАЙЛЕТ СПЛЭШ' },
    tagline: { ru: 'Лесные ягоды', kz: 'Орман жидектері' },
    description: {
      ru: 'Спелые лесные ягоды с фиолетовым взрывом вкуса. Самый узнаваемый в линейке.',
      kz: 'Күлгін дәм жарылысымен піскен орман жидектері. Желідегі ең танымал.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ВАЙЛЕТ-СПЛЭШ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ВАЙЛЕТ-СПЛЭШ.png')}${V}`],
    price: 2200,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'violet-splash', name: { ru: 'Лесные ягоды', kz: 'Орман жидектері' }, color: '#7B1FA2', inStock: true },
    ],
  },
  {
    id: 'bikini-bottom',
    slug: 'bikini-bottom',
    name: { ru: 'БИКИНИ БОТТОМ', kz: 'БИКИНИ БОТТОМ' },
    tagline: { ru: 'Ананас', kz: 'Ананас' },
    description: {
      ru: 'Сочный тропический ананас — как отпуск в пауче.',
      kz: 'Шырынды тропикалық ананас — пауштағы демалыс сияқты.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('БИКИНИ-БОТТОМ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('БИКИНИ-БОТТОМ.png')}${V}`],
    price: 2200,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'bikini-bottom', name: { ru: 'Ананас', kz: 'Ананас' }, color: '#F9A825', inStock: true },
    ],
  },
  {
    id: 'frosty-berries',
    slug: 'frosty-berries',
    name: { ru: 'ФРОСТИ БЭЙРИС', kz: 'ФРОСТИ БЭЙРИС' },
    tagline: { ru: 'Мята и малина', kz: 'Жалбыз және таңқурай' },
    description: {
      ru: 'Малина встречается с ледяной мятой. Освежает и бодрит одновременно.',
      kz: 'Таңқурай мұзды жалбызбен кездеседі. Бір мезгілде сергітеді де, қуат береді де.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ФРОСТИ-БЭЙРИС.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ФРОСТИ-БЭЙРИС.png')}${V}`],
    price: 2200,
    priceRub: 399,
    badge: { ru: 'NEW', kz: 'NEW' },
    isNew: true,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'frosty-berries', name: { ru: 'Мята и малина', kz: 'Жалбыз және таңқурай' }, color: '#E91E8C', inStock: true },
    ],
  },
  {
    id: 'blue-gem',
    slug: 'blue-gem',
    name: { ru: 'БЛЮ ГЕМ', kz: 'БЛЮ ГЕМ' },
    tagline: { ru: 'Тропические фрукты', kz: 'Тропикалық жемістер' },
    description: {
      ru: 'Микс тропических фруктов с ледяным послевкусием. Редкий вкус который запоминается.',
      kz: 'Мұзды дәммен тропикалық жемістер миксі. Есте қалатын сирек дәм.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('БЛЮ-ГЕМ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('БЛЮ-ГЕМ.png')}${V}`],
    price: 2200,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'blue-gem', name: { ru: 'Тропические фрукты', kz: 'Тропикалық жемістер' }, color: '#1565C0', inStock: true },
    ],
  },
  {
    id: 'sicilian-drip',
    slug: 'sicilian-drip',
    name: { ru: 'СИЦИЛИАН ДРИП', kz: 'СИЦИЛИАН ДРИП' },
    tagline: { ru: 'Апельсин', kz: 'Апельсин' },
    description: {
      ru: 'Настоящий сицилийский апельсин — яркий, сочный, незабываемый.',
      kz: 'Шынайы сицилиялық апельсин — жарқын, шырынды, ұмытылмас.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('СИЦИЛИАН-ДРИП.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('СИЦИЛИАН-ДРИП.png')}${V}`],
    price: 2200,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'sicilian-drip', name: { ru: 'Апельсин', kz: 'Апельсин' }, color: '#FF6F00', inStock: true },
    ],
  },
  {
    id: 'sour-blast',
    slug: 'sour-blast',
    name: { ru: 'СОУР БЛАСТ', kz: 'СОУР БЛАСТ' },
    tagline: { ru: 'Лимон, ананас и клубника', kz: 'Лимон, ананас және құлпынай' },
    description: {
      ru: 'Три фрукта — один взрыв. Самый кислый и яркий вкус в линейке. Не для слабаков.',
      kz: 'Үш жеміс — бір жарылыс. Желідегі ең қышқыл және жарқын дәм. Әлсіздерге емес.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('СОУР-БЛАСТ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('СОУР-БЛАСТ.png')}${V}`],
    price: 2200,
    priceRub: 399,
    badge: { ru: 'NEW', kz: 'NEW' },
    isNew: true,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'sour-blast', name: { ru: 'Лимон, ананас и клубника', kz: 'Лимон, ананас және құлпынай' }, color: '#CDDC39', inStock: true },
    ],
  },
  {
    id: 'vinograd',
    slug: 'vinograd',
    name: { ru: 'ВИНОГРАД', kz: 'ВИНОГРАД' },
    tagline: { ru: 'Виноград', kz: 'Жүзім' },
    description: {
      ru: 'Натуральный виноградный вкус без лишнего. Просто и вкусно.',
      kz: 'Артық нәрсесіз натуралды жүзім дәмі. Қарапайым және дәмді.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ВИНОГРАД.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ВИНОГРАД.png')}${V}`],
    price: 2200,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'vinograd', name: { ru: 'Виноград', kz: 'Жүзім' }, color: '#6A1B9A', inStock: true },
    ],
  },
  {
    id: 'limezilla',
    slug: 'limezilla',
    name: { ru: 'ЛАЙМЗИЛЛА', kz: 'ЛАЙМЗИЛЛА' },
    tagline: { ru: 'Лайм', kz: 'Лайм' },
    description: {
      ru: 'Концентрированный лайм атакует с первой секунды. Для тех кто любит острые ощущения.',
      kz: 'Шоғырланған лайм бірінші секунттан шабуылдайды. Күшті сезімді ұнататындарға.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ЛАЙМЗИЛЛА.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ЛАЙМЗИЛЛА.png')}${V}`],
    price: 2200,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'limezilla', name: { ru: 'Лайм', kz: 'Лайм' }, color: '#8BC34A', inStock: true },
    ],
  },
  {
    id: 'creamy-blush',
    slug: 'creamy-blash',
    name: { ru: 'КРИМИ БЛАШ', kz: 'КРИМИ БЛАШ' },
    tagline: { ru: 'Клубника со сливками', kz: 'Кілегеймен құлпынай' },
    description: {
      ru: 'Клубника со сливками в формате пауча. Мягкий вкус который не перебивает — энергия без агрессии.',
      kz: 'Пауш форматындағы кілегеймен құлпынай. Басып кетпейтін жұмсақ дәм — агрессиясыз энергия.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('КРИМИ-БЛАШ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('КРИМИ-БЛАШ.png')}${V}`],
    price: 2200,
    priceRub: 399,
    badge: { ru: 'NEW', kz: 'NEW' },
    isNew: true,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'creamy-blush', name: { ru: 'Клубника со сливками', kz: 'Кілегеймен құлпынай' }, color: '#F8BBD0', inStock: true },
    ],
  },
  {
    id: 'ice-baby',
    slug: 'ice-baby',
    name: { ru: 'АЙС БЭЙБИ', kz: 'АЙС БЭЙБИ' },
    tagline: { ru: 'Сладкая мята', kz: 'Тәтті жалбыз' },
    description: {
      ru: 'Сладкая мята с ледяным охлаждающим эффектом. Самый освежающий в линейке.',
      kz: 'Мұзды салқындату әсерімен тәтті жалбыз. Желідегі ең жаңартатын.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('АЙС-БЭЙБИ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('АЙС-БЭЙБИ.png')}${V}`],
    price: 2200,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'ice-baby', name: { ru: 'Сладкая мята', kz: 'Тәтті жалбыз' }, color: '#B3E5FC', inStock: true },
    ],
  },
  {
    id: 'peach-beach',
    slug: 'peach-beach',
    name: { ru: 'ПИЧ БИЧ', kz: 'ПИЧ БИЧ' },
    tagline: { ru: 'Персик', kz: 'Шабдалы' },
    description: {
      ru: 'Спелый персик с лёгкой летней ноткой. Мягко заходит, долго держит.',
      kz: 'Жеңіл жазғы нотамен піскен шабдалы. Жұмсақ кіреді, ұзақ ұстайды.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('ПИЧ-БИЧ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('ПИЧ-БИЧ.png')}${V}`],
    price: 2200,
    priceRub: 399,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'peach-beach', name: { ru: 'Персик', kz: 'Шабдалы' }, color: '#FFAB91', inStock: true },
    ],
  },
  {
    id: 'kiwi-fresh',
    slug: 'kivi-fresh',
    name: { ru: 'КИВИ ФРЭШ', kz: 'КИВИ ФРЭШ' },
    tagline: { ru: 'Яблоко и киви', kz: 'Алма және киви' },
    description: {
      ru: 'Сочный киви с яблочной свежестью. Хит среди тех кто попробовал.',
      kz: 'Алма сергектігімен шырынды киви. Татып көргендердің хиті.',
    },
    image: `${ORIGIN}/images/${encodeURIComponent('КИВИ-ФРЭШ.png')}${V}`,
    images: [`${ORIGIN}/images/${encodeURIComponent('КИВИ-ФРЭШ.png')}${V}`],
    price: 2200,
    priceRub: 399,
    badge: { ru: 'NEW', kz: 'NEW' },
    isNew: true,
    isHit: true,
    inStock: true,
    category: 'single',
    caffeine: 100,
    pouches: 20,
    flavors: [
      { id: 'kiwi-fresh', name: { ru: 'Яблоко и киви', kz: 'Алма және киви' }, color: '#7CB342', inStock: true },
    ],
  },
];

/** Everything a customer may see: the catalogue minus anything withdrawn. */
export const visibleProducts = products.filter((p) => !p.hidden);

/** Resolves hidden products too — an order placed before it was withdrawn
 *  must still render. Pages that serve customers check `hidden` themselves. */
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

/** Only categories that actually have stock become filter chips. */
export const CATEGORY_IDS = [
  'all',
  ...ALL_CATEGORIES.filter((c) => products.some((p) => p.category === c)),
] as const;

export const SORT_IDS = ['popular', 'price-asc', 'price-desc', 'new'] as const;

export type CategoryId = 'all' | ProductCategory;
export type SortId = (typeof SORT_IDS)[number];

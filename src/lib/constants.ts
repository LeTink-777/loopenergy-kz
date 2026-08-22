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

export type Product = {
  id: string;
  key: 'kit' | 'jar' | 'kiwi' | 'creamy';
  image: string;
  price: number;
  oldPrice?: number;
  badge?: 'hit' | 'new' | 'profit';
  caffeine: number;
  portions: number;
};

/** Cyrillic filenames on the origin need percent-encoding before next/image sees them. */
const productImage = (file: string) => `${ORIGIN}/images/${encodeURIComponent(file)}`;

export const PRODUCTS: Product[] = [
  {
    id: 'big-kit',
    key: 'kit',
    image: `${ORIGIN}/images/big/drip.png`,
    price: 24900,
    oldPrice: 29900,
    badge: 'profit',
    caffeine: 50,
    portions: 100,
  },
  {
    id: 'big-jar',
    key: 'jar',
    image: productImage('Большаябанка.png'),
    price: 9900,
    caffeine: 50,
    portions: 40,
  },
  {
    id: 'kiwi-fresh',
    key: 'kiwi',
    image: productImage('КИВИ-ФРЭШ.png'),
    price: 3490,
    badge: 'hit',
    caffeine: 50,
    portions: 20,
  },
  {
    id: 'creamy-blush',
    key: 'creamy',
    image: productImage('КРИМИ-БЛАШ.png'),
    price: 3490,
    badge: 'new',
    caffeine: 50,
    portions: 20,
  },
];

export const NAV_LINKS = [
  { key: 'home', href: '#hero' },
  { key: 'catalog', href: '#products' },
  { key: 'about', href: '#product' },
  { key: 'partnership', href: '#b2b' },
  { key: 'faq', href: '#faq' },
] as const;

export const SOCIALS = [
  { key: 'telegram', label: 'Telegram', href: 'https://t.me/loop_energy' },
  { key: 'instagram', label: 'Instagram', href: 'https://instagram.com/loopenergy.official' },
  { key: 'youtube', label: 'YouTube', href: 'https://youtube.com/@loop_energy' },
  { key: 'tiktok', label: 'TikTok', href: 'https://tiktok.com/@loopenergy.official' },
] as const;

export const CONTACTS = {
  consumerTelegram: { label: '@loop_energy_manager', href: 'https://t.me/loop_energy_manager' },
  wholesaleTelegram: { label: '@loopenergysale', href: 'https://t.me/loopenergysale' },
  phone: { label: '+7 (700) 000-00-00', href: 'tel:+77000000000' },
  email: { label: 'b2b@loopenergy.kz', href: 'mailto:b2b@loopenergy.kz' },
} as const;

export const CITIES = [
  'Астана',
  'Алматы',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Атырау',
  'Костанай',
  'Кызылорда',
  'Уральск',
  'Петропавловск',
  'Актау',
  'Туркестан',
] as const;

export const STATS = [
  { key: 'caffeine', value: 50, suffix: '+' },
  { key: 'noNicotine', value: 0, suffix: '' },
  { key: 'effect', value: 30, suffix: '' },
  { key: 'legal', value: 100, suffix: '%' },
] as const;

export const WHY_ITEMS = [
  'noNicotine',
  'noSugar',
  'energy',
  'taste',
  'legal',
  'portable',
] as const;

export const HOW_STEPS = ['take', 'place', 'wait', 'dispose'] as const;

export const AUDIENCE = [
  { key: 'athletes', icon: 'Dumbbell' },
  { key: 'gamers', icon: 'Gamepad2' },
  { key: 'students', icon: 'GraduationCap' },
  { key: 'nightShifts', icon: 'Moon' },
  { key: 'office', icon: 'Briefcase' },
] as const;

export const FAQ_KEYS = ['what', 'nicotine', 'safe', 'howMany', 'legal', 'delivery'] as const;

export const ANSWER_KEYS = ['effect', 'taste', 'storage', 'age'] as const;

export const formatTenge = (value: number) =>
  `${new Intl.NumberFormat('ru-RU').format(value).replace(/ /g, ' ')} ₸`;

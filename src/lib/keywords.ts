/**
 * Keyword map for the Kazakhstan market.
 *
 * Volumes are modelled estimates, not pulled from Yandex Wordstat — treat them
 * as relative weighting for prioritisation, and re-check against a live
 * Wordstat / Keyword Planner export before committing ad spend.
 */

export type Intent = 'informational' | 'commercial' | 'transactional' | 'navigational';

export type Keyword = {
  keyword: string;
  estMonthly: number;
  intent: Intent;
};

/** Head terms — these drive the homepage h1, title and opening paragraph. */
export const highVolumePrimary: Keyword[] = [
  { keyword: 'кофеиновые паучи', estMonthly: 8400, intent: 'informational' },
  { keyword: 'купить паучи Казахстан', estMonthly: 5200, intent: 'transactional' },
  { keyword: 'паучи без никотина', estMonthly: 4100, intent: 'commercial' },
  { keyword: 'Loop Energy купить', estMonthly: 3800, intent: 'transactional' },
  { keyword: 'энергетик без сахара Казахстан', estMonthly: 3200, intent: 'commercial' },
  { keyword: 'кофеиновые паучи Казахстан', estMonthly: 2900, intent: 'commercial' },
  { keyword: 'сухой энергетик', estMonthly: 2700, intent: 'informational' },
  { keyword: 'Loop Energy Казахстан', estMonthly: 2400, intent: 'navigational' },
  { keyword: 'паучи с кофеином купить', estMonthly: 2200, intent: 'transactional' },
  { keyword: 'кофеиновый снюс', estMonthly: 2100, intent: 'informational' },
  { keyword: 'энергетик под губу', estMonthly: 1900, intent: 'informational' },
  { keyword: 'Loop Energy официальный сайт', estMonthly: 1800, intent: 'navigational' },
  { keyword: 'кофеиновые подушечки', estMonthly: 1650, intent: 'informational' },
  { keyword: 'паучи Loop', estMonthly: 1500, intent: 'navigational' },
  { keyword: 'бодрость без кофе', estMonthly: 1400, intent: 'informational' },
  { keyword: 'кофеин 50 мг паучи', estMonthly: 1300, intent: 'commercial' },
  { keyword: 'энергетик без напитка', estMonthly: 1200, intent: 'informational' },
  { keyword: 'паучи цена Казахстан', estMonthly: 1150, intent: 'transactional' },
  { keyword: 'легальные паучи Казахстан', estMonthly: 1050, intent: 'commercial' },
  { keyword: 'заменитель энергетика', estMonthly: 980, intent: 'informational' },
];

/** Mid-tail, heavily city-weighted — Kazakhstan search skews local. */
export const mediumVolumeSecondary: Keyword[] = [
  { keyword: 'кофеиновые паучи Алматы', estMonthly: 2800, intent: 'transactional' },
  { keyword: 'кофеиновые паучи Астана', estMonthly: 2400, intent: 'transactional' },
  { keyword: 'Loop Energy Алматы', estMonthly: 1900, intent: 'transactional' },
  { keyword: 'Loop Energy Астана', estMonthly: 1700, intent: 'transactional' },
  { keyword: 'паучи Шымкент купить', estMonthly: 1200, intent: 'transactional' },
  { keyword: 'кофеиновые паучи Караганда', estMonthly: 900, intent: 'transactional' },
  { keyword: 'кофеиновые паучи Актобе', estMonthly: 780, intent: 'transactional' },
  { keyword: 'паучи доставка Казахстан', estMonthly: 1600, intent: 'transactional' },
  { keyword: 'Loop Energy отзывы', estMonthly: 1500, intent: 'commercial' },
  { keyword: 'кофеиновые паучи состав', estMonthly: 1400, intent: 'informational' },
  { keyword: 'Loop Energy вкусы', estMonthly: 1250, intent: 'commercial' },
  { keyword: 'кофеиновые паучи оптом', estMonthly: 1100, intent: 'transactional' },
  { keyword: 'Loop Energy оптом Казахстан', estMonthly: 950, intent: 'transactional' },
  { keyword: 'дистрибьютор энергетиков Казахстан', estMonthly: 870, intent: 'transactional' },
  { keyword: 'паучи для магазина закупка', estMonthly: 640, intent: 'transactional' },
  { keyword: 'кофеиновые паучи как использовать', estMonthly: 1350, intent: 'informational' },
  { keyword: 'сколько кофеина в пауче', estMonthly: 1100, intent: 'informational' },
  { keyword: 'кофеиновые паучи для тренировок', estMonthly: 820, intent: 'commercial' },
  { keyword: 'энергетик для геймеров', estMonthly: 760, intent: 'commercial' },
  { keyword: 'что лучше энергетик или паучи', estMonthly: 590, intent: 'informational' },
];

/** Long tail — objection-handling and comparison queries feed the FAQ. */
export const longTail: Keyword[] = [
  { keyword: 'кофеиновые паучи вред или польза', estMonthly: 480, intent: 'informational' },
  { keyword: 'кофеиновые паучи вред для здоровья', estMonthly: 460, intent: 'informational' },
  { keyword: 'паучи вместо кофе утром', estMonthly: 430, intent: 'informational' },
  { keyword: 'есть ли привыкание к кофеиновым паучам', estMonthly: 410, intent: 'informational' },
  { keyword: 'сколько паучей можно в день', estMonthly: 395, intent: 'informational' },
  { keyword: 'кофеиновые паучи через сколько действует', estMonthly: 380, intent: 'informational' },
  { keyword: 'чем отличаются кофеиновые паучи от никотиновых', estMonthly: 360, intent: 'informational' },
  { keyword: 'кофеиновые паучи разрешены в Казахстане', estMonthly: 340, intent: 'informational' },
  { keyword: 'нужна ли лицензия на кофеиновые паучи', estMonthly: 290, intent: 'informational' },
  { keyword: 'кофеиновые паучи с какого возраста', estMonthly: 285, intent: 'informational' },
  { keyword: 'как хранить кофеиновые паучи', estMonthly: 260, intent: 'informational' },
  { keyword: 'кофеиновые паучи куда девать после использования', estMonthly: 240, intent: 'informational' },
  { keyword: 'кофеиновые паучи можно ли глотать', estMonthly: 230, intent: 'informational' },
  { keyword: 'Loop Energy киви фрэш отзывы', estMonthly: 225, intent: 'commercial' },
  { keyword: 'Loop Energy крими блаш вкус', estMonthly: 210, intent: 'commercial' },
  { keyword: 'большая банка Loop Energy цена', estMonthly: 205, intent: 'transactional' },
  { keyword: 'большой комплект Loop Energy что входит', estMonthly: 190, intent: 'commercial' },
  { keyword: 'кофеиновые паучи перед тренировкой', estMonthly: 185, intent: 'informational' },
  { keyword: 'кофеиновые паучи на ночной смене', estMonthly: 175, intent: 'informational' },
  { keyword: 'кофеиновые паучи для студентов сессия', estMonthly: 160, intent: 'informational' },
  { keyword: 'паучи без сахара для диабетиков', estMonthly: 155, intent: 'informational' },
  { keyword: 'кофеиновые паучи сколько стоят в Казахстане', estMonthly: 150, intent: 'transactional' },
  { keyword: 'где купить кофеиновые паучи в Алматы', estMonthly: 145, intent: 'transactional' },
  { keyword: 'кофеиновые паучи доставка Астана сегодня', estMonthly: 130, intent: 'transactional' },
  { keyword: 'Loop Energy официальный дистрибьютор Казахстан', estMonthly: 125, intent: 'navigational' },
  { keyword: 'кофеиновые паучи оптом от производителя', estMonthly: 115, intent: 'transactional' },
  { keyword: 'кофеиновые паучи для вейп шопа', estMonthly: 95, intent: 'transactional' },
  { keyword: 'закупка энергетиков для киберклуба', estMonthly: 85, intent: 'transactional' },
  { keyword: 'кофеиновые паучи таурин состав', estMonthly: 75, intent: 'informational' },
  { keyword: 'кофеиновые паучи сертификат качества', estMonthly: 60, intent: 'informational' },
];

/** Kazakh-language demand — smaller but almost uncontested. */
export const kazakhKeywords: Keyword[] = [
  { keyword: 'кофеин пауштары', estMonthly: 720, intent: 'informational' },
  { keyword: 'кофеин пауштарын сатып алу', estMonthly: 610, intent: 'transactional' },
  { keyword: 'никотинсіз пауштар', estMonthly: 540, intent: 'commercial' },
  { keyword: 'Loop Energy Қазақстан', estMonthly: 480, intent: 'navigational' },
  { keyword: 'қантсыз энергетик', estMonthly: 430, intent: 'commercial' },
  { keyword: 'құрғақ энергетик', estMonthly: 380, intent: 'informational' },
  { keyword: 'кофеин пауштары бағасы', estMonthly: 340, intent: 'transactional' },
  { keyword: 'кофеин пауштары Алматы', estMonthly: 310, intent: 'transactional' },
  { keyword: 'кофеин пауштары Астана', estMonthly: 285, intent: 'transactional' },
  { keyword: 'кофеин пауштары құрамы', estMonthly: 240, intent: 'informational' },
  { keyword: 'кофеин пауштары қалай қолданылады', estMonthly: 215, intent: 'informational' },
  { keyword: 'кофеин пауштары зияны', estMonthly: 190, intent: 'informational' },
  { keyword: 'кофеин пауштары Қазақстанда заңды ма', estMonthly: 165, intent: 'informational' },
  { keyword: 'кофеин пауштары көтерме', estMonthly: 130, intent: 'transactional' },
  { keyword: 'ресми дистрибьютор Loop Energy', estMonthly: 95, intent: 'navigational' },
];

/**
 * Exclude from paid targeting: nicotine intent, competitor products and
 * freebie traffic all convert badly and drag the product into the wrong
 * regulatory conversation.
 */
export const negativeKeywords: string[] = [
  'никотиновые паучи',
  'снюс купить',
  'снюс никотин',
  'табак',
  'сигареты',
  'вейп жидкость',
  'бесплатно',
  'скачать',
  'своими руками',
  'как бросить',
];

/** Page-level clusters — one primary term per page, no cannibalisation. */
export const keywordClusters = {
  homepage: {
    primary: 'кофеиновые паучи Казахстан',
    secondary: ['купить паучи без никотина', 'Loop Energy официальный сайт КЗ', 'сухой энергетик купить'],
    lsi: ['сухой энергетик', 'энергия без кофе', 'бодрость без напитка', '50 мг кофеина', 'без сахара и никотина'],
  },
  product: {
    primary: 'купить Loop Energy Алматы',
    secondary: ['цена кофеиновых паучей', 'Loop Energy отзывы', 'Loop Energy вкусы'],
    lsi: ['кофеин паучи состав', 'киви фрэш', 'крими блаш', 'большая банка', 'большой комплект'],
  },
  b2b: {
    primary: 'Loop Energy оптом Казахстан',
    secondary: ['кофеиновые паучи оптом', 'дистрибьютор энергетиков КЗ'],
    lsi: ['паучи для магазина', 'оптовые поставки энергетиков', 'закупка для вейп шопа', 'киберклуб', 'АЗС'],
  },
  faq: {
    primary: 'кофеиновые паучи как использовать',
    secondary: ['сколько паучей можно в день', 'кофеиновые паучи вред'],
    lsi: ['привыкание', 'через сколько действует', 'с какого возраста', 'как хранить'],
  },
} as const;

/** Flat list for the `keywords` meta tag, ordered by modelled volume. */
export const metaKeywords = (locale: 'ru' | 'kz'): string[] =>
  locale === 'kz'
    ? kazakhKeywords.slice(0, 12).map((k) => k.keyword)
    : [...highVolumePrimary.slice(0, 10), ...mediumVolumeSecondary.slice(0, 6)].map((k) => k.keyword);

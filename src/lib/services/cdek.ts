import type {
  DeliveryCalculateParams,
  DeliveryKind,
  DeliveryPoint,
  DeliveryTariff,
} from './types';

const CDEK_API = 'https://api.cdek.ru/v2';

/** Live calls switch on the moment both credentials exist — no code change. */
const isLive = () => Boolean(process.env.CDEK_CLIENT_ID && process.env.CDEK_CLIENT_SECRET);

/** Roubles on the CDEK side; the storefront only ever shows tenge. */
const RUB_TO_KZT = 5;

async function getToken(): Promise<string> {
  const res = await fetch(`${CDEK_API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.CDEK_CLIENT_ID!,
      client_secret: process.env.CDEK_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) throw new Error(`CDEK auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

const STUB_TARIFFS: DeliveryTariff[] = [
  {
    id: 'cdek-pvz',
    name: { ru: 'До ПВЗ СДЭК', kz: 'СДЭК ПВЗ-ге дейін' },
    operator: 'cdek',
    type: 'pvz',
    price: 1200,
    daysMin: 3,
    daysMax: 5,
    daysLabel: '3–5 дн.',
  },
  {
    id: 'cdek-postamat',
    name: { ru: 'До постамата', kz: 'Постаматқа дейін' },
    operator: 'cdek',
    type: 'postamat',
    price: 1200,
    daysMin: 3,
    daysMax: 5,
    daysLabel: '3–5 дн.',
  },
  {
    id: 'cdek-express-pvz',
    name: { ru: 'Экспресс ПВЗ', kz: 'Экспресс ПВЗ' },
    operator: 'cdek',
    type: 'pvz',
    price: 2000,
    daysMin: 2,
    daysMax: 3,
    daysLabel: '2–3 дн.',
  },
  {
    id: 'cdek-courier',
    name: { ru: 'Курьер до двери', kz: 'Есікке дейін курьер' },
    operator: 'cdek',
    type: 'courier',
    price: 2500,
    daysMin: 3,
    daysMax: 5,
    daysLabel: '3–5 дн.',
  },
];

type CdekTariff = {
  tariff_code: number;
  tariff_name: string;
  delivery_mode: number;
  delivery_sum: number;
  period_min: number;
  period_max: number;
};

export async function cdekCalculate(params: DeliveryCalculateParams): Promise<DeliveryTariff[]> {
  if (!isLive()) {
    console.info('[CDEK STUB] calculate', params.toCity);
    return STUB_TARIFFS;
  }

  const token = await getToken();
  const res = await fetch(`${CDEK_API}/calculator/tarifflist`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from_location: { city: params.fromCity },
      to_location: { city: params.toCity },
      packages: [
        {
          weight: Math.round(params.weight * 1000),
          length: params.length,
          width: params.width,
          height: params.height,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`CDEK calculate failed: ${res.status}`);
  const data = (await res.json()) as { tariff_codes?: CdekTariff[] };

  return (data.tariff_codes ?? []).map((tariff) => ({
    id: `cdek-${tariff.tariff_code}`,
    name: { ru: tariff.tariff_name, kz: tariff.tariff_name },
    operator: 'cdek' as const,
    type: tariff.delivery_mode === 1 ? ('pvz' as const) : ('courier' as const),
    price: Math.round(tariff.delivery_sum * RUB_TO_KZT),
    daysMin: tariff.period_min,
    daysMax: tariff.period_max,
    daysLabel: `${tariff.period_min}–${tariff.period_max} дн.`,
  }));
}

const STUB_POINTS: DeliveryPoint[] = [
  {
    id: 'cdek-point-1',
    name: 'ПВЗ СДЭК Алматы Центр',
    address: 'г. Алматы, ул. Абая 10',
    lat: 43.2565,
    lng: 76.9286,
    type: 'pvz',
    operator: 'cdek',
    workHours: 'Пн–Пт 9:00–20:00, Сб 10:00–18:00',
  },
  {
    id: 'cdek-point-2',
    name: 'ПВЗ СДЭК Алматы Бостандык',
    address: 'г. Алматы, пр. Достык 134',
    lat: 43.2389,
    lng: 76.9538,
    type: 'pvz',
    operator: 'cdek',
    workHours: 'Ежедневно 9:00–21:00',
  },
];

type CdekPoint = {
  code: string;
  name: string;
  location: { address: string; latitude: number; longitude: number };
  work_time?: string;
  phones?: { number: string }[];
};

export async function cdekGetPoints(city: string): Promise<DeliveryPoint[]> {
  if (!isLive()) {
    console.info('[CDEK STUB] points', city);
    return STUB_POINTS;
  }

  const token = await getToken();
  const res = await fetch(
    `${CDEK_API}/deliverypoints?city_code=${encodeURIComponent(city)}&type=PVZ&is_handout=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) throw new Error(`CDEK points failed: ${res.status}`);
  const data = (await res.json()) as CdekPoint[];

  return data.map((point) => ({
    id: point.code,
    name: point.name,
    address: point.location.address,
    lat: point.location.latitude,
    lng: point.location.longitude,
    type: 'pvz' as const,
    operator: 'cdek' as const,
    workHours: point.work_time,
    phone: point.phones?.[0]?.number,
  }));
}

export type DeliveryQuote = {
  pvz: { price: number; days: string };
  courier: { price: number; days: string };
  /** False while the figures are the fallback rather than CDEK's own. */
  live: boolean;
};

/**
 * What the checkout needs: one price per delivery shape, in tenge.
 *
 * Falls back to flat figures until both credentials exist, so the shape of the
 * answer never changes and the caller needs no branch of its own. The moment
 * the keys land, real tariffs flow through the same call.
 */
export async function getCdekDeliveryCost(toCity: string, weightKg = 0.5): Promise<DeliveryQuote> {
  const fallback: DeliveryQuote = {
    pvz: { price: 800, days: '3–7' },
    courier: { price: 1200, days: '2–5' },
    live: false,
  };

  if (!isLive()) return fallback;

  try {
    const tariffs = await cdekCalculate({
      fromCity: 'Алматы',
      toCity,
      weight: weightKg,
      length: 20,
      width: 15,
      height: 10,
      declaredValue: 0,
    });
    if (!tariffs.length) return fallback;

    const cheapest = (kinds: DeliveryKind[]) => {
      const pool = tariffs.filter((t) => kinds.includes(t.type));
      const use = pool.length ? pool : tariffs;
      return use.reduce((a, b) => (a.price <= b.price ? a : b));
    };

    const p = cheapest(['pvz', 'postamat']);
    const c = cheapest(['courier', 'express']);
    return {
      pvz: { price: Math.round(p.price), days: p.daysLabel },
      courier: { price: Math.round(c.price), days: c.daysLabel },
      live: true,
    };
  } catch (error) {
    console.error('[cdek] quote failed, using fallback', error);
    return fallback;
  }
}

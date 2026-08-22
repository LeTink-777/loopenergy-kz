import type { DeliveryPoint, DeliveryTariff } from './types';

const isLive = () => Boolean(process.env.KASPI_API_KEY && process.env.KASPI_MERCHANT_ID);

const authHeaders = () => ({
  'X-Auth': process.env.KASPI_API_KEY!,
  'X-Merchant-Id': process.env.KASPI_MERCHANT_ID!,
  'Content-Type': 'application/json',
});

const STUB_TARIFFS: DeliveryTariff[] = [
  {
    id: 'kaspi-pvz',
    name: { ru: 'До ПВЗ Kaspi', kz: 'Kaspi ПВЗ-ге дейін' },
    operator: 'kaspi',
    type: 'pvz',
    price: 0,
    daysMin: 1,
    daysMax: 3,
    daysLabel: '1–3 дн.',
    isFree: true,
  },
  {
    id: 'kaspi-courier',
    name: { ru: 'Курьер Kaspi', kz: 'Kaspi курьері' },
    operator: 'kaspi',
    type: 'courier',
    price: 1500,
    daysMin: 1,
    daysMax: 2,
    daysLabel: '1–2 дн.',
  },
  {
    id: 'kaspi-express',
    name: { ru: 'Экспресс (Алматы, Астана)', kz: 'Экспресс (Алматы, Астана)' },
    operator: 'kaspi',
    type: 'express',
    price: 2500,
    daysMin: 0,
    daysMax: 0,
    daysLabel: 'сегодня',
  },
];

export async function kaspiGetTariffs(city: string): Promise<DeliveryTariff[]> {
  if (!isLive()) {
    console.info('[KASPI STUB] tariffs', city);
    return STUB_TARIFFS;
  }

  // Endpoint shape is confirmed against the merchant docs once access is granted.
  const res = await fetch('https://kaspi.kz/yml/api/v1/delivery/tariffs', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ city }),
  });

  if (!res.ok) throw new Error(`Kaspi tariffs failed: ${res.status}`);
  const data = (await res.json()) as { tariffs?: DeliveryTariff[] };
  return data.tariffs ?? [];
}

const STUB_POINTS: DeliveryPoint[] = [
  {
    id: 'kaspi-point-1',
    name: 'Kaspi Магазин Mega Alma-Ata',
    address: 'г. Алматы, пр. Розыбакиева 247а',
    lat: 43.2195,
    lng: 76.8451,
    type: 'pvz',
    operator: 'kaspi',
    workHours: 'Ежедневно 10:00–22:00',
  },
  {
    id: 'kaspi-point-2',
    name: 'Kaspi Магазин Достык Плаза',
    address: 'г. Алматы, пр. Достык 111',
    lat: 43.2313,
    lng: 76.9418,
    type: 'pvz',
    operator: 'kaspi',
    workHours: 'Ежедневно 10:00–21:00',
  },
];

export async function kaspiGetPoints(city: string): Promise<DeliveryPoint[]> {
  if (!isLive()) {
    console.info('[KASPI STUB] points', city);
    return STUB_POINTS;
  }

  const res = await fetch(
    `https://kaspi.kz/yml/api/v1/delivery/points?city=${encodeURIComponent(city)}`,
    { headers: authHeaders() },
  );

  if (!res.ok) throw new Error(`Kaspi points failed: ${res.status}`);
  const data = (await res.json()) as { points?: DeliveryPoint[] };
  return data.points ?? [];
}

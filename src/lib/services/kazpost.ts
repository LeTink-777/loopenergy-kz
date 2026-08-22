import type { DeliveryTariff } from './types';

const isLive = () => Boolean(process.env.KAZPOST_API_KEY);

const STUB_TARIFFS: DeliveryTariff[] = [
  {
    id: 'kp-standard',
    name: { ru: 'Стандарт Казпочта', kz: 'Қазпошта Стандарт' },
    operator: 'kazpost',
    type: 'pvz',
    price: 600,
    daysMin: 7,
    daysMax: 14,
    daysLabel: '7–14 дн.',
  },
  {
    id: 'kp-express',
    name: { ru: 'Экспресс Казпочта', kz: 'Қазпошта Экспресс' },
    operator: 'kazpost',
    type: 'pvz',
    price: 1200,
    daysMin: 3,
    daysMax: 5,
    daysLabel: '3–5 дн.',
  },
];

export async function kazpostGetTariffs(city: string): Promise<DeliveryTariff[]> {
  if (!isLive()) {
    console.info('[KAZPOST STUB] tariffs', city);
    return STUB_TARIFFS;
  }

  // Kazpost publishes docs only after a contract; confirm the shape then.
  const res = await fetch('https://api.kazpost.kz/v1/tariffs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KAZPOST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ destination: city }),
  });

  if (!res.ok) throw new Error(`Kazpost tariffs failed: ${res.status}`);
  const data = (await res.json()) as { tariffs?: DeliveryTariff[] };
  return data.tariffs ?? [];
}

export * from './types';
export * from './cdek';
export * from './kaspi';
export * from './kazpost';
export * from './freedomPay';
export * from './kaspiPay';

import { cdekCalculate } from './cdek';
import { kaspiGetTariffs } from './kaspi';
import { kazpostGetTariffs } from './kazpost';
import { cdekGetPoints } from './cdek';
import { kaspiGetPoints } from './kaspi';
import type { DeliveryOperator, DeliveryPoint, DeliveryTariff } from './types';

/** One parcel of pouches — used until per-order dimensions are wired up. */
const DEFAULT_PARCEL = { weight: 0.5, length: 15, width: 10, height: 5 } as const;

export async function getDeliveryTariffs(
  operator: DeliveryOperator,
  city: string,
  declaredValue = 0,
): Promise<DeliveryTariff[]> {
  switch (operator) {
    case 'cdek':
      return cdekCalculate({ fromCity: 'Алматы', toCity: city, declaredValue, ...DEFAULT_PARCEL });
    case 'kaspi':
      return kaspiGetTariffs(city);
    case 'kazpost':
      return kazpostGetTariffs(city);
  }
}

export async function getDeliveryPoints(
  operator: DeliveryOperator,
  city: string,
): Promise<DeliveryPoint[]> {
  switch (operator) {
    case 'cdek':
      return cdekGetPoints(city);
    case 'kaspi':
      return kaspiGetPoints(city);
    // Kazpost hands over at post offices; no point API until the contract is signed.
    case 'kazpost':
      return [];
  }
}

/** Which integrations are actually live — handy for diagnostics and the UI. */
export const serviceStatus = () => ({
  cdek: Boolean(process.env.CDEK_CLIENT_ID && process.env.CDEK_CLIENT_SECRET),
  kaspi: Boolean(process.env.KASPI_API_KEY && process.env.KASPI_MERCHANT_ID),
  kazpost: Boolean(process.env.KAZPOST_API_KEY),
  freedomPay: Boolean(process.env.FREEDOM_PAY_MERCHANT_ID && process.env.FREEDOM_PAY_SECRET_KEY),
  kaspiPay: Boolean(process.env.KASPI_PAY_PRIVATE_KEY),
});

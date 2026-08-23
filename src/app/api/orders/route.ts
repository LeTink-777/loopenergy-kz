import { NextResponse } from 'next/server';

import { freedomPayCreate } from '@/lib/services/freedomPay';
import { kaspiPayCreate } from '@/lib/services/kaspiPay';
import { SITE } from '@/lib/constants';

export const runtime = 'nodejs';

type OrderLine = {
  productId?: unknown;
  name?: unknown;
  price?: unknown;
  quantity?: unknown;
  flavorLabel?: unknown;
};

type OrderPayload = {
  phone?: unknown;
  name?: unknown;
  email?: unknown;
  city?: unknown;
  address?: unknown;
  comment?: unknown;
  carrier?: unknown;
  deliveryOption?: unknown;
  paymentMethod?: unknown;
  locale?: unknown;
  items?: unknown;
};

const str = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/** Kazakh numbers normalise to 11 digits starting with 7 (+7 / 8 prefixes). */
const normalisePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
  return digits;
};

const CARRIERS = ['kazpost', 'cdek', 'pickup'] as const;
/** Which options each carrier offers — mirrors the checkout form. */
const CARRIER_OPTIONS: Record<(typeof CARRIERS)[number], readonly string[]> = {
  kazpost: ['pvz', 'postomat', 'courier'],
  cdek: ['pvz', 'postomat', 'courier', 'express'],
  pickup: [],
};
const PAYMENT_METHODS = ['card', 'kaspi'] as const;

export async function POST(request: Request) {
  let body: OrderPayload;

  try {
    body = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 });
  }

  const phone = normalisePhone(str(body.phone, 40));
  const name = str(body.name, 120);
  const email = str(body.email, 160);
  const city = str(body.city, 80);
  const address = str(body.address, 300);
  const comment = str(body.comment, 2000);
  const locale = str(body.locale, 8) || 'ru';
  const carrier = str(body.carrier, 20);
  const deliveryOption = str(body.deliveryOption, 20);
  const paymentMethod = str(body.paymentMethod, 20);

  const rawItems = Array.isArray(body.items) ? (body.items as OrderLine[]) : [];
  const items = rawItems.slice(0, 50).map((line) => ({
    productId: str(line.productId, 60),
    name: str(line.name, 120),
    price: Number(line.price) || 0,
    quantity: Math.max(1, Math.min(99, Number(line.quantity) || 1)),
    flavor: str(line.flavorLabel, 60),
  }));

  if (!name || !phone || items.length === 0) {
    return NextResponse.json({ success: false, error: 'missing_fields' }, { status: 422 });
  }

  if (!/^7\d{10}$/.test(phone)) {
    return NextResponse.json({ success: false, error: 'invalid_phone' }, { status: 422 });
  }

  if (!CARRIERS.includes(carrier as (typeof CARRIERS)[number])) {
    return NextResponse.json({ success: false, error: 'invalid_carrier' }, { status: 422 });
  }

  const allowed = CARRIER_OPTIONS[carrier as (typeof CARRIERS)[number]];
  if (allowed.length > 0 && !allowed.includes(deliveryOption)) {
    return NextResponse.json({ success: false, error: 'invalid_delivery' }, { status: 422 });
  }

  if (carrier !== 'pickup' && !city) {
    return NextResponse.json({ success: false, error: 'missing_city' }, { status: 422 });
  }

  // Only a door delivery has an address; a pick-up point is chosen on the
  // carrier's own map after the order is placed.
  if ((deliveryOption === 'courier' || deliveryOption === 'express') && !address) {
    return NextResponse.json({ success: false, error: 'missing_address' }, { status: 422 });
  }

  if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
    return NextResponse.json({ success: false, error: 'invalid_payment' }, { status: 422 });
  }

  const total = items.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const orderId = `LE-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  // Gateways answer with a stub until their credentials exist, so the checkout
  // flow is identical before and after the merchant accounts are approved.
  const returnUrl = `${SITE.url}/${locale}/order/${orderId}?status=success`;
  const failUrl = `${SITE.url}/${locale}/order/${orderId}?status=fail`;
  const paymentParams = {
    orderId,
    amount: total,
    currency: 'KZT' as const,
    description: `Заказ LOOP Energy ${orderId}`,
    customerPhone: `+${phone}`,
    customerEmail: email || undefined,
    returnUrl,
    failUrl,
  };

  const payment =
    paymentMethod === 'card'
      ? await freedomPayCreate(paymentParams)
      : await kaspiPayCreate(paymentParams);

  // TODO: persist the order (Supabase / Postgres) instead of only logging it.
  // TODO: notify the manager in Telegram when TELEGRAM_BOT_TOKEN is set.
  // TODO: send an email confirmation when RESEND_API_KEY is set.
  console.info('[order]', {
    orderId,
    receivedAt: new Date().toISOString(),
    phone: `+${phone}`,
    name,
    email,
    city,
    address,
    comment,
    carrier,
    deliveryOption,
    paymentMethod,
    locale,
    total,
    items,
    payment: { method: paymentMethod, id: payment.paymentId, stubbed: payment.stubbed ?? false },
  });

  return NextResponse.json(
    {
      success: true,
      orderId,
      total,
      // Only a live gateway returns somewhere worth redirecting to.
      paymentRedirectUrl: payment.stubbed ? undefined : payment.redirectUrl,
    },
    { status: 201 },
  );
}

import { NextResponse } from 'next/server';

import { freedomPayCreate } from '@/lib/services/freedomPay';
import { SITE } from '@/lib/constants';
import { createOrder, supabaseReady, type Order } from '@/lib/orders';
import { esc, sendTelegramMessage } from '@/lib/telegram';

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

const CARRIERS = ['cdek'] as const;
/** Which options each carrier offers — mirrors the checkout form. */
const CARRIER_OPTIONS: Record<(typeof CARRIERS)[number], readonly string[]> = {
  cdek: ['pvz', 'postomat', 'courier', 'express'],
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

  if (!city) {
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

  const record = {
    customer_name: name,
    customer_phone: `+${phone}`,
    city,
    address,
    comment,
    carrier,
    delivery_option: deliveryOption,
    items,
    total_amount: total,
    payment_method: paymentMethod,
    status: 'pending' as const,
    locale,
  };

  let order: Order | null = null;
  if (supabaseReady()) {
    try {
      order = await createOrder(record);
    } catch (error) {
      console.error('[order] persist failed', error);
    }
  }

  const orderId = order?.id ?? `LE-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const label = order ? `#${order.order_number}` : orderId;

  const lines = items
    .map((l) => `• ${esc(l.name)} × ${l.quantity} — ${l.price * l.quantity} ₸`)
    .join('\n');
  const notified = await sendTelegramMessage(
    `🛒 <b>НОВЫЙ ЗАКАЗ ${esc(label)}</b>\n\n` +
      `👤 Клиент: ${esc(name)}\n📱 Телефон: +${esc(phone)}\n📍 Город: ${esc(city || '—')}\n` +
      `🚚 Доставка: ${esc(carrier)} / ${esc(deliveryOption || '—')}\n` +
      (address ? `🏠 Адрес: ${esc(address)}\n` : '') +
      `\n🛍 Товары:\n${lines}\n\n💰 Итого: ${total} ₸\n💳 Оплата: ${paymentMethod === 'kaspi' ? 'Kaspi QR' : 'Картой онлайн'}\n\n` +
      (paymentMethod === 'kaspi' ? '⏳ Ожидает оплаты…' : ''),
  );

  // Never fail the customer over our own plumbing. A refused checkout loses
  // the sale outright; an order that only made it into the logs can still be
  // recovered from them. The marker below is what to grep for.
  if (!order && !notified.ok) {
    console.error('[ORDER-UNSTORED]', JSON.stringify({ orderId, ...record }));
  }

  // Kaspi is settled by QR and confirmed by hand, so the customer goes to our
  // own page rather than to a gateway.
  if (paymentMethod === 'kaspi') {
    const path = order
      ? `/payment/kaspi/${orderId}`
      : `/payment/kaspi/${orderId}?total=${total}`;
    return NextResponse.json({ success: true, orderId, total, paymentPath: path }, { status: 201 });
  }

  const returnUrl = `${SITE.url}/${locale}/order/${orderId}?status=success`;
  const failUrl = `${SITE.url}/${locale}/order/${orderId}?status=fail`;
  const payment = await freedomPayCreate({
    orderId,
    amount: total,
    currency: 'KZT' as const,
    description: `Заказ LOOP Energy ${orderId}`,
    customerPhone: `+${phone}`,
    customerEmail: email || undefined,
    returnUrl,
    failUrl,
  });

  return NextResponse.json(
    {
      success: true,
      orderId,
      total,
      paymentRedirectUrl: payment.stubbed ? undefined : payment.redirectUrl,
    },
    { status: 201 },
  );
}

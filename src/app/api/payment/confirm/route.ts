import { NextResponse } from 'next/server';

import { getOrder, setStatus, supabaseReady } from '@/lib/orders';
import { esc, orderKeyboard, sendTelegramMessage } from '@/lib/telegram';

export const runtime = 'nodejs';

/** The customer says they have paid. Nothing is trusted yet — this only asks
 *  the shop to go and look. */
export async function POST(request: Request) {
  let orderId = '';
  try {
    const body = (await request.json()) as { orderId?: string };
    orderId = typeof body.orderId === 'string' ? body.orderId : '';
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!orderId) return NextResponse.json({ success: false, error: 'missing_order' }, { status: 422 });

  // Record the move when there is somewhere to record it. Only from `pending`,
  // so a second tap or a replay cannot re-alert the shop about an order that
  // has already been decided.
  let order = null;
  if (supabaseReady()) {
    order = await setStatus(orderId, 'awaiting_review', { from: ['pending'] });
    if (!order) {
      const current = await getOrder(orderId);
      if (!current) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
      return NextResponse.json({ success: true, status: current.status });
    }
  }

  // Telling the shop is the point of the button, and it must happen with or
  // without a database — without one this message is the only record there is.
  const label = order ? `#${order.order_number}` : esc(orderId);
  const who = order
    ? `👤 ${esc(order.customer_name)} — ${esc(order.customer_phone)}\n💰 Сумма: ${order.total_amount} ₸\n`
    : '';

  await sendTelegramMessage(
    `✅ <b>КЛИЕНТ ПОДТВЕРДИЛ ОПЛАТУ ${label}</b>\n\n` +
      who +
      `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}\n\n` +
      `Проверьте поступление в Kaspi и подтвердите:`,
    orderKeyboard(order?.id ?? orderId),
  );

  return NextResponse.json({ success: true, status: order?.status ?? 'awaiting_review' });
}

import { NextResponse } from 'next/server';

import { getOrder, setStatus, supabaseReady } from '@/lib/orders';
import { esc, sendTelegramMessage } from '@/lib/telegram';

export const runtime = 'nodejs';

/** The customer says they have paid. Nothing is trusted yet — this only asks
 *  the shop to go and look. */
export async function POST(request: Request) {
  if (!supabaseReady()) {
    return NextResponse.json({ success: false, error: 'storage_unavailable' }, { status: 503 });
  }

  let orderId = '';
  try {
    const body = (await request.json()) as { orderId?: string };
    orderId = typeof body.orderId === 'string' ? body.orderId : '';
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!orderId) return NextResponse.json({ success: false, error: 'missing_order' }, { status: 422 });

  // Only from `pending`: a second tap, or a replay, must not re-alert the shop
  // for an order that is already decided.
  const order = await setStatus(orderId, 'awaiting_review', { from: ['pending'] });
  if (!order) {
    const current = await getOrder(orderId);
    if (!current) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ success: true, status: current.status });
  }

  await sendTelegramMessage(
    `✅ <b>КЛИЕНТ ПОДТВЕРДИЛ ОПЛАТУ #${order.order_number}</b>\n\n` +
      `👤 ${esc(order.customer_name)} — ${esc(order.customer_phone)}\n` +
      `💰 Сумма: ${order.total_amount} ₸\n` +
      `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}\n\n` +
      `Проверьте поступление в Kaspi и подтвердите:`,
    {
      inline_keyboard: [
        [
          { text: '✅ Оплата получена', callback_data: `confirm_${order.id}` },
          { text: '❌ Оплата не найдена', callback_data: `notfound_${order.id}` },
        ],
        [
          { text: '🔄 Отменить — не тот номер', callback_data: `cancel_phone_${order.id}` },
          { text: '🔄 Отменить — не та сумма', callback_data: `cancel_amount_${order.id}` },
        ],
        [{ text: '🚫 Отменить — подозрительный', callback_data: `cancel_suspicious_${order.id}` }],
      ],
    },
  );

  return NextResponse.json({ success: true, status: order.status });
}

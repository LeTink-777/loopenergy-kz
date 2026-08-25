import { NextResponse } from 'next/server';

import {
  getOrder,
  listOrders,
  setStatus,
  supabaseReady,
  todayStats,
  type Order,
  type OrderStatus,
} from '@/lib/orders';
import {
  answerCallback,
  backToMenu,
  esc,
  mainMenu,
  orderKeyboard,
  sendTelegramMessage,
  stripKeyboard,
} from '@/lib/telegram';

export const runtime = 'nodejs';

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

type Update = {
  message?: { text?: string; chat?: { id: number } };
  callback_query?: {
    id: string;
    data?: string;
    message?: { message_id: number; chat?: { id: number } };
  };
};

/** What the customer is told, per decision. */
const CANCEL_TEXT: Record<string, string> = {
  phone: 'неверный номер телефона',
  amount: 'неверная сумма',
  suspicious: 'заказ отменён службой безопасности',
  manual: 'отменён администратором',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '⏳ Ожидает оплаты',
  awaiting_review: '🔍 Клиент подтвердил, проверяем',
  paid: '✅ Оплачен',
  cancelled: '❌ Отменён',
};

function formatOrder(o: Order): string {
  const items = o.items
    .map((i) => `• ${esc(i.name)} × ${i.quantity} — ${i.price * i.quantity} ₸`)
    .join('\n');
  return (
    `🛒 <b>ЗАКАЗ №${o.order_number}</b>\n` +
    `${'━'.repeat(18)}\n\n` +
    `👤 ${esc(o.customer_name)}\n📱 ${esc(o.customer_phone)}\n📍 ${esc(o.city || '—')}\n` +
    `🚚 ${esc(o.carrier)} · ${esc(o.delivery_option || '—')}\n` +
    (o.address ? `🏠 ${esc(o.address)}\n` : '') +
    `\n🛍 Товары:\n${items}\n\n` +
    `💰 Итого: ${o.total_amount} ₸\n` +
    `💳 ${o.payment_method === 'kaspi' ? 'Kaspi QR' : 'Картой онлайн'}\n` +
    `📅 ${new Date(o.created_at).toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}\n\n` +
    `Статус: ${STATUS_LABEL[o.status]}` +
    (o.cancel_reason ? `\nПричина: ${esc(o.cancel_reason)}` : '')
  );
}

/** Lists never dead-end: an empty one still offers the way back. */
async function showList(chatId: string, status: OrderStatus, empty: string, withButtons: boolean) {
  if (!supabaseReady()) {
    await sendTelegramMessage('⚠️ База заказов не подключена.', backToMenu(), chatId);
    return;
  }

  let orders: Order[];
  try {
    orders = await listOrders(status);
  } catch (error) {
    console.error('[bot] list failed', error);
    await sendTelegramMessage(
      '⚠️ Не удалось прочитать заказы. Похоже, таблица ещё не создана.',
      backToMenu(),
      chatId,
    );
    return;
  }

  if (!orders.length) {
    await sendTelegramMessage(empty, backToMenu(), chatId);
    return;
  }
  for (const o of orders) {
    await sendTelegramMessage(formatOrder(o), withButtons ? orderKeyboard(o.id) : undefined, chatId);
  }
  await sendTelegramMessage(`Показано: ${orders.length}`, backToMenu(), chatId);
}

export async function POST(request: Request) {
  // Without this the endpoint is an open door: anyone who guessed an order id
  // could POST confirm_<id> and mark it paid. Telegram echoes the secret set
  // alongside setWebhook on every delivery.
  if (!SECRET || request.headers.get('x-telegram-bot-api-secret-token') !== SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: Update;
  try {
    update = (await request.json()) as Update;
  } catch {
    return NextResponse.json({ ok: true });
  }

  // ── Typed commands ──────────────────────────────────────────────────────
  if (update.message?.chat?.id) {
    const chatId = String(update.message.chat.id);
    const text = (update.message.text ?? '').trim();
    if (text === '/start' || text === '/menu') {
      await sendTelegramMessage(
        '👋 <b>Панель LOOP Energy</b>\n\nВыберите действие:',
        mainMenu(),
        chatId,
      );
    }
    return NextResponse.json({ ok: true });
  }

  const q = update.callback_query;
  if (!q?.data) return NextResponse.json({ ok: true });

  const chatId = q.message?.chat?.id ? String(q.message.chat.id) : undefined;
  const data = q.data;

  // ── Menu ────────────────────────────────────────────────────────────────
  if (data.startsWith('menu_')) {
    await answerCallback(q.id, '');
    if (!chatId) return NextResponse.json({ ok: true });

    switch (data) {
      case 'menu_main':
        await sendTelegramMessage('👋 <b>Панель LOOP Energy</b>\n\nВыберите действие:', mainMenu(), chatId);
        break;
      case 'menu_active':
        await showList(chatId, 'pending', '📭 Активных заказов нет', true);
        break;
      case 'menu_completed':
        await showList(chatId, 'paid', '📭 Выполненных заказов нет', false);
        break;
      case 'menu_cancelled':
        await showList(chatId, 'cancelled', '📭 Отменённых заказов нет', false);
        break;
      case 'menu_stats': {
        if (!supabaseReady()) {
          await sendTelegramMessage('⚠️ База заказов не подключена.', backToMenu(), chatId);
          break;
        }
        let s;
        try {
          s = await todayStats();
        } catch (error) {
          console.error('[bot] stats failed', error);
          await sendTelegramMessage(
            '⚠️ Не удалось посчитать статистику. Похоже, таблица ещё не создана.',
            backToMenu(),
            chatId,
          );
          break;
        }
        await sendTelegramMessage(
          `📊 <b>Статистика за сегодня</b>\n\n` +
            `🛒 Новых заказов: ${s.total}\n✅ Оплачено: ${s.paid}\n` +
            `❌ Отменено: ${s.cancelled}\n⏳ Ожидают: ${s.pending}\n` +
            `💰 Выручка: ${s.revenue} ₸`,
          {
            inline_keyboard: [
              [{ text: '🔄 Обновить', callback_data: 'menu_stats' }],
              [{ text: '◀️ Главное меню', callback_data: 'menu_main' }],
            ],
          },
          chatId,
        );
        break;
      }
    }
    return NextResponse.json({ ok: true });
  }

  // ── Decisions on one order ──────────────────────────────────────────────
  const decide = async (id: string, run: () => Promise<Order | null>, note: string) => {
    let label = esc(id);
    if (supabaseReady()) {
      try {
        const order = await run();
        if (!order) {
          await answerCallback(q.id, 'Заказ уже обработан или не найден');
          return;
        }
        label = `№${order.order_number}`;
      } catch (error) {
        console.error('[bot] status update failed', error);
        await answerCallback(q.id, 'Решение записано только в чат — база недоступна');
      }
    }
    if (q.message) await stripKeyboard(q.message.message_id, chatId);
    await answerCallback(q.id, note);
    await sendTelegramMessage(`${note} — заказ ${label}`, backToMenu(), chatId);
  };

  if (data.startsWith('confirm_')) {
    const id = data.slice('confirm_'.length);
    // Only from awaiting_review: a stale button in the chat history must not
    // revive a cancelled order or confirm one twice.
    await decide(id, () => setStatus(id, 'paid', { from: ['awaiting_review', 'pending'] }), '✅ Оплата подтверждена');
    return NextResponse.json({ ok: true });
  }

  if (data.startsWith('notfound_')) {
    const id = data.slice('notfound_'.length);
    let order: Order | null = null;
    if (supabaseReady()) {
      try {
        order = await getOrder(id);
      } catch (error) {
        console.error('[bot] lookup failed', error);
      }
    }
    const label = order ? `№${order.order_number}` : esc(id);
    await answerCallback(q.id, 'Отмечено: платёж пока не найден');
    // Offers the manual cancel too, so the sixth decision has somewhere to be
    // reached from rather than existing only in the parser.
    await sendTelegramMessage(
      `⏳ Заказ ${label}: платёж пока не найден. Проверьте ещё раз через несколько минут.`,
      {
        inline_keyboard: [
          [{ text: '🔄 Проверить снова', callback_data: `notfound_${id}` }],
          [{ text: '✅ Оплата получена', callback_data: `confirm_${id}` }],
          [{ text: '🚫 Отменить заказ', callback_data: `cancel_manual_${id}` }],
          [{ text: '◀️ Главное меню', callback_data: 'menu_main' }],
        ],
      },
      chatId,
    );
    return NextResponse.json({ ok: true });
  }

  const cancel = /^cancel_(phone|amount|suspicious|manual)_(.+)$/.exec(data);
  if (cancel) {
    const [, kind, id] = cancel;
    await decide(
      id,
      () =>
        setStatus(id, 'cancelled', {
          from: ['pending', 'awaiting_review'],
          reason: CANCEL_TEXT[kind] ?? kind,
        }),
      `❌ Заказ отменён (${esc(CANCEL_TEXT[kind] ?? kind)})`,
    );
    return NextResponse.json({ ok: true });
  }

  await answerCallback(q.id, '');
  return NextResponse.json({ ok: true });
}

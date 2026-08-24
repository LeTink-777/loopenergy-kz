import { NextResponse } from 'next/server';

import { getOrder, setStatus, supabaseReady, type Order } from '@/lib/orders';
import { answerCallback, esc, sendTelegramMessage, stripKeyboard } from '@/lib/telegram';

export const runtime = 'nodejs';

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

type Callback = {
  callback_query?: {
    id: string;
    data?: string;
    message?: { message_id: number };
    from?: { id: number; username?: string };
  };
};

/** What the customer is told, per decision. */
const CANCEL_TEXT: Record<string, string> = {
  phone: 'неверный номер телефона',
  amount: 'неверная сумма',
  suspicious: 'заказ отменён службой безопасности',
};

export async function POST(request: Request) {
  // Without this check the endpoint is an open door: anyone who guesses an
  // order id could POST `confirm_<id>` and mark it paid. Telegram echoes the
  // secret set with setWebhook on every delivery.
  if (!SECRET || request.headers.get('x-telegram-bot-api-secret-token') !== SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!supabaseReady()) return NextResponse.json({ ok: true });

  let update: Callback;
  try {
    update = (await request.json()) as Callback;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const q = update.callback_query;
  if (!q?.data) return NextResponse.json({ ok: true });

  const data = q.data;
  const decide = async (
    id: string,
    run: () => Promise<Order | null>,
    adminNote: string,
  ) => {
    const order = await run();
    if (!order) {
      await answerCallback(q.id, 'Заказ уже обработан или не найден');
      return;
    }
    if (q.message) await stripKeyboard(q.message.message_id);
    await answerCallback(q.id, adminNote);
    await sendTelegramMessage(`${adminNote} — заказ #${order.order_number}`);
  };

  if (data.startsWith('confirm_')) {
    const id = data.slice('confirm_'.length);
    // Only from awaiting_review: an already cancelled order cannot be revived
    // by a stale button in the chat history.
    await decide(id, () => setStatus(id, 'paid', { from: ['awaiting_review'] }), '✅ Оплата подтверждена');
    return NextResponse.json({ ok: true });
  }

  if (data.startsWith('notfound_')) {
    const id = data.slice('notfound_'.length);
    const order = await getOrder(id);
    await answerCallback(q.id, 'Клиенту сообщено, что платёж ещё проверяется');
    if (order) {
      await sendTelegramMessage(
        `⏳ Заказ #${order.order_number}: платёж пока не найден. Кнопки остаются — проверьте ещё раз через несколько минут.`,
      );
    }
    return NextResponse.json({ ok: true });
  }

  const cancel = /^cancel_(phone|amount|suspicious)_(.+)$/.exec(data);
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

  return NextResponse.json({ ok: true });
}

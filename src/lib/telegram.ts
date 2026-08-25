const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const telegramReady = () => Boolean(TOKEN && CHAT_ID);

export type Keyboard = { inline_keyboard: { text: string; callback_data: string }[][] };

async function call(method: string, body: Record<string, unknown>) {
  if (!TOKEN) return { ok: false as const, error: 'no_token' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // A slow Telegram must never hold up the customer's checkout.
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json()) as { ok?: boolean; description?: string };
    if (!json.ok) console.error('[telegram]', method, json.description);
    return { ok: Boolean(json.ok), error: json.description };
  } catch (error) {
    console.error('[telegram]', method, error);
    return { ok: false as const, error: String(error) };
  }
}

/** Message to the shop's own chat — order alerts and confirmations. */
export function sendTelegramMessage(text: string, keyboard?: Keyboard, chatId?: string) {
  const target = chatId ?? CHAT_ID;
  if (!target) return Promise.resolve({ ok: false as const, error: 'no_chat_id' });
  return call('sendMessage', {
    chat_id: target,
    text,
    parse_mode: 'HTML',
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

/** Clears the button's spinner in the admin's client. */
export function answerCallback(id: string, text: string) {
  return call('answerCallbackQuery', { callback_query_id: id, text });
}

/** Leaves the decision visible but takes the buttons away, so one order
 *  cannot be confirmed twice by a second tap. */
export function stripKeyboard(messageId: number, chatId?: string) {
  const target = chatId ?? CHAT_ID;
  if (!target) return Promise.resolve({ ok: false as const, error: 'no_chat_id' });
  return call('editMessageReplyMarkup', {
    chat_id: target,
    message_id: messageId,
    reply_markup: { inline_keyboard: [] },
  });
}

export const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The decision buttons the shop acts on. Same set wherever an order needs one. */
export function orderKeyboard(orderId: string): Keyboard {
  return {
    inline_keyboard: [
      [
        { text: '✅ Оплата получена', callback_data: `confirm_${orderId}` },
        { text: '❌ Не найдена', callback_data: `notfound_${orderId}` },
      ],
      [
        { text: '🔄 Не тот номер', callback_data: `cancel_phone_${orderId}` },
        { text: '🔄 Не та сумма', callback_data: `cancel_amount_${orderId}` },
      ],
      [{ text: '🚫 Подозрительный', callback_data: `cancel_suspicious_${orderId}` }],
    ],
  };
}

/** The bot's home screen. Every list ends with a way back to it. */
export function mainMenu(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: '📦 Активные заказы', callback_data: 'menu_active' }],
      [{ text: '✅ Выполненные заказы', callback_data: 'menu_completed' }],
      [{ text: '❌ Отменённые заказы', callback_data: 'menu_cancelled' }],
      [{ text: '📊 Статистика за сегодня', callback_data: 'menu_stats' }],
    ],
  };
}

export function backToMenu(): Keyboard {
  return { inline_keyboard: [[{ text: '◀️ Главное меню', callback_data: 'menu_main' }]] };
}

import { NextResponse } from 'next/server';

import { sendTelegramMessage, telegramReady } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Setup check. Guarded by the same secret as the webhook so the shop's chat
 * cannot be spammed by anyone who finds the URL.
 */
export async function GET(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const given = new URL(request.url).searchParams.get('key');
  if (!secret || given !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 });
  }

  if (!telegramReady()) {
    return NextResponse.json({ ok: false, error: 'telegram_not_configured' }, { status: 503 });
  }

  const result = await sendTelegramMessage(
    `🧪 <b>Проверка бота LOOP Energy</b>\n\n✅ Бот отвечает\n⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`,
  );
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

import { NextResponse } from 'next/server';

import { getOrder, supabaseReady } from '@/lib/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Polled by the customer's status page. Deliberately returns no personal
 *  data — the order id is guessable enough that this must stay uninteresting. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!supabaseReady()) {
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  }

  let order;
  try {
    order = await getOrder(id);
  } catch (error) {
    // Polled every five seconds — a database blip must read as "still checking"
    // on the customer's screen, not as a crash.
    console.error('[status] lookup failed', error);
    return NextResponse.json(
      { error: 'temporarily_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json(
    {
      status: order.status,
      orderNumber: order.order_number,
      total: order.total_amount,
      cancelReason: order.cancel_reason,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

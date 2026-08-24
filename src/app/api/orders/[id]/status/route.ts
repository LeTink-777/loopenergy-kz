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

  const order = await getOrder(id);
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

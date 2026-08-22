import { createHmac } from 'node:crypto';

import type { PaymentCreateParams, PaymentResult, PaymentStatus } from './types';

const API = 'https://api.freedompay.kz/v1';

const isLive = () =>
  Boolean(process.env.FREEDOM_PAY_MERCHANT_ID && process.env.FREEDOM_PAY_SECRET_KEY);

export async function freedomPayCreate(params: PaymentCreateParams): Promise<PaymentResult> {
  if (!isLive()) {
    console.info('[FREEDOM PAY STUB] create', params.orderId, params.amount);
    return {
      success: true,
      paymentId: `fp-stub-${params.orderId}`,
      // Send the customer straight to the confirmation page — nothing is charged.
      redirectUrl: `${params.returnUrl}&stub=1`,
      status: 'pending',
      stubbed: true,
    };
  }

  const payload = {
    merchant_id: process.env.FREEDOM_PAY_MERCHANT_ID!,
    amount: params.amount,
    currency: params.currency,
    order_id: params.orderId,
    description: params.description,
    back_url: params.returnUrl,
    failure_url: params.failUrl,
    email: params.customerEmail ?? '',
    phone: params.customerPhone,
  };

  // Freedom Pay signs the ordered field values with HMAC-SHA256.
  const signature = createHmac('sha256', process.env.FREEDOM_PAY_SECRET_KEY!)
    .update(Object.values(payload).join(';'))
    .digest('hex');

  const res = await fetch(`${API}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, signature }),
  });

  const data = (await res.json()) as {
    status?: string;
    payment_id?: string;
    redirect_url?: string;
    error_message?: string;
  };

  const ok = res.ok && data.status === 'ok';

  return {
    success: ok,
    paymentId: data.payment_id ?? '',
    redirectUrl: data.redirect_url,
    status: ok ? 'pending' : 'failed',
    error: data.error_message,
  };
}

export async function freedomPayStatus(paymentId: string): Promise<PaymentStatus> {
  if (!isLive()) {
    console.info('[FREEDOM PAY STUB] status', paymentId);
    return {
      paymentId,
      orderId: paymentId.replace('fp-stub-', ''),
      // Nothing was charged, so the honest stub state is "awaiting payment".
      status: 'pending',
      amount: 0,
    };
  }

  const res = await fetch(`${API}/payment/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${process.env.FREEDOM_PAY_SECRET_KEY}` },
  });

  if (!res.ok) throw new Error(`Freedom Pay status failed: ${res.status}`);
  const data = (await res.json()) as {
    order_id: string;
    payment_status: PaymentStatus['status'];
    amount: number;
    paid_at?: string;
  };

  return {
    paymentId,
    orderId: data.order_id,
    status: data.payment_status,
    amount: data.amount,
    paidAt: data.paid_at,
  };
}

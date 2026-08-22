import type { PaymentCreateParams, PaymentResult } from './types';

const API = 'https://pay.kaspi.kz/pay/api/v2';

const isLive = () => Boolean(process.env.KASPI_PAY_PRIVATE_KEY);

export async function kaspiPayCreate(params: PaymentCreateParams): Promise<PaymentResult> {
  if (!isLive()) {
    console.info('[KASPI PAY STUB] create', params.orderId, params.amount);
    return {
      success: true,
      paymentId: `kp-stub-${params.orderId}`,
      redirectUrl: `${params.returnUrl}&stub=1`,
      status: 'pending',
      stubbed: true,
    };
  }

  const res = await fetch(`${API}/payment/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KASPI_PAY_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: params.orderId,
      amount: params.amount,
      description: params.description,
      back_url: params.returnUrl,
      failure_url: params.failUrl,
    }),
  });

  const data = (await res.json()) as {
    status?: string;
    payment_id?: string;
    payment_url?: string;
    error?: string;
  };

  const ok = res.ok && data.status === 'success';

  return {
    success: ok,
    paymentId: data.payment_id ?? '',
    redirectUrl: data.payment_url,
    status: ok ? 'pending' : 'failed',
    error: data.error,
  };
}

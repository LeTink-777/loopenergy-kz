'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { CONTACTS } from '@/lib/constants';

type State = { status: string; orderNumber?: number; cancelReason?: string | null } | null;

export function PaymentStatus({ orderId }: { orderId: string }) {
  const t = useTranslations('payment_status');
  const [state, setState] = useState<State>(null);
  const [missing, setMissing] = useState(false);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    let alive = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, { cache: 'no-store' });
        if (res.status === 404) { if (alive) setMissing(true); return true; }
        // Anything else that is not an answer keeps the screen honest: it says
        // it is still checking rather than implying the order is unpaid.
        if (!res.ok) { if (alive) setDegraded(true); return false; }
        const data = (await res.json()) as NonNullable<State>;
        if (alive) { setDegraded(false); setState(data); }
        // Stop polling once the answer cannot change any more.
        return data.status === 'paid' || data.status === 'cancelled';
      } catch {
        if (alive) setDegraded(true);
        return false;
      }
    };

    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const done = await poll();
      if (!done && alive) timer = setTimeout(tick, 5000);
    };
    void tick();

    return () => { alive = false; clearTimeout(timer); };
  }, [orderId]);

  if (missing) return <Card tone="bad" title={t('not_found')} />;

  const status = state?.status ?? 'pending';
  const number = state?.orderNumber;

  const orderLabel = number ? t('order_label', { number: String(number) }) : undefined;

  if (status === 'paid') {
    return <Card tone="good" title={t('paid_title')} hint={t('paid_hint')} orderLabel={orderLabel} />;
  }

  if (status === 'cancelled') {
    return (
      <Card
        tone="bad"
        title={t('cancelled_title')}
        hint={state?.cancelReason ? t('cancelled_reason', { reason: state.cancelReason }) : undefined}
        orderLabel={orderLabel}
        supportLabel={t('support')}
      />
    );
  }

  // Never seen a successful reply yet — show the neutral "checking" wording
  // instead of a status the page cannot actually vouch for.
  const waiting = status === 'awaiting_review' || (degraded && !state);
  return (
    <Card
      tone="wait"
      title={waiting ? t('checking') : t('pending_title')}
      hint={waiting ? t('checking_hint') : t('pending_hint')}
      orderLabel={orderLabel}
    />
  );
}

function Card({
  tone,
  title,
  hint,
  orderLabel,
  supportLabel,
}: {
  tone: 'good' | 'bad' | 'wait';
  title: string;
  hint?: string;
  orderLabel?: string;
  supportLabel?: string;
}) {
  const Icon = tone === 'good' ? CheckCircle2 : tone === 'bad' ? XCircle : Loader2;
  const colour =
    tone === 'good' ? 'text-[#6ee7a8]' : tone === 'bad' ? 'text-[#ff8f8f]' : 'text-accent-light';

  return (
    <div className="purple-ring flex flex-col items-center gap-fluid-xs px-fluid-md py-fluid-2xl text-center">
      <Icon className={`h-12 w-12 ${colour} ${tone === 'wait' ? 'animate-spin' : ''}`} aria-hidden="true" />
      {orderLabel ? (
        <p className="text-fluid-xs font-semibold uppercase tracking-[0.16em] text-w-50">{orderLabel}</p>
      ) : null}
      <p className="text-fluid-lg font-bold uppercase tracking-tight">{title}</p>
      {hint ? <p className="max-w-sm text-fluid-sm leading-relaxed text-w-70">{hint}</p> : null}
      {supportLabel ? (
        <a
          href={CONTACTS.consumerTelegram.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-fluid-xs inline-flex min-h-[48px] items-center rounded-pill border border-accent/40 px-6 text-fluid-xs font-bold uppercase tracking-wide text-accent-light transition-colors hover:border-accent hover:text-white"
        >
          {supportLabel}
        </a>
      ) : null}
    </div>
  );
}

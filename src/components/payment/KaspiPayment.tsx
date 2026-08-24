'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { formatTenge } from '@/lib/constants';

const WINDOW_SECONDS = 15 * 60;

export function KaspiPayment({
  orderId,
  orderNumber,
  total,
  createdAt,
}: {
  orderId: string;
  orderNumber: number;
  total: number;
  createdAt: string;
}) {
  const t = useTranslations('kaspi_payment');
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Counted from when the order was created, not from mount — reloading the
  // page must not hand out another fifteen minutes.
  const [left, setLeft] = useState(() =>
    Math.max(0, WINDOW_SECONDS - Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)),
  );

  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [left]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  const confirm = async () => {
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.push(`/payment/status/${orderId}`);
    } catch {
      setError(t('error'));
      setSending(false);
    }
  };

  return (
    <div className="grid gap-fluid-md lg:grid-cols-[1fr_360px] lg:items-start">
      <section className="purple-ring p-fluid-md">
        <h2 className="text-fluid-md font-bold uppercase tracking-tight">{t('scan_title')}</h2>

        <div className="mt-fluid-sm flex justify-center rounded-2xl bg-white p-fluid-sm">
          <Image
            src="/assets/kaspi-qr.png"
            alt={t('qr_alt')}
            width={640}
            height={640}
            priority
            className="h-auto w-full max-w-[280px]"
          />
        </div>

        <ol className="mt-fluid-sm flex list-decimal flex-col gap-1.5 pl-5 text-fluid-sm leading-relaxed text-w-70">
          <li>{t('step_1')}</li>
          <li>{t('step_2')}</li>
          <li>{t('step_3')}</li>
        </ol>

        <p className="mt-fluid-sm rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-fluid-sm text-w-80">
          {t('amount_note', { amount: formatTenge(total) })}
        </p>
      </section>

      <aside className="purple-ring p-fluid-md lg:sticky lg:top-[calc(var(--header-h)+24px)]">
        <p className="text-fluid-xs font-semibold uppercase tracking-[0.16em] text-w-50">
          {t('order_label', { number: String(orderNumber) })}
        </p>
        <p className="mt-2 text-fluid-2xl font-extrabold tabular-nums">{formatTenge(total)}</p>

        <div className="mt-fluid-sm rounded-2xl border border-w-10 px-4 py-3 text-center">
          <p className="text-fluid-xs uppercase tracking-[0.16em] text-w-50">{t('timer_label')}</p>
          <p className={`mt-1 text-fluid-xl font-extrabold tabular-nums ${left === 0 ? 'text-w-50' : ''}`}>
            {mm}:{ss}
          </p>
        </div>

        {left === 0 ? (
          <p className="mt-fluid-sm text-fluid-sm leading-relaxed text-w-70">{t('expired')}</p>
        ) : null}

        <button
          type="button"
          onClick={confirm}
          disabled={sending}
          className="mt-fluid-sm inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-accent-grad px-6 text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow disabled:opacity-60"
        >
          {sending ? t('sending') : t('paid_cta')}
        </button>

        {error ? <p className="mt-3 text-fluid-sm text-[#ff8f8f]">{error}</p> : null}

        <p className="mt-fluid-sm text-fluid-xs leading-relaxed text-w-50">{t('manual_note')}</p>
      </aside>
    </div>
  );
}

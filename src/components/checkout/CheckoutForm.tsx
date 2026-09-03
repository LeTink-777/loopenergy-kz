'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { m } from 'framer-motion';
import { CreditCard, Loader2, Truck, Wallet } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Link, useRouter } from '@/i18n/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { springPop } from '@/components/ui/motion';
import { formatTenge } from '@/lib/constants';
import type { Content, Locale } from '@/lib/content';
import { t as pickText, visibleProducts as products } from '@/lib/products';
import { useCartStore } from '@/store/cartStore';

/** Which ways of receiving an order each carrier actually offers. */
const CARRIER_OPTIONS = {
  cdek: ['pvz', 'postomat', 'courier', 'express'],
} as const;

const FREE_DELIVERY_FROM = 3000;
const DELIVERY_FEE = 800;

const fieldClass =
  'w-full rounded-2xl border border-w-10 bg-white/[0.03] px-4 py-3.5 text-white placeholder:text-w-50 outline-none transition-[border-color,box-shadow] duration-300 focus:border-accent/60 focus:shadow-[0_0_0_4px_rgba(149,97,233,0.18)]';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-fluid-xs font-semibold uppercase tracking-[0.12em] text-w-50">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-fluid-xs text-rose-300">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function CheckoutForm() {
  const t = useTranslations('checkout');
  const tRoot = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const hydrated = useHydrated();
  const { hoverScale, tapPress } = useUniversalMotion();

  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  /**
   * "Купить сейчас" carries the product in the URL instead of writing it to the
   * cart, so backing out of checkout leaves the cart exactly as it was. Only
   * "В корзину" persists anything.
   */
  const searchParams = useSearchParams();
  const buyId = searchParams.get('buy');
  const buyQty = Math.max(1, Math.min(99, Number(searchParams.get('qty')) || 1));
  const buyFlavor = searchParams.get('flavor') ?? undefined;

  const directItem = useMemo(() => {
    const product = buyId ? products.find((p) => p.id === buyId) : undefined;
    if (!product) return null;
    const flavour = product.flavors.find((f) => f.id === buyFlavor);
    return {
      productId: product.id,
      slug: product.slug,
      name: pickText(product.name, locale),
      image: product.image,
      price: product.price,
      quantity: buyQty,
      flavor: flavour?.id,
      flavorLabel: flavour ? pickText(flavour.name, locale) : undefined,
    };
  }, [buyId, buyFlavor, buyQty, locale]);

  const items = directItem ? [directItem] : cartItems;
  const [submitting, setSubmitting] = useState(false);

  const cityList = tRoot.raw('b2b.form.field_city_options') as Content['b2b']['form']['field_city_options'];

  const schema = z.object({
    phone: z.string().refine((v) => v.replace(/\D/g, '').length >= 11, t('error_phone')),
    name: z.string().min(2, t('error_name')),
    email: z.union([z.literal(''), z.string().email(t('error_email'))]),
    city: z.string(),
    address: z.string(),
    comment: z.string(),
    carrier: z.enum(['cdek']),
    deliveryOption: z.string(),
    paymentMethod: z.enum(['card', 'kaspi']),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      name: '',
      email: '',
      city: '',
      address: '',
      comment: '',
      carrier: 'cdek',
      deliveryOption: 'pvz',
      paymentMethod: 'kaspi',
    },
  });

  const carrier = watch('carrier');
  const deliveryOption = watch('deliveryOption');
  const paymentMethod = watch('paymentMethod');

  const options = CARRIER_OPTIONS[carrier];
  // Only a door delivery has an address to put on it; a pick-up point is
  // chosen on the carrier's own map after the order is placed.
  const needsAddress = deliveryOption === 'courier' || deliveryOption === 'express';
  const needsCity = true;

  const pickCarrier = (next: FormValues['carrier']) => {
    setValue('carrier', next);
    // The previous option may not exist for the new carrier.
    setValue('deliveryOption', CARRIER_OPTIONS[next][0] ?? '');
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCost = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryCost;

  const onSubmit = async (values: FormValues) => {
    if (!values.city) {
      toast.error(t('error_city'));
      return;
    }

    if (!values.deliveryOption) {
      toast.error(t('error_option'));
      return;
    }

    // Address is only required when someone is actually delivering to it.
    const door = values.deliveryOption === 'courier' || values.deliveryOption === 'express';
    if (door && values.address.trim().length < 5) {
      toast.error(t('error_address'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale, items }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        orderId?: string;
        paymentRedirectUrl?: string;
        paymentPath?: string;
      };

      if (!response.ok || !result.orderId) {
        toast.error(t('error_generic'));
        return;
      }

      // A direct buy never touched the cart, so there is nothing to clear.
      if (!directItem) clearCart();

      // Kaspi is settled by QR on a page of ours; a live card gateway hands
      // back its own. Stubs give neither and fall through to the order page.
      if (result.paymentPath) {
        router.push(result.paymentPath);
        return;
      }

      if (result.paymentRedirectUrl) {
        window.location.href = result.paymentRedirectUrl;
        return;
      }

      router.push(`/order/${result.orderId}`);
    } catch {
      toast.error(t('error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return <div className="purple-ring min-h-[420px] animate-pulse" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="purple-ring flex flex-col items-center gap-fluid-xs px-fluid-md py-fluid-2xl text-center">
        <p className="text-fluid-lg font-bold uppercase tracking-tight">{t('empty_title')}</p>
        <p className="max-w-sm text-fluid-sm text-w-70">{t('empty_text')}</p>
        <Link
          href="/shop"
          className="mt-fluid-xs inline-flex min-h-[48px] items-center rounded-pill bg-accent-grad px-7 text-fluid-xs font-bold uppercase tracking-wide text-white shadow-glow"
        >
          {t('empty_cta')}
        </Link>
      </div>
    );
  }

  // Icons rather than the carriers' own logos: those are their trademarks,
  // the marks would imply a partnership we have not signed, and it keeps the
  // row consistent with the payment options below, which already use icons.
  const carriers = [
    { id: 'cdek', label: t('carrier_cdek'), sub: t('carrier_cdek_sub'), Icon: Truck },
  ] as const;

  const optionLabels: Record<string, { label: string; sub?: string }> = {
    pvz: { label: t('option_pvz') },
    postomat: { label: t('option_postomat') },
    courier: { label: t('option_courier') },
    express: { label: t('option_express'), sub: t('option_express_sub') },
  };

  const paymentOptions = [
    { id: 'kaspi', label: t('pay_kaspi'), sub: t('pay_kaspi_sub'), Icon: Wallet },
    { id: 'card', label: t('pay_card'), sub: t('pay_card_sub'), Icon: CreditCard },
  ] as const;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-fluid-lg lg:grid-cols-[1.6fr_1fr] lg:items-start"
    >
      <div className="flex min-w-0 flex-col gap-fluid-md">
        <section className="purple-ring p-fluid-md">
          <h2 className="text-fluid-md font-bold uppercase tracking-tight">{t('contact_title')}</h2>
          <div className="mt-fluid-sm grid gap-fluid-sm sm:grid-cols-2">
            <Field label={`${t('field_phone')} *`} error={errors.phone?.message}>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t('field_phone_placeholder')}
                className={fieldClass}
                {...register('phone')}
              />
            </Field>
            <Field label={`${t('field_name')} *`} error={errors.name?.message}>
              <input
                type="text"
                autoComplete="name"
                placeholder={t('field_name_placeholder')}
                className={fieldClass}
                {...register('name')}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t('field_email')} error={errors.email?.message}>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder={t('field_email_placeholder')}
                  className={fieldClass}
                  {...register('email')}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="purple-ring p-fluid-md">
          <h2 className="text-fluid-md font-bold uppercase tracking-tight">{t('delivery_title')}</h2>

          <p className="mt-fluid-sm text-fluid-xs font-semibold uppercase tracking-[0.14em] text-w-50">
            {t('carrier_title')}
          </p>
          <fieldset className="mt-2 grid gap-fluid-xs sm:grid-cols-3">
            {carriers.map((option) => (
              <label
                key={option.id}
                className={`flex min-h-[76px] cursor-pointer flex-col justify-center rounded-2xl border px-4 py-3 transition-[border-color,background-color,box-shadow] ${
                  carrier === option.id
                    ? 'border-[#9561e9] bg-[#9561e9]/10'
                    : 'border-[#9561e9]/30 hover:border-[#9561e9] hover:shadow-[0_0_12px_rgba(149,97,233,0.25)]'
                }`}
              >
                <input
                  type="radio"
                  name="carrier"
                  value={option.id}
                  checked={carrier === option.id}
                  onChange={() => pickCarrier(option.id)}
                  className="sr-only"
                />
                <span className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent-light">
                    <option.Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-fluid-sm font-semibold text-white">{option.label}</span>
                    <span className="block text-fluid-xs text-w-50">{option.sub}</span>
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          {options.length > 0 ? (
            <>
              <p className="mt-fluid-sm text-fluid-xs font-semibold uppercase tracking-[0.14em] text-w-50">
                {t('option_title')}
              </p>
              <fieldset className="mt-2 grid gap-fluid-xs sm:grid-cols-2">
                {options.map((id) => (
                  <label
                    key={id}
                    className={`flex min-h-[60px] cursor-pointer flex-col justify-center rounded-2xl border px-4 py-3 transition-colors ${
                      deliveryOption === id
                        ? 'border-[#9561e9] bg-[#9561e9]/10'
                        : 'border-w-10 hover:border-[#9561e9]/60'
                    }`}
                  >
                    <input type="radio" value={id} className="sr-only" {...register('deliveryOption')} />
                    <span className="text-fluid-sm font-semibold text-white">{optionLabels[id]?.label}</span>
                    {optionLabels[id]?.sub ? (
                      <span className="mt-0.5 text-fluid-xs text-w-50">{optionLabels[id].sub}</span>
                    ) : null}
                  </label>
                ))}
              </fieldset>
            </>
          ) : null}

          <div className="mt-fluid-sm grid gap-fluid-sm sm:grid-cols-2">
            {needsCity ? (
              <Field label={`${t('field_city')} *`} error={errors.city?.message}>
                <select defaultValue="" className={fieldClass} {...register('city')}>
                  <option value="" disabled>
                    {t('field_city_placeholder')}
                  </option>
                  {cityList.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            {needsAddress ? (
              <Field label={`${t('field_address')} *`} error={errors.address?.message}>
                <input
                  type="text"
                  autoComplete="street-address"
                  placeholder={t('field_address_placeholder')}
                  className={fieldClass}
                  {...register('address')}
                />
              </Field>
            ) : null}

            <div className="sm:col-span-2">
              <Field label={t('field_comment')}>
                <textarea
                  rows={3}
                  placeholder={t('field_comment_placeholder')}
                  className={`${fieldClass} resize-none`}
                  {...register('comment')}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="purple-ring p-fluid-md">
          <h2 className="text-fluid-md font-bold uppercase tracking-tight">{t('payment_title')}</h2>

          <fieldset className="mt-fluid-sm grid gap-fluid-xs sm:grid-cols-2">
            {paymentOptions.map((option) => (
              <label
                key={option.id}
                className={`flex min-h-[76px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  paymentMethod === option.id
                    ? 'border-accent/60 bg-accent/10'
                    : 'border-w-10 hover:border-accent/35'
                }`}
              >
                <input type="radio" value={option.id} className="sr-only" {...register('paymentMethod')} />
                <option.Icon className="h-5 w-5 shrink-0 text-accent-light" aria-hidden="true" />
                <span>
                  <span className="block text-fluid-sm font-semibold text-white">{option.label}</span>
                  <span className="block text-fluid-xs text-w-50">{option.sub}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {/* TODO: integrate Freedom Pay or Kaspi Pay gateway. */}
          <p className="mt-fluid-sm text-fluid-xs leading-relaxed text-w-50">{t('payment_note')}</p>
        </section>
      </div>

      <aside className="purple-ring p-fluid-md lg:sticky lg:top-[calc(var(--header-h)+24px)]">
        <p className="text-fluid-md font-bold uppercase tracking-tight">{t('summary_title')}</p>

        <ul className="mt-fluid-sm flex flex-col gap-fluid-xs text-fluid-sm">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.flavor ?? ''}`}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="text-w-70">
                {item.name}
                <span className="text-w-50"> × {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap font-semibold tabular-nums">
                {formatTenge(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-fluid-sm flex flex-col gap-2 border-t border-w-10 pt-fluid-sm text-fluid-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-w-70">{tRoot('cart.subtotal')}</dt>
            <dd className="tabular-nums">{formatTenge(subtotal)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-w-70">{tRoot('cart.delivery')}</dt>
            <dd className="tabular-nums">
              {deliveryCost === 0 ? t('free_delivery_note') : formatTenge(deliveryCost)}
            </dd>
          </div>
        </dl>

        <div className="mt-fluid-sm flex items-baseline justify-between gap-4 border-t border-w-10 pt-fluid-sm">
          <span className="text-fluid-sm uppercase tracking-wide text-w-70">{tRoot('cart.total')}</span>
          <span className="text-fluid-xl font-extrabold tabular-nums">{formatTenge(total)}</span>
        </div>

        <m.button
          type="submit"
          disabled={submitting}
          whileHover={submitting ? undefined : hoverScale}
          whileTap={submitting ? undefined : tapPress}
          transition={springPop}
          className="mt-fluid-md inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-pill bg-accent-grad px-6 text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow disabled:opacity-70"
        >
          {submitting ? (
            <>
              <m.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                className="grid place-items-center"
              >
                <Loader2 className="h-4 w-4" aria-hidden="true" />
              </m.span>
              {t('submitting')}
            </>
          ) : (
            t('submit')
          )}
        </m.button>
      </aside>
    </form>
  );
}

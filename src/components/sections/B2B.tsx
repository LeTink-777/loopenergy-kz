'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Check, Handshake, Loader2, Send, Tag, Truck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import { RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EASE, fadeUp, springPop } from '@/components/ui/motion';
import type { Content } from '@/lib/content';

/** Icons pair with `content.b2b.features` by position. */
const FEATURE_ICONS = [Handshake, Tag, Truck, Send] as const;

type Status = 'idle' | 'loading' | 'success' | 'error';

const fieldClass =
  'w-full rounded-2xl border border-w-10 bg-white/[0.03] px-4 py-3.5 text-fluid-sm text-white placeholder:text-w-50 outline-none transition-[border-color,box-shadow] duration-300 focus:border-accent/60 focus:shadow-[0_0_0_4px_rgba(149,97,233,0.18)]';

export function B2B() {
  const t = useTranslations('b2b');
  const features = t.raw('features') as Content['b2b']['features'];
  const cities = t.raw('form.field_city_options') as Content['b2b']['form']['field_city_options'];
  const locale = useLocale();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get('name') ?? ''),
      phone: String(data.get('phone') ?? ''),
      city: String(data.get('city') ?? ''),
      comment: String(data.get('comment') ?? ''),
      locale,
    };

    if (!payload.name.trim() || !payload.phone.trim() || !payload.city.trim()) {
      setError(t('form.error_required'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/b2b-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(result?.error === 'invalid_phone' ? t('form.error_phone') : t('form.error_generic'));
        setStatus('error');
        return;
      }

      form.reset();
      setStatus('success');
    } catch {
      setError(t('form.error_generic'));
      setStatus('error');
    }
  };

  return (
    <section id="b2b" className="section-pad relative scroll-mt-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-70 blur-3xl"
        style={{
          background: 'radial-gradient(45% 60% at 70% 30%, rgba(149,97,233,0.2), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="container-content">
        <div className="grid-2col !items-start">
          <RevealGroup>
            <SectionHeading
              badge={t('badge')}
              title={t('h2')}
              accent={t('h2_accent')}
              subtitle={t('description')}
              align="left"
            />

            <ul className="grid-auto-sm mt-fluid-lg">
              {features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];

                return (
                <m.li key={feature.title} variants={fadeUp}>
                  <m.div
                    whileHover={{ y: -4, boxShadow: '0 20px 50px -22px rgba(149,97,233,0.32)' }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="purple-ring h-full p-5"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-light">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-fluid-base font-bold uppercase tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-fluid-sm leading-relaxed text-w-70">
                      {feature.description}
                    </p>
                  </m.div>
                </m.li>
                );
              })}
            </ul>
          </RevealGroup>

          <RevealGroup>
            <m.div variants={fadeUp} className="purple-ring relative overflow-hidden p-6 sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {status === 'success' ? (
                  <m.div
                    key="success"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  >
                    <m.span
                      className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 16, delay: 0.1 }}
                    >
                      <Check className="h-8 w-8" aria-hidden="true" />
                    </m.span>

                    <h3 className="mt-6 text-fluid-lg font-extrabold uppercase tracking-tight">
                      {t('form.submit_success_title')}
                    </h3>
                    <p className="mt-2 max-w-sm text-fluid-sm text-w-70">{t('form.submit_success_description')}</p>

                    <m.button
                      type="button"
                      onClick={() => setStatus('idle')}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={springPop}
                      className="mt-7 rounded-pill border border-w-15 px-6 py-3 text-fluid-xs font-bold uppercase tracking-wide text-w-80 transition-colors hover:border-accent/45 hover:text-white"
                    >
                      {t('form.submit_again')}
                    </m.button>
                  </m.div>
                ) : (
                  <m.form
                    key="form"
                    onSubmit={onSubmit}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <h3 className="text-fluid-lg font-extrabold uppercase tracking-tight">
                        {t('form.title')}
                      </h3>
                      <p className="mt-1.5 text-fluid-sm text-w-70">{t('form.subtitle')}</p>
                    </div>

                    <div className="grid gap-fluid-sm sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-fluid-xs font-semibold uppercase tracking-[0.12em] text-w-50">
                          {t('form.field_name')} *
                        </span>
                        <input
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder={t('form.field_name_placeholder')}
                          className={fieldClass}
                        />
                      </label>

                    </div>

                    <div className="grid gap-fluid-sm sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-fluid-xs font-semibold uppercase tracking-[0.12em] text-w-50">
                          {t('form.field_phone')} *
                        </span>
                        <input
                          name="phone"
                          type="tel"
                          required
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder={t('form.field_phone_placeholder')}
                          className={fieldClass}
                        />
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-fluid-xs font-semibold uppercase tracking-[0.12em] text-w-50">
                          {t('form.field_city')} *
                        </span>
                        <select name="city" required defaultValue="" className={fieldClass}>
                          <option value="" disabled>
                            {t('form.field_city_placeholder')}
                          </option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="text-fluid-xs font-semibold uppercase tracking-[0.12em] text-w-50">
                        {t('form.field_comment')}
                      </span>
                      <textarea
                        name="comment"
                        rows={4}
                        placeholder={t('form.field_comment_placeholder')}
                        className={`${fieldClass} resize-none`}
                      />
                    </label>

                    <AnimatePresence>
                      {error ? (
                        <m.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          role="alert"
                          className="text-fluid-sm text-rose-300"
                        >
                          {error}
                        </m.p>
                      ) : null}
                    </AnimatePresence>

                    <m.button
                      type="submit"
                      disabled={status === 'loading'}
                      whileHover={status === 'loading' ? undefined : { scale: 1.02, y: -2 }}
                      whileTap={status === 'loading' ? undefined : { scale: 0.98 }}
                      transition={springPop}
                      className="mt-1 inline-flex items-center justify-center gap-2.5 rounded-pill bg-accent-grad px-7 py-4 text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow disabled:opacity-70"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {status === 'loading' ? (
                          <m.span
                            key="loading"
                            className="inline-flex items-center gap-2.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <m.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                              className="grid place-items-center"
                            >
                              <Loader2 className="h-4 w-4" aria-hidden="true" />
                            </m.span>
                            {t('form.submitting')}
                          </m.span>
                        ) : (
                          <m.span
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {t('form.submit')}
                          </m.span>
                        )}
                      </AnimatePresence>
                    </m.button>

                    <p className="text-fluid-xs leading-relaxed text-w-50">{t('form.privacy_note')}</p>
                  </m.form>
                )}
              </AnimatePresence>
            </m.div>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

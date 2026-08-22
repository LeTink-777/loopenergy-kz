'use client';

import { AnimatePresence, m } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { ProductGridCard } from './ProductGridCard';
import { RevealGroup } from '@/components/ui/Reveal';
import { EASE, springPop } from '@/components/ui/motion';
import {
  CATEGORY_IDS,
  SORT_IDS,
  STRENGTH_IDS,
  products,
  type CategoryId,
  type SortId,
  type StrengthId,
} from '@/lib/products';

type FilterState = { category: CategoryId; strength: StrengthId; sort: SortId; inStockOnly: boolean };

const DEFAULTS: FilterState = { category: 'all', strength: 'all', sort: 'popular', inStockOnly: false };

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-[44px] items-center rounded-pill border px-4 text-fluid-sm font-semibold transition-colors ${
        active
          ? 'border-accent/60 bg-accent/15 text-white'
          : 'border-w-15 text-w-70 hover:border-accent/35 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function FilterPanel({
  state,
  set,
  reset,
}: {
  state: FilterState;
  set: (patch: Partial<FilterState>) => void;
  reset: () => void;
}) {
  const t = useTranslations('shop');

  return (
    <div className="flex flex-col gap-fluid-md">
      <div>
        <p className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-w-50">
          {t('category_label')}
        </p>
        <div className="mt-fluid-xs flex flex-wrap gap-2">
          {CATEGORY_IDS.map((id) => (
            <Chip key={id} active={state.category === id} onClick={() => set({ category: id })}>
              {t(`category_${id}`)}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-w-50">
          {t('strength_label')}
        </p>
        <div className="mt-fluid-xs flex flex-wrap gap-2">
          {STRENGTH_IDS.map((id) => (
            <Chip key={id} active={state.strength === id} onClick={() => set({ strength: id })}>
              {t(`strength_${id}`)}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-w-50">
          {t('sort_label')}
        </p>
        <div className="mt-fluid-xs flex flex-wrap gap-2">
          {SORT_IDS.map((id) => (
            <Chip key={id} active={state.sort === id} onClick={() => set({ sort: id })}>
              {t(`sort_${id.replace('-', '_')}` as 'sort_popular')}
            </Chip>
          ))}
        </div>
      </div>

      <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-3 text-fluid-sm text-w-80">
        <input
          type="checkbox"
          checked={state.inStockOnly}
          onChange={(e) => set({ inStockOnly: e.target.checked })}
          className="h-5 w-5 shrink-0 accent-[#9561e9]"
        />
        {t('in_stock_only')}
      </label>

      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-[44px] items-center justify-center self-start rounded-pill border border-w-15 px-5 text-fluid-xs font-bold uppercase tracking-wide text-w-70 transition-colors hover:border-accent/45 hover:text-white"
      >
        {t('filters_reset')}
      </button>
    </div>
  );
}

export function ShopCatalog() {
  const t = useTranslations('shop');
  const [state, setState] = useState<FilterState>(DEFAULTS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const set = (patch: Partial<FilterState>) => setState((prev) => ({ ...prev, ...patch }));

  const visible = useMemo(() => {
    let list = products.filter((p) => {
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (state.inStockOnly && !p.inStock) return false;
      if (state.strength !== 'all') {
        // Kits and jars ship mixed strengths, so they never match a single filter.
        return p.strength.some((s) => s.id === state.strength);
      }
      return true;
    });

    list = [...list];
    if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (state.sort === 'new') list.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
    if (state.sort === 'popular') list.sort((a, b) => Number(Boolean(b.isHit)) - Number(Boolean(a.isHit)));

    return list;
  }, [state]);

  return (
    <div className="grid gap-fluid-lg lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="purple-ring sticky top-[calc(var(--header-h)+24px)] p-fluid-md">
          <p className="text-fluid-md font-bold uppercase tracking-tight">{t('filters_title')}</p>
          <div className="mt-fluid-sm">
            <FilterPanel state={state} set={set} reset={() => setState(DEFAULTS)} />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-fluid-md flex items-center justify-between gap-fluid-sm">
          <p className="text-fluid-sm text-w-50">{t('found', { count: String(visible.length) })}</p>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-pill border border-w-15 px-4 text-fluid-xs font-bold uppercase tracking-wide text-w-80 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {t('filters_open')}
          </button>
        </div>

        {visible.length > 0 ? (
          <RevealGroup stagger={0.08} className="grid-products">
            {visible.map((product, index) => (
              <ProductGridCard key={product.id} product={product} priority={index < 2} />
            ))}
          </RevealGroup>
        ) : (
          <div className="purple-ring flex flex-col items-center gap-fluid-xs px-fluid-md py-fluid-2xl text-center">
            <p className="text-fluid-lg font-bold uppercase tracking-tight">{t('empty_title')}</p>
            <p className="max-w-sm text-fluid-sm text-w-70">{t('empty_text')}</p>
            <button
              type="button"
              onClick={() => setState(DEFAULTS)}
              className="mt-fluid-xs inline-flex min-h-[44px] items-center rounded-pill bg-accent-grad px-6 text-fluid-xs font-bold uppercase tracking-wide text-white"
            >
              {t('filters_reset')}
            </button>
          </div>
        )}
      </div>

      {/* Bottom sheet keeps filters reachable with one thumb on narrow screens. */}
      <AnimatePresence>
        {sheetOpen ? (
          <m.div
            key="sheet"
            className="fixed inset-0 z-[80] flex items-end lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <button
              type="button"
              aria-label={t('filters_apply')}
              onClick={() => setSheetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <m.div
              className="purple-ring purple-ring-blur relative max-h-[85vh] w-full overflow-y-auto !rounded-b-none !bg-[#241e2b]/97 p-fluid-md pb-[max(1rem,var(--safe-bottom))]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="mb-fluid-sm flex items-center justify-between">
                <p className="text-fluid-md font-bold uppercase tracking-tight">{t('filters_title')}</p>
                <m.button
                  type="button"
                  aria-label={t('filters_apply')}
                  onClick={() => setSheetOpen(false)}
                  whileTap={{ scale: 0.92 }}
                  transition={springPop}
                  className="grid h-11 w-11 place-items-center rounded-pill border border-w-10 text-w-70"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </m.button>
              </div>

              <FilterPanel state={state} set={set} reset={() => setState(DEFAULTS)} />

              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="mt-fluid-md inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-accent-grad text-fluid-xs font-bold uppercase tracking-wide text-white"
              >
                {t('filters_apply')} · {visible.length}
              </button>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

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
  visibleProducts as products,
  type CategoryId,
  type SortId,
} from '@/lib/products';

type FilterState = { category: CategoryId; sort: SortId; inStockOnly: boolean };

const DEFAULTS: FilterState = { category: 'all', sort: 'popular', inStockOnly: false };

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
      className={`filter-pill ${active ? 'is-active' : ''}`}
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

  const dirty =
    state.category !== DEFAULTS.category ||
    state.sort !== DEFAULTS.sort ||
    state.inStockOnly !== DEFAULTS.inStockOnly;

  return (
    <div>
      <p className="filter-label">{t('category_label')}</p>
      <div className="filter-group">
        {CATEGORY_IDS.map((id) => (
          <Chip key={id} active={state.category === id} onClick={() => set({ category: id })}>
            {t(`category_${id}`)}
          </Chip>
        ))}
      </div>


      <p className="filter-label">{t('sort_label')}</p>
      <div className="filter-group">
        {SORT_IDS.map((id) => (
          <Chip key={id} active={state.sort === id} onClick={() => set({ sort: id })}>
            {t(`sort_${id.replace('-', '_')}` as 'sort_popular')}
          </Chip>
        ))}
      </div>

      <label className="mt-6 flex h-[52px] cursor-pointer items-center gap-3 px-1 text-fluid-sm text-w-80">
        <input
          type="checkbox"
          checked={state.inStockOnly}
          onChange={(e) => set({ inStockOnly: e.target.checked })}
          className="h-5 w-5 shrink-0 accent-[#9561e9]"
        />
        {t('in_stock_only')}
      </label>

      {/* Only offered once there is something to undo — a permanent reset on an
          untouched panel reads as a control that does nothing. */}
      {dirty ? (
        <button
          type="button"
          onClick={reset}
          className="mt-3 inline-flex min-h-[44px] items-center text-fluid-sm font-semibold text-accent underline-offset-4 transition-colors hover:text-accent-light hover:underline"
        >
          {t('filters_reset')}
        </button>
      ) : null}
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
            className="btn btn-sm btn-ghost uppercase tracking-wide lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {t('filters_open')}
          </button>
        </div>

        {visible.length > 0 ? (
          <RevealGroup stagger={0.08} className="grid-products">
            {visible.map((product, index) => (
              <ProductGridCard key={product.id} product={product} priority={index < 2} headingLevel="h2" />
            ))}
          </RevealGroup>
        ) : (
          <div className="purple-ring flex flex-col items-center gap-fluid-xs px-fluid-md py-fluid-2xl text-center">
            <p className="text-fluid-lg font-bold uppercase tracking-tight">{t('empty_title')}</p>
            <p className="max-w-sm text-fluid-sm text-w-70">{t('empty_text')}</p>
            <button
              type="button"
              onClick={() => setState(DEFAULTS)}
              className="btn btn-md btn-primary mt-2 uppercase tracking-wide"
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
                className="btn btn-md btn-primary mt-4 w-full uppercase tracking-wide"
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

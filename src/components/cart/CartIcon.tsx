'use client';

import { AnimatePresence, m } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { springPop } from '@/components/ui/motion';
import { useCartStore } from '@/store/cartStore';

export function CartIcon() {
  const t = useTranslations('header');
  const hydrated = useHydrated();
  const { tapPress } = useUniversalMotion();
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  // The badge only renders after hydration — the server cannot know the cart.
  const visible = hydrated && count > 0;

  return (
    <m.div whileTap={tapPress} transition={springPop} className="relative">
      <Link
        href="/cart"
        aria-label={visible ? `${t('cart')} — ${count}` : t('cart')}
        className="relative grid h-11 w-11 place-items-center rounded-pill border border-w-10 bg-white/[0.04] text-w-80 transition-colors hover:border-accent/40 hover:text-white"
      >
        <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />

        <AnimatePresence>
          {visible ? (
            <m.span
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 22 }}
              className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-pill bg-accent-grad px-1 text-[11px] font-black tabular-nums text-white shadow-glow-sm"
            >
              {count > 99 ? '99+' : count}
            </m.span>
          ) : null}
        </AnimatePresence>
      </Link>
    </m.div>
  );
}

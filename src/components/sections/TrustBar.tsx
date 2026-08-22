'use client';

import { BadgeCheck, ScrollText, ShieldCheck, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RevealGroup, Reveal } from '@/components/ui/Reveal';

const ITEMS = [
  { key: 'distributor', Icon: BadgeCheck },
  { key: 'delivery', Icon: Truck },
  { key: 'age', Icon: ShieldCheck },
  { key: 'legal', Icon: ScrollText },
] as const;

export function TrustBar() {
  const t = useTranslations('trust_bar');

  return (
    <section aria-label={t('distributor')} className="py-fluid-sm">
      <div className="container-content">
        <RevealGroup stagger={0.08} className="purple-ring grid-stats">
          {ITEMS.map(({ key, Icon }) => (
            <Reveal key={key} as="div">
              <div className="flex items-center justify-center gap-2.5 text-center">
                <Icon className="h-[18px] w-[18px] shrink-0 text-accent-light" aria-hidden="true" />
                <span className="text-fluid-xs font-semibold uppercase tracking-[0.08em] text-w-70">
                  {t(key)}
                </span>
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

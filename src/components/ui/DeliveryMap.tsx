'use client';

import { m } from 'framer-motion';
import { Clock, MapPin, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { springPop } from './motion';
import type { DeliveryPoint } from '@/lib/services/types';

/**
 * Pickup point picker.
 *
 * Without a map key it renders the selectable list only — which is the part
 * that actually completes a checkout. The map is decoration on top of it, so
 * the fallback is a working UI rather than a placeholder.
 */
export function DeliveryMap({
  points,
  selectedId,
  onSelect,
}: {
  points: DeliveryPoint[];
  selectedId?: string;
  onSelect: (point: DeliveryPoint) => void;
}) {
  const t = useTranslations('delivery_map');
  const mapRef = useRef<HTMLDivElement>(null);
  const { tapPress } = useUniversalMotion();
  const hasMapKey = Boolean(process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY);

  useEffect(() => {
    if (!hasMapKey || !mapRef.current) return;
    // TODO: mount Yandex Maps here once NEXT_PUBLIC_YANDEX_MAPS_KEY is issued;
    // the list below stays as the no-JS and screen-reader path either way.
  }, [hasMapKey, points]);

  return (
    <div className="flex flex-col gap-fluid-sm">
      {hasMapKey ? (
        <div ref={mapRef} className="purple-ring h-[320px] overflow-hidden" />
      ) : (
        <p className="purple-ring flex items-center gap-2.5 p-fluid-sm text-fluid-sm text-w-70">
          <MapPin className="h-[18px] w-[18px] shrink-0 text-accent-light" aria-hidden="true" />
          {t('map_pending')}
        </p>
      )}

      {points.length === 0 ? (
        <p className="purple-ring p-fluid-md text-center text-fluid-sm text-w-70">{t('empty')}</p>
      ) : (
        <ul className="flex max-h-[320px] flex-col gap-2 overflow-y-auto">
          {points.map((point) => {
            const active = point.id === selectedId;

            return (
              <li key={point.id}>
                <m.button
                  type="button"
                  onClick={() => onSelect(point)}
                  aria-pressed={active}
                  whileTap={tapPress}
                  transition={springPop}
                  className={`w-full rounded-2xl border p-fluid-sm text-left transition-colors ${
                    active
                      ? 'border-accent/60 bg-accent/10'
                      : 'border-w-10 hover:border-accent/35 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="block text-fluid-sm font-semibold text-white">{point.name}</span>
                  <span className="mt-1 block text-fluid-xs text-w-70">{point.address}</span>

                  <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-fluid-xs text-w-50">
                    {point.workHours ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {point.workHours}
                      </span>
                    ) : null}
                    {point.phone ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {point.phone}
                      </span>
                    ) : null}
                  </span>
                </m.button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

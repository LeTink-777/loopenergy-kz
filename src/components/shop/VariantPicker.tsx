'use client';

import { m } from 'framer-motion';

import { EASE } from '@/components/ui/motion';

export type Option = { id: string; label: string; sub?: string; color?: string; disabled?: boolean };

/** Pill row for strengths; renders a colour dot when an option carries one. */
export function VariantPicker({
  label,
  options,
  value,
  onChange,
  name,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  name: string;
}) {
  return (
    <fieldset>
      <legend className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-w-50">
        {label}
      </legend>

      <div className="mt-fluid-xs flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === value;

          return (
            <label
              key={option.id}
              className={`relative inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-pill border px-4 text-fluid-sm font-semibold transition-colors ${
                active
                  ? 'border-accent/60 text-white'
                  : 'border-w-15 text-w-70 hover:border-accent/35 hover:text-white'
              } ${option.disabled ? 'pointer-events-none opacity-40' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={active}
                disabled={option.disabled}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />

              {/* Plain fade, not a shared layout animation — LazyMotion's
                  `domAnimation` feature set has no layout support. */}
              <m.span
                className="absolute inset-0 -z-10 rounded-pill bg-accent/15"
                initial={false}
                animate={{ opacity: active ? 1 : 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                aria-hidden="true"
              />

              {option.color ? (
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-white/25"
                  style={{ backgroundColor: option.color }}
                  aria-hidden="true"
                />
              ) : null}

              <span className="whitespace-nowrap">{option.label}</span>
              {option.sub ? <span className="text-fluid-xs text-w-50">{option.sub}</span> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

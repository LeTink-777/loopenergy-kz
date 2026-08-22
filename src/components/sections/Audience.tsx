'use client';

import { m } from 'framer-motion';
import { Briefcase, Dumbbell, Gamepad2, GraduationCap, Moon, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EASE } from '@/components/ui/motion';
import type { Content } from '@/lib/content';

const ICONS: Record<string, LucideIcon> = {
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Moon,
  Briefcase,
};

export function Audience() {
  const t = useTranslations('audience');
  const items = t.raw('items') as Content['audience']['items'];

  return (
    <section id="audience" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <RevealGroup>
          <SectionHeading badge={t('badge')} title={t('h2')} accent={t('h2_accent')} />
        </RevealGroup>

        <RevealGroup stagger={0.1} className="grid-audience mt-fluid-xl">
          {items.map((item) => {
            const Icon = ICONS[item.icon];

            return (
              <m.div
                key={item.key}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                }}
                className="h-full"
              >
                <m.div
                  initial="rest"
                  animate="rest"
                  whileHover="active"
                  variants={{
                    rest: { y: 0, boxShadow: '0 0 0 rgba(149,97,233,0)' },
                    active: { y: -4, boxShadow: '0 20px 50px -20px rgba(149,97,233,0.35)' },
                  }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="purple-ring h-full p-6"
                >
                  <m.span
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-light"
                    variants={{ rest: { rotate: 0 }, active: { rotate: -8 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                  </m.span>

                  <h3 className="mt-5 text-fluid-md font-bold uppercase tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-fluid-sm leading-relaxed text-w-70">{item.description}</p>
                </m.div>
              </m.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}

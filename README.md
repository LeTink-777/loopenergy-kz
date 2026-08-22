# LOOP Energy Kazakhstan

Marketing site for the official exclusive distributor of LOOP Energy caffeine
pouches in Kazakhstan. Russian by default, Kazakh via a header switcher.

Domains: `loopenergy.kz` and `loop-energy.kz` (identical mirrors).

## Stack

- Next.js 15 (App Router) · TypeScript strict
- Tailwind CSS v3 with a fluid `clamp()` design system
- Framer Motion (via `LazyMotion` + `domAnimation`) for every animation
- next-intl 4 for `ru` / `kz` routing and messages
- Deployed on Vercel (`fra1`)

## Commands

```bash
npm run dev     # http://localhost:3000 → redirects to /ru
npm run build   # production build
npm start       # serve the production build
npm run lint
```

## Layout of the code

```
src/
├── app/[locale]/        # locale layout + home page (JSON-LD lives here)
├── app/api/b2b-lead/    # wholesale lead endpoint (logs to the function log)
├── components/
│   ├── layout/          # Header, Footer, ContactWidget, StickyCta
│   ├── sections/        # one file per page section
│   └── ui/              # PurpleBorderCard, Reveal, AgeGate, ProductCard, …
├── hooks/               # useUniversalMotion
├── i18n/                # routing, request config, typed navigation
└── lib/
    ├── content.ts       # every word on the site, RU + KZ — single source
    ├── seo.ts           # metadata, icon set, schema.org graph
    ├── keywords.ts      # Kazakhstan keyword map and page clusters
    └── constants.ts     # asset URLs, socials, contacts
```

## Content and translations

`src/lib/content.ts` is the only place copy lives. next-intl reads it directly
(`src/i18n/request.ts`), and `src/global.d.ts` feeds its shape back into
`useTranslations`, so `t('hero.h1')` is checked at build time and a typo in a
key fails the build rather than rendering blank.

Both locales must carry the same key tree — `Content` is derived from the
Russian branch, so a missing Kazakh string is a compile error. Numeric copy
(prices, doses) is stored as strings because next-intl only exposes string
leaves as typed keys; parse at the point of use.

Copy is written against the clusters in `src/lib/keywords.ts`: the primary term
lands in the h1, the first paragraph and one h2, with the rest spread across
section headings. Volumes there are modelled estimates, not a live Wordstat
export — re-check before spending on ads.

## Icons

`npm run icons` regenerates all 35 platform icons from
`public/favicon-source.svg`; `npm run og` rebuilds the 1200x630 social card.
Both write into `public/`, and the output is committed, so a normal build never
needs sharp. Coverage: browser tabs, every iOS device generation, Android
densities including maskable, Windows tiles, PWA install and Google Search.

## Responsive approach

No device breakpoints. Sizes come from `clamp()` tokens in `globals.css`
(`--text-*`, `--space-*`, `--radius-*`), and layouts come from `auto-fit` /
`auto-fill` grids that form columns from the space available. The only media
queries left are logical ones: the nav appears at `960px` (where it fits), the
product rail becomes a grid at `640px`, and there are small allowances for
ultra-narrow (`≤300px`) and short-landscape viewports.

Verified with an automated sweep at 280 / 320 / 360 / 375 / 390 / 412 / 430 /
540 / 600 / 720 / 768 / 834 / 900 / 960 / 1024 / 1180 / 1280 / 1440 / 1920 /
2560 px: no horizontal overflow, no tap target under 44px, no text under 11px.

Safe-area insets (`env(safe-area-inset-*)`) offset the header, the floating
contact widget, the sticky CTA and the footer.

## Two things worth knowing before you touch the animations

1. **Never declare `scroll-snap-type` on a container in CSS up front.** A snap
   container performs an automatic snap-scroll during layout, and Chrome
   finalises Largest Contentful Paint on the first scroll — the page ends up
   with *no* LCP candidate at all and a Lighthouse performance score of 0. The
   product rail switches snapping on (`data-snap="on"`) when the visitor first
   touches it, by which point LCP has settled.

2. **Above-the-fold content must not animate from `opacity: 0`.** An element
   first painted transparent is permanently disqualified as an LCP candidate,
   and Framer's compositor-driven opacity never re-registers it. The hero
   headline animates transform only. Below-the-fold reveals may fade freely.

## Content and assets

Product photography and the hero artwork are served from the manufacturer's CDN
(`loopenergy.ru`) and optimised through `next/image`. Prices are in ₸ and live in
`src/lib/constants.ts`.

Adding a locale means adding it to `src/i18n/routing.ts` and dropping a message
file with the same key tree into `src/messages/`.

## Lighthouse

| | performance | accessibility | best practices | SEO |
|---|---|---|---|---|
| desktop | 100 | 100 | 100 | 100 |
| mobile | 90 | 100 | 100 | 100 |

CLS 0, TBT ≤ 20 ms. Measured against `next start` on localhost; Vercel's CDN
does better on the network-bound metrics.

## Deploying

Pushing to `main` deploys automatically once the Vercel project is connected to
this GitHub repository. Connect it under
**Vercel → loopenergy-kz → Settings → Git**, or run `vercel git connect` after
authorising the Vercel GitHub App for the account that owns the repo.

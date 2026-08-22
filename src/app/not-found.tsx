import Link from 'next/link';

import './globals.css';

/** Root-level 404 for paths the locale middleware never matched. */
export default function NotFound() {
  return (
    <html lang="ru">
      <body className="grid min-h-screen place-items-center bg-bg px-6 text-center text-white">
        <div>
          <p className="text-fluid-lg font-black uppercase tracking-[0.14em]">
            LOOP<span className="text-accent-light">&nbsp;Energy</span>
          </p>
          <h1 className="mt-fluid-sm text-fluid-5xl font-extrabold tracking-tight">404</h1>
          <p className="mt-fluid-xs text-fluid-base text-w-70">Страница не найдена / Бет табылмады</p>
          <Link
            href="/ru"
            className="mt-fluid-lg inline-flex min-h-[48px] items-center rounded-pill bg-accent-grad px-7 text-fluid-sm font-bold uppercase tracking-wide text-white"
          >
            На главную
          </Link>
        </div>
      </body>
    </html>
  );
}

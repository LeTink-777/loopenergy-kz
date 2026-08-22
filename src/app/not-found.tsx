import Link from 'next/link';

import './globals.css';

/** Root-level 404 for paths the locale middleware never matched. */
export default function NotFound() {
  return (
    <html lang="ru">
      <body className="grid min-h-screen place-items-center bg-bg px-6 text-center text-white">
        <div>
          <p className="text-lg font-black uppercase tracking-[0.14em]">
            LOOP<span className="text-accent-light"> Energy</span>
          </p>
          <h1 className="mt-6 text-6xl font-extrabold tracking-tight">404</h1>
          <p className="mt-3 text-w-70">Страница не найдена / Бет табылмады</p>
          <Link
            href="/ru"
            className="mt-8 inline-block rounded-pill bg-accent-grad px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white"
          >
            На главную
          </Link>
        </div>
      </body>
    </html>
  );
}

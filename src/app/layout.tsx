import type { ReactNode } from 'react';

import './globals.css';

/**
 * Root layout is intentionally minimal — `<html>`/`<body>` live in the
 * locale layout so the `lang` attribute matches the active locale.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

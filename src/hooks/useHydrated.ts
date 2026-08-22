'use client';

import { useEffect, useState } from 'react';

/**
 * True only after the first client render.
 *
 * The cart is restored from localStorage, which the server cannot know about —
 * rendering a count before hydration would mismatch the server HTML and make
 * React throw away the tree.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

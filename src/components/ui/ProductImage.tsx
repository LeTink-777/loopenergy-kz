'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

const FALLBACK = 'https://loopenergy.ru/images/home/hero.png?v=mt21jjez';

/**
 * Product shot that degrades to the generic tin if the artwork is missing.
 *
 * The catalogue points at the manufacturer's CDN, so a renamed or not-yet-
 * uploaded file would otherwise leave a broken image in the grid. Swap the URL
 * in `products.ts` once the real shot lands.
 */
export function ProductImage({ src, alt, ...props }: ImageProps) {
  const [source, setSource] = useState(src);

  return (
    <Image
      {...props}
      src={source}
      alt={alt}
      onError={() => {
        if (source !== FALLBACK) setSource(FALLBACK);
      }}
    />
  );
}

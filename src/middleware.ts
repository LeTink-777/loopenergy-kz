import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from '@/i18n/routing';

const intl = createMiddleware(routing);

/** The files worth hotlinking: product renders and the frame sequence. */
const PROTECTED = ['/animation/frames/', '/assets/brand/', '/assets/pouches/'];

/** Served to anyone embedding our images on their own page. */
const HONEYPOT = '/assets/protected.avif';

/**
 * Anti-hotlinking, not anti-download. A cross-origin `Referer` means another
 * site is embedding our artwork and spending our bandwidth on it — that we can
 * refuse. A direct request carries no referer at all and is indistinguishable
 * from someone opening the image in a tab, so it passes: anything a browser
 * renders can be saved, and pretending otherwise would only cost us crawlers.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED.some((prefix) => pathname.startsWith(prefix))) {
    const referer = request.headers.get('referer');

    if (referer) {
      let sameOrigin = false;
      try {
        const from = new URL(referer).host;
        sameOrigin = from === request.headers.get('host') || from === request.nextUrl.host;
      } catch {
        // A referer we cannot parse is not one we can trust.
        sameOrigin = false;
      }

      if (!sameOrigin) {
        return NextResponse.redirect(new URL(HONEYPOT, request.url));
      }
    }

    return NextResponse.next();
  }

  // Everything else is the locale router, which owns every page route.
  return intl(request);
}

export const config = {
  matcher: [
    // Pages: unchanged — dropping this would 404 the whole site.
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Assets: added, since the page matcher deliberately excludes anything
    // with a file extension.
    '/animation/frames/:path*',
    '/assets/brand/:path*',
    '/assets/pouches/:path*',
  ],
};

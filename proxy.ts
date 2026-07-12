import { NextResponse, NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

/**
 * Whole-site i18n + auth, composed (BLOG_SEO_ENGINE §8):
 *  - Default locale (en) and all unprefixed paths: unchanged auth/session pipeline,
 *    just tagged with `x-locale: en`. Production English behavior is identical.
 *  - `/<locale>/…` paths: run the SAME session/auth pipeline against the de-prefixed
 *    canonical path (so portal/admin gating keeps working), then rewrite onto the real
 *    route carrying the refreshed session cookies + `x-locale`. No route files moved.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // agency.sageideas.dev — host-based second skin. Serve the /agency tree at the
  // subdomain root, before i18n/auth (the agency surface is public + locale-free).
  const host = (request.headers.get('host') ?? '').split(':')[0];
  if (host === 'agency.sageideas.dev' || host === 'agency.localhost') {
    // SEO files: the dot-exclusion below would let these fall through to the
    // main site's sitemap/robots — map them explicitly onto the agency tree.
    if (pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname === '/feed.xml') {
      const seoUrl = request.nextUrl.clone();
      seoUrl.pathname = `/agency${pathname}`;
      return NextResponse.rewrite(seoUrl);
    }
    if (!pathname.startsWith('/agency') && !pathname.startsWith('/api') && !pathname.includes('.')) {
      const agencyUrl = request.nextUrl.clone();
      agencyUrl.pathname = pathname === '/' ? '/agency' : `/agency${pathname}`;
      const agencyHeaders = new Headers(request.headers);
      agencyHeaders.set('x-pathname', agencyUrl.pathname + (search || ''));
      return NextResponse.rewrite(agencyUrl, { request: { headers: agencyHeaders } });
    }
  }

  const firstSegment = pathname.split('/')[1];

  if (isLocale(firstSegment) && firstSegment !== defaultLocale) {
    const locale = firstSegment;
    const canonicalPath = pathname.slice(locale.length + 1) || '/';

    // Run auth/session against the canonical path so gating + cookie refresh behave
    // exactly as they do for English.
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = canonicalPath;
    const sessionResponse = await updateSession(new NextRequest(canonicalUrl, request));

    // Auth gating issued a redirect/rewrite (e.g. someone hit /es/portal) — honor it.
    if (sessionResponse.headers.get('location') || sessionResponse.headers.get('x-middleware-rewrite')) {
      return sessionResponse;
    }

    // Rewrite the prefixed URL onto the real route, in this locale.
    const headers = new Headers(request.headers);
    headers.set('x-locale', locale);
    headers.set('x-pathname', canonicalPath + (search || ''));
    const rewrite = NextResponse.rewrite(canonicalUrl, { request: { headers } });
    sessionResponse.cookies.getAll().forEach((cookie) => rewrite.cookies.set(cookie));
    return rewrite;
  }

  const response = await updateSession(request);
  response.headers.set('x-locale', defaultLocale);
  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next internals (static, image, AND the dev HMR
    // websocket /_next/webpack-hmr — matching only _next/static|_next/image let
    // the middleware process the HMR upgrade and break it, killing dev hydration)
    // and static asset/feed files.
    '/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
    // SEO files must reach the proxy so the agency host can serve its own
    // sitemap/robots. On the main host these hit the default path (updateSession
    // pass-through), so app/sitemap.ts + app/robots.ts behavior is unchanged.
    '/sitemap.xml',
    '/robots.txt',
    '/feed.xml',
  ],
};

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that need Clerk context but are publicly accessible
const isPublicPortalRoute = createRouteMatcher([
  '/login(.*)',
  '/api/portal/health',
  '/api/portal/webhooks(.*)',
]);

// All routes that should hide marketing chrome (nav/footer)
const isPortalChromeRoute = createRouteMatcher([
  '/login(.*)',
  '/portal(.*)',
]);

// Auth-gated portal routes
const isProtectedPortalRoute = createRouteMatcher([
  '/portal(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Tag portal/login routes with header so server components can hide chrome
  if (isPortalChromeRoute(req)) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-portal', '1');

    // Auth-gate /portal/*
    if (isProtectedPortalRoute(req) && !isPublicPortalRoute(req)) {
      await auth.protect();
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }
});

export const config = {
  matcher: [
    // All paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
    // Always run on API routes
    '/(api|trpc)(.*)',
  ],
};

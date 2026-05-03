import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const STUDIO_HOST = 'studio.sageideas.dev';

// Public routes within the studio namespace
const isPublicStudioRoute = createRouteMatcher([
  '/studio/login(.*)',
  '/studio/api/portal/health',
  '/studio/api/portal/webhooks(.*)',
]);

// Pre-pass that rewrites studio.sageideas.dev/* -> /studio/* internally
// so the URL bar stays clean while the file system uses /app/studio/*.
function rewriteStudioHost(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const url = req.nextUrl.clone();

  if (host === STUDIO_HOST && !url.pathname.startsWith('/studio')) {
    url.pathname = `/studio${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  return null;
}

export default clerkMiddleware(async (auth, req) => {
  // 1) Host rewrite for studio.sageideas.dev
  const rewrite = rewriteStudioHost(req);
  if (rewrite) return rewrite;

  // 2) Auth gate for /studio/* (except public routes)
  const path = req.nextUrl.pathname;
  if (path.startsWith('/studio') && !isPublicStudioRoute(req)) {
    await auth.protect();
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

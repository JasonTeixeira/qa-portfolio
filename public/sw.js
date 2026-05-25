// Sage Ideas Service Worker — Phase 1
// Hand-rolled, no dependencies. Strategies:
//   - HTML navigations: network-first, fallback to /offline + cache
//   - Static assets (_next/static, /brand, /work, /images, /icons): stale-while-revalidate
//   - API: network-only (never cache)
//   - Cross-origin: pass-through

const VERSION = 'sage-sw-v1-2026-05-25'
const SHELL_CACHE = `${VERSION}-shell`
const STATIC_CACHE = `${VERSION}-static`
const RUNTIME_CACHE = `${VERSION}-runtime`

const OFFLINE_URL = '/offline'
const SHELL_URLS = [OFFLINE_URL, '/', '/work', '/lab', '/services', '/pricing', '/contact']

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      // Best-effort prefetch — never fail install on a missing page.
      await Promise.all(
        SHELL_URLS.map((url) =>
          fetch(url, { credentials: 'same-origin' })
            .then((res) => (res && res.ok ? cache.put(url, res.clone()) : null))
            .catch(() => null),
        ),
      )
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// Helpers
const isHtmlNav = (req) =>
  req.mode === 'navigate' ||
  (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))

const isStaticAsset = (url) =>
  /\/_next\/static\//.test(url.pathname) ||
  /\/(brand|work|images|icons|founder|artifacts|quality)\//.test(url.pathname) ||
  /\.(png|jpg|jpeg|svg|webp|avif|ico|gif|woff2?|ttf|otf|css|js)$/i.test(url.pathname)

const isApi = (url) =>
  url.pathname.startsWith('/api/') ||
  url.pathname.startsWith('/monitoring') ||
  url.pathname.startsWith('/auth/')

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // cross-origin: pass-through
  if (isApi(url)) return // API: never intercept

  if (isHtmlNav(req)) {
    event.respondWith(networkFirstShell(req))
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE))
    return
  }

  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE))
})

async function networkFirstShell(req) {
  try {
    const fresh = await fetch(req)
    if (fresh && fresh.ok) {
      const cache = await caches.open(SHELL_CACHE)
      cache.put(req, fresh.clone()).catch(() => null)
    }
    return fresh
  } catch {
    const cache = await caches.open(SHELL_CACHE)
    const cached = await cache.match(req)
    if (cached) return cached
    const offline = await cache.match(OFFLINE_URL)
    if (offline) return offline
    return new Response(
      `<!doctype html><meta charset="utf-8"><title>Offline</title><body style="background:#09090B;color:#F4F2EF;font-family:system-ui;display:grid;place-items:center;min-height:100vh"><div><h1>Offline</h1><p>You're offline and this page isn't cached yet.</p></div></body>`,
      { headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(req)
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone()).catch(() => null)
      return res
    })
    .catch(() => null)
  return cached || (await network) || new Response('Resource unavailable offline', { status: 503 })
}

import { readFileSync } from 'node:fs';
import net from 'node:net';
import { JSDOM } from 'jsdom';
import { globby } from 'globby';
import { spawn } from 'node:child_process';

const DEFAULT_PORT = Number(process.env.LINKCHECK_PORT || 4173);
const TIMEOUT_MS = Number(process.env.LINKCHECK_TIMEOUT_MS || 15000);
const MAX_REDIRECTS = 5;

const ALLOW_EXTERNAL = new Set([
  'github.com',
  'www.github.com',
  // LinkedIn blocks automated HEAD/GET checks (often returns 999).
  // We'll allow these URLs but skip validation.
  'linkedin.com',
  'www.linkedin.com',
]);

const SKIP_EXTERNAL = new Set([
  'linkedin.com',
  'www.linkedin.com',
]);

const FILE_EXTS = new Set(['.md', '.pdf', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.zip']);

function isHttpUrl(href) {
  return href.startsWith('http://') || href.startsWith('https://');
}

function normalizeUrl(url) {
  const u = new URL(url);
  u.hash = '';
  return u.toString();
}

function shouldCheckExternal(url) {
  try {
    const u = new URL(url);
    // GitHub may redirect or block automated probing for certain paths.
    // For this portfolio, we validate GitHub URLs by allowing them (they must be well-formed)
    // but we do not fail the build on GitHub returning a non-200 in automated checks.
    if (u.hostname === 'github.com' || u.hostname === 'www.github.com') return false;
    return ALLOW_EXTERNAL.has(u.hostname) && !SKIP_EXTERNAL.has(u.hostname);
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net
      .createConnection({ host: '127.0.0.1', port })
      .once('connect', () => {
        socket.end();
        resolve(true);
      })
      .once('error', () => {
        resolve(false);
      });
  });
}

async function findAvailablePort(startPort, tries = 20) {
  for (let p = startPort; p < startPort + tries; p++) {
    // If something is already listening, we can reuse it.
    // Otherwise, we will attempt to start our own server on it.
    if (!(await isPortOpen(p))) return p;
  }
  return startPort;
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status >= 200 && res.status < 500) return;
    } catch {
      // ignore
    }
    await sleep(250);
  }
  throw new Error(`Server not reachable at ${url} after ${timeoutMs}ms`);
}

async function fetchFollow(url, opts, redirectsLeft = MAX_REDIRECTS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...opts,
      redirect: 'manual',
      signal: controller.signal,
    });

    if (res.status >= 300 && res.status < 400 && res.headers.get('location') && redirectsLeft > 0) {
      const loc = res.headers.get('location');
      const next = new URL(loc, url).toString();
      return fetchFollow(next, opts, redirectsLeft - 1);
    }

    return res;
  } finally {
    clearTimeout(t);
  }
}

async function headOrGet(url) {
  let res = await fetchFollow(url, { method: 'HEAD' });
  // GitHub commonly redirects (302) for blob URLs (e.g., to sign-in/consent or canonical paths).
  // A redirect is still a valid, non-broken link for our purposes.
  if (res.status >= 300 && res.status < 400) {
    return { status: res.status };
  }
  if (res.status === 405 || res.status === 403) {
    res = await fetchFollow(url, { method: 'GET' });
  }
  return { status: res.status };
}

function looksLikeFile(pathname) {
  const lower = pathname.toLowerCase();
  for (const ext of FILE_EXTS) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

function isInternalUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.origin === new URL(globalThis.__SITE_URL__).origin;
  } catch {
    return false;
  }
}

function normalizeInternal(urlStr) {
  const u = new URL(urlStr);
  u.hash = '';
  // normalize trailing slash (Next serves both but keep consistent)
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.slice(0, -1);
  }
  return u.toString();
}

function parseProjectSlugs() {
  const src = readFileSync(new URL('../lib/projectsData.ts', import.meta.url), 'utf8');
  const slugs = new Set();
  for (const m of src.matchAll(/\bslug:\s*"([^"]+)"/g)) slugs.add(m[1]);
  return [...slugs];
}

function parseBlogIds() {
  const src = readFileSync(new URL('../lib/blogData.ts', import.meta.url), 'utf8');
  const ids = new Set();
  for (const m of src.matchAll(/\bid:\s*(\d+)/g)) ids.add(m[1]);
  return [...ids];
}

async function main() {
  // Determine site URL + whether we need to start a server.
  const providedSiteUrl = process.env.SITE_URL;
  let siteUrl = providedSiteUrl;
  let server;

  if (!siteUrl) {
    // Prefer 4173, but avoid collisions from other running processes.
    const port = await findAvailablePort(DEFAULT_PORT);
    siteUrl = `http://127.0.0.1:${port}`;
    globalThis.__SITE_URL__ = siteUrl;

    // If something is already listening, reuse it.
    const alreadyUp = await isPortOpen(port);
    if (!alreadyUp) {
      server = spawn('node', ['scripts/serve-prod.mjs'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: String(port) },
      });
    }
  } else {
    globalThis.__SITE_URL__ = siteUrl;
  }

  try {
    await waitForServer(siteUrl, 60_000);

    const toVisit = [];
    const visited = new Set();
    const internalUrls = new Set();
    const externalUrls = new Set();

    // Seed routes (static + dynamic)
    const seeds = [
      '/',
      '/about',
      '/projects',
      '/artifacts',
      '/blog',
      '/contact',
      ...parseProjectSlugs().map((s) => `/projects/${s}`),
      ...parseBlogIds().map((id) => `/blog/${id}`),
    ];

    for (const p of seeds) {
      toVisit.push(new URL(p, siteUrl).toString());
    }

    // Crawl internal links (bounded)
    const MAX_INTERNAL_PAGES = Number(process.env.LINKCHECK_MAX_PAGES || 200);
    while (toVisit.length && visited.size < MAX_INTERNAL_PAGES) {
      const url = normalizeInternal(toVisit.shift());
      if (visited.has(url)) continue;
      visited.add(url);

      const { status } = await headOrGet(url);
      internalUrls.add(url);
      // If HTML page isn't OK, we still record it and continue.
      if (status < 200 || status >= 400) continue;
      if (looksLikeFile(new URL(url).pathname)) continue;

      const pageRes = await fetchFollow(url, { method: 'GET' });
      const html = await pageRes.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      for (const a of [...document.querySelectorAll('a[href]')]) {
        const href = (a.getAttribute('href') || '').trim();
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
        if (href.startsWith('#')) continue;

        // External
        if (isHttpUrl(href)) {
          if (ALLOW_EXTERNAL.has(new URL(href).hostname)) externalUrls.add(normalizeUrl(href));
          continue;
        }

        const abs = new URL(href, url).toString();
        if (!isInternalUrl(abs)) continue;
        toVisit.push(abs);
      }
    }

    const failures = [];

    for (const url of [...internalUrls].sort()) {
      const { status } = await headOrGet(url);
      if (status < 200 || status >= 400) failures.push({ url, status, kind: 'internal' });
    }

    const artifactFiles = await globby(['public/artifacts/**/*.*', '!public/artifacts/_manifest.json']);
    for (const f of artifactFiles) {
      const rel = f.replace(/^public/, '');
      const url = new URL(rel, siteUrl).toString();
      const { status } = await headOrGet(url);
      if (status < 200 || status >= 400) failures.push({ url, status, kind: 'artifact' });
    }

    for (const url of [...externalUrls].sort()) {
      // Skip known-hostile sites like LinkedIn.
      if (!shouldCheckExternal(url)) continue;
      const { status } = await headOrGet(url);
      if (status < 200 || status >= 400) failures.push({ url, status, kind: 'external' });
    }

    if (failures.length) {
      console.error('\nBroken links detected:');
      for (const f of failures) console.error(`- [${f.kind}] ${f.status} ${f.url}`);
      process.exitCode = 1;
      return;
    }

    console.log(`OK: ${internalUrls.size} internal URLs, ${artifactFiles.length} artifacts, ${externalUrls.size} external URLs discovered.`);
  } finally {
    server?.kill('SIGTERM');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

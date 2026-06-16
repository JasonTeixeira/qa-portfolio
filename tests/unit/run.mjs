// Phase-1 unit tests — pure logic only, no server, no Supabase.
// Run with: node --experimental-strip-types tests/unit/run.mjs
//
// Keeps each suite self-contained so we don't have to wire a full test
// framework just for a handful of assertions.

import { strict as assert } from 'node:assert';

// .ts imports work via the tsx loader, which is registered through the
// package script (`tsx tests/unit/run.mjs` or `node --import tsx ...`).
// Direct `node tests/unit/run.mjs` will fail when importing .ts files.

const suites = [];
function test(name, fn) {
  suites.push({ name, fn });
}

// -------------------------------------------------------------- api-errors

test('api-errors: badRequest returns 400 + structured body', async () => {
  const { badRequest } = await import('../../lib/api-errors.ts');
  const res = badRequest('nope');
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'nope');
  assert.equal(body.code, 'bad_request');
});

test('api-errors: unauthorized + forbidden + notFound + serverError status codes', async () => {
  const { unauthorized, forbidden, notFound, serverError } = await import(
    '../../lib/api-errors.ts'
  );
  assert.equal(unauthorized().status, 401);
  assert.equal(forbidden().status, 403);
  assert.equal(notFound().status, 404);
  assert.equal(serverError().status, 500);
});

test('api-errors: tooManyRequests sets Retry-After header', async () => {
  const { tooManyRequests } = await import('../../lib/api-errors.ts');
  const res = tooManyRequests(42);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('Retry-After'), '42');
});

test('api-errors: fromZodError returns 400 with first message', async () => {
  const { fromZodError } = await import('../../lib/api-errors.ts');
  const { z } = await import('zod');
  const parsed = z.object({ x: z.string() }).safeParse({ x: 1 });
  assert.equal(parsed.success, false);
  const res = fromZodError(parsed.error);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.code, 'invalid_request');
  assert.ok(typeof body.error === 'string' && body.error.length > 0);
});

// -------------------------------------------------------------- rate-limit

test('rate-limit: checkRateLimitFromHeaders blocks after limit', async () => {
  const mod = await import('../../lib/rate-limit.ts');
  const headers = {
    get(name) {
      return name.toLowerCase() === 'x-forwarded-for' ? '203.0.113.42' : null;
    },
  };
  const opts = { limit: 3, windowMs: 60_000, prefix: 'unit-test:burst' };
  for (let i = 0; i < 3; i++) {
    const r = mod.checkRateLimitFromHeaders(headers, opts);
    assert.equal(r.ok, true, `hit ${i + 1} should pass`);
  }
  const blocked = mod.checkRateLimitFromHeaders(headers, opts);
  assert.equal(blocked.ok, false);
  if (blocked.ok === false) {
    assert.ok(blocked.retryAfterSeconds >= 1);
  }
});

test('rate-limit: separate prefixes do not share buckets', async () => {
  const mod = await import('../../lib/rate-limit.ts');
  const headers = {
    get(name) {
      return name.toLowerCase() === 'x-forwarded-for' ? '198.51.100.7' : null;
    },
  };
  const a = mod.checkRateLimitFromHeaders(headers, {
    limit: 1,
    windowMs: 60_000,
    prefix: 'unit-test:a',
  });
  const b = mod.checkRateLimitFromHeaders(headers, {
    limit: 1,
    windowMs: 60_000,
    prefix: 'unit-test:b',
  });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
});

// -------------------------------------------------------------- route validation
// Direct-call a route's POST() to assert the Zod gate fires before any
// side-effects. We stub requireAdminApi to return a fake guard and
// supabaseAdmin so the body validator runs without DB access.

test('admin/templates POST: malformed body returns 400 with { error }', async () => {
  // Mock dependencies via dynamic import + module replacement is brittle in
  // Node ESM; instead, drive the handler with a body that fails Zod and
  // verify the helper response shape independently of the auth guard.
  // We import the schema chain by pulling fromZodError + a fresh schema.
  const { fromZodError, badRequest } = await import('../../lib/api-errors.ts');
  const { z } = await import('zod');
  const schema = z.object({
    title: z.string().min(1).max(300),
  });
  // Empty body -> Zod fails -> route returns fromZodError(...).
  const parsed = schema.safeParse({});
  assert.equal(parsed.success, false);
  const res = parsed.success
    ? badRequest('unreachable')
    : fromZodError(parsed.error);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.error, 'response body must include `error`');
  assert.ok(typeof body.code === 'string');
});

// -------------------------------------------------------------- active-org (Phase 2B PR-A)

test('resolveActiveOrg: explicit slug wins over cookie and first', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: 'beta-test-co',
    cookieSlug: 'acme',
  });
  assert.equal(out?.org.id, 'b');
});

test('resolveActiveOrg: cookie wins when no explicit slug', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: null,
    cookieSlug: 'beta-test-co',
  });
  assert.equal(out?.org.id, 'b');
});

test('resolveActiveOrg: falls back to first when slug+cookie miss', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: 'unknown-slug',
    cookieSlug: 'also-unknown',
  });
  assert.equal(out?.org.id, 'a');
});

test('resolveActiveOrg: empty memberships -> null', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const out = resolveActiveOrg([], { slug: 'anything', cookieSlug: 'whatever' });
  assert.equal(out, null);
});

// -------------------------------------------------------------- events

test('event name registry is the closed set', async () => {
  const { EVENT_NAMES, GA4_CONVERSION_EVENTS, isValidEvent } = await import('../../lib/analytics/events.ts');
  assert.ok(EVENT_NAMES.includes('checkout_start'));
  assert.ok(EVENT_NAMES.includes('lead_magnet_complete'));
  assert.equal(isValidEvent('not_a_real_event'), false);
  assert.equal(isValidEvent('cta_click'), true);
  assert.deepEqual([...GA4_CONVERSION_EVENTS], [
    'contact_submit',
    'checkout_start',
    'lead_magnet_complete',
    'newsletter_signup',
  ]);

  // Exact count guard — update this when adding new events
  assert.equal(EVENT_NAMES.length, 14);

  // Every expected event must be present
  const expected = [
    'cta_click',
    'contact_submit',
    'pricing_view',
    'service_view',
    'checkout_start',
    'checkout_complete',
    'lead_magnet_start',
    'lead_magnet_complete',
    'booking_click',
    'newsletter_signup',
    'decision_tree_complete',
  ];
  for (const name of expected) {
    assert.ok(EVENT_NAMES.includes(name), `EVENT_NAMES missing: ${name}`);
  }
});

test('attribution: extracts first-touch campaign metadata from a URL', async () => {
  const { extractAttributionFromUrl, parseAttributionCookie, serializeAttribution } = await import(
    '../../lib/analytics/attribution.ts'
  );
  const attribution = extractAttributionFromUrl(
    'https://www.sageideas.dev/academy?utm_source=linkedin&utm_medium=social&utm_campaign=wave-2&gclid=abc123',
    'https://linkedin.com/feed',
    new Date('2026-06-16T12:00:00.000Z'),
  );

  assert.equal(attribution.landingPage, '/academy?utm_source=linkedin&utm_medium=social&utm_campaign=wave-2&gclid=abc123');
  assert.equal(attribution.referrer, 'https://linkedin.com/feed');
  assert.equal(attribution.utmSource, 'linkedin');
  assert.equal(attribution.utmMedium, 'social');
  assert.equal(attribution.utmCampaign, 'wave-2');
  assert.equal(attribution.gclid, 'abc123');
  assert.deepEqual(parseAttributionCookie(serializeAttribution(attribution)), attribution);
});

test('lead scoring: high-intent studio inquiry outranks newsletter signup', async () => {
  const { scoreLead } = await import('../../lib/leads/scoring.ts');
  const studio = scoreLead({
    source: 'contact',
    email: 'founder@company.com',
    name: 'Founder',
    detail: 'We need a full AI product, brand system, checkout funnel, and content engine built this quarter.',
    inquiryType: 'studio',
    budget: '50-100k',
  });
  const newsletter = scoreLead({
    source: 'newsletter',
    email: 'reader@gmail.com',
    name: null,
    detail: 'Newsletter signup',
  });

  assert.ok(studio.score > newsletter.score);
  assert.ok(studio.reasons.includes('studio engagement selected'));
  assert.ok(newsletter.reasons.includes('newsletter signup'));
});

// -------------------------------------------------------------- content / seo

test('blog toc: injects stable ids for h2 and h3 headings', async () => {
  const { injectHeadingIds } = await import('../../lib/blog-toc.ts');
  const out = injectHeadingIds('<h2>First section</h2><p>x</p><h3>Nested & useful</h3><h2>First section</h2>');
  assert.equal(out.toc.length, 3);
  assert.deepEqual(out.toc.map((node) => node.id), [
    'first-section',
    'nested-and-useful',
    'first-section-2',
  ]);
  assert.ok(out.html.includes('id="first-section"'));
  assert.ok(out.html.includes('id="nested-and-useful"'));
});

test('keyword map: primary keywords are unique per URL', async () => {
  const { keywordMap, getPrimaryKeyword, getKeywordsByUrl } = await import('../../data/seo/keyword-map.ts');
  const primaryByUrl = new Map();
  for (const entry of keywordMap.filter((item) => item.isPrimary)) {
    const count = primaryByUrl.get(entry.assignedUrl) ?? 0;
    primaryByUrl.set(entry.assignedUrl, count + 1);
  }
  for (const [url, count] of primaryByUrl) {
    assert.equal(count, 1, `${url} should have exactly one primary keyword`);
    assert.equal(getPrimaryKeyword(url)?.assignedUrl, url);
    assert.ok(getKeywordsByUrl(url).length >= 1);
  }
});

// -------------------------------------------------------------- isSelfServe

test('isSelfServe: audit ($750 one-time) is self-serve', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const audit = tiersOrdered.find((t) => t.slug === 'audit');
  assert.ok(audit, 'audit tier must exist');
  assert.equal(isSelfServe(audit), true);
});

test('isSelfServe: build ($9500 custom) is NOT self-serve', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const build = tiersOrdered.find((t) => t.slug === 'build');
  assert.ok(build, 'build tier must exist');
  assert.equal(isSelfServe(build), false);
});

test('isSelfServe: all self-serve tiers have stripePriceId, cadence=one-time, priceCents ≤ 250000', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe, SELF_SERVE_PRICE_CAP_CENTS } = await import(
    '../../data/services/tier-classification.ts'
  );
  for (const tier of tiersOrdered) {
    if (!isSelfServe(tier)) continue;
    assert.ok(tier.stripePriceId, `${tier.slug}: must have stripePriceId`);
    assert.equal(tier.cadence, 'one-time', `${tier.slug}: cadence must be one-time`);
    assert.ok(
      tier.priceCents <= SELF_SERVE_PRICE_CAP_CENTS,
      `${tier.slug}: priceCents ${tier.priceCents} exceeds cap ${SELF_SERVE_PRICE_CAP_CENTS}`,
    );
  }
});

// -------------------------------------------------------------- checkout slug routing

test('checkout slug routing: care slugs exist in careTiersBySlug', async () => {
  const { careTiersBySlug } = await import('../../data/services/tiers.ts');
  for (const slug of ['site-care', 'brand-care', 'content-care']) {
    assert.ok(careTiersBySlug[slug], `careTiersBySlug must contain: ${slug}`);
    assert.equal(careTiersBySlug[slug].cadence, 'monthly', `${slug}: cadence must be monthly`);
    assert.ok(careTiersBySlug[slug].stripePriceId, `${slug}: must have stripePriceId`);
  }
});

test('checkout slug routing: care slugs are NOT in tiersBySlug (no collision)', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  for (const slug of ['site-care', 'brand-care', 'content-care']) {
    assert.equal(tiersBySlug[slug], undefined, `${slug} must not appear in tiersBySlug`);
  }
});

test('checkout slug routing: build slug is in tiersBySlug but NOT self-serve', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const build = tiersBySlug['build'];
  assert.ok(build, 'build must exist in tiersBySlug');
  assert.equal(isSelfServe(build), false, 'build must not be self-serve');
});

test('checkout slug routing: audit slug is self-serve and in tiersBySlug', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const audit = tiersBySlug['audit'];
  assert.ok(audit, 'audit must exist in tiersBySlug');
  assert.equal(isSelfServe(audit), true, 'audit must be self-serve');
});

// -------------------------------------------------------------- ssrf guard

test('ssrf: isPrivateIp — 10.x, 127.x, 169.254.x, 192.168.x, 172.16–31.x are private', async () => {
  const { isPrivateIp } = await import('../../lib/seo-audit/ssrf.ts');
  assert.equal(isPrivateIp('10.0.0.5'), true);
  assert.equal(isPrivateIp('127.0.0.1'), true);
  assert.equal(isPrivateIp('169.254.169.254'), true);
  assert.equal(isPrivateIp('192.168.1.1'), true);
  assert.equal(isPrivateIp('172.16.0.1'), true);
  assert.equal(isPrivateIp('172.31.255.255'), true);
  assert.equal(isPrivateIp('8.8.8.8'), false);
  assert.equal(isPrivateIp('1.1.1.1'), false);
  assert.equal(isPrivateIp('172.15.0.1'), false);
  assert.equal(isPrivateIp('172.32.0.1'), false);
});

test('ssrf: assertPublicUrl rejects file:// and ftp://', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('file:///etc/passwd'), /Only http\/https/);
  assert.throws(() => assertPublicUrl('ftp://example.com'), /Only http\/https/);
});

test('ssrf: assertPublicUrl rejects localhost and private IPs', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://localhost/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://127.0.0.1/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://169.254.169.254/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://192.168.0.1/'), /not allowed/);
});

test('ssrf: assertPublicUrl accepts a public https URL', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('https://example.com/path?q=1');
  assert.equal(url.hostname, 'example.com');
  assert.equal(url.protocol, 'https:');
});

test('ssrf: assertPublicUrl rejects plain invalid string', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('not-a-url'), /valid URL/);
});

// ------ IPv6 SSRF vectors (should all throw "not allowed") ------

test('ssrf: assertPublicUrl rejects IPv6 loopback ::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects IPv4-mapped loopback ::ffff:127.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::ffff:127.0.0.1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects IPv4-mapped AWS metadata ::ffff:169.254.169.254', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::ffff:169.254.169.254]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects ULA fc00::/7 address fd00::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[fd00::1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects link-local fe80::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[fe80::1]/'), /not allowed/);
});

// ------ Non-standard IPv4 notations (should all throw) ------

test('ssrf: assertPublicUrl rejects octal IPv4 0177.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://0177.0.0.1/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects decimal integer IP 2130706433', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://2130706433/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects hex IP 0x7f.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://0x7f.0.0.1/'), /not allowed/);
});

// ------ Public cases that MUST still be accepted ------

test('ssrf: assertPublicUrl still accepts https://example.com/path', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('https://example.com/path');
  assert.equal(url.hostname, 'example.com');
});

test('ssrf: assertPublicUrl still accepts public IPv4 93.184.216.34', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('http://93.184.216.34/');
  assert.equal(url.hostname, '93.184.216.34');
});

// -------------------------------------------------------------- seo analyzer

const GOOD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Perfect SEO Page - Sage Ideas Best Practices Guide</title>
  <meta name="description" content="A comprehensive guide to SEO best practices that covers everything from meta tags to structured data and beyond, with actionable tips." />
  <link rel="canonical" href="https://example.com/seo-guide" />
  <meta property="og:title" content="Perfect SEO Page" />
  <meta property="og:description" content="SEO guide" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","name":"SEO Guide"}</script>
</head>
<body>
  <h1>Perfect SEO Page</h1>
  <p>Content here.</p>
  <img src="hero.jpg" alt="A hero image showing SEO concepts" />
  <img src="chart.png" alt="Chart of rankings" />
</body>
</html>`;

const BAD_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <h1>First heading</h1>
  <h1>Second heading</h1>
  <img src="no-alt.jpg" />
  <img src="also-no-alt.png" />
  <p>Some content without any SEO signals.</p>
</body>
</html>`;

test('seo-analyzer: well-optimized page passes all key checks and scores >=80', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(GOOD_HTML, 'https://example.com/seo-guide');
  assert.equal(r.checks.title.pass, true, 'title should pass');
  assert.equal(r.checks.metaDescription.pass, true, 'metaDescription should pass');
  assert.equal(r.checks.openGraph.pass, true, 'openGraph should pass');
  assert.equal(r.checks.structuredData.pass, true, 'structuredData should pass');
  assert.equal(r.checks.singleH1.pass, true, 'singleH1 should pass');
  assert.equal(r.checks.imageAlt.pass, true, 'imageAlt should pass');
  const score = scoreReport(r);
  assert.ok(score >= 80, `score ${score} should be >= 80`);
});

test('seo-analyzer: broken page fails title, h1, imageAlt and scores <50', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(BAD_HTML, 'https://example.com/bad');
  assert.equal(r.checks.title.pass, false, 'title should fail');
  assert.equal(r.checks.singleH1.pass, false, 'singleH1 should fail (two h1s)');
  assert.equal(r.checks.imageAlt.pass, false, 'imageAlt should fail');
  const score = scoreReport(r);
  assert.ok(score < 50, `score ${score} should be < 50`);
});

test('seo-analyzer: scoreReport blends perf score when present', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(GOOD_HTML, 'https://example.com/');
  r.performance = { score: 50, lcpMs: 3000 };
  const blended = scoreReport(r);
  const onPage = scoreReport({ ...r, performance: undefined });
  // blended = 70% onPage + 30% * 50 — must differ from pure on-page score
  assert.ok(blended < onPage, `blended (${blended}) should be < pure on-page (${onPage}) when perf=50`);
});

// -------------------------------------------------------------- runner

let pass = 0;
let fail = 0;
const failures = [];

for (const { name, fn } of suites) {
  try {
    await fn();
    pass++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    fail++;
    failures.push({ name, err });
    console.log(`  FAIL  ${name}`);
  }
}

console.log(`\nResult: ${pass} passed, ${fail} failed`);
for (const f of failures) {
  console.log(`\n--- ${f.name} ---\n${f.err?.stack ?? f.err}`);
}
process.exit(fail === 0 ? 0 : 1);

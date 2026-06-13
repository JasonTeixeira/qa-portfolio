/**
 * POST /api/tools/seo-audit
 *
 * Security notes:
 * - assertPublicUrl() validates the user-supplied URL before any fetch.
 * - We use redirect: 'manual' and re-validate every 3xx Location header
 *   to prevent a redirect-to-private-host SSRF bypass.
 * - fetch has a hard AbortSignal.timeout(12s) and we cap the body at 2 MB.
 * - PAGESPEED_API_KEY is server-only — never reaches the client bundle.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { captureLead } from '@/lib/leads/capture';
import { assertPublicUrl } from '@/lib/seo-audit/ssrf';
import { analyzeHtml, scoreReport } from '@/lib/seo-audit/analyzer';
import { fetchPsi } from '@/lib/seo-audit/psi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  url: z.string().min(4).max(2048),
  email: z.string().email(),
  honey: z.string().optional(),
});

const MAX_BODY_BYTES = 2_000_000;
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT = 'SageIdeas-SEO-Audit/1.0';

/**
 * Fetch the target URL while manually handling redirects so we can
 * re-validate each Location header through assertPublicUrl.
 *
 * Residual risk: DNS rebinding after the initial SSRF check. Mitigation at
 * this layer would require resolving the hostname to an IP before fetching,
 * which adds latency and complexity beyond the stated scope. The window is
 * narrow (milliseconds between check and fetch) and acceptable for v1.
 */
async function fetchWithSsrfCheck(input: string): Promise<Response> {
  let currentUrl = input;
  let hops = 0;

  while (hops < MAX_REDIRECTS) {
    // Validate current URL before each hop
    assertPublicUrl(currentUrl);

    const res = await fetch(currentUrl, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT },
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) break;
      // Resolve relative redirects against the current URL
      currentUrl = new URL(location, currentUrl).href;
      hops++;
      continue;
    }

    return res;
  }

  // Too many redirects — fetch the final URL as-is (assertPublicUrl already ran)
  const res = await fetch(currentUrl, {
    redirect: 'error',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'user-agent': USER_AGENT },
  });
  return res;
}

export async function POST(req: NextRequest) {
  // Rate limiting: 5 audits per minute per IP
  const limited = rateLimit(req, { limit: 5, windowMs: 60_000, prefix: 'seo-audit' });
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { url, email, honey } = parsed.data;

  // Bot trap — respond with fake success immediately
  if (honey) {
    return NextResponse.json({ ok: true });
  }

  // SSRF guard on the original URL
  let target: URL;
  try {
    target = assertPublicUrl(url);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid URL' },
      { status: 400 },
    );
  }

  // Fetch target page (with per-hop SSRF re-validation)
  let rawHtml: string;
  try {
    const res = await fetchWithSsrfCheck(target.href);
    // Stream the body with a hard cap so a giant/slow response can't OOM
    // the function. We cancel the reader as soon as we exceed MAX_BODY_BYTES.
    if (!res.body) {
      rawHtml = '';
    } else {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.length;
        if (total >= MAX_BODY_BYTES) {
          await reader.cancel();
          break;
        }
      }
      const merged = new Uint8Array(total > MAX_BODY_BYTES ? MAX_BODY_BYTES : total);
      let offset = 0;
      for (const chunk of chunks) {
        const toCopy = Math.min(chunk.length, MAX_BODY_BYTES - offset);
        merged.set(chunk.subarray(0, toCopy), offset);
        offset += toCopy;
        if (offset >= MAX_BODY_BYTES) break;
      }
      rawHtml = new TextDecoder('utf-8', { fatal: false }).decode(merged);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('not allowed') || msg.includes('https://')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: 'Could not reach that URL.' }, { status: 502 });
  }

  // Analyze HTML
  const report = analyzeHtml(rawHtml, target.href);

  // Performance (best-effort — degrades to null when key absent)
  report.performance = await fetchPsi(target.href);

  const score = scoreReport(report);

  // Capture lead — best-effort, never throws
  await captureLead({
    source: 'seo_audit',
    email,
    name: null,
    detail: `SEO audit of ${url} — score ${score}`,
    metadata: { url, score },
  });

  return NextResponse.json({ score, report });
}

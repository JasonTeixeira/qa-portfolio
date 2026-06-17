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
import { readAttributionFromRequest } from '@/lib/analytics/server-attribution';
import { mergeAttributionMetadata } from '@/lib/analytics/attribution';
import { assertPublicUrl } from '@/lib/seo-audit/ssrf';
import { runLiveSeoAudit } from '@/lib/seo-audit/run';
import { persistAuditReport } from '@/lib/seo-audit/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  url: z.string().min(4).max(2048),
  email: z.string().email(),
  honey: z.string().optional(),
});

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

  let audit: Awaited<ReturnType<typeof runLiveSeoAudit>>;
  try {
    audit = await runLiveSeoAudit(target.href);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('not allowed') || msg.includes('https://')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: 'Could not reach that URL.' }, { status: 502 });
  }

  // Capture lead — best-effort, never throws
  const attribution = readAttributionFromRequest(req);
  const metadata = mergeAttributionMetadata({ url, score: audit.score }, attribution);
  await captureLead({
    source: 'seo_audit',
    email,
    name: null,
    detail: `SEO audit of ${url} — score ${audit.score}`,
    metadata,
  });

  const persisted = await persistAuditReport({
    url: target.href,
    score: audit.score,
    report: audit.report,
    metadata: {
      source: 'seo_audit_tool',
      evidence: audit.evidence,
      ...metadata,
    },
  });

  return NextResponse.json({ score: audit.score, report: audit.report, shareId: persisted?.shareId ?? null });
}

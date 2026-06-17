import { analyzeHtml, scoreReport, type SeoReport } from './analyzer';
import { fetchPsi } from './psi';
import { assertPublicUrl } from './ssrf';

const MAX_BODY_BYTES = 2_000_000;
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT = 'SageIdeas-SEO-Audit/1.0';

async function fetchWithSsrfCheck(input: string): Promise<Response> {
  let currentUrl = input;
  let hops = 0;

  while (hops < MAX_REDIRECTS) {
    assertPublicUrl(currentUrl);

    const res = await fetch(currentUrl, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT },
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) break;
      currentUrl = new URL(location, currentUrl).href;
      hops += 1;
      continue;
    }

    return res;
  }

  return fetch(currentUrl, {
    redirect: 'error',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'user-agent': USER_AGENT },
  });
}

async function readCappedBody(res: Response) {
  if (!res.body) return '';
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

  return new TextDecoder('utf-8', { fatal: false }).decode(merged);
}

export type LiveSeoAudit = {
  target: URL;
  score: number;
  report: SeoReport;
  evidence: {
    fetchedAt: string;
    httpStatus: number;
    finalUrl: string;
    bytesRead: number;
    failedChecks: Array<{ key: string; label: string; detail: string; weight: number }>;
    passedChecks: Array<{ key: string; label: string; detail: string; weight: number }>;
    performance: SeoReport['performance'];
  };
};

export async function runLiveSeoAudit(input: string): Promise<LiveSeoAudit> {
  const target = assertPublicUrl(input);
  const res = await fetchWithSsrfCheck(target.href);
  const rawHtml = await readCappedBody(res);
  const report = analyzeHtml(rawHtml, target.href);
  report.performance = await fetchPsi(target.href);
  const score = scoreReport(report);

  const checks = Object.entries(report.checks);
  const failedChecks = checks
    .filter(([, check]) => !check.pass)
    .map(([key, check]) => ({
      key,
      label: check.label,
      detail: check.detail,
      weight: check.weight,
    }));
  const passedChecks = checks
    .filter(([, check]) => check.pass)
    .map(([key, check]) => ({
      key,
      label: check.label,
      detail: check.detail,
      weight: check.weight,
    }));

  return {
    target,
    score,
    report,
    evidence: {
      fetchedAt: new Date().toISOString(),
      httpStatus: res.status,
      finalUrl: res.url || target.href,
      bytesRead: rawHtml.length,
      failedChecks,
      passedChecks,
      performance: report.performance,
    },
  };
}

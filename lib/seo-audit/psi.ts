/**
 * PageSpeed Insights integration.
 *
 * Always returns a result shape — never throws.
 * Returns { score: null } when the API key is absent or the call fails.
 *
 * PAGESPEED_API_KEY is a server-only env var; never expose it to the client.
 */

export type PsiResult = {
  score: number | null;
  lcpMs?: number;
  cls?: number;
};

export async function fetchPsi(url: string): Promise<PsiResult> {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return { score: null };

  const endpoint =
    'https://www.googleapis.com/pagespeedonline/v5/runPagespeed' +
    `?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { score: null };

    const json = (await res.json()) as {
      lighthouseResult?: {
        categories?: {
          performance?: { score?: number };
        };
        audits?: {
          'largest-contentful-paint'?: { numericValue?: number };
          'cumulative-layout-shift'?: { numericValue?: number };
        };
      };
    };

    const rawScore = json.lighthouseResult?.categories?.performance?.score;
    const score = typeof rawScore === 'number' ? Math.round(rawScore * 100) : null;

    const lcpRaw =
      json.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
    const lcpMs = typeof lcpRaw === 'number' ? Math.round(lcpRaw) : undefined;

    const clsRaw =
      json.lighthouseResult?.audits?.['cumulative-layout-shift']?.numericValue;
    const cls = typeof clsRaw === 'number' ? clsRaw : undefined;

    return { score, lcpMs, cls };
  } catch {
    return { score: null };
  }
}

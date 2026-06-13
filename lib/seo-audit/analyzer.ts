/**
 * Pure HTML-based SEO analyzer.
 * No DOM dependency — uses regex only so it runs in any Node environment.
 */

export type Check = {
  pass: boolean;
  weight: number;
  label: string;
  detail: string;
};

export type SeoReport = {
  url: string;
  checks: Record<string, Check>;
  performance?: {
    score: number | null;
    lcpMs?: number;
    cls?: number;
  };
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function attr(tag: string, attrName: string): string | null {
  // Match content="…" or content='…'
  const re = new RegExp(`${attrName}=["']([^"']*)["']`, 'i');
  const m = tag.match(re);
  return m ? m[1] : null;
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function getMetaContent(html: string, name: string): string | null {
  // Matches both name="x" content="…" and content="…" name="x" order
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["'][^>]*>`,
    'i',
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? null) : null;
}

function hasCanonical(html: string): boolean {
  return /<link[^>]+rel=["']canonical["'][^>]*>/i.test(html);
}

function hasLdJson(html: string): boolean {
  return /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
}

function hasViewport(html: string): boolean {
  return /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
}

function getLangAttr(html: string): string | null {
  const m = html.match(/<html[^>]+lang=["']([^"']+)["'][^>]*>/i);
  return m ? m[1] : null;
}

function countH1(html: string): number {
  return (html.match(/<h1[\s>]/gi) ?? []).length;
}

/**
 * Returns { total, missing } for <img> tags.
 * An img "passes" if it has alt="" (including empty string is intentional —
 * decorative images may use alt="").
 */
function auditImages(html: string): { total: number; missing: number } {
  const tags = html.match(/<img\s[^>]*>/gi) ?? [];
  let missing = 0;
  for (const tag of tags) {
    if (!/\balt\s*=/i.test(tag)) missing++;
  }
  return { total: tags.length, missing };
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function analyzeHtml(html: string, url: string): SeoReport {
  const title = getTitle(html);
  const titleLen = title?.length ?? 0;
  const titlePass = titleLen >= 15 && titleLen <= 65;
  let titleDetail = title
    ? titlePass
      ? `"${title.slice(0, 60)}${title.length > 60 ? '…' : ''}" (${titleLen} chars — good)`
      : `"${title.slice(0, 60)}${title.length > 60 ? '…' : ''}" (${titleLen} chars — ideal range is 15–65)`
    : 'No <title> tag found';

  const desc = getMetaContent(html, 'description');
  const descLen = desc?.length ?? 0;
  const descPass = descLen >= 50 && descLen <= 160;
  const descDetail = desc
    ? descPass
      ? `${descLen} chars — good`
      : `${descLen} chars — ideal range is 50–160`
    : 'No meta description found';

  const canonicalPass = hasCanonical(html);

  const ogTitle = getMetaContent(html, 'og:title');
  const ogPass = !!ogTitle;

  const twitterCard = getMetaContent(html, 'twitter:card');
  const twitterPass = !!twitterCard;

  const ldJsonPass = hasLdJson(html);

  const viewportPass = hasViewport(html);

  const lang = getLangAttr(html);
  const langPass = !!lang;

  const h1Count = countH1(html);
  const h1Pass = h1Count === 1;
  const h1Detail =
    h1Count === 0
      ? 'No <h1> found — add exactly one'
      : h1Count === 1
        ? 'Exactly one <h1> — good'
        : `${h1Count} <h1> tags found — use exactly one`;

  const { total: imgTotal, missing: imgMissing } = auditImages(html);
  const imageAltPass = imgTotal === 0 || imgMissing === 0;
  const imageAltDetail =
    imgTotal === 0
      ? 'No images found'
      : imgMissing === 0
        ? `All ${imgTotal} image(s) have alt attributes`
        : `${imgMissing} of ${imgTotal} image(s) missing alt attribute`;

  return {
    url,
    checks: {
      title: {
        pass: titlePass,
        weight: 15,
        label: 'Page title',
        detail: titleDetail,
      },
      metaDescription: {
        pass: descPass,
        weight: 12,
        label: 'Meta description',
        detail: descDetail,
      },
      canonical: {
        pass: canonicalPass,
        weight: 8,
        label: 'Canonical tag',
        detail: canonicalPass
          ? 'Canonical link present'
          : 'No <link rel="canonical"> found — add one to avoid duplicate content',
      },
      openGraph: {
        pass: ogPass,
        weight: 10,
        label: 'Open Graph tags',
        detail: ogPass
          ? `og:title is "${(ogTitle ?? '').slice(0, 60)}"`
          : 'No og:title found — add Open Graph meta tags for social sharing',
      },
      twitter: {
        pass: twitterPass,
        weight: 5,
        label: 'Twitter card',
        detail: twitterPass
          ? `twitter:card="${twitterCard}"`
          : 'No twitter:card found — add for better Twitter/X previews',
      },
      structuredData: {
        pass: ldJsonPass,
        weight: 12,
        label: 'Structured data (JSON-LD)',
        detail: ldJsonPass
          ? 'JSON-LD script block found'
          : 'No application/ld+json found — add schema.org markup for rich results',
      },
      viewport: {
        pass: viewportPass,
        weight: 6,
        label: 'Viewport meta tag',
        detail: viewportPass
          ? 'Viewport meta present'
          : 'No viewport meta tag — required for mobile-friendliness',
      },
      langAttr: {
        pass: langPass,
        weight: 4,
        label: 'HTML lang attribute',
        detail: langPass
          ? `lang="${lang}"`
          : 'No lang attribute on <html> — required for accessibility and i18n',
      },
      singleH1: {
        pass: h1Pass,
        weight: 10,
        label: 'Single H1 heading',
        detail: h1Detail,
      },
      imageAlt: {
        pass: imageAltPass,
        weight: 8,
        label: 'Image alt text',
        detail: imageAltDetail,
      },
    },
  };
}

/**
 * Compute 0–100 score from an SeoReport.
 *
 * On-page score = weighted % of passed checks.
 * If performance.score is a number, blend: 70% on-page + 30% performance.
 */
export function scoreReport(report: SeoReport): number {
  const checks = Object.values(report.checks);
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const passedWeight = checks.filter((c) => c.pass).reduce((s, c) => s + c.weight, 0);
  const onPage = totalWeight > 0 ? (passedWeight / totalWeight) * 100 : 0;

  const perf = report.performance?.score;
  if (typeof perf === 'number') {
    return Math.round(onPage * 0.7 + perf * 0.3);
  }
  return Math.round(onPage);
}

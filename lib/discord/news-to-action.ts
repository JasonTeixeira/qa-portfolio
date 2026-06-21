export const DISCORD_NEWS_TO_ACTION_REGISTRY_VERSION = 'discord-news-to-action-registry-v1';

export type NewsToActionSource = {
  key: string;
  label: string;
  category: 'ai_platform' | 'dev_platform' | 'product_platform' | 'infra' | 'payments' | 'open_source';
  domains: string[];
  pathPrefixes: string[];
  audienceUse: string;
};

export type NewsToActionFreshness = 'fresh' | 'watch' | 'stale' | 'unknown';

export type NewsToActionCandidate = {
  sourceKey?: string | null;
  sourceUrl: string;
  publishedAt: string;
  title: string;
  summary: string;
  builderRelevance: string;
  action: string;
};

export type NewsToActionScore = {
  ok: boolean;
  score: number;
  source: NewsToActionSource | null;
  freshness: NewsToActionFreshness;
  reasons: string[];
};

export type NewsToActionDraft = {
  title: string;
  body: string;
  sourceKey: string;
  sourceLabel: string;
  sourceUrl: string;
  publishedAt: string;
  freshness: NewsToActionFreshness;
  score: number;
  reasons: string[];
};

export const approvedNewsToActionSources = [
  {
    key: 'openai_changelog',
    label: 'OpenAI Changelog',
    category: 'ai_platform',
    domains: ['openai.com', 'platform.openai.com'],
    pathPrefixes: ['/index', '/docs', '/blog', '/changelog'],
    audienceUse: 'AI app features, model behavior changes, API capability updates, and builder workflow changes.',
  },
  {
    key: 'anthropic_news',
    label: 'Anthropic News and Docs',
    category: 'ai_platform',
    domains: ['anthropic.com', 'docs.anthropic.com'],
    pathPrefixes: ['/news', '/docs', '/release-notes'],
    audienceUse: 'Claude model, tool use, prompt, safety, and agent workflow changes.',
  },
  {
    key: 'vercel_changelog',
    label: 'Vercel Changelog',
    category: 'dev_platform',
    domains: ['vercel.com'],
    pathPrefixes: ['/changelog', '/blog'],
    audienceUse: 'Next.js hosting, deployment, observability, and web app delivery updates.',
  },
  {
    key: 'supabase_changelog',
    label: 'Supabase Changelog',
    category: 'dev_platform',
    domains: ['supabase.com'],
    pathPrefixes: ['/changelog', '/blog', '/docs'],
    audienceUse: 'Database, auth, storage, realtime, vector, and backend build patterns.',
  },
  {
    key: 'github_changelog',
    label: 'GitHub Changelog',
    category: 'dev_platform',
    domains: ['github.blog', 'docs.github.com'],
    pathPrefixes: ['/changelog', '/en'],
    audienceUse: 'Developer workflow, Actions, security, repositories, Copilot, and collaboration changes.',
  },
  {
    key: 'cloudflare_blog',
    label: 'Cloudflare Blog',
    category: 'infra',
    domains: ['blog.cloudflare.com', 'developers.cloudflare.com'],
    pathPrefixes: ['/', '/workers', '/pages'],
    audienceUse: 'Edge, Workers, security, performance, and production infrastructure updates.',
  },
  {
    key: 'stripe_changelog',
    label: 'Stripe Changelog',
    category: 'payments',
    domains: ['stripe.com', 'docs.stripe.com'],
    pathPrefixes: ['/changelog', '/docs'],
    audienceUse: 'Billing, checkout, subscriptions, webhooks, and monetization implementation changes.',
  },
  {
    key: 'huggingface_blog',
    label: 'Hugging Face Blog',
    category: 'open_source',
    domains: ['huggingface.co'],
    pathPrefixes: ['/blog', '/docs'],
    audienceUse: 'Open-source models, datasets, evaluation, and deployment patterns.',
  },
] as const satisfies readonly NewsToActionSource[];

const genericActionPhrases = [
  'check it out',
  'read the article',
  'stay updated',
  'learn more',
  'what do you think',
  'share your thoughts',
  'keep an eye on it',
];

export function getApprovedNewsToActionSource(key: string): NewsToActionSource | null {
  return approvedNewsToActionSources.find((source) => source.key === key) ?? null;
}

export function findApprovedNewsToActionSourceForUrl(sourceUrl: string): NewsToActionSource | null {
  const parsed = parseHttpsUrl(sourceUrl);
  if (!parsed) return null;
  return approvedNewsToActionSources.find((source) => {
    const hostMatches = source.domains.some((domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
    const pathMatches = source.pathPrefixes.some((prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`));
    return hostMatches && pathMatches;
  }) ?? null;
}

export function isApprovedNewsToActionUrl(sourceUrl: string): boolean {
  return Boolean(findApprovedNewsToActionSourceForUrl(sourceUrl));
}

export function classifyNewsToActionFreshness(publishedAt: string, now = new Date()): NewsToActionFreshness {
  const published = new Date(publishedAt);
  if (Number.isNaN(published.getTime())) return 'unknown';
  const ageDays = Math.floor((now.getTime() - published.getTime()) / 86_400_000);
  if (ageDays < 0) return 'unknown';
  if (ageDays <= 14) return 'fresh';
  if (ageDays <= 45) return 'watch';
  return 'stale';
}

export function scoreNewsToActionCandidate(candidate: NewsToActionCandidate, now = new Date()): NewsToActionScore {
  const reasons: string[] = [];
  let score = 0;
  const sourceFromUrl = findApprovedNewsToActionSourceForUrl(candidate.sourceUrl);
  const sourceFromKey = candidate.sourceKey ? getApprovedNewsToActionSource(candidate.sourceKey) : null;
  const source = sourceFromKey ?? sourceFromUrl;

  if (!source) {
    reasons.push('source_url_not_approved');
  } else if (sourceFromKey && sourceFromUrl && sourceFromKey.key !== sourceFromUrl.key) {
    reasons.push('source_key_url_mismatch');
  } else {
    score += 25;
    reasons.push('approved_source');
  }

  const freshness = classifyNewsToActionFreshness(candidate.publishedAt, now);
  if (freshness === 'fresh') {
    score += 25;
    reasons.push('fresh_source');
  } else if (freshness === 'watch') {
    score += 10;
    reasons.push('watch_source');
  } else if (freshness === 'stale') {
    reasons.push('stale_source');
  } else {
    reasons.push('invalid_or_future_published_at');
  }

  if (candidate.title.trim().length >= 12) {
    score += 10;
    reasons.push('specific_title');
  } else {
    reasons.push('thin_title');
  }

  if (candidate.summary.trim().length >= 40) {
    score += 10;
    reasons.push('specific_summary');
  } else {
    reasons.push('thin_summary');
  }

  if (candidate.builderRelevance.trim().length >= 40) {
    score += 10;
    reasons.push('builder_relevance');
  } else {
    reasons.push('thin_builder_relevance');
  }

  if (hasConcreteBuilderAction(candidate.action)) {
    score += 20;
    reasons.push('concrete_builder_action');
  } else {
    reasons.push('generic_or_missing_action');
  }

  const blocked = !source || freshness === 'stale' || freshness === 'unknown' || !hasConcreteBuilderAction(candidate.action);
  return {
    ok: !blocked && score >= 75,
    score: Math.max(0, Math.min(100, score)),
    source: blocked && !source ? null : source,
    freshness,
    reasons,
  };
}

export function buildNewsToActionDraft(candidate: NewsToActionCandidate, now = new Date()): NewsToActionDraft {
  const result = scoreNewsToActionCandidate(candidate, now);
  if (!result.ok || !result.source) {
    throw new Error(`News-to-action candidate rejected: ${result.reasons.join(', ')}`);
  }

  const title = `News-to-action: ${candidate.title.trim()}`;
  const body = [
    `**News-to-action:** ${candidate.title.trim()}`,
    `**What changed:** ${candidate.summary.trim()}`,
    `**Why builders should care:** ${candidate.builderRelevance.trim()}`,
    `**Action today:** ${candidate.action.trim()}`,
    `Source: ${result.source.label} - ${candidate.sourceUrl.trim()}`,
  ].join('\n');

  return {
    title,
    body,
    sourceKey: result.source.key,
    sourceLabel: result.source.label,
    sourceUrl: candidate.sourceUrl.trim(),
    publishedAt: candidate.publishedAt,
    freshness: result.freshness,
    score: result.score,
    reasons: result.reasons,
  };
}

export function buildNewsToActionSourcePolicyLine(): string {
  const labels = approvedNewsToActionSources.map((source) => source.label).join(', ');
  return `Use only approved, fresh, sourced updates from: ${labels}. If no approved item is available, write "No approved news item today."`;
}

function hasConcreteBuilderAction(action: string): boolean {
  const normalized = action.trim().toLowerCase();
  if (normalized.length < 35) return false;
  if (genericActionPhrases.some((phrase) => normalized.includes(phrase))) return false;
  return /\b(build|ship|test|audit|compare|implement|write|refactor|deploy|review|measure|document|prototype|map|create|update)\b/.test(normalized);
}

function parseHttpsUrl(sourceUrl: string): URL | null {
  try {
    const parsed = new URL(sourceUrl);
    return parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}

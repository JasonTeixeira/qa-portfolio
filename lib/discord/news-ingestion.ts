import {
  type NewsToActionCandidate,
  type NewsToActionDraft,
  type NewsToActionSource,
  approvedNewsToActionSources,
  buildNewsToActionDraft,
  scoreNewsToActionCandidate,
} from './news-to-action';

export const DISCORD_NEWS_TO_ACTION_INGESTION_VERSION = 'discord-news-to-action-ingestion-v1';

export type NewsToActionIngestionItem = {
  candidate: NewsToActionCandidate;
  draft: NewsToActionDraft;
};

export type NewsToActionIngestionResult = {
  ok: boolean;
  version: string;
  checkedSources: number;
  fetchedFeeds: number;
  items: NewsToActionIngestionItem[];
  errors: Array<{ sourceKey: string; feedUrl: string; error: string }>;
};

type FeedEntry = {
  title: string;
  link: string;
  publishedAt: string;
  summary: string;
};

export async function fetchNewsToActionCandidates(input: {
  now?: Date;
  maxItems?: number;
  maxPerSource?: number;
  fetchImpl?: typeof fetch;
} = {}): Promise<NewsToActionIngestionResult> {
  const now = input.now ?? new Date();
  const maxItems = input.maxItems ?? 8;
  const maxPerSource = input.maxPerSource ?? 2;
  const fetchImpl = input.fetchImpl ?? fetch;
  const items: NewsToActionIngestionItem[] = [];
  const errors: NewsToActionIngestionResult['errors'] = [];
  let fetchedFeeds = 0;

  for (const source of approvedNewsToActionSources) {
    let acceptedForSource = 0;
    for (const feedUrl of source.feedUrls) {
      if (items.length >= maxItems || acceptedForSource >= maxPerSource) break;
      try {
        const xml = await fetchFeedXml(fetchImpl, feedUrl);
        fetchedFeeds += 1;
        for (const entry of parseFeedEntries(xml)) {
          if (items.length >= maxItems || acceptedForSource >= maxPerSource) break;
          const candidate = feedEntryToCandidate(source, entry);
          const score = scoreNewsToActionCandidate(candidate, now);
          if (!score.ok) continue;
          items.push({ candidate, draft: buildNewsToActionDraft(candidate, now) });
          acceptedForSource += 1;
        }
      } catch (error) {
        errors.push({
          sourceKey: source.key,
          feedUrl,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  items.sort((a, b) => {
    const scoreDelta = b.draft.score - a.draft.score;
    if (scoreDelta !== 0) return scoreDelta;
    return new Date(b.draft.publishedAt).getTime() - new Date(a.draft.publishedAt).getTime();
  });

  return {
    ok: items.length > 0,
    version: DISCORD_NEWS_TO_ACTION_INGESTION_VERSION,
    checkedSources: approvedNewsToActionSources.length,
    fetchedFeeds,
    items: items.slice(0, maxItems),
    errors,
  };
}

export function parseNewsFeedEntriesForTest(xml: string): FeedEntry[] {
  return parseFeedEntries(xml);
}

function feedEntryToCandidate(source: NewsToActionSource, entry: FeedEntry): NewsToActionCandidate {
  return {
    sourceKey: source.key,
    sourceUrl: entry.link,
    publishedAt: entry.publishedAt,
    title: entry.title,
    summary: entry.summary || `${entry.title} was published by ${source.label}.`,
    builderRelevance: `${source.audienceUse} Turn this into one practical improvement for a current Sage Ideas build, lesson, or review.`,
    action: buildActionForSource(source, entry.title),
  };
}

function buildActionForSource(source: NewsToActionSource, title: string): string {
  const subject = title.replace(/\s+/g, ' ').trim();
  if (source.category === 'payments') {
    return `Audit one checkout, subscription, or webhook flow and document one billing improvement connected to "${subject}".`;
  }
  if (source.category === 'infra') {
    return `Review one deployed project and document one performance, security, or reliability improvement connected to "${subject}".`;
  }
  if (source.category === 'ai_platform' || source.category === 'open_source') {
    return `Prototype one prompt, model, retrieval, or evaluation change connected to "${subject}" and record the before/after behavior.`;
  }
  return `Audit one active web or product build and document one implementation improvement connected to "${subject}".`;
}

async function fetchFeedXml(fetchImpl: typeof fetch, feedUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetchImpl(feedUrl, {
      headers: { 'user-agent': 'SageIdeasBot/1.0' },
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
    if (!/<(rss|feed)\b/i.test(text)) throw new Error('Feed response was not RSS or Atom XML.');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function parseFeedEntries(xml: string): FeedEntry[] {
  const blocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  return blocks.map((block) => ({
    title: cleanXmlText(firstTag(block, 'title')),
    link: cleanXmlText(firstLink(block)),
    publishedAt: cleanXmlText(firstTag(block, 'pubDate') || firstTag(block, 'published') || firstTag(block, 'updated')),
    summary: cleanXmlText(firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content')),
  })).filter((entry) => entry.title && entry.link && entry.publishedAt);
}

function firstTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1] ?? '';
}

function firstLink(block: string): string {
  const tagBody = firstTag(block, 'link');
  if (tagBody) return tagBody;
  const href = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  return href?.[1] ?? '';
}

function cleanXmlText(value: string): string {
  return decodeXmlEntities(value)
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

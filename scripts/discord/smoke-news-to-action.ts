import {
  DISCORD_NEWS_TO_ACTION_REGISTRY_VERSION,
  buildNewsToActionDraft,
  buildNewsToActionSourcePolicyLine,
  scoreNewsToActionCandidate,
} from '@/lib/discord/news-to-action';

const now = new Date('2099-01-15T12:00:00.000Z');

const validCandidate = {
  sourceKey: 'vercel_changelog',
  sourceUrl: 'https://vercel.com/changelog/example-builder-update',
  publishedAt: '2099-01-14T12:00:00.000Z',
  title: 'Vercel ships a builder workflow update',
  summary: 'A platform update changes how teams can deploy, inspect, and operate production web applications.',
  builderRelevance: 'Sage Ideas members can use the change to improve web app delivery and review deployment quality.',
  action: 'Audit one current project deployment and document one build, preview, or observability improvement to implement today.',
};

const validScore = scoreNewsToActionCandidate(validCandidate, now);
if (!validScore.ok) {
  throw new Error(`Expected valid candidate to pass: ${validScore.reasons.join(', ')}`);
}

const draft = buildNewsToActionDraft(validCandidate, now);
if (!draft.body.includes('**Action today:**') || !draft.body.includes('Source: Vercel Changelog')) {
  throw new Error('Expected generated draft to include action and source citation.');
}

const unapproved = scoreNewsToActionCandidate(
  {
    ...validCandidate,
    sourceKey: null,
    sourceUrl: 'https://example.com/random-ai-news',
  },
  now,
);
if (unapproved.ok || !unapproved.reasons.includes('source_url_not_approved')) {
  throw new Error('Expected unapproved source URL to be rejected.');
}

const stale = scoreNewsToActionCandidate(
  {
    ...validCandidate,
    publishedAt: '2098-10-01T12:00:00.000Z',
  },
  now,
);
if (stale.ok || !stale.reasons.includes('stale_source')) {
  throw new Error('Expected stale source to be rejected.');
}

const generic = scoreNewsToActionCandidate(
  {
    ...validCandidate,
    action: 'Read the article and share your thoughts.',
  },
  now,
);
if (generic.ok || !generic.reasons.includes('generic_or_missing_action')) {
  throw new Error('Expected generic action to be rejected.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      registryVersion: DISCORD_NEWS_TO_ACTION_REGISTRY_VERSION,
      policy: buildNewsToActionSourcePolicyLine(),
      validScore: validScore.score,
      validReasons: validScore.reasons,
      rejected: {
        unapproved: unapproved.reasons,
        stale: stale.reasons,
        generic: generic.reasons,
      },
      preview: draft.body,
    },
    null,
    2,
  ),
);

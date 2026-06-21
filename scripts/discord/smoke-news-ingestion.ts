import { fetchNewsToActionCandidates } from '@/lib/discord/news-ingestion';

async function main() {
  const result = await fetchNewsToActionCandidates({ maxItems: 5, maxPerSource: 1 });
  const ok = result.ok
    && result.fetchedFeeds > 0
    && result.items.length > 0
    && result.items.every((item) => item.draft.body.includes('**Action today:**') && item.draft.body.includes('Source:'));

  console.log(JSON.stringify({
    ok,
    version: result.version,
    checkedSources: result.checkedSources,
    fetchedFeeds: result.fetchedFeeds,
    acceptedItems: result.items.length,
    errors: result.errors,
    items: result.items.map((item) => ({
      sourceKey: item.draft.sourceKey,
      sourceUrl: item.draft.sourceUrl,
      publishedAt: item.draft.publishedAt,
      freshness: item.draft.freshness,
      score: item.draft.score,
      title: item.draft.title,
    })),
  }, null, 2));

  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

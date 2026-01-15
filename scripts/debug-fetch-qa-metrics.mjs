/*
  Quick debug tool: fetch and print parsed qa-metrics.json for a repo.
  Usage:
    node scripts/debug-fetch-qa-metrics.mjs BDD-Cucumber-Framework
*/

import { tryFetchQaMetrics } from '../lib/githubArtifacts.ts';

const repo = process.argv[2];
if (!repo) {
  console.error('Usage: node scripts/debug-fetch-qa-metrics.mjs <repo>');
  process.exit(1);
}

const owner = process.env.QUALITY_GITHUB_OWNER || 'JasonTeixeira';
const token = process.env.QUALITY_GITHUB_TOKEN;

const r = await tryFetchQaMetrics({ owner, repo, token });
console.log(JSON.stringify(r, null, 2));

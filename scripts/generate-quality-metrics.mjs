/*
  Generates a public-safe quality snapshot for the portfolio dashboard.
  Phase 1: runs in GitHub Actions on a schedule and commits `public/quality/metrics.json`.

  Inputs:
    - GitHub API token (optional for public repos, recommended for rate limits): GITHUB_TOKEN or GH_TOKEN
    - Repo owner: QUALITY_GITHUB_OWNER (default: JasonTeixeira)
    - Repo list: QUALITY_GITHUB_REPOS (comma-separated)

  Notes:
    - We intentionally keep this lightweight and stable.
    - Phase 2 (live dashboard) will fetch the same data server-side.
*/

import fs from 'node:fs/promises';
import path from 'node:path';

const OWNER = process.env.QUALITY_GITHUB_OWNER || 'JasonTeixeira';
const REPOS = (process.env.QUALITY_GITHUB_REPOS || [
  'qa-portfolio',
  'E2E-Framework',
  'API-Test-Automation-Wireframe',
  'CI-CD-Pipeline',
  'Performance-Testing-Framework',
  'Mobile-Testing-Framework',
  'BDD-Cucumber-Framework',
  'visual-regression-testing-suite',
  'Security-Testing-Suite',
].join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function ghFetch(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API error ${res.status} for ${url}: ${body}`);
  }
  return res.json();
}

async function getRepoHealth(owner, repo) {
  // Prefer a simple + stable signal: latest Actions run across default workflows.
  const runs = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`
  );

  const latest = runs?.workflow_runs?.[0];
  const status = latest?.conclusion === 'success'
    ? 'healthy'
    : latest?.conclusion
      ? 'degraded'
      : 'degraded';

  return {
    name: repo,
    repo: `${owner}/${repo}`,
    type: repo === 'qa-portfolio' ? 'portfolio' : 'project',
    status,
    lastRun: latest?.updated_at || latest?.created_at || null,
    ci: {
      runsUrl: `https://github.com/${owner}/${repo}/actions`,
    },
    // We can enrich tests/perf/security later once we standardize report artifacts.
    tests: {},
    performance: {},
    security: {},
  };
}

async function main() {
  const generatedAt = new Date().toISOString();

  const projects = [];
  for (const repo of REPOS) {
    try {
      const m = await getRepoHealth(OWNER, repo);
      projects.push(m);
    } catch (e) {
      projects.push({
        name: repo,
        repo: `${OWNER}/${repo}`,
        type: repo === 'qa-portfolio' ? 'portfolio' : 'project',
        status: 'degraded',
        lastRun: null,
        ci: {
          runsUrl: `https://github.com/${OWNER}/${repo}/actions`,
        },
        notes: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const overallStatus = projects.some((p) => p.status === 'down')
    ? 'down'
    : projects.some((p) => p.status === 'degraded')
      ? 'degraded'
      : 'healthy';

  const snapshot = {
    generatedAt,
    summary: {
      overallStatus,
      notes:
        'Auto-generated snapshot from GitHub Actions (Phase 1). Phase 2 upgrades to live server-side GitHub API + report artifacts.',
      targets: {
        lighthouse: {
          performance: 0.95,
          accessibility: 0.95,
          bestPractices: 0.95,
          seo: 0.95,
        },
        flakeRate: 0.01,
        criticalVulns: 0,
      },
    },
    projects,
  };

  const outPath = path.join(process.cwd(), 'public', 'quality', 'metrics.json');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${outPath}`);

  // Maintain a 30-day history file for trends.
  const historyPath = path.join(process.cwd(), 'public', 'quality', 'history.json');
  const HISTORY_KEEP = Number(process.env.QUALITY_HISTORY_KEEP_DAYS || 30);

  let history = [];
  try {
    const raw = await fs.readFile(historyPath, 'utf8');
    history = JSON.parse(raw);
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  // Add today's entry.
  history.push({ generatedAt, projects });

  // Deduplicate by date (UTC) keeping the latest entry for a date.
  const byDate = new Map();
  for (const item of history) {
    const dateKey = typeof item?.generatedAt === 'string' ? item.generatedAt.slice(0, 10) : 'unknown';
    byDate.set(dateKey, item);
  }
  history = Array.from(byDate.values()).sort((a, b) => {
    const at = String(a?.generatedAt || '');
    const bt = String(b?.generatedAt || '');
    return at.localeCompare(bt);
  });

  // Trim to last N entries.
  if (history.length > HISTORY_KEEP) {
    history = history.slice(history.length - HISTORY_KEEP);
  }

  await fs.writeFile(historyPath, JSON.stringify(history, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${historyPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

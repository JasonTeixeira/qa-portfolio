/*
  Audits GitHub repos for the QA telemetry system:
  - workflow presence (.github/workflows/qa-metrics.yml)
  - latest run exists
  - qa-metrics artifact exists on latest run

  Usage:
    node scripts/audit-repos-metrics.mjs

  Env:
    QUALITY_GITHUB_TOKEN (recommended)
    QUALITY_GITHUB_OWNER (default JasonTeixeira)
    QUALITY_GITHUB_REPOS (csv)
*/

const OWNER = process.env.QUALITY_GITHUB_OWNER || 'JasonTeixeira';
const REPOS = (process.env.QUALITY_GITHUB_REPOS || [
  'qa-portfolio',
  'Qa-Automation-Project',
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

const token =
  process.env.QUALITY_GITHUB_TOKEN ||
  process.env.GITHUB_TOKEN ||
  process.env.GH_TOKEN;

async function ghFetch(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, json };
}

async function checkWorkflowFile(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows/qa-metrics.yml`;
  const r = await ghFetch(url);
  return r.ok;
}

async function latestRun(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`;
  const r = await ghFetch(url);
  if (!r.ok) return null;
  return r.json?.workflow_runs?.[0] || null;
}

async function runArtifacts(owner, repo, runId) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`;
  const r = await ghFetch(url);
  if (!r.ok) return [];
  return r.json?.artifacts || [];
}

async function main() {
  const rows = [];

  for (const repo of REPOS) {
    const hasWorkflow = await checkWorkflowFile(OWNER, repo);
    const run = await latestRun(OWNER, repo);
    const artifacts = run?.id ? await runArtifacts(OWNER, repo, run.id) : [];
    const hasQaMetricsArtifact = artifacts.some((a) => a.name === 'qa-metrics');

    rows.push({
      repo: `${OWNER}/${repo}`,
      workflow: hasWorkflow ? 'yes' : 'no',
      lastRun: run?.updated_at || run?.created_at || '—',
      conclusion: run?.conclusion || '—',
      qaMetricsArtifact: hasQaMetricsArtifact ? 'yes' : 'no',
      actionsUrl: `https://github.com/${OWNER}/${repo}/actions`,
    });
  }

  console.table(rows);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

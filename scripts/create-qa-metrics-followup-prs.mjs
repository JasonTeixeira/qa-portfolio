/*
  Creates follow-up PRs to update existing qa-metrics workflows to include
  JUnit parsing for pytest repos.

  Env:
    QUALITY_GITHUB_TOKEN (classic PAT with repo scope)
    QUALITY_GITHUB_OWNER (default JasonTeixeira)
*/

const OWNER = process.env.QUALITY_GITHUB_OWNER || 'JasonTeixeira';
const TOKEN = process.env.QUALITY_GITHUB_TOKEN;

const PYTEST_REPOS = [
  'E2E-Framework',
  'API-Test-Automation-Wireframe',
  'Mobile-Testing-Framework',
  'visual-regression-testing-suite',
  'Security-Testing-Suite',
];

function b64(s) {
  return Buffer.from(s, 'utf8').toString('base64');
}

async function gh(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { ok: res.ok, status: res.status, json };
}

async function getDefaultBranch(repo) {
  const r = await gh(`https://api.github.com/repos/${OWNER}/${repo}`);
  if (!r.ok) throw new Error(`Failed to fetch repo ${repo}: ${r.status}`);
  return r.json.default_branch;
}

async function getBranchSha(repo, branch) {
  const r = await gh(`https://api.github.com/repos/${OWNER}/${repo}/git/ref/heads/${branch}`);
  if (!r.ok) throw new Error(`Failed to fetch ref ${repo}:${branch}: ${r.status}`);
  return r.json.object.sha;
}

async function createBranch(repo, branch, sha) {
  const r = await gh(`https://api.github.com/repos/${OWNER}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
  });
  if (r.status === 422) return;
  if (!r.ok) throw new Error(`Failed to create branch ${repo}:${branch}: ${r.status}`);
}

async function upsertFile(repo, branch, path, content, message) {
  const existing = await gh(`https://api.github.com/repos/${OWNER}/${repo}/contents/${path}?ref=${branch}`);
  const sha = existing.ok ? existing.json.sha : undefined;

  const r = await gh(`https://api.github.com/repos/${OWNER}/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: b64(content),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!r.ok) throw new Error(`Failed to upsert ${repo}:${path}: ${r.status}`);
}

async function openPr(repo, head, base, title, body) {
  const r = await gh(`https://api.github.com/repos/${OWNER}/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title, head, base, body }),
  });
  if (r.status === 422) return null;
  if (!r.ok) throw new Error(`Failed to open PR for ${repo}: ${r.status}`);
  return r.json.html_url;
}

function pytestWorkflowWithJUnit() {
  return [
    'name: QA Metrics',
    '',
    'on:',
    '  push:',
    '    branches: [ main ]',
    '  workflow_dispatch:',
    '',
    'permissions:',
    '  contents: read',
    '',
    'jobs:',
    '  qa-metrics:',
    '    runs-on: ubuntu-latest',
    '',
    '    steps:',
    '      - name: Checkout',
    '        uses: actions/checkout@v4',
    '',
    '      - name: Setup Python',
    '        uses: actions/setup-python@v5',
    '        with:',
    "          python-version: '3.11'",
    '',
    '      - name: Install deps',
    '        run: |',
    '          python -m pip install --upgrade pip',
    '          pip install -r requirements.txt',
    '',
    '      - name: Run pytest (JUnit)',
    '        run: pytest -q --junitxml=pytest-junit.xml',
    '',
    '      - name: Upload pytest-junit.xml',
    '        if: always()',
    '        uses: actions/upload-artifact@v4',
    '        with:',
    '          name: pytest-junit',
    '          path: pytest-junit.xml',
    '',
    "      - name: Generate qa-metrics.json",
    '        if: always()',
    '        run: |',
    "          python - <<'PY'",
    '          import json, os, datetime',
    '          import xml.etree.ElementTree as ET',
    '          out = {',
    "            'generatedAt': datetime.datetime.utcnow().replace(microsecond=0).isoformat() + 'Z',",
    "            'repo': os.getenv('GITHUB_REPOSITORY'),",
    "            'branch': os.getenv('GITHUB_REF_NAME'),",
    "            'commit': os.getenv('GITHUB_SHA'),",
    "            'runId': int(os.getenv('GITHUB_RUN_ID') or 0),",
    "            'tests': {},",
    '          }',
    "          if os.path.exists('pytest-junit.xml'):",
    "            tree = ET.parse('pytest-junit.xml')",
    '            root = tree.getroot()',
    "            suite = root if root.tag == 'testsuite' else root.find('testsuite')",
    '            if suite is not None:',
    "              total = int(float(suite.attrib.get('tests', 0) or 0))",
    "              failures = int(float(suite.attrib.get('failures', 0) or 0))",
    "              errors = int(float(suite.attrib.get('errors', 0) or 0))",
    "              skipped = int(float(suite.attrib.get('skipped', 0) or 0))",
    '              failed = failures + errors',
    '              passed = max(total - failed - skipped, 0)',
    '              out["tests"] = {',
    '                "total": total,',
    '                "pass": passed,',
    '                "fail": failed,',
    '                "passRate": (passed / total) if total else None,',
    '              }',
    "          with open('qa-metrics.json','w') as f:",
    '            json.dump(out, f, indent=2)',
    "          print('Wrote qa-metrics.json')",
    '          PY',
    '',
    '      - name: Upload qa-metrics artifact',
    '        if: always()',
    '        uses: actions/upload-artifact@v4',
    '        with:',
    '          name: qa-metrics',
    '          path: qa-metrics.json',
    '',
  ].join('\n');
}

async function main() {
  if (!TOKEN) throw new Error('Missing QUALITY_GITHUB_TOKEN');

  const results = [];
  for (const repo of PYTEST_REPOS) {
    const base = await getDefaultBranch(repo);
    const sha = await getBranchSha(repo, base);
    const branch = `qa-metrics-junit/${Date.now()}`;

    await createBranch(repo, branch, sha);
    await upsertFile(
      repo,
      branch,
      '.github/workflows/qa-metrics.yml',
      pytestWorkflowWithJUnit(),
      'chore(ci): add junit-backed qa-metrics'
    );

    const prUrl = await openPr(
      repo,
      `${OWNER}:${branch}`,
      base,
      'chore(ci): qa-metrics with real pytest totals (JUnit)',
      [
        'Upgrades qa-metrics workflow to run pytest with JUnit output and publish real totals/passRate into qa-metrics.json.',
        'Also uploads pytest-junit.xml as evidence.',
      ].join('\n')
    );

    results.push({ repo: `${OWNER}/${repo}`, prUrl: prUrl || '(already exists)' });
  }

  console.table(results);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

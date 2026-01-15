/*
  Creates PRs across multiple repos adding `.github/workflows/qa-metrics.yml`.

  Strategy:
    - Detect default branch
    - Create branch
    - PUT file contents via GitHub Contents API
    - Open PR

  Env:
    QUALITY_GITHUB_TOKEN (classic PAT with repo scope)
    QUALITY_GITHUB_OWNER (default JasonTeixeira)
    QUALITY_GITHUB_REPOS (csv)
*/

const OWNER = process.env.QUALITY_GITHUB_OWNER || 'JasonTeixeira';
const REPOS = (process.env.QUALITY_GITHUB_REPOS || [
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

const TOKEN = process.env.QUALITY_GITHUB_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

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
  if (!r.ok) throw new Error(`Failed to fetch repo ${repo}: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json.default_branch;
}

async function getBranchSha(repo, branch) {
  const r = await gh(`https://api.github.com/repos/${OWNER}/${repo}/git/ref/heads/${branch}`);
  if (!r.ok) throw new Error(`Failed to fetch ref ${repo}:${branch}: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json.object.sha;
}

async function createBranch(repo, branch, sha) {
  const r = await gh(`https://api.github.com/repos/${OWNER}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
  });
  if (r.status === 422) return; // already exists
  if (!r.ok) throw new Error(`Failed to create branch ${repo}:${branch}: ${r.status} ${JSON.stringify(r.json)}`);
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
  if (!r.ok) throw new Error(`Failed to upsert ${repo}:${path}: ${r.status} ${JSON.stringify(r.json)}`);
}

async function openPr(repo, head, base, title, body) {
  const r = await gh(`https://api.github.com/repos/${OWNER}/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title, head, base, body }),
  });
  if (r.status === 422) return null; // likely already exists
  if (!r.ok) throw new Error(`Failed to open PR for ${repo}: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json.html_url;
}

function workflowFor(repo) {
  const pythonSetup = [
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
  ].join('\n');

  const compileOnly = [
    '      - name: Compile check (safe default)',
    '        run: python -m compileall .',
    '',
  ].join('\n');

  const pytest = [
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
  ].join('\n');

  const behave = [
    '      - name: Install Playwright browsers',
    '        run: python -m playwright install --with-deps chromium',
    '',
    '      - name: Run behave (Allure)',
    '        run: behave -f allure -o allure-results',
    '',
    '      - name: Upload allure-results',
    '        if: always()',
    '        uses: actions/upload-artifact@v4',
    '        with:',
    '          name: allure-results',
    '          path: allure-results',
    '',
  ].join('\n');

  let testBlock = compileOnly;
  if (repo === 'BDD-Cucumber-Framework') testBlock = behave;
  else if (repo === 'CI-CD-Pipeline' || repo === 'Performance-Testing-Framework') testBlock = compileOnly;
  else testBlock = pytest;

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
    pythonSetup,
    testBlock,
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
    '          # If pytest-junit.xml exists, parse totals + pass rate',
    "          if os.path.exists('pytest-junit.xml'):",
    "            tree = ET.parse('pytest-junit.xml')",
    '            root = tree.getroot()',
    '            # junit may be <testsuite> or <testsuites>',
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
  for (const repo of REPOS) {
    const base = await getDefaultBranch(repo);
    const sha = await getBranchSha(repo, base);
    const branch = `qa-metrics/${Date.now()}`;

    await createBranch(repo, branch, sha);
    await upsertFile(
      repo,
      branch,
      '.github/workflows/qa-metrics.yml',
      workflowFor(repo),
      'chore(ci): add QA metrics workflow'
    );

    const prUrl = await openPr(
      repo,
      `${OWNER}:${branch}`,
      base,
      'chore(ci): add QA metrics workflow + artifacts',
      [
        'Adds a standardized QA telemetry workflow that uploads a `qa-metrics.json` artifact.',
        '',
        'Schema reference: https://github.com/JasonTeixeira/qa-portfolio/blob/main/QUALITY_METRICS_SCHEMA.md',
        '',
        'This enables the portfolio Quality Dashboard to ingest evidence-backed metrics.',
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

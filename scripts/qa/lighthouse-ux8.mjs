import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const routes = [
  { name: 'home', path: '/' },
  { name: 'services', path: '/services' },
  { name: 'pricing', path: '/pricing' },
  { name: 'blog', path: '/blog' },
  { name: 'academy', path: '/academy' },
  { name: 'academy-enroll-ai-native-product-building', path: '/academy/ai-native-product-building/enroll' },
  { name: 'route-finder', path: '/tools/route-finder' },
  { name: 'contact', path: '/contact' },
  { name: 'work', path: '/work' },
  { name: 'service-studio-package', path: '/services/studio-package' },
  { name: 'service-rag-engineering', path: '/services/rag-engineering' },
  { name: 'service-internal-ai-copilot', path: '/services/internal-ai-copilot' },
  { name: 'service-ai-agent-development', path: '/services/ai-agent-development' },
];

const profile = process.argv.includes('--mobile') ? 'mobile' : 'desktop';
const port = process.env.PORT || '4173';
const origin = `http://127.0.0.1:${port}`;
const outDir = join(process.cwd(), '.lighthouseci', `ux8-${profile}`);
const retries = Number(process.env.LH_UX8_RETRIES ?? '2');

const budgets = {
  desktop: { performance: 0.88, accessibility: 0.95, bestPractices: 0.95, seo: 0.95, lcp: 2500, cls: 0.1, tbt: 200 },
  mobile: { performance: 0.7, accessibility: 0.95, bestPractices: 0.9, seo: 0.95, lcp: 3000, cls: 0.1, tbt: 300 },
}[profile];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? 'inherit',
      shell: false,
      env: { ...process.env, ...options.env },
    });
    let output = '';
    if (options.stdio === 'pipe') {
      child.stdout.on('data', (chunk) => { output += chunk.toString(); });
      child.stderr.on('data', (chunk) => { output += chunk.toString(); });
    }
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output || `${command} ${args.join(' ')} exited ${code}`));
    });
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    let ready = false;
    const child = spawn('./node_modules/.bin/next', ['start', '-p', port], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: port },
    });
    let buffer = '';
    const onData = (chunk) => {
      const text = chunk.toString();
      buffer += text;
      process.stdout.write(text);
      if (!ready && /Ready in|Local:\s+http:\/\/localhost/.test(buffer)) {
        ready = true;
        resolve(child);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', reject);
    child.on('exit', (code) => {
      if (!ready) reject(new Error(`next start exited before ready with ${code}`));
    });
  });
}

async function lighthouse(route, attempt) {
  const outputPath = join(outDir, `${route.name}.json`);
  const url = `${origin}${route.path}`;
  const args = [
    'lighthouse',
    url,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json',
    `--output-path=${outputPath}`,
    '--chrome-flags=--headless=new --no-sandbox',
  ];

  if (profile === 'desktop') {
    args.push('--preset=desktop');
  } else {
    args.push(
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--screenEmulation.width=390',
      '--screenEmulation.height=844',
      '--screenEmulation.deviceScaleFactor=3',
      '--throttling.cpuSlowdownMultiplier=4',
      '--throttling.rttMs=40',
      '--throttling.throughputKbps=10240',
    );
  }

  console.log(`[ux8:${profile}] ${route.path} attempt ${attempt + 1}/${retries + 1}`);
  await run('npm', ['exec', '--', ...args], { stdio: 'pipe' });
  return JSON.parse(readFileSync(outputPath, 'utf8'));
}

async function warmRoute(route) {
  const url = `${origin}${route.path}`;
  const res = await fetch(url, {
    headers: {
      'user-agent': `sage-lighthouse-warmup/${profile}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`warmup ${route.path} returned ${res.status}: ${body.slice(0, 180)}`);
  }
  await res.arrayBuffer();
}

function assertBudget(report) {
  const scores = {
    performance: report.categories.performance.score,
    accessibility: report.categories.accessibility.score,
    bestPractices: report.categories['best-practices'].score,
    seo: report.categories.seo.score,
  };
  const metrics = {
    lcp: report.audits['largest-contentful-paint'].numericValue,
    cls: report.audits['cumulative-layout-shift'].numericValue,
    tbt: report.audits['total-blocking-time'].numericValue,
  };
  const failures = [];
  for (const key of ['performance', 'accessibility', 'bestPractices', 'seo']) {
    if (scores[key] < budgets[key]) failures.push(`${key} ${scores[key]} < ${budgets[key]}`);
  }
  if (metrics.lcp > budgets.lcp) failures.push(`lcp ${Math.round(metrics.lcp)} > ${budgets.lcp}`);
  if (metrics.cls > budgets.cls) failures.push(`cls ${metrics.cls} > ${budgets.cls}`);
  if (metrics.tbt > budgets.tbt) failures.push(`tbt ${Math.round(metrics.tbt)} > ${budgets.tbt}`);
  return { scores, metrics, failures };
}

async function main() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  console.log(`[ux8:${profile}] build`);
  rmSync(join(process.cwd(), '.next'), {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 250,
  });
  await run('npm', ['run', 'build']);

  const server = await startServer();
  const results = [];
  try {
    console.log(`[ux8:${profile}] warm routes`);
    for (const route of routes) {
      await warmRoute(route);
    }

    for (const route of routes) {
      let lastError;
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const report = await lighthouse(route, attempt);
          const result = { route, ...assertBudget(report) };
          results.push(result);
          console.log(
            `[ux8:${profile}] ${route.path} perf=${result.scores.performance} a11y=${result.scores.accessibility} bp=${result.scores.bestPractices} seo=${result.scores.seo} lcp=${Math.round(result.metrics.lcp)} cls=${result.metrics.cls} tbt=${Math.round(result.metrics.tbt)}`,
          );
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          console.warn(`[ux8:${profile}] ${route.path} failed attempt ${attempt + 1}: ${error.message.split('\n')[0]}`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }
      if (lastError) throw lastError;
    }
  } finally {
    server.kill('SIGTERM');
  }

  const summary = {
    profile,
    generatedAt: new Date().toISOString(),
    budgets,
    results: results.map((result) => ({
      route: result.route.path,
      name: result.route.name,
      scores: result.scores,
      metrics: {
        lcp: Math.round(result.metrics.lcp),
        cls: result.metrics.cls,
        tbt: Math.round(result.metrics.tbt),
      },
      failures: result.failures,
    })),
  };
  writeFileSync(join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.route.path}: ${failure}`));
  if (failures.length > 0) {
    console.error(`[ux8:${profile}] budget failures:\n${failures.join('\n')}`);
    process.exit(1);
  }

  if (!existsSync(join(outDir, 'summary.json'))) process.exit(1);
  console.log(`[ux8:${profile}] passed ${results.length}/${routes.length}; summary ${join(outDir, 'summary.json')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const date = process.env.AUDIT_DATE ?? new Date().toISOString().slice(0, 10)
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3041'
const auditDir = join(process.cwd(), 'docs/evidence/marketing/audits', date)

const routes = [
  { name: 'home', path: '/?source=lighthouse_business' },
  { name: 'services', path: '/services' },
  { name: 'book', path: '/book?source=lighthouse_business' },
  { name: 'showcase-revenue-os', path: '/showcase/revenue-os' },
]

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk.toString()
      process.stdout.write(chunk)
    })
    child.stderr.on('data', (chunk) => {
      output += chunk.toString()
      process.stderr.write(chunk)
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve(output)
      else reject(new Error(output || `${command} ${args.join(' ')} exited ${code}`))
    })
  })
}

function url(path) {
  return new URL(path, baseUrl).toString()
}

mkdirSync(auditDir, { recursive: true })

const results = []
for (const route of routes) {
  const out = join(auditDir, `lighthouse-${route.name}.json`)
  await run('npm', [
    'exec',
    '--',
    'lighthouse',
    url(route.path),
    '--only-categories=performance,accessibility,best-practices,seo',
    '--preset=desktop',
    '--output=json',
    `--output-path=${out}`,
    '--chrome-flags=--headless=new --no-sandbox',
  ])

  if (!existsSync(out)) {
    throw new Error(`Lighthouse did not write ${out}`)
  }

  const report = JSON.parse(readFileSync(out, 'utf8'))
  results.push({
    route: route.path,
    file: out,
    scores: {
      performance: report.categories.performance.score,
      accessibility: report.categories.accessibility.score,
      bestPractices: report.categories['best-practices'].score,
      seo: report.categories.seo.score,
    },
    metrics: {
      lcp: Math.round(report.audits['largest-contentful-paint'].numericValue),
      cls: report.audits['cumulative-layout-shift'].numericValue,
      tbt: Math.round(report.audits['total-blocking-time'].numericValue),
    },
  })
}

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  routes: results,
}

writeFileSync(join(auditDir, 'lighthouse-business-summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
console.log(JSON.stringify(summary, null, 2))

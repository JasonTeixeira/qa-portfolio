import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import path from 'node:path'
import process from 'node:process'

import { evaluateLighthouseAssertions } from '../../lib/accessibility-performance/contract.mjs'

const root = process.cwd()
const configArg = process.argv.find((value) => value.startsWith('--config='))?.slice('--config='.length) ?? 'lighthouserc.json'
const configPath = path.resolve(root, configArg)
const config = JSON.parse(await readFile(configPath, 'utf8'))
const collect = config?.ci?.collect
const assertions = config?.ci?.assert?.assertions ?? {}
if (!collect || !Array.isArray(collect.url) || collect.url.length === 0) throw new Error('Lighthouse config must define ci.collect.url')

const configuredUrls = collect.url.map((value) => new URL(value))
if (configuredUrls.some((url) => !['127.0.0.1', 'localhost'].includes(url.hostname))) {
  throw new Error('Local Lighthouse runner refuses non-local targets')
}
if (configuredUrls.some((url) => (url.port || '80') !== (configuredUrls[0].port || '80'))) throw new Error('All Lighthouse URLs must use one local port')

const profile = configArg.includes('mobile') ? 'mobile' : 'desktop'
const outputDir = path.join(root, '.lighthouseci', `config-${profile}`)
const lighthouseBin = path.join(root, 'node_modules', '.bin', 'lighthouse')

async function availablePort() {
  if (process.env.LIGHTHOUSE_PORT) {
    const requested = Number(process.env.LIGHTHOUSE_PORT)
    if (!Number.isInteger(requested) || requested < 1024 || requested > 65535) throw new Error('LIGHTHOUSE_PORT must be an unprivileged TCP port')
    return requested
  }
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.unref()
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address()
      const selected = typeof address === 'object' && address ? address.port : null
      probe.close((error) => error ? reject(error) : resolve(selected))
    })
  })
}

function run(command, args, { capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    })
    let output = ''
    if (capture) {
      child.stdout.on('data', (chunk) => { output += String(chunk) })
      child.stderr.on('data', (chunk) => { output += String(chunk) })
    }
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolve(output) : reject(new Error(output || `${command} exited ${code}`)))
  })
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  let lastError = 'not ready'
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) })
      if (response.status < 500) return
      lastError = `HTTP ${response.status}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
  throw new Error(`Lighthouse target did not become ready: ${lastError}`)
}

function lighthouseArgs(url, outputPath) {
  const settings = collect.settings ?? {}
  const args = [
    url.toString(),
    '--output=json',
    `--output-path=${outputPath}`,
    `--only-categories=${(settings.onlyCategories ?? ['performance', 'accessibility', 'best-practices', 'seo']).join(',')}`,
    '--chrome-flags=--headless=new --no-sandbox',
  ]
  if (settings.preset === 'desktop') args.push('--preset=desktop')
  if (settings.formFactor === 'mobile') {
    args.push('--form-factor=mobile')
    const screen = settings.screenEmulation ?? {}
    if (screen.width) args.push(`--screenEmulation.width=${screen.width}`)
    if (screen.height) args.push(`--screenEmulation.height=${screen.height}`)
    if (screen.deviceScaleFactor) args.push(`--screenEmulation.deviceScaleFactor=${screen.deviceScaleFactor}`)
    const throttling = settings.throttling ?? {}
    for (const key of ['rttMs', 'throughputKbps', 'cpuSlowdownMultiplier']) {
      if (throttling[key] !== undefined) args.push(`--throttling.${key}=${throttling[key]}`)
    }
  }
  return args
}

async function stopServer(server) {
  if (server.exitCode !== null) return
  await new Promise((resolve) => {
    const timeout = setTimeout(() => server.kill('SIGKILL'), 5000)
    server.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
    server.kill('SIGTERM')
  })
}

await mkdir(outputDir, { recursive: true })
const port = await availablePort()
if (!port) throw new Error('Unable to allocate a local Lighthouse port')
const urls = configuredUrls.map((configured) => {
  const url = new URL(configured)
  url.hostname = '127.0.0.1'
  url.port = String(port)
  return url
})
const server = spawn(process.execPath, ['scripts/serve-prod.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: port },
  stdio: 'inherit',
})

const results = []
try {
  await waitForServer(urls[0], Number(collect.startServerReadyTimeout ?? 60_000))
  for (const [index, url] of urls.entries()) {
    const name = `${String(index + 1).padStart(2, '0')}-${url.pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'home'}`
    const outputPath = path.join(outputDir, `${name}.json`)
    await run(lighthouseBin, lighthouseArgs(url, outputPath), { capture: true })
    const report = JSON.parse(await readFile(outputPath, 'utf8'))
    results.push({ url: url.toString(), outputPath: path.relative(root, outputPath), assertions: evaluateLighthouseAssertions(report, assertions) })
  }
} finally {
  await stopServer(server)
}

const failures = results.flatMap((result) => result.assertions
  .filter((assertion) => !assertion.passed && assertion.level === 'error')
  .map((assertion) => `${result.url}: ${assertion.key} value ${assertion.value} outside ${assertion.minScore ?? assertion.maxNumericValue}`))
const warnings = results.flatMap((result) => result.assertions
  .filter((assertion) => !assertion.passed && assertion.level === 'warn')
  .map((assertion) => `${result.url}: ${assertion.key} value ${assertion.value} outside ${assertion.minScore ?? assertion.maxNumericValue}`))
const summary = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  config: path.relative(root, configPath),
  profile,
  ok: failures.length === 0,
  failures,
  warnings,
  results,
}
await writeFile(path.join(outputDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
console.log(JSON.stringify(summary, null, 2))
if (failures.length) process.exit(1)

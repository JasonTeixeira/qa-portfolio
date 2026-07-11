#!/usr/bin/env node
/**
 * Agency release gate runner.
 *
 * Runs the real checks that back proof/site-proof.json (rendered verbatim by
 * components/agency/gate-runner.tsx) and rewrites that file with the results.
 * Every step is independent: a failure records status 'fail' and the run
 * continues, so the committed proof is honest — no fake greens.
 *
 * Usage:
 *   node scripts/agency/run-proof-gates.mjs
 *   SKIP_BUILD=1 node scripts/agency/run-proof-gates.mjs   # reuse existing .next build
 *
 * Exit code 0 iff every check passed (CI gates on this).
 */

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const PROOF_PATH = path.join(ROOT, 'proof', 'site-proof.json')
const AXE_PATH = path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js')
const PLAYWRIGHT_PATH = path.join(ROOT, 'node_modules', 'playwright')
const LIGHTHOUSE_PATH = path.join(ROOT, 'node_modules', 'lighthouse')

const PORT = 3055
const ORIGIN = `http://localhost:${PORT}`
const AGENCY_HOST = 'agency.localhost'
const AGENCY_URL = `http://${AGENCY_HOST}:${PORT}/`
const VIEWPORT_WIDTHS = [320, 768, 1024, 1440]
const LIGHTHOUSE_MIN_SCORE = 90
const SERVER_WAIT_CAP_MS = 60_000
const SERVER_POLL_INTERVAL_MS = 1_000

/** @type {{ id: string, label: string, status: 'pass' | 'fail' }[]} */
const checks = []

function record(id, label, passed) {
  checks.push({ id, label, status: passed ? 'pass' : 'fail' })
}

function runSync(command, args, extraEnv = {}) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...extraEnv },
    maxBuffer: 64 * 1024 * 1024,
  })
}

function readExistingProof() {
  try {
    return JSON.parse(fs.readFileSync(PROOF_PATH, 'utf8'))
  } catch {
    return null
  }
}

function shortSha() {
  const result = runSync('git', ['rev-parse', '--short', 'HEAD'])
  return result.status === 0 ? result.stdout.trim() : null
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Probe the server with a Host: agency.localhost header (proxy routes by host). */
function probeAgencyHome() {
  return new Promise((resolve) => {
    const req = http.request(
      `${ORIGIN}/`,
      { method: 'GET', headers: { Host: AGENCY_HOST }, timeout: 5_000 },
      (res) => {
        res.resume()
        resolve(res.statusCode === 200)
      },
    )
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.end()
  })
}

// --- a. typecheck -----------------------------------------------------------

function runTypecheck() {
  process.stderr.write('[gate] typecheck: npx tsc --noEmit\n')
  const result = runSync('npx', ['tsc', '--noEmit'])
  record('typecheck', 'tsc --noEmit', result.status === 0)
  if (result.status !== 0) process.stderr.write(result.stdout || result.stderr || '')
}

// --- b. build ---------------------------------------------------------------

function runBuild() {
  if (process.env.SKIP_BUILD === '1') {
    const hasBuild = fs.existsSync(path.join(ROOT, '.next', 'BUILD_ID'))
    process.stderr.write(`[gate] build: skipped (SKIP_BUILD=1), existing .next ${hasBuild ? 'found' : 'MISSING'}\n`)
    record('build', 'next build (reused existing build)', hasBuild)
    return
  }
  process.stderr.write('[gate] build: npx next build\n')
  const result = runSync('npx', ['next', 'build'])
  record('build', 'next build', result.status === 0)
  if (result.status !== 0) process.stderr.write(result.stdout || result.stderr || '')
}

// --- c. server lifecycle ----------------------------------------------------

function startServer() {
  process.stderr.write(`[gate] server: npx next start -p ${PORT}\n`)
  const child = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: true,
  })
  child.unref()
  return child
}

function stopServer(child) {
  if (!child || child.exitCode !== null) return
  try {
    process.kill(-child.pid, 'SIGTERM')
  } catch {
    try {
      child.kill('SIGTERM')
    } catch {
      /* already gone */
    }
  }
}

async function waitForServer() {
  const deadline = Date.now() + SERVER_WAIT_CAP_MS
  while (Date.now() < deadline) {
    if (await probeAgencyHome()) return true
    await sleep(SERVER_POLL_INTERVAL_MS)
  }
  return false
}

// --- d + e. playwright overflow + axe ---------------------------------------

async function runBrowserChecks() {
  if (!fs.existsSync(PLAYWRIGHT_PATH)) {
    record('playwright', 'playwright overflow check — playwright not installed', false)
    record('axe', 'axe-core scan — playwright not installed', false)
    return
  }
  if (!fs.existsSync(AXE_PATH)) {
    record('axe', 'axe-core scan — axe-core not installed', false)
  }

  let browser = null
  try {
    const { chromium } = await import('playwright')
    browser = await chromium.launch()

    // Reduced motion gives deterministic steady-state DOM: scroll-reveal
    // animations otherwise leave text at partial opacity, producing phantom
    // color-contrast results that vary run to run.
    const pageOptions = { reducedMotion: 'reduce' }

    // d. horizontal overflow at each width — single check.
    const overflowing = []
    for (const width of VIEWPORT_WIDTHS) {
      const page = await browser.newPage({ ...pageOptions, viewport: { width, height: 900 } })
      try {
        await page.goto(AGENCY_URL, { waitUntil: 'load', timeout: 30_000 })
        await page.waitForTimeout(500)
        const hasOverflow = await page.evaluate(() => {
          const el = document.documentElement
          return el.scrollWidth > el.clientWidth
        })
        if (hasOverflow) overflowing.push(width)
      } catch (error) {
        process.stderr.write(`[gate] playwright @${width}: ${error.message}\n`)
        overflowing.push(width)
      } finally {
        await page.close()
      }
    }
    record(
      'playwright',
      overflowing.length === 0
        ? `playwright no-overflow ${VIEWPORT_WIDTHS.join('/')}`
        : `playwright no-overflow ${VIEWPORT_WIDTHS.join('/')} — overflow at ${overflowing.join(', ')}`,
      overflowing.length === 0,
    )

    // e. axe-core WCAG scan.
    if (fs.existsSync(AXE_PATH)) {
      const page = await browser.newPage({ ...pageOptions, viewport: { width: 1280, height: 900 } })
      try {
        await page.goto(AGENCY_URL, { waitUntil: 'load', timeout: 30_000 })
        await page.addScriptTag({ path: AXE_PATH })
        const results = await page.evaluate(() =>
          window.axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          }),
        )
        const count = results.violations.length
        record('axe', `axe-core scan — ${count} violations (WCAG 2.1 AA)`, count === 0)
        if (count > 0) {
          for (const violation of results.violations) {
            process.stderr.write(`[gate] axe: ${violation.id} (${violation.impact}) x${violation.nodes.length}\n`)
          }
        }
      } catch (error) {
        record('axe', `axe-core scan — errored: ${error.message}`, false)
      } finally {
        await page.close()
      }
    }
  } catch (error) {
    process.stderr.write(`[gate] browser checks errored: ${error.message}\n`)
    if (!checks.some((check) => check.id === 'playwright')) {
      record('playwright', `playwright no-overflow ${VIEWPORT_WIDTHS.join('/')} — errored`, false)
    }
    if (!checks.some((check) => check.id === 'axe')) {
      record('axe', 'axe-core scan — errored', false)
    }
  } finally {
    if (browser) await browser.close()
  }
}

// --- f. lighthouse ----------------------------------------------------------

function runLighthouse() {
  if (!fs.existsSync(LIGHTHOUSE_PATH)) {
    record('lighthouse', 'lighthouse desktop — lighthouse not installed', false)
    return null
  }
  process.stderr.write('[gate] lighthouse: desktop preset\n')
  const outputPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'agency-lh-')), 'report.json')
  const result = runSync('npx', [
    'lighthouse',
    AGENCY_URL,
    '--preset=desktop',
    '--quiet',
    '--chrome-flags=--headless=new',
    '--output=json',
    `--output-path=${outputPath}`,
  ])
  if (result.status !== 0 || !fs.existsSync(outputPath)) {
    process.stderr.write(result.stderr || result.stdout || '')
    record('lighthouse', 'lighthouse desktop — run failed', false)
    return null
  }
  try {
    const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    const score = (id) => Math.round((report.categories[id]?.score ?? 0) * 100)
    const scores = {
      performance: score('performance'),
      accessibility: score('accessibility'),
      bestPractices: score('best-practices'),
      seo: score('seo'),
    }
    const values = Object.values(scores)
    record(
      'lighthouse',
      `lighthouse desktop ${values.join(' / ')}`,
      values.every((value) => value >= LIGHTHOUSE_MIN_SCORE),
    )
    return scores
  } catch (error) {
    record('lighthouse', `lighthouse desktop — unreadable report: ${error.message}`, false)
    return null
  } finally {
    fs.rmSync(path.dirname(outputPath), { recursive: true, force: true })
  }
}

// --- g. write proof ---------------------------------------------------------

function writeProof(lighthouseScores, previousProof) {
  const previousLighthouse = previousProof?.lighthouse ?? {}
  const proof = {
    verifiedAt: new Date().toISOString().slice(0, 10),
    checks,
    lighthouse: lighthouseScores
      ? {
          strategy: 'desktop',
          ...lighthouseScores,
          mobileNote: previousLighthouse.mobileNote ?? 'mobile not measured by this gate',
        }
      : { ...previousLighthouse, strategy: previousLighthouse.strategy ?? 'desktop' },
  }
  const sha = shortSha()
  if (sha) proof.commit = sha
  fs.writeFileSync(PROOF_PATH, `${JSON.stringify(proof, null, 2)}\n`)
  return proof
}

// --- main -------------------------------------------------------------------

async function main() {
  const previousProof = readExistingProof()
  let server = null

  runTypecheck()
  runBuild()

  process.on('exit', () => stopServer(server))
  process.on('SIGINT', () => {
    stopServer(server)
    process.exit(130)
  })

  server = startServer()
  const serverUp = await waitForServer()

  let lighthouseScores = null
  if (serverUp) {
    await runBrowserChecks()
    lighthouseScores = runLighthouse()
  } else {
    process.stderr.write(`[gate] server never answered 200 on ${ORIGIN} (Host: ${AGENCY_HOST}) within 60s\n`)
    record('playwright', `playwright no-overflow ${VIEWPORT_WIDTHS.join('/')} — server unavailable`, false)
    record('axe', 'axe-core scan — server unavailable', false)
    record('lighthouse', 'lighthouse desktop — server unavailable', false)
  }

  stopServer(server)

  const proof = writeProof(lighthouseScores, previousProof)

  const width = Math.max(...checks.map((check) => check.id.length))
  console.log(`\nagency release gate — ${proof.verifiedAt}${proof.commit ? ` @ ${proof.commit}` : ''}`)
  for (const check of checks) {
    console.log(`  ${check.status === 'pass' ? 'PASS' : 'FAIL'}  ${check.id.padEnd(width)}  ${check.label}`)
  }
  const allPassed = checks.every((check) => check.status === 'pass')
  console.log(allPassed ? '\nREADINESS: SHIP' : '\nREADINESS: BLOCKED')
  console.log(`wrote ${path.relative(ROOT, PROOF_PATH)}`)

  process.exit(allPassed ? 0 : 1)
}

main().catch((error) => {
  process.stderr.write(`[gate] fatal: ${error.stack || error.message}\n`)
  process.exit(1)
})

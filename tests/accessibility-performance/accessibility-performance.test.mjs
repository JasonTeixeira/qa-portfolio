import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  REQUIRED_PUBLIC_ROUTES,
  REQUIRED_ACCESSIBILITY_ROUTES,
  auditAccessibilityPerformanceContract,
  evaluateLighthouseAssertions,
} from '../../lib/accessibility-performance/contract.mjs'
import {
  calculateCpuSlowdownMultiplier,
  resolveCpuExecutionMode,
  selectMedianBenchmarkIndex,
} from '../../lib/accessibility-performance/cpu-calibration.mjs'
import { clientMessagesForLocale } from '../../lib/i18n/client-catalog.mjs'

const fixture = (name) => JSON.parse(readFileSync(`tests/accessibility-performance/fixtures/${name}.json`, 'utf8'))

test('known-good accessibility and performance contract passes', () => {
  assert.deepEqual(auditAccessibilityPerformanceContract(fixture('known-good')), [])
})

test('deliberately broken fixture is rejected across every production dimension', () => {
  const codes = new Set(auditAccessibilityPerformanceContract(fixture('known-broken')).map((finding) => finding.code))
  for (const code of [
    'script_missing',
    'remote_lighthouse_target',
    'critical_route_missing',
    'accessibility_not_hard_gated',
    'core_web_vital_not_hard_gated',
    'mobile_profile_missing',
    'cpu_calibration_missing',
    'zoom_disabled',
    'focus_contract_missing',
    'reduced_motion_contract_missing',
    'skip_link_contract_missing',
    'local_browser_boundary_missing',
    'axe_wcag22_contract_missing',
    'accessibility_route_matrix_missing',
    'keyboard_contract_missing',
    'responsive_overflow_contract_missing',
  ]) assert.ok(codes.has(code), `expected broken fixture finding: ${code}`)
})

test('mobile CPU calibration matches the official Lighthouse calculator policy', () => {
  assert.equal(calculateCpuSlowdownMultiplier(150), 1)
  assert.equal(calculateCpuSlowdownMultiplier(475), 1.5)
  assert.equal(calculateCpuSlowdownMultiplier(800), 2)
  assert.equal(calculateCpuSlowdownMultiplier(1050), 2.5)
  assert.equal(calculateCpuSlowdownMultiplier(1300), 3)
  assert.equal(calculateCpuSlowdownMultiplier(1533), 4)
  assert.equal(calculateCpuSlowdownMultiplier(2889), 9.8)
})

test('mobile CPU calibration fails closed for invalid or underpowered runners', () => {
  for (const value of [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, -1, 149.9]) {
    assert.throws(() => calculateCpuSlowdownMultiplier(value), /benchmarkIndex|too slow/)
  }
})

test('mobile CPU calibration uses the median of an odd sample set', () => {
  assert.equal(selectMedianBenchmarkIndex([510, 470, 490]), 490)
  assert.throws(() => selectMedianBenchmarkIndex([]), /non-empty odd number/)
  assert.throws(() => selectMedianBenchmarkIndex([400, 500]), /non-empty odd number/)
  assert.throws(() => selectMedianBenchmarkIndex([400, Number.NaN, 500]), /finite/)
})

test('mobile CPU execution mode defaults to calibrated and rejects ambiguous bypasses', () => {
  assert.equal(resolveCpuExecutionMode(undefined), 'calibrated')
  assert.equal(resolveCpuExecutionMode('calibrated'), 'calibrated')
  assert.equal(resolveCpuExecutionMode('provided'), 'provided')
  for (const value of ['', 'off', 'false', '1']) {
    assert.throws(() => resolveCpuExecutionMode(value), /LIGHTHOUSE_CPU_MODE/)
  }
})

test('default-English pages send no redundant client catalog while localized pages retain translations', () => {
  const messages = { Services: 'Servicios' }
  assert.deepEqual(clientMessagesForLocale('en', 'en', messages), {})
  assert.equal(clientMessagesForLocale('es', 'en', messages), messages)
})

test('Lighthouse evaluator hard-fails metrics and scores outside their budgets', () => {
  const assertions = {
    'categories:accessibility': ['error', { minScore: 0.95 }],
    'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
    'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
    'total-blocking-time': ['error', { maxNumericValue: 200 }],
  }
  const report = {
    categories: { accessibility: { score: 0.94 } },
    audits: {
      'largest-contentful-paint': { numericValue: 2501 },
      'cumulative-layout-shift': { numericValue: 0.101 },
      'total-blocking-time': { numericValue: 201 },
    },
  }
  const results = evaluateLighthouseAssertions(report, assertions)
  assert.equal(results.length, 4)
  assert.ok(results.every((result) => result.passed === false && result.level === 'error'))
})

test('the repository contract covers every critical public route', () => {
  const actual = {
    packageScripts: JSON.parse(readFileSync('package.json', 'utf8')).scripts,
    desktopConfig: JSON.parse(readFileSync('lighthouserc.json', 'utf8')),
    mobileConfig: JSON.parse(readFileSync('lighthouserc.mobile.json', 'utf8')),
    layoutSource: readFileSync('app/layout.tsx', 'utf8'),
    globalCss: readFileSync('app/globals.css', 'utf8'),
    chromeSource: readFileSync('components/marketing-chrome.tsx', 'utf8'),
    browserConfigSource: readFileSync('playwright.accessibility-performance.config.ts', 'utf8'),
    browserSpecSource: readFileSync('tests/accessibility-performance/accessibility-performance.spec.ts', 'utf8'),
  }
  assert.deepEqual(auditAccessibilityPerformanceContract(actual), [])
  assert.deepEqual(REQUIRED_PUBLIC_ROUTES, ['/', '/services', '/work', '/pricing', '/blog', '/contact'])
  assert.deepEqual(REQUIRED_ACCESSIBILITY_ROUTES, [
    '/', '/services', '/work', '/pricing', '/blog', '/contact',
    '/login', '/signup', '/academy/catalog', '/academy/try', '/checkout/audit',
  ])
})

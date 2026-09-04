import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  REQUIRED_PUBLIC_ROUTES,
  REQUIRED_ACCESSIBILITY_ROUTES,
  auditAccessibilityPerformanceContract,
  evaluateLighthouseAssertions,
} from '../../lib/accessibility-performance/contract.mjs'

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

#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const sources = [
  '.lighthouseci/ux8-desktop/summary.json',
  '.lighthouseci/ux8-mobile/summary.json',
  '.lighthouseci/live-desktop/summary.json',
  '.lighthouseci/live-mobile/summary.json',
  '.lighthouseci/live-commerce-smoke/summary.json',
];

const routeExemptions = {
  '/academy/my-courses': new Set(['seo']),
};

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function normalizeSummary(summary, sourcePath) {
  const budgets = summary.budgets ?? {};
  const profile = summary.profile ?? (sourcePath.includes('mobile') ? 'mobile' : 'desktop');
  return {
    source: sourcePath,
    profile,
    origin: summary.origin ?? 'local',
    generatedAt: summary.generatedAt ?? null,
    budgets,
    routes: (summary.results ?? []).map((result) => {
      const failures = [...(result.failures ?? [])];
      const scores = result.scores ?? {};
      const metrics = result.metrics ?? {};

      if (typeof budgets.performance === 'number' && scores.performance < budgets.performance) {
        failures.push(`performance ${scores.performance} < ${budgets.performance}`);
      }
      if (typeof budgets.accessibility === 'number' && scores.accessibility < budgets.accessibility) {
        failures.push(`accessibility ${scores.accessibility} < ${budgets.accessibility}`);
      }
      if (typeof budgets.bestPractices === 'number' && scores.bestPractices < budgets.bestPractices) {
        failures.push(`bestPractices ${scores.bestPractices} < ${budgets.bestPractices}`);
      }
      if (typeof budgets.seo === 'number' && scores.seo < budgets.seo) {
        failures.push(`seo ${scores.seo} < ${budgets.seo}`);
      }
      if (typeof budgets.lcp === 'number' && metrics.lcp > budgets.lcp) {
        failures.push(`lcp ${metrics.lcp}ms > ${budgets.lcp}ms`);
      }
      if (typeof budgets.cls === 'number' && metrics.cls > budgets.cls) {
        failures.push(`cls ${metrics.cls} > ${budgets.cls}`);
      }
      if (typeof budgets.tbt === 'number' && metrics.tbt > budgets.tbt) {
        failures.push(`tbt ${metrics.tbt}ms > ${budgets.tbt}ms`);
      }

      const exemptions = routeExemptions[result.route] ?? new Set();
      const activeFailures = failures.filter((failure) => {
        const key = failure.split(' ')[0];
        return !exemptions.has(key);
      });
      const exemptedFailures = failures.filter((failure) => !activeFailures.includes(failure));

      return {
        name: result.name,
        route: result.route,
        scores,
        metrics,
        failures: [...new Set(activeFailures)],
        exemptedFailures: [...new Set(exemptedFailures)],
      };
    }),
  };
}

const summaries = sources
  .map((source) => {
    const absolute = join(root, source);
    const summary = readJson(absolute);
    return summary ? normalizeSummary(summary, source) : null;
  })
  .filter(Boolean);

const failedRoutes = summaries.flatMap((summary) =>
  summary.routes
    .filter((route) => route.failures.length > 0)
    .map((route) => ({
      source: summary.source,
      profile: summary.profile,
      origin: summary.origin,
      route: route.route,
      name: route.name,
      failures: route.failures,
    })),
);

const report = {
  generatedAt: new Date().toISOString(),
  status: failedRoutes.length ? 'fail' : 'pass',
  sourceCount: summaries.length,
  routeCount: summaries.reduce((total, summary) => total + summary.routes.length, 0),
  failedRouteCount: failedRoutes.length,
  failedRoutes,
  exemptedFailures: summaries.flatMap((summary) =>
    summary.routes
      .filter((route) => route.exemptedFailures.length > 0)
      .map((route) => ({
        source: summary.source,
        profile: summary.profile,
        route: route.route,
        name: route.name,
        exemptedFailures: route.exemptedFailures,
      })),
  ),
  summaries,
};

const outputDir = join(root, 'docs', 'baselines');
mkdirSync(outputDir, { recursive: true });

const latestPath = join(outputDir, 'cwv-budget-latest.json');
const historyPath = join(outputDir, 'cwv-budget-history.jsonl');

writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(historyPath, `${JSON.stringify({
  generatedAt: report.generatedAt,
  status: report.status,
  sourceCount: report.sourceCount,
  routeCount: report.routeCount,
  failedRouteCount: report.failedRouteCount,
})}\n`, { flag: 'a' });

console.log(`CWV budget ${report.status}: ${report.routeCount} route checks from ${report.sourceCount} summaries`);
if (failedRoutes.length) {
  for (const failed of failedRoutes) {
    console.log(`- ${failed.profile} ${failed.route}: ${failed.failures.join('; ')}`);
  }
  process.exitCode = 1;
}

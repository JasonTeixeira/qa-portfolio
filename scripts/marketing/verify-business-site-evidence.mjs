import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const auditsRoot = join(root, 'docs', 'evidence', 'marketing', 'audits');
const date = process.env.AUDIT_DATE ?? latestAuditDate();
const auditDir = join(auditsRoot, date);
const outputPath = join(auditDir, 'business-site-evidence-verification.json');

const thresholds = {
  minRoutesAudited: 29,
  minLinkTargets: 200,
  maxFailedLinks: 0,
  maxAxeViolationRoutes: 0,
  maxSeriousAxeViolations: 0,
  maxOverflowRoutes: 0,
  minLighthouseRoutes: 18,
  minPerformance: 0.96,
  minAccessibility: 1,
  minBestPractices: 1,
  minSeo: 1,
  maxCls: 0,
  maxTbt: 0,
};

function latestAuditDate() {
  if (!existsSync(auditsRoot)) {
    throw new Error(`Missing marketing audit directory: ${auditsRoot}`);
  }
  const dates = readdirSync(auditsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const latest = dates.at(-1);
  if (!latest) throw new Error(`No dated marketing audit directories found under ${auditsRoot}`);
  return latest;
}

function readJson(relativePath) {
  const filePath = join(root, relativePath);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function readText(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assertCheck(checks, key, passed, evidence) {
  checks.push({ key, passed, evidence });
}

function minScore(routes, selector) {
  return Math.min(...routes.map(selector));
}

function main() {
  const checks = [];
  const businessAuditPath = `docs/evidence/marketing/audits/${date}/business-site-audit.json`;
  const lighthouseSummaryPath = `docs/evidence/marketing/audits/${date}/lighthouse-business-summary.json`;
  const scorecardPath = `docs/marketing/business-site-scorecard.${date}.txt`;
  const completionAuditPath = `docs/marketing/business-site-completion-audit.${date}.txt`;
  const matrixPath = `docs/marketing/business-front-end-page-score-matrix.${date}.txt`;

  const businessAudit = readJson(businessAuditPath);
  const lighthouseSummary = readJson(lighthouseSummaryPath);
  const scorecard = readText(scorecardPath);
  const completionAudit = readText(completionAuditPath);
  const matrix = readText(matrixPath);
  const lighthouseRoutes = Array.isArray(lighthouseSummary.routes) ? lighthouseSummary.routes : [];

  assertCheck(checks, 'business_routes_audited', businessAudit.summary?.routes >= thresholds.minRoutesAudited, `${businessAudit.summary?.routes ?? 0}/${thresholds.minRoutesAudited}`);
  assertCheck(checks, 'business_link_targets_checked', businessAudit.summary?.linkTargets >= thresholds.minLinkTargets, `${businessAudit.summary?.linkTargets ?? 0}/${thresholds.minLinkTargets}`);
  assertCheck(checks, 'business_failed_links_zero', businessAudit.summary?.failedLinks === thresholds.maxFailedLinks, String(businessAudit.summary?.failedLinks ?? 'missing'));
  assertCheck(checks, 'business_axe_routes_zero', businessAudit.summary?.routesWithAxeViolations === thresholds.maxAxeViolationRoutes, String(businessAudit.summary?.routesWithAxeViolations ?? 'missing'));
  assertCheck(checks, 'business_serious_axe_zero', (businessAudit.summary?.seriousAxeViolations ?? []).length === thresholds.maxSeriousAxeViolations, String((businessAudit.summary?.seriousAxeViolations ?? []).length));
  assertCheck(checks, 'business_overflow_zero', (businessAudit.summary?.routesWithOverflow ?? []).length === thresholds.maxOverflowRoutes, String((businessAudit.summary?.routesWithOverflow ?? []).length));

  const lighthouseMinimums = {
    performance: lighthouseRoutes.length ? minScore(lighthouseRoutes, (route) => route.scores?.performance ?? 0) : 0,
    accessibility: lighthouseRoutes.length ? minScore(lighthouseRoutes, (route) => route.scores?.accessibility ?? 0) : 0,
    bestPractices: lighthouseRoutes.length ? minScore(lighthouseRoutes, (route) => route.scores?.bestPractices ?? 0) : 0,
    seo: lighthouseRoutes.length ? minScore(lighthouseRoutes, (route) => route.scores?.seo ?? 0) : 0,
    cls: lighthouseRoutes.length ? Math.max(...lighthouseRoutes.map((route) => route.metrics?.cls ?? 1)) : 1,
    tbt: lighthouseRoutes.length ? Math.max(...lighthouseRoutes.map((route) => route.metrics?.tbt ?? 1)) : 1,
  };

  assertCheck(checks, 'lighthouse_route_count', lighthouseRoutes.length >= thresholds.minLighthouseRoutes, `${lighthouseRoutes.length}/${thresholds.minLighthouseRoutes}`);
  assertCheck(checks, 'lighthouse_performance_minimum', lighthouseMinimums.performance >= thresholds.minPerformance, String(lighthouseMinimums.performance));
  assertCheck(checks, 'lighthouse_accessibility_minimum', lighthouseMinimums.accessibility >= thresholds.minAccessibility, String(lighthouseMinimums.accessibility));
  assertCheck(checks, 'lighthouse_best_practices_minimum', lighthouseMinimums.bestPractices >= thresholds.minBestPractices, String(lighthouseMinimums.bestPractices));
  assertCheck(checks, 'lighthouse_seo_minimum', lighthouseMinimums.seo >= thresholds.minSeo, String(lighthouseMinimums.seo));
  assertCheck(checks, 'lighthouse_cls_zero', lighthouseMinimums.cls === thresholds.maxCls, String(lighthouseMinimums.cls));
  assertCheck(checks, 'lighthouse_tbt_zero', lighthouseMinimums.tbt === thresholds.maxTbt, String(lighthouseMinimums.tbt));

  assertCheck(checks, 'scorecard_claim_is_bounded', /Earned business-site posture: 94-96 \/ 100/.test(scorecard), 'scorecard must claim bounded 94-96 posture');
  assertCheck(checks, 'scorecard_has_no_100_claim', !/\b100\s*\/\s*100\b/.test(scorecard), 'scorecard must not claim 100/100');
  assertCheck(checks, 'scorecard_has_live_proof_disclaimer', /not a claim that live customer ROI, live booked-call lift, or legal sufficiency has been proven/i.test(scorecard), 'scorecard must name missing live proof');
  assertCheck(checks, 'completion_audit_has_remaining_gaps', /WHAT IS LEFT[\s\S]*Real proof capture/i.test(completionAudit), 'completion audit must keep real proof capture as remaining work');
  assertCheck(checks, 'matrix_keeps_trust_below_high_90s', /Trust and proof\s+91\b/.test(matrix) || /Trust and proof:\s*91\b/.test(scorecard), 'trust/proof must not overclaim high-90s without live proof');

  const failures = checks.filter((check) => !check.passed).map((check) => check.key);
  const report = {
    ok: failures.length === 0,
    version: 'business-site-evidence-verification-v1',
    generatedFrom: {
      date,
      businessAuditPath,
      lighthouseSummaryPath,
      scorecardPath,
      completionAuditPath,
      matrixPath,
    },
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This verifies committed local marketing evidence only. It does not run the site, rerun Lighthouse, deploy, publish, or prove live customer outcomes.',
    thresholds,
    observed: {
      auditSummary: businessAudit.summary,
      lighthouseRouteCount: lighthouseRoutes.length,
      lighthouseMinimums,
    },
    checks,
    failures,
  };

  mkdirSync(auditDir, { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) {
    throw new Error(`Business-site evidence verification failed: ${failures.join(', ')}`);
  }
  console.log(`Wrote ${outputPath.replace(`${root}/`, '')}`);
}

main();

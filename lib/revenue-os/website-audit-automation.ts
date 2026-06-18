import type { LiveSeoAudit } from '@/lib/seo-audit/run';
import type { RevenueWorkerJob } from './worker-engine';

export type WebsiteAuditEvidenceType =
  | 'http'
  | 'performance'
  | 'seo_check'
  | 'accessibility_check'
  | 'conversion_check'
  | 'brand_check';

export type WebsiteAuditEvidenceSeverity = 'low' | 'medium' | 'high';

export type WebsiteAuditEvidenceItem = {
  evidenceKey: string;
  evidenceType: WebsiteAuditEvidenceType;
  status: 'passed' | 'failed';
  severity: WebsiteAuditEvidenceSeverity;
  label: string;
  detail: string;
  sourceUrl: string;
  observedAt: string;
  raw: Record<string, unknown>;
};

export type WebsiteAuditFinding = {
  checkKey: string;
  status: 'passed' | 'failed';
  label: string;
  detail: string;
  weight: number;
  category: WebsiteAuditEvidenceType;
  severity: WebsiteAuditEvidenceSeverity;
};

export type WebsiteAuditOfferMapping = {
  recommendedOffer: 'seo_conversion_audit' | 'site_starter' | 'brand_care';
  closeProbabilityLift: number;
  reasons: string[];
  nextAction: string;
};

export type WebsiteAuditAutomation = {
  runKey: string;
  accountId: string;
  accountName: string;
  url: string;
  auditScore: number;
  findings: WebsiteAuditFinding[];
  evidence: WebsiteAuditEvidenceItem[];
  offerMapping: WebsiteAuditOfferMapping;
  workerJobs: RevenueWorkerJob[];
  persistence: {
    auditEvidence: Array<Record<string, unknown>>;
    offerMapping: Record<string, unknown>;
  };
};

function severityFromWeight(weight: number): WebsiteAuditEvidenceSeverity {
  if (weight >= 10) return 'high';
  if (weight >= 6) return 'medium';
  return 'low';
}

function severityFromPerformance(score: number | null | undefined): WebsiteAuditEvidenceSeverity {
  if (score == null) return 'medium';
  if (score < 50) return 'high';
  if (score < 75) return 'medium';
  return 'low';
}

function categoryFromCheckKey(key: string): WebsiteAuditEvidenceType {
  if (['langAttr', 'imageAlt'].includes(key)) return 'accessibility_check';
  if (['openGraph', 'twitter'].includes(key)) return 'brand_check';
  if (['metaDescription', 'singleH1'].includes(key)) return 'conversion_check';
  return 'seo_check';
}

function buildFindings(audit: LiveSeoAudit): WebsiteAuditFinding[] {
  return [
    ...audit.evidence.failedChecks.map((check) => ({
      checkKey: check.key,
      status: 'failed' as const,
      label: check.label,
      detail: check.detail,
      weight: check.weight,
      category: categoryFromCheckKey(check.key),
      severity: severityFromWeight(check.weight),
    })),
    ...audit.evidence.passedChecks.map((check) => ({
      checkKey: check.key,
      status: 'passed' as const,
      label: check.label,
      detail: check.detail,
      weight: check.weight,
      category: categoryFromCheckKey(check.key),
      severity: 'low' as const,
    })),
  ];
}

function buildOfferMapping(findings: WebsiteAuditFinding[], auditScore: number): WebsiteAuditOfferMapping {
  const failed = findings.filter((finding) => finding.status === 'failed');
  const failedKeys = new Set(failed.map((finding) => finding.checkKey));
  const brandIssue = failed.some((finding) => finding.category === 'brand_check');
  const conversionIssue = failed.some((finding) => finding.category === 'conversion_check');
  const seoIssue = failed.some((finding) => finding.category === 'seo_check');

  const recommendedOffer = conversionIssue || seoIssue
    ? 'seo_conversion_audit'
    : brandIssue
      ? 'brand_care'
      : 'site_starter';

  const reasons = failed.slice(0, 4).map((finding) => `${finding.label}: ${finding.detail}`);
  if (failedKeys.has('metaDescription')) {
    reasons.push('Meta description gap gives outreach a concrete conversion/SEO problem to cite.');
  }
  if (auditScore < 70) {
    reasons.push(`Overall audit score is ${auditScore}/100, which supports a prioritized cleanup offer.`);
  }

  return {
    recommendedOffer,
    closeProbabilityLift: Math.max(5, Math.min(35, failed.length * 5 + (auditScore < 70 ? 8 : 0))),
    reasons: [...new Set(reasons)],
    nextAction: 'Draft evidence-grounded outreach using the failed checks and offer mapping.',
  };
}

function buildEvidence(input: {
  audit: LiveSeoAudit;
  findings: WebsiteAuditFinding[];
}): WebsiteAuditEvidenceItem[] {
  const sourceUrl = input.audit.target.href;
  const observedAt = input.audit.evidence.fetchedAt;
  const performance = input.audit.evidence.performance;

  return [
    {
      evidenceKey: 'http-status',
      evidenceType: 'http',
      status: input.audit.evidence.httpStatus >= 200 && input.audit.evidence.httpStatus < 400 ? 'passed' : 'failed',
      severity: input.audit.evidence.httpStatus >= 400 ? 'high' : 'low',
      label: 'HTTP reachability',
      detail: `Fetched ${input.audit.evidence.finalUrl} with status ${input.audit.evidence.httpStatus}`,
      sourceUrl,
      observedAt,
      raw: {
        httpStatus: input.audit.evidence.httpStatus,
        finalUrl: input.audit.evidence.finalUrl,
        bytesRead: input.audit.evidence.bytesRead,
      },
    },
    {
      evidenceKey: 'mobile-performance',
      evidenceType: 'performance',
      status: performance?.score != null && performance.score >= 75 ? 'passed' : 'failed',
      severity: severityFromPerformance(performance?.score),
      label: 'Mobile performance',
      detail: performance?.score == null
        ? 'PageSpeed evidence unavailable; keep as medium-risk until measured.'
        : `Mobile performance score ${performance.score}/100`,
      sourceUrl,
      observedAt,
      raw: {
        performance,
      },
    },
    ...input.findings.map((finding) => ({
      evidenceKey: finding.checkKey,
      evidenceType: finding.category,
      status: finding.status,
      severity: finding.severity,
      label: finding.label,
      detail: finding.detail,
      sourceUrl,
      observedAt,
      raw: {
        weight: finding.weight,
        checkKey: finding.checkKey,
      },
    })),
  ];
}

function buildWorkerJobs(input: {
  runKey: string;
  url: string;
  observedAt: string;
}): RevenueWorkerJob[] {
  return [
    {
      id: `${input.runKey}-audit-enrichment`,
      kind: 'enrichment',
      target: input.url,
      priority: 82,
      requestedUnits: 1,
      rateLimitPerMinute: 30,
      attemptsRemaining: 3,
      status: 'queued',
      nextRunAt: input.observedAt,
      result: {},
      lastError: null,
    },
  ];
}

export function buildRealWebsiteAuditAutomation(input: {
  runKey: string;
  accountId: string;
  accountName: string;
  audit: LiveSeoAudit;
}): WebsiteAuditAutomation {
  const findings = buildFindings(input.audit);
  const evidence = buildEvidence({ audit: input.audit, findings });
  const offerMapping = buildOfferMapping(findings, input.audit.score);
  const workerJobs = buildWorkerJobs({
    runKey: input.runKey,
    url: input.audit.target.href,
    observedAt: input.audit.evidence.fetchedAt,
  });

  return {
    runKey: input.runKey,
    accountId: input.accountId,
    accountName: input.accountName,
    url: input.audit.target.href,
    auditScore: input.audit.score,
    findings,
    evidence,
    offerMapping,
    workerJobs,
    persistence: {
      auditEvidence: evidence.map((item) => ({
        account_id: input.accountId,
        run_key: input.runKey,
        source_url: item.sourceUrl,
        evidence_key: item.evidenceKey,
        evidence_type: item.evidenceType,
        status: item.status,
        severity: item.severity,
        label: item.label,
        detail: item.detail,
        observed_at: item.observedAt,
        raw: item.raw,
        metadata: {
          accountName: input.accountName,
          auditScore: input.audit.score,
        },
      })),
      offerMapping: {
        account_id: input.accountId,
        run_key: input.runKey,
        source_url: input.audit.target.href,
        audit_score: input.audit.score,
        recommended_offer: offerMapping.recommendedOffer,
        close_probability_lift: offerMapping.closeProbabilityLift,
        reasons: offerMapping.reasons,
        next_action: offerMapping.nextAction,
        metadata: {
          accountName: input.accountName,
          failedFindings: findings.filter((finding) => finding.status === 'failed').length,
        },
      },
    },
  };
}

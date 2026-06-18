export type ConsentBasis =
  | 'legitimate_interest'
  | 'consent'
  | 'contract'
  | 'manual_review'
  | 'do_not_contact';

export type RevenueComplianceContact = {
  email?: string | null;
  source: string;
  sourceUrl?: string | null;
  consentBasis: ConsentBasis;
  businessContext: string;
  unsubscribeUrl?: string | null;
  retentionDays: number;
  suppressed?: boolean;
};

export type PrivacyRequestType = 'export' | 'delete' | 'suppress' | 'anonymize';

export type RevenuePrivacyRequest = {
  requestType: PrivacyRequestType;
  subjectEmail: string;
  status: 'received' | 'verified' | 'completed' | 'rejected';
  dueAt: string;
};

const RISKY_PERSONAL_DOMAINS = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']);

function emailDomain(email?: string | null) {
  return email?.split('@')[1]?.trim().toLowerCase() ?? null;
}

function daysUntil(dateIso: string) {
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export function buildRevenueComplianceDecision(contact: RevenueComplianceContact) {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const controls: string[] = [];
  const domain = emailDomain(contact.email);

  if (contact.suppressed || contact.consentBasis === 'do_not_contact') {
    blockers.push('contact is suppressed or marked do not contact');
  }
  if (!contact.source || contact.source === 'unknown') blockers.push('source provenance is required');
  else controls.push('source provenance stored');

  if (!contact.businessContext || contact.businessContext.trim().length < 12) {
    blockers.push('business-context reason is required before outreach');
  } else {
    controls.push('business-context reason documented');
  }

  if (!contact.unsubscribeUrl) blockers.push('unsubscribe URL is required before outreach');
  else controls.push('unsubscribe path available');

  if (contact.retentionDays <= 0 || contact.retentionDays > 730) {
    warnings.push('retention period should be between 1 and 730 days for outreach records');
  } else {
    controls.push('retention period configured');
  }

  if (domain && RISKY_PERSONAL_DOMAINS.has(domain) && contact.consentBasis !== 'consent') {
    warnings.push('personal mailbox should require consent or manual approval');
  }

  const score = Math.max(0, Math.min(100, 100 - blockers.length * 22 - warnings.length * 8));

  return {
    allowed: blockers.length === 0,
    score,
    consentBasis: contact.consentBasis,
    source: contact.source,
    domain,
    blockers,
    warnings,
    controls,
    retentionDeleteAt: new Date(Date.now() + Math.max(1, contact.retentionDays) * 86_400_000).toISOString(),
  };
}

export function buildRevenueGovernanceReport(input: {
  tenantKey: string;
  contacts: RevenueComplianceContact[];
  privacyRequests: RevenuePrivacyRequest[];
  auditEvents: number;
}) {
  const decisions = input.contacts.map(buildRevenueComplianceDecision);
  const allowed = decisions.filter((decision) => decision.allowed).length;
  const blocked = decisions.length - allowed;
  const overduePrivacyRequests = input.privacyRequests.filter((request) =>
    request.status !== 'completed' && daysUntil(request.dueAt) < 0,
  );
  const dueSoonPrivacyRequests = input.privacyRequests.filter((request) =>
    request.status !== 'completed' && daysUntil(request.dueAt) >= 0 && daysUntil(request.dueAt) <= 7,
  );
  const sourceCoverage = decisions.length
    ? Math.round((decisions.filter((decision) => Boolean(decision.source && decision.source !== 'unknown')).length / decisions.length) * 100)
    : 0;
  const averageScore = decisions.length
    ? Math.round(decisions.reduce((sum, decision) => sum + decision.score, 0) / decisions.length)
    : 0;
  const blockers = [
    ...new Set(decisions.flatMap((decision) => decision.blockers)),
    ...overduePrivacyRequests.map((request) => `${request.requestType} request for ${request.subjectEmail} is overdue`),
  ];
  const warnings = [
    ...new Set(decisions.flatMap((decision) => decision.warnings)),
    ...dueSoonPrivacyRequests.map((request) => `${request.requestType} request for ${request.subjectEmail} is due soon`),
  ];

  return {
    tenantKey: input.tenantKey,
    status: blockers.length === 0 ? 'ready' : 'blocked',
    score: Math.max(0, Math.min(100, averageScore - overduePrivacyRequests.length * 12 - (input.auditEvents === 0 ? 10 : 0))),
    sourceCoverage,
    allowed,
    blocked,
    privacyRequestsOpen: input.privacyRequests.filter((request) => request.status !== 'completed').length,
    auditEvents: input.auditEvents,
    blockers,
    warnings,
    controls: [
      'consent basis tracked',
      'source provenance tracked',
      'retention policy tracked',
      'privacy request workflow tracked',
      'tenant audit log evidence tracked',
    ],
    decisions,
  };
}

export function buildPrivacyWorkflow(input: {
  requestType: PrivacyRequestType;
  subjectEmail: string;
  receivedAt?: string;
}) {
  const receivedAt = input.receivedAt ?? new Date().toISOString();
  const dueAt = new Date(new Date(receivedAt).getTime() + 30 * 86_400_000).toISOString();
  return {
    requestType: input.requestType,
    subjectEmail: input.subjectEmail.toLowerCase(),
    status: 'received' as const,
    dueAt,
    requiredSteps: [
      'verify requester identity',
      input.requestType === 'export' ? 'prepare data export' : 'identify matching records',
      input.requestType === 'suppress' ? 'write suppression event' : 'record completion evidence',
      'log governance audit event',
    ],
  };
}

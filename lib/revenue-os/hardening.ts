export type RevenueOsProductionReadinessInput = {
  cronSecretConfigured: boolean;
  emailDispatchMode: 'manual_review' | 'automatic' | 'disabled';
  jobApplicationMode: 'manual_review' | 'automatic' | 'disabled';
  hasSuppressionChecks: boolean;
  hasE2eCoverage: boolean;
  hasBuildVerification: boolean;
};

export type RevenueOsProductionReadiness = {
  ready: boolean;
  score: number;
  blockers: string[];
  warnings: string[];
  controls: string[];
};

export type RevenueOsProductionGateInput = {
  env: Record<string, string | undefined>;
  liveConnectorsEnabled: boolean;
  packetDownloadsEnabled: boolean;
  operatorSavedViewsEnabled: boolean;
  e2ePassing: boolean;
  buildPassing: boolean;
};

export type RevenueOsSecretStatus = {
  configured: boolean;
  redacted: string | null;
};

export function validateRevenueOsProductionReadiness(
  input: RevenueOsProductionReadinessInput,
): RevenueOsProductionReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const controls: string[] = [];

  if (!input.cronSecretConfigured) blockers.push('CRON_SECRET must be configured before enabling scheduled runs.');
  else controls.push('Cron endpoint is bearer-token protected.');

  if (input.emailDispatchMode === 'automatic') {
    blockers.push('automatic email dispatch is disabled until unsubscribe/suppression/final-review controls are live.');
  } else if (input.emailDispatchMode === 'manual_review') {
    controls.push('Email outreach is constrained to manual review.');
  } else {
    warnings.push('Email dispatch is disabled; revenue motion depends on manual export.');
  }

  if (input.jobApplicationMode === 'automatic') {
    blockers.push('job applications cannot run automatically; final submission and sensitive answers require manual approval.');
  } else if (input.jobApplicationMode === 'manual_review') {
    controls.push('Job applications are ranked and prepared for manual submission.');
  } else {
    warnings.push('Job application execution is disabled.');
  }

  if (!input.hasSuppressionChecks) blockers.push('Suppression checks must run before any outreach queue is considered send-ready.');
  else controls.push('Suppression checks are part of email preparation.');

  if (!input.hasE2eCoverage) warnings.push('Launch-critical dashboard/API paths need E2E coverage.');
  else controls.push('Revenue OS dashboard and API boundaries have E2E coverage.');

  if (!input.hasBuildVerification) warnings.push('Production build verification has not passed.');
  else controls.push('Production build verification is part of the release gate.');

  const score = Math.max(
    0,
    Math.min(100, 100 - blockers.length * 18 - warnings.length * 7),
  );

  return {
    ready: blockers.length === 0 && score >= 85,
    score,
    blockers,
    warnings,
    controls,
  };
}

function redactSecret(value: string | undefined): string | null {
  if (!value) return null;
  if (value.length <= 8) return `${value.slice(0, 2)}...${value.slice(-2)}`;
  return `${value.slice(0, 4)}...${value.slice(-3)}`;
}

function secretStatus(env: Record<string, string | undefined>, key: string): RevenueOsSecretStatus {
  const value = env[key];
  return {
    configured: Boolean(value),
    redacted: redactSecret(value),
  };
}

export function buildRevenueOsProductionGate(input: RevenueOsProductionGateInput) {
  const secrets = {
    CRON_SECRET: secretStatus(input.env, 'CRON_SECRET'),
    RESEND_API_KEY: secretStatus(input.env, 'RESEND_API_KEY'),
    GOOGLE_PLACES_API_KEY: secretStatus(input.env, 'GOOGLE_PLACES_API_KEY'),
    EXA_API_KEY: secretStatus(input.env, 'EXA_API_KEY'),
  };
  const blockers: string[] = [];
  const warnings: string[] = [];
  const controls: string[] = [
    'manual-review email sending is enforced before provider dispatch.',
    'job applications remain final-click/manual submission only.',
    'suppression checks are required before outreach approval.',
  ];

  if (!secrets.CRON_SECRET.configured) blockers.push('CRON_SECRET is required for scheduled Revenue OS runs.');
  if (!input.buildPassing) blockers.push('Production build must pass before launch.');
  if (!input.e2ePassing) blockers.push('Revenue OS E2E suite must pass before launch.');
  if (!input.packetDownloadsEnabled) warnings.push('Application packet downloads are disabled.');
  if (!input.operatorSavedViewsEnabled) warnings.push('Operator saved views are disabled.');

  if (input.liveConnectorsEnabled) {
    if (!secrets.GOOGLE_PLACES_API_KEY.configured) {
      blockers.push('GOOGLE_PLACES_API_KEY is required before live business lead connectors run.');
    }
    if (!secrets.EXA_API_KEY.configured) {
      warnings.push('EXA_API_KEY is missing; company/contact enrichment depth will be limited.');
    }
  } else {
    warnings.push('Live connectors are disabled; only proof/sample connector runs are available.');
  }

  const score = Math.max(0, Math.min(100, 100 - blockers.length * 16 - warnings.length * 6));

  return {
    ready: blockers.length === 0 && score >= 85,
    score,
    blockers,
    warnings,
    controls,
    secrets,
  };
}

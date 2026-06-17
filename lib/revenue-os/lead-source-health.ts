export type LeadProviderKey = 'google_places' | 'serpapi' | 'exa';

export type LeadSourceCredentialHealth = {
  providers: Record<LeadProviderKey, {
    configured: boolean;
    envVar: string;
    redacted: string | null;
    dailyBudgetUsd: number;
    costPerLeadUsd: number;
  }>;
  readyProviders: number;
  warnings: string[];
};

export type LeadSourceRunDecision = {
  provider: LeadProviderKey | string;
  allowed: boolean;
  reason: 'ok' | 'missing_credentials' | 'quota_exhausted' | 'budget_capped' | 'zero_request';
  requestedLeadCount: number;
  allowedLeadCount: number;
  remainingQuota: number;
  estimatedCostUsd: number;
  dailyBudgetUsd: number;
};

const PROVIDERS: Record<LeadProviderKey, { envVar: string; costPerLeadUsd: number }> = {
  google_places: { envVar: 'GOOGLE_PLACES_API_KEY', costPerLeadUsd: 0.032 },
  serpapi: { envVar: 'SERPAPI_API_KEY', costPerLeadUsd: 0.02 },
  exa: { envVar: 'EXA_API_KEY', costPerLeadUsd: 0.01 },
};

function redactSecret(value: string | null | undefined) {
  const secret = value?.trim();
  if (!secret) return null;
  if (secret.length <= 8) return `${secret.slice(0, 2)}…${secret.slice(-2)}`;
  return `${secret.slice(0, 4)}…${secret.slice(-4)}`;
}

function cents(value: number) {
  return Math.round(value * 100) / 100;
}

export function buildLeadSourceCredentialHealth(input: {
  env?: Record<string, string | undefined>;
  dailyBudgetUsd?: number;
} = {}): LeadSourceCredentialHealth {
  const env = input.env ?? process.env;
  const dailyBudgetUsd = Math.max(0, input.dailyBudgetUsd ?? Number(process.env.REVENUE_LEAD_DAILY_BUDGET_USD ?? 15));
  const warnings: string[] = [];
  const providers = Object.fromEntries(
    Object.entries(PROVIDERS).map(([provider, config]) => {
      const value = env[config.envVar];
      const configured = Boolean(value?.trim());
      if (!configured) warnings.push(`${config.envVar} is not configured; ${provider} live runs are disabled.`);
      return [
        provider,
        {
          configured,
          envVar: config.envVar,
          redacted: redactSecret(value),
          dailyBudgetUsd,
          costPerLeadUsd: config.costPerLeadUsd,
        },
      ];
    }),
  ) as LeadSourceCredentialHealth['providers'];

  return {
    providers,
    readyProviders: Object.values(providers).filter((provider) => provider.configured).length,
    warnings,
  };
}

export function buildLeadSourceRunDecision(input: {
  provider: LeadProviderKey | string;
  requested: number;
  alreadyRunToday: number;
  dailyLimit: number;
  costPerLeadUsd: number;
  dailyBudgetUsd: number;
  providerConfigured: boolean;
}): LeadSourceRunDecision {
  const requestedLeadCount = Math.max(0, Math.round(input.requested));
  const remainingQuota = Math.max(0, Math.round(input.dailyLimit) - Math.max(0, Math.round(input.alreadyRunToday)));
  if (!input.providerConfigured) {
    return {
      provider: input.provider,
      allowed: false,
      reason: 'missing_credentials',
      requestedLeadCount,
      allowedLeadCount: 0,
      remainingQuota,
      estimatedCostUsd: 0,
      dailyBudgetUsd: cents(input.dailyBudgetUsd),
    };
  }
  if (requestedLeadCount === 0) {
    return {
      provider: input.provider,
      allowed: false,
      reason: 'zero_request',
      requestedLeadCount,
      allowedLeadCount: 0,
      remainingQuota,
      estimatedCostUsd: 0,
      dailyBudgetUsd: cents(input.dailyBudgetUsd),
    };
  }
  if (remainingQuota <= 0) {
    return {
      provider: input.provider,
      allowed: false,
      reason: 'quota_exhausted',
      requestedLeadCount,
      allowedLeadCount: 0,
      remainingQuota,
      estimatedCostUsd: 0,
      dailyBudgetUsd: cents(input.dailyBudgetUsd),
    };
  }

  const quotaAllowed = Math.min(requestedLeadCount, remainingQuota);
  const budgetAllowed = input.costPerLeadUsd > 0
    ? Math.floor(Math.max(0, input.dailyBudgetUsd) / input.costPerLeadUsd)
    : quotaAllowed;
  const allowedLeadCount = Math.max(0, Math.min(quotaAllowed, budgetAllowed));
  const estimatedCostUsd = cents(allowedLeadCount * input.costPerLeadUsd);

  return {
    provider: input.provider,
    allowed: allowedLeadCount > 0,
    reason: allowedLeadCount < quotaAllowed ? 'budget_capped' : 'ok',
    requestedLeadCount,
    allowedLeadCount,
    remainingQuota,
    estimatedCostUsd,
    dailyBudgetUsd: cents(input.dailyBudgetUsd),
  };
}

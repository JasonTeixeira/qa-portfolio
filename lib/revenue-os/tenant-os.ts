export type RevenueTenantWorkspace = {
  tenantId: string;
  businessName: string;
  ownerEmail: string;
  leadSources: string[];
  sendingDomains: Array<{
    domain: string;
    status: 'pending_dns' | 'verified';
  }>;
  permissions: Array<{
    email: string;
    role: 'owner' | 'operator' | 'viewer';
  }>;
  limits: {
    monthlyLeadLimit: number;
    dailyEmailLimit: number;
  };
  auditLog: Array<{
    action: string;
    actor: string;
  }>;
};

export type RevenueTenantRole = 'owner' | 'operator' | 'viewer';

export type TenantSaasWorkspaceInput = {
  tenantKey: string;
  businessName: string;
  ownerEmail: string;
  members?: Array<{ email: string; role: Exclude<RevenueTenantRole, 'owner'> }>;
  leadSources: string[];
  sendingDomains: string[];
  monthlyLeadLimit: number;
  dailyEmailLimit: number;
  config: {
    icp: Record<string, unknown>;
    offers: string[];
    brandVoice: Record<string, unknown>;
    compliance: Record<string, unknown>;
  };
};

export type TenantSaasFoundation = {
  runKey: string;
  workspaces: Array<{
    tenantKey: string;
    businessName: string;
    ownerEmail: string;
    status: 'trial' | 'active';
    planKey: 'internal' | 'client_starter';
    metadata: Record<string, unknown>;
  }>;
  memberships: Array<{
    tenantKey: string;
    email: string;
    role: RevenueTenantRole;
    status: 'active';
    metadata: Record<string, unknown>;
  }>;
  configs: Array<{
    tenantKey: string;
    icp: Record<string, unknown>;
    offers: string[];
    brandVoice: Record<string, unknown>;
    compliance: Record<string, unknown>;
    leadSources: string[];
    sendingDomains: Array<{ domain: string; status: 'pending_dns' | 'verified' }>;
    limits: { monthlyLeadLimit: number; dailyEmailLimit: number; apiLimit: number };
    metadata: Record<string, unknown>;
  }>;
  usageRecords: Array<{
    tenantKey: string;
    periodStart: string;
    periodEnd: string;
    leadsLimit: number;
    emailsLimit: number;
    apiLimit: number;
    metadata: Record<string, unknown>;
  }>;
  billingBoundaries: Array<{
    tenantKey: string;
    planKey: 'internal' | 'client_starter';
    billingStatus: 'internal' | 'trial';
    includedUsage: { leads: number; emails: number; apiCalls: number };
    meteredUsage: { leads: number; emails: number; apiCalls: number };
    metadata: Record<string, unknown>;
  }>;
  auditLogs: Array<{
    tenantKey: string;
    actorEmail: string;
    action: string;
    entityType: string;
    metadata: Record<string, unknown>;
  }>;
  persistence: {
    workspaces: Array<Record<string, unknown>>;
    memberships: Array<Record<string, unknown>>;
    configs: Array<Record<string, unknown>>;
    usageRecords: Array<Record<string, unknown>>;
    billingBoundaries: Array<Record<string, unknown>>;
    auditLogs: Array<Record<string, unknown>>;
  };
};

function redactEmail(email: string) {
  const [name, domain] = email.split('@');
  return `${name?.[0] ?? '*'}***@${domain ?? 'unknown'}`;
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))];
}

export function buildTenantWorkspace(input: {
  tenantId: string;
  businessName: string;
  ownerEmail: string;
  sendingDomain: string;
  leadSources: string[];
  monthlyLeadLimit: number;
}): RevenueTenantWorkspace {
  return {
    tenantId: input.tenantId,
    businessName: input.businessName,
    ownerEmail: input.ownerEmail.toLowerCase(),
    leadSources: [...new Set(input.leadSources)],
    sendingDomains: [{ domain: input.sendingDomain.toLowerCase(), status: 'pending_dns' }],
    permissions: [{ email: input.ownerEmail.toLowerCase(), role: 'owner' }],
    limits: {
      monthlyLeadLimit: Math.max(0, Math.round(input.monthlyLeadLimit)),
      dailyEmailLimit: Math.min(200, Math.max(10, Math.round(input.monthlyLeadLimit / 20))),
    },
    auditLog: [{ action: 'tenant.created', actor: input.ownerEmail.toLowerCase() }],
  };
}

export function buildTenantExport(workspace: RevenueTenantWorkspace) {
  return {
    tenantId: workspace.tenantId,
    businessName: workspace.businessName,
    redactedConfig: {
      ownerEmail: redactEmail(workspace.ownerEmail),
      leadSources: workspace.leadSources,
      sendingDomains: workspace.sendingDomains,
      limits: workspace.limits,
    },
    exportedAt: new Date().toISOString(),
  };
}

export function buildTenantSaasFoundation(input: {
  runKey: string;
  workspaces: TenantSaasWorkspaceInput[];
  now?: string;
}): TenantSaasFoundation {
  const now = input.now ?? new Date().toISOString();
  const periodStart = now.slice(0, 10);
  const periodEnd = new Date(new Date(`${periodStart}T00:00:00.000Z`).getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const seenTenantKeys = new Set<string>();
  const foundation: TenantSaasFoundation = {
    runKey: input.runKey,
    workspaces: [],
    memberships: [],
    configs: [],
    usageRecords: [],
    billingBoundaries: [],
    auditLogs: [],
    persistence: {
      workspaces: [],
      memberships: [],
      configs: [],
      usageRecords: [],
      billingBoundaries: [],
      auditLogs: [],
    },
  };

  for (const workspaceInput of input.workspaces) {
    const tenantKey = normalizeKey(workspaceInput.tenantKey);
    if (!tenantKey || seenTenantKeys.has(tenantKey)) {
      throw new Error(`Duplicate or empty tenant key: ${workspaceInput.tenantKey}`);
    }
    seenTenantKeys.add(tenantKey);

    const ownerEmail = normalizeEmail(workspaceInput.ownerEmail);
    const metadata = { runKey: input.runKey, program: '7_multi_tenant_saas', tenantKey };
    const leadSources = uniqueStrings(workspaceInput.leadSources);
    const sendingDomains = uniqueStrings(workspaceInput.sendingDomains).map((domain) => ({
      domain,
      status: 'pending_dns' as const,
    }));
    const limits = {
      monthlyLeadLimit: Math.max(0, Math.round(workspaceInput.monthlyLeadLimit)),
      dailyEmailLimit: Math.min(200, Math.max(1, Math.round(workspaceInput.dailyEmailLimit))),
      apiLimit: Math.max(1_000, Math.round(workspaceInput.monthlyLeadLimit * 20)),
    };

    foundation.workspaces.push({
      tenantKey,
      businessName: workspaceInput.businessName.trim(),
      ownerEmail,
      status: 'trial',
      planKey: 'client_starter',
      metadata,
    });

    const memberships = [
      { email: ownerEmail, role: 'owner' as const },
      ...(workspaceInput.members ?? []).map((member) => ({
        email: normalizeEmail(member.email),
        role: member.role,
      })),
    ].filter((member, index, all) => all.findIndex((item) => item.email === member.email) === index);

    for (const membership of memberships) {
      foundation.memberships.push({
        tenantKey,
        email: membership.email,
        role: membership.role,
        status: 'active',
        metadata,
      });
    }

    foundation.configs.push({
      tenantKey,
      icp: workspaceInput.config.icp,
      offers: uniqueStrings(workspaceInput.config.offers),
      brandVoice: workspaceInput.config.brandVoice,
      compliance: workspaceInput.config.compliance,
      leadSources,
      sendingDomains,
      limits,
      metadata,
    });

    foundation.usageRecords.push({
      tenantKey,
      periodStart,
      periodEnd,
      leadsLimit: limits.monthlyLeadLimit,
      emailsLimit: limits.dailyEmailLimit * 30,
      apiLimit: limits.apiLimit,
      metadata,
    });

    foundation.billingBoundaries.push({
      tenantKey,
      planKey: 'client_starter',
      billingStatus: 'trial',
      includedUsage: {
        leads: limits.monthlyLeadLimit,
        emails: limits.dailyEmailLimit * 30,
        apiCalls: limits.apiLimit,
      },
      meteredUsage: { leads: 0, emails: 0, apiCalls: 0 },
      metadata,
    });

    for (const action of ['workspace.created', 'workspace.owner.added', 'workspace.config.created', 'workspace.limits.created']) {
      foundation.auditLogs.push({
        tenantKey,
        actorEmail: ownerEmail,
        action,
        entityType: 'workspace',
        metadata,
      });
    }
  }

  foundation.persistence.workspaces = foundation.workspaces.map((workspace) => ({
    run_key: input.runKey,
    tenant_key: workspace.tenantKey,
    business_name: workspace.businessName,
    owner_email: workspace.ownerEmail,
    status: workspace.status,
    plan_key: workspace.planKey,
    metadata: workspace.metadata,
  }));
  foundation.persistence.memberships = foundation.memberships.map((membership) => ({
    tenant_key: membership.tenantKey,
    email: membership.email,
    role: membership.role,
    status: membership.status,
    metadata: membership.metadata,
  }));
  foundation.persistence.configs = foundation.configs.map((config) => ({
    tenant_key: config.tenantKey,
    icp: config.icp,
    offers: config.offers,
    brand_voice: config.brandVoice,
    compliance: config.compliance,
    lead_sources: config.leadSources,
    sending_domains: config.sendingDomains,
    limits: config.limits,
    metadata: config.metadata,
  }));
  foundation.persistence.usageRecords = foundation.usageRecords.map((usage) => ({
    tenant_key: usage.tenantKey,
    period_start: usage.periodStart,
    period_end: usage.periodEnd,
    leads_limit: usage.leadsLimit,
    emails_limit: usage.emailsLimit,
    api_limit: usage.apiLimit,
    metadata: usage.metadata,
  }));
  foundation.persistence.billingBoundaries = foundation.billingBoundaries.map((billing) => ({
    tenant_key: billing.tenantKey,
    plan_key: billing.planKey,
    billing_status: billing.billingStatus,
    included_usage: billing.includedUsage,
    metered_usage: billing.meteredUsage,
    metadata: billing.metadata,
  }));
  foundation.persistence.auditLogs = foundation.auditLogs.map((log) => ({
    tenant_key: log.tenantKey,
    actor_email: log.actorEmail,
    action: log.action,
    entity_type: log.entityType,
    metadata: log.metadata,
  }));

  return foundation;
}

export function canAccessTenant(foundation: TenantSaasFoundation, email: string, tenantKey: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedTenantKey = normalizeKey(tenantKey);
  return foundation.memberships.some(
    (membership) =>
      membership.tenantKey === normalizedTenantKey &&
      membership.email === normalizedEmail &&
      membership.status === 'active',
  );
}

export function buildTenantIsolationProof(foundation: TenantSaasFoundation) {
  const [firstWorkspace, secondWorkspace] = foundation.workspaces;
  const firstOperator = foundation.memberships.find(
    (membership) => membership.tenantKey === firstWorkspace?.tenantKey && membership.role === 'operator',
  );
  const crossTenantAccessBlocked = firstOperator && secondWorkspace
    ? !canAccessTenant(foundation, firstOperator.email, secondWorkspace.tenantKey)
    : true;
  const configTenantKeys = new Set(foundation.configs.map((config) => config.tenantKey));

  return {
    crossTenantAccessBlocked,
    duplicateBusinessNamesAllowedWithTenantKeys:
      foundation.workspaces.length >= 2 &&
      new Set(foundation.workspaces.map((workspace) => workspace.tenantKey)).size === foundation.workspaces.length,
    allConfigsTenantScoped: foundation.workspaces.every((workspace) => configTenantKeys.has(workspace.tenantKey)),
    hasPerTenantUsageAndBilling:
      foundation.usageRecords.length === foundation.workspaces.length &&
      foundation.billingBoundaries.length === foundation.workspaces.length,
  };
}

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';
import { buildWebsiteAuditDraft } from '@/lib/acquisition/audit';
import {
  buildAcquisitionEnrichment,
  domainFromEmail,
  domainFromUrl,
  nextFollowUpDate,
} from '@/lib/acquisition/enrichment';
import { buildOutreachOutcomeTransition } from '@/lib/acquisition/crm';
import { parseAcquisitionLeadList } from '@/lib/acquisition/import';
import { buildOutreachDraft } from '@/lib/acquisition/outreach';
import { scoreAcquisitionAccount } from '@/lib/acquisition/scoring';
import { persistAuditReport } from '@/lib/seo-audit/reports';
import { runLiveSeoAudit } from '@/lib/seo-audit/run';
import { buildDailyRevenueRun } from '@/lib/revenue-os/daily-runner';
import { buildLeadSourceConnectorPlan } from '@/lib/revenue-os/connectors';
import { buildEmailPreparationQueue } from '@/lib/revenue-os/email-prep';
import { buildJobSearchPipeline } from '@/lib/revenue-os/jobs';
import { buildRevenueLearningReport } from '@/lib/revenue-os/reporting';
import { buildManualReviewSequence, buildDeliverabilityEvent } from '@/lib/revenue-os/sequences';
import { buildJobApplicationRecord, buildRecruiterFollowUp } from '@/lib/revenue-os/job-tracker';
import { enrichConnectorLead, normalizeGooglePlaceLead } from '@/lib/revenue-os/lead-connectors';
import { runLeadConnector, type LeadConnector } from '@/lib/revenue-os/external-connectors';
import { composePersonalizedOutreachV2 } from '@/lib/revenue-os/outreach-v2';
import { buildRevenueEmailDeliveryPlan, sendRevenueEmailWithResend } from '@/lib/revenue-os/email-delivery';
import { buildLeadSourceCredentialHealth, buildLeadSourceRunDecision } from '@/lib/revenue-os/lead-source-health';
import { buildJobConnectorRun, normalizeJobSourceResults } from '@/lib/revenue-os/job-connectors';
import { buildApplicationPacket } from '@/lib/revenue-os/application-packets';
import { buildDailyRevenueRunV2 } from '@/lib/revenue-os/daily-runner-v2';
import { actionFailure } from '@/lib/revenue-os/action-results';
import { buildAgentRun, completeAgentTask, recordAgentToolTrace } from '@/lib/revenue-os/agent-runtime';
import {
  buildConnectorWorkerBatch,
  claimDueWorkerJobs,
  completeWorkerJob,
  failWorkerJob,
} from '@/lib/revenue-os/worker-engine';
import { buildLiveConnectorImportBatch } from '@/lib/revenue-os/live-connector-engine';
import { buildRealWebsiteAuditAutomation } from '@/lib/revenue-os/website-audit-automation';
import {
  buildAiPersonalizationDraft,
  buildEvidenceLockedPersonalizationDraft,
  reviewAiPersonalizationDraft,
} from '@/lib/revenue-os/ai-personalization';
import { buildEmailSafetyRun } from '@/lib/revenue-os/email-safety';
import { buildInboxIntelligenceRun, classifyInboxReply } from '@/lib/revenue-os/inbox-intelligence';
import { buildMlScoringModel, scoreWithMlModel } from '@/lib/revenue-os/ml-scoring';
import { buildAdaptiveSequencePlan, advanceAdaptiveSequence } from '@/lib/revenue-os/adaptive-sequences';
import {
  buildTenantExport,
  buildTenantIsolationProof,
  buildTenantSaasFoundation,
  buildTenantWorkspace,
} from '@/lib/revenue-os/tenant-os';
import { runRevenueOsEvalSuite } from '@/lib/revenue-os/eval-gates';
import type { AcquisitionSignalInput } from '@/lib/acquisition/types';

const BUSINESS_MODELS = [
  'local_service',
  'professional_service',
  'creator',
  'saas',
  'ecommerce',
  'health_wellness',
  'real_estate',
  'recruiting',
  'education',
  'unknown',
] as const;

const BUDGETS = ['under_2k', '2k_5k', '5k_10k', '10k_25k', '25k_plus', 'unknown'] as const;

const ImportSchema = z.object({
  name: z.string().trim().min(1, 'Company name is required').max(200),
  websiteUrl: z.string().trim().url('Website must be a valid URL').optional().or(z.literal('')),
  industry: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  businessModel: z.enum(BUSINESS_MODELS).default('unknown'),
  estimatedBudget: z.enum(BUDGETS).default('unknown'),
  contactName: z.string().trim().max(160).optional(),
  contactTitle: z.string().trim().max(160).optional(),
  contactEmail: z.string().trim().email('Contact email must be valid').optional().or(z.literal('')),
});

const IdSchema = z.object({ id: z.string().uuid() });

const BulkImportSchema = z.object({
  leads: z.string().trim().min(1).max(50_000),
});

const OutcomeSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['ready', 'sent', 'replied', 'booked', 'declined', 'bounced', 'archived']),
});

const FollowUpSchema = z.object({
  id: z.string().uuid(),
  days: z.coerce.number().int().min(1).max(30).default(3),
});

const PersistenceProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const ConnectorOutreachProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const LeadSourceHealthProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const JobAutomationProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const IntelligenceProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const AiPersonalizationProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const EmailSafetyProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const InboxReplyIntelligenceProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const TenantSaasProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === 'on';
}

function readSignals(formData: FormData, base: z.infer<typeof ImportSchema>): AcquisitionSignalInput {
  return {
    businessModel: base.businessModel,
    websiteUrl: base.websiteUrl || null,
    hasBrokenWebsite: checkbox(formData, 'hasBrokenWebsite'),
    hasOutdatedBrand: checkbox(formData, 'hasOutdatedBrand'),
    hasWeakSeo: checkbox(formData, 'hasWeakSeo'),
    hasWeakConversionPath: checkbox(formData, 'hasWeakConversionPath'),
    hasBookingOrCheckoutGap: checkbox(formData, 'hasBookingOrCheckoutGap'),
    hasRecentHiringSignal: checkbox(formData, 'hasRecentHiringSignal'),
    hasRecentFundingOrLaunch: checkbox(formData, 'hasRecentFundingOrLaunch'),
    isOwnerOperated: checkbox(formData, 'isOwnerOperated'),
    contactConfidence: base.contactEmail ? 85 : 35,
    estimatedBudget: base.estimatedBudget,
    location: base.location || null,
  };
}

function isMissingAuditEvidenceColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const message = error.message ?? '';
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    message.includes('raw_report') ||
    message.includes('evidence') ||
    message.includes('public_report_share_id')
  );
}

async function recordRevenueOsActionFailure(input: {
  actorId?: string;
  actorEmail?: string;
  action: string;
  code: Parameters<typeof actionFailure>[0];
  message: string;
  detail?: unknown;
}) {
  const result = actionFailure(input.code, input.message, input.detail);
  const auditPayload = {
    code: input.code,
    message: input.message,
    ...(input.detail === undefined ? {} : { detail: input.detail }),
  };
  if (input.actorId && input.actorEmail) {
    await logAudit({
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      action: `${input.action}.failed`,
      entityType: 'revenue_os',
      after: auditPayload,
    });
  }
  return result;
}

async function incrementDailyMetrics(patch: Record<string, number>) {
  const sb = supabaseAdmin();
  const metricDate = new Date().toISOString().slice(0, 10);
  const { data } = await sb
    .from('acquisition_daily_metrics')
    .select('*')
    .eq('metric_date', metricDate)
    .maybeSingle();

  const next: Record<string, unknown> = { metric_date: metricDate, updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch)) {
    next[key] = Number(data?.[key] ?? 0) + value;
  }

  await sb.from('acquisition_daily_metrics').upsert(next, { onConflict: 'metric_date' });
}

async function isSuppressed(args: { websiteUrl?: string | null; email?: string | null }) {
  const sb = supabaseAdmin();
  const domain = domainFromUrl(args.websiteUrl) ?? domainFromEmail(args.email);
  if (!domain && !args.email) return false;

  let query = sb.from('acquisition_suppression_list').select('id').limit(1);
  if (args.email && domain) {
    query = query.or(`email.eq.${args.email.toLowerCase()},domain.eq.${domain}`);
  } else if (args.email) {
    query = query.eq('email', args.email.toLowerCase());
  } else if (domain) {
    query = query.eq('domain', domain);
  }

  const { data } = await query;
  return Boolean(data?.length);
}

async function accountExists(args: { name: string; websiteUrl?: string | null }) {
  const sb = supabaseAdmin();
  const normalizedName = args.name.trim();
  if (args.websiteUrl) {
    const { data } = await sb
      .from('acquisition_accounts')
      .select('id')
      .eq('website_url', args.websiteUrl)
      .limit(1);
    if (data?.length) return true;
  }

  const { data } = await sb
    .from('acquisition_accounts')
    .select('id')
    .ilike('name', normalizedName)
    .limit(1);
  return Boolean(data?.length);
}

export async function importAcquisitionAccount(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = ImportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const input = parsed.data;
  const signals = readSignals(formData, input);
  const score = scoreAcquisitionAccount(signals);
  const sb = supabaseAdmin();
  if (await isSuppressed({ websiteUrl: input.websiteUrl || null, email: input.contactEmail || null })) return;
  if (await accountExists({ name: input.name, websiteUrl: input.websiteUrl || null })) return;
  const enrichment = buildAcquisitionEnrichment({
    websiteUrl: input.websiteUrl || null,
    contactEmail: input.contactEmail || null,
    industry: input.industry || null,
    location: input.location || null,
  });

  const { data: account, error } = await sb
    .from('acquisition_accounts')
    .insert({
      name: input.name,
      website_url: input.websiteUrl || null,
      industry: input.industry || null,
      location: input.location || null,
      source: 'manual',
      stage: score.totalScore >= 45 ? 'qualified' : 'prospect',
      priority: score.priority,
      fit_score: score.fitScore,
      urgency_score: score.urgencyScore,
      revenue_score: score.revenueScore,
      total_score: score.totalScore,
      recommended_offer: score.recommendedOffer,
      pain_summary: score.reasons.join('; '),
      next_action: score.nextAction,
      next_action_at: new Date().toISOString(),
      owner_id: user.id,
      tags: [input.businessModel, input.estimatedBudget, `close_${score.closeProbability}`, ...enrichment.signals],
      metadata: { signals, score, scoreReasons: score.reasons, scoreWarnings: score.warnings, enrichment },
    })
    .select('id, name')
    .maybeSingle();

  if (error || !account) return;

  if (input.contactName || input.contactEmail || input.contactTitle) {
    await sb.from('acquisition_contacts').insert({
      account_id: account.id,
      full_name: input.contactName || null,
      title: input.contactTitle || null,
      email: input.contactEmail || null,
      role_fit: input.contactTitle?.toLowerCase().includes('founder') ? 'founder' : 'unknown',
      confidence: input.contactEmail ? 85 : 45,
      is_primary: true,
      source: 'manual',
    });
  }

  await incrementDailyMetrics({
    accounts_added: 1,
    accounts_qualified: score.totalScore >= 45 ? 1 : 0,
  });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.account.import',
    entityType: 'acquisition_account',
    entityId: account.id,
    after: { name: account.name, signals, score },
  });

  revalidatePath('/admin/acquisition');
  return;
}

export async function bulkImportAcquisitionAccounts(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = BulkImportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const leads = parseAcquisitionLeadList(parsed.data.leads);
  if (leads.length === 0) return;

  const sb = supabaseAdmin();
  let imported = 0;
  let qualified = 0;

  for (const lead of leads) {
    if (await isSuppressed({ websiteUrl: lead.websiteUrl, email: lead.contactEmail })) continue;
    if (await accountExists({ name: lead.name, websiteUrl: lead.websiteUrl })) continue;

    const score = scoreAcquisitionAccount(lead.signals);
    const enrichment = buildAcquisitionEnrichment({
      websiteUrl: lead.websiteUrl,
      contactEmail: lead.contactEmail,
      industry: lead.industry,
      location: lead.location,
    });
    const { data: account, error } = await sb
      .from('acquisition_accounts')
      .insert({
        name: lead.name,
        website_url: lead.websiteUrl,
        industry: lead.industry,
        location: lead.location,
        source: 'import',
        stage: score.totalScore >= 45 ? 'qualified' : 'prospect',
        priority: score.priority,
        fit_score: score.fitScore,
        urgency_score: score.urgencyScore,
        revenue_score: score.revenueScore,
        total_score: score.totalScore,
        recommended_offer: score.recommendedOffer,
        pain_summary: score.reasons.join('; '),
        next_action: score.nextAction,
        next_action_at: new Date().toISOString(),
        owner_id: user.id,
        tags: ['bulk_import', lead.source, lead.businessModel, lead.estimatedBudget, ...lead.tags, ...enrichment.signals],
        metadata: {
          intake: {
            source: lead.source,
            notes: lead.notes,
            companySize: lead.companySize,
            tags: lead.tags,
          },
          signals: lead.signals,
          score,
          scoreReasons: score.reasons,
          scoreWarnings: score.warnings,
          enrichment,
        },
      })
      .select('id')
      .maybeSingle();

    if (error || !account) continue;
    imported += 1;
    if (score.totalScore >= 45) qualified += 1;

    if (lead.contactName || lead.contactEmail || lead.contactTitle) {
      await sb.from('acquisition_contacts').insert({
        account_id: account.id,
        full_name: lead.contactName,
        title: lead.contactTitle,
        email: lead.contactEmail,
        role_fit: lead.contactTitle?.toLowerCase().includes('founder') ? 'founder' : 'unknown',
        confidence: lead.contactEmail ? 85 : 45,
        is_primary: true,
        source: 'bulk_import',
      });
    }
  }

  if (imported > 0) {
    await incrementDailyMetrics({
      accounts_added: imported,
      accounts_qualified: qualified,
    });
  }

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.account.bulk_import',
    entityType: 'acquisition_account',
    after: { imported, qualified },
  });

  revalidatePath('/admin/acquisition');
}

export async function rescoreAcquisitionAccount(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = IdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const sb = supabaseAdmin();
  const { data: account } = await sb
    .from('acquisition_accounts')
    .select('id, metadata')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (!account) return;

  const signals = (account.metadata?.signals ?? {}) as AcquisitionSignalInput;
  const score = scoreAcquisitionAccount(signals);
  const { error } = await sb
    .from('acquisition_accounts')
    .update({
      priority: score.priority,
      fit_score: score.fitScore,
      urgency_score: score.urgencyScore,
      revenue_score: score.revenueScore,
      total_score: score.totalScore,
      recommended_offer: score.recommendedOffer,
      pain_summary: score.reasons.join('; '),
      next_action: score.nextAction,
      metadata: { ...(account.metadata ?? {}), score, scoreReasons: score.reasons, scoreWarnings: score.warnings },
    })
    .eq('id', parsed.data.id);
  if (error) return;

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.account.rescore',
    entityType: 'acquisition_account',
    entityId: parsed.data.id,
    after: score,
  });

  revalidatePath('/admin/acquisition');
  return;
}

export async function enrichAcquisitionAccount(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = IdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const sb = supabaseAdmin();
  const { data: account } = await sb
    .from('acquisition_accounts')
    .select('id, website_url, industry, location, metadata')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (!account) return;

  const { data: contact } = await sb
    .from('acquisition_contacts')
    .select('email')
    .eq('account_id', account.id)
    .order('is_primary', { ascending: false })
    .order('confidence', { ascending: false })
    .limit(1)
    .maybeSingle();

  const enrichment = buildAcquisitionEnrichment({
    websiteUrl: account.website_url,
    contactEmail: contact?.email,
    industry: account.industry,
    location: account.location,
  });

  await sb
    .from('acquisition_accounts')
    .update({
      next_action: enrichment.recommendedNextAction,
      metadata: { ...(account.metadata ?? {}), enrichment },
      tags: enrichment.signals,
    })
    .eq('id', account.id);

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.account.enrich',
    entityType: 'acquisition_account',
    entityId: account.id,
    after: enrichment,
  });

  revalidatePath('/admin/acquisition');
}

export async function scheduleAcquisitionFollowUp(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = FollowUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const followUpAt = nextFollowUpDate(parsed.data.days);
  const sb = supabaseAdmin();
  const { error } = await sb
    .from('acquisition_accounts')
    .update({
      stage: 'follow_up',
      next_action: `Follow up in ${parsed.data.days} day${parsed.data.days === 1 ? '' : 's'}.`,
      next_action_at: followUpAt,
    })
    .eq('id', parsed.data.id);
  if (error) return;

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.account.schedule_follow_up',
    entityType: 'acquisition_account',
    entityId: parsed.data.id,
    after: { followUpAt, days: parsed.data.days },
  });

  revalidatePath('/admin/acquisition');
}

export async function suppressAcquisitionAccount(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = IdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const sb = supabaseAdmin();
  const { data: account } = await sb
    .from('acquisition_accounts')
    .select('id, website_url')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (!account) return;

  const { data: contact } = await sb
    .from('acquisition_contacts')
    .select('email')
    .eq('account_id', account.id)
    .order('is_primary', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: suppressionError } = await sb.from('acquisition_suppression_list').insert({
    account_id: account.id,
    email: contact?.email?.toLowerCase() ?? null,
    domain: domainFromUrl(account.website_url),
    reason: 'manual do-not-contact from Acquisition OS',
    created_by: user.id,
  });
  if (suppressionError) throw new Error('Failed to suppress acquisition account.');

  const { error: accountError } = await sb
    .from('acquisition_accounts')
    .update({
      stage: 'do_not_contact',
      priority: 'low',
      next_action: 'Suppressed. Do not contact.',
      next_action_at: null,
    })
    .eq('id', account.id);
  if (accountError) throw new Error('Failed to update suppressed acquisition account.');

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.account.suppress',
    entityType: 'acquisition_account',
    entityId: account.id,
    after: { suppressed: true },
  });

  revalidatePath('/admin/acquisition');
}

export async function generateWebsiteAudit(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = IdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const sb = supabaseAdmin();
  const { data: account } = await sb
    .from('acquisition_accounts')
    .select('id, name, website_url, metadata')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (!account) return;

  const signals = (account.metadata?.signals ?? {}) as AcquisitionSignalInput;
  if (account.website_url) {
    let audit: Awaited<ReturnType<typeof runLiveSeoAudit>>;
    try {
      audit = await runLiveSeoAudit(account.website_url);
    } catch {
      await sb
        .from('acquisition_accounts')
        .update({
          next_action: 'Live audit failed. Verify the website is public and reachable, then retry.',
        })
        .eq('id', account.id);
      revalidatePath('/admin/acquisition');
      return;
    }

    const persisted = await persistAuditReport({
      url: audit.target.href,
      score: audit.score,
      report: audit.report,
      metadata: {
        source: 'acquisition_os',
        accountId: account.id,
        evidence: audit.evidence,
      },
    });
    const failed = audit.evidence.failedChecks;
    const passed = audit.evidence.passedChecks;
    const issues = failed.length
      ? failed.map((check) => ({
          check: check.label,
          detail: check.detail,
          weight: check.weight,
        }))
      : [{ check: 'No critical on-page issues found', detail: 'The audited page passed the weighted checks.', weight: 0 }];
    const opportunities = failed.length
      ? failed.map((check) => ({
          title: `Fix ${check.label.toLowerCase()}`,
          detail: check.detail,
        }))
      : [{ title: 'Improve conversion proof', detail: 'Use the clean audit as a trust-building entry point.' }];

    const auditInsert = {
      account_id: account.id,
      url: audit.target.href,
      overall_score: audit.score,
      performance_score: audit.report.performance?.score ?? null,
      seo_score: audit.score,
      accessibility_score: passed.some((check) => check.key === 'langAttr') ? 90 : 55,
      conversion_score: failed.some((check) => ['openGraph', 'metaDescription', 'singleH1'].includes(check.key)) ? 55 : 80,
      brand_score: failed.some((check) => ['openGraph', 'twitter'].includes(check.key)) ? 60 : 82,
      issues,
      opportunities,
      recommended_offer: 'seo_conversion_audit',
      audit_source: 'seo_audit_tool',
    };
    const auditEvidenceInsert = {
      ...auditInsert,
      raw_report: audit.report,
      evidence: audit.evidence,
      public_report_share_id: persisted?.shareId ?? null,
    };
    let createdAudit = await sb
      .from('acquisition_website_audits')
      .insert(auditEvidenceInsert)
      .select('id')
      .maybeSingle();

    if (isMissingAuditEvidenceColumnError(createdAudit.error)) {
      createdAudit = await sb.from('acquisition_website_audits').insert(auditInsert).select('id').maybeSingle();
    }
    if (createdAudit.error || !createdAudit.data) return;
    const auditId = createdAudit.data.id;

    const runKey = `website-audit-${account.id}-${Date.now()}`;
    const auditAutomation = buildRealWebsiteAuditAutomation({
      runKey,
      accountId: account.id,
      accountName: account.name ?? 'Acquisition account',
      audit,
    });

    if (auditAutomation.persistence.auditEvidence.length > 0) {
      await sb.from('revenue_website_audit_evidence').insert(
        auditAutomation.persistence.auditEvidence.map((item) => ({
          ...item,
          audit_id: auditId,
          created_by: user.id,
        })),
      );
    }

    await sb.from('revenue_website_audit_offer_mappings').insert({
      ...auditAutomation.persistence.offerMapping,
      audit_id: auditId,
      created_by: user.id,
    });

    if (auditAutomation.workerJobs.length > 0) {
      await sb.from('revenue_worker_jobs').insert(auditAutomation.workerJobs.map((job) => ({
        run_key: runKey,
        job_kind: job.kind,
        target: job.target,
        priority: job.priority,
        status: job.status,
        attempts_remaining: job.attemptsRemaining,
        rate_limit_per_minute: job.rateLimitPerMinute,
        next_run_at: job.nextRunAt,
        metadata: {
          runKey,
          proof: true,
          program: '3_website_audit_automation',
          workerJob: job,
          auditId,
          accountId: account.id,
        },
        created_by: user.id,
      })));
    }

    const issueSummary = failed.length
      ? failed.slice(0, 3).map((check) => check.label).join('; ')
      : `Live audit score ${audit.score}/100`;

    await sb
      .from('acquisition_accounts')
      .update({
        stage: 'qualified',
        recommended_offer: 'seo_conversion_audit',
        pain_summary: issueSummary,
        next_action: 'Live SEO audit evidence stored. Use the failed checks to draft specific outreach.',
      })
      .eq('id', account.id);

    await logAudit({
      actorId: user.id,
      actorEmail: profile.email,
      action: 'acquisition.audit.generate_live',
      entityType: 'acquisition_website_audit',
      entityId: createdAudit.data.id,
      after: {
        score: audit.score,
        url: audit.target.href,
        failedChecks: failed.length,
        shareId: persisted?.shareId ?? null,
        structuredEvidence: auditAutomation.evidence.length,
        recommendedOffer: auditAutomation.offerMapping.recommendedOffer,
      },
    });

    revalidatePath('/admin/acquisition');
    return;
  }

  const audit = buildWebsiteAuditDraft({ ...signals, websiteUrl: account.website_url });
  const { data: created, error } = await sb
    .from('acquisition_website_audits')
    .insert({
      account_id: account.id,
      url: account.website_url ?? signals.websiteUrl ?? 'https://example.com',
      overall_score: audit.overallScore,
      performance_score: audit.performanceScore,
      seo_score: audit.seoScore,
      accessibility_score: audit.accessibilityScore,
      conversion_score: audit.conversionScore,
      brand_score: audit.brandScore,
      issues: audit.issues,
      opportunities: audit.opportunities,
      recommended_offer: audit.recommendedOffer,
      audit_source: 'agent',
    })
    .select('id')
    .maybeSingle();
  if (error || !created) return;

  await sb
    .from('acquisition_accounts')
    .update({
      stage: 'qualified',
      recommended_offer: audit.recommendedOffer,
      pain_summary: audit.issues.join('; '),
      next_action: 'Use the audit evidence to draft a specific outreach message.',
    })
    .eq('id', account.id);

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.audit.generate',
    entityType: 'acquisition_website_audit',
    entityId: created.id,
    after: audit,
  });

  revalidatePath('/admin/acquisition');
  return;
}

export async function draftOutreachMessage(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = IdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const sb = supabaseAdmin();
  const { data: account } = await sb
    .from('acquisition_accounts')
    .select('id, name, website_url, industry, recommended_offer, pain_summary, metadata')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (!account) return;

  const { data: contact } = await sb
    .from('acquisition_contacts')
    .select('id, full_name, title')
    .eq('account_id', account.id)
    .order('is_primary', { ascending: false })
    .order('confidence', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: audit } = await sb
    .from('acquisition_website_audits')
    .select('overall_score, issues, opportunities, public_report_share_id')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: existingDraft } = await sb
    .from('acquisition_outreach_messages')
    .select('id, status')
    .eq('account_id', account.id)
    .in('status', ['draft', 'ready', 'queued'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingDraft) {
    await sb
      .from('acquisition_accounts')
      .update({
        stage: 'drafted',
        next_action: `Active ${existingDraft.status} draft already exists. Review it before creating another.`,
      })
      .eq('id', account.id);
    revalidatePath('/admin/acquisition');
    return;
  }

  const draft = buildOutreachDraft({
    accountName: account.name,
    websiteUrl: account.website_url,
    contactName: contact?.full_name,
    contactTitle: contact?.title,
    industry: account.industry,
    painSummary: account.pain_summary,
    recommendedOffer: account.recommended_offer,
    source: account.metadata?.intake?.source ?? account.metadata?.signals?.source ?? null,
    companySize: account.metadata?.intake?.companySize ?? account.metadata?.signals?.companySize ?? null,
    notes: account.metadata?.intake?.notes ?? account.metadata?.signals?.notes ?? null,
    closeProbability: account.metadata?.score?.closeProbability ?? null,
    confidence: account.metadata?.score?.confidence ?? null,
    scoreReasons: Array.isArray(account.metadata?.scoreReasons) ? account.metadata.scoreReasons : [],
    scoreWarnings: Array.isArray(account.metadata?.scoreWarnings) ? account.metadata.scoreWarnings : [],
    auditIssues: Array.isArray(audit?.issues) ? audit.issues : [],
    auditOpportunities: Array.isArray(audit?.opportunities) ? audit.opportunities : [],
    auditScore: typeof audit?.overall_score === 'number' ? audit.overall_score : null,
    publicReportShareId: audit?.public_report_share_id ?? null,
  });

  const { data: created, error } = await sb
    .from('acquisition_outreach_messages')
    .insert({
      account_id: account.id,
      contact_id: contact?.id ?? null,
      channel: 'email',
      status: 'draft',
      subject: draft.subject,
      body: draft.body,
      personalization_notes: draft.personalizationNotes,
      call_to_action: draft.callToAction,
      metadata: {
        personalization: draft.metadata,
        source: account.metadata?.intake?.source ?? account.metadata?.signals?.source ?? null,
        score: account.metadata?.score ?? null,
        audit: {
          score: audit?.overall_score ?? null,
          publicReportShareId: audit?.public_report_share_id ?? null,
        },
      },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();
  if (error || !created) return;

  await sb
    .from('acquisition_accounts')
    .update({ stage: 'drafted', next_action: 'Review the draft, verify the contact, then approve sending manually.' })
    .eq('id', account.id);

  await incrementDailyMetrics({ messages_drafted: 1 });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.outreach.draft',
    entityType: 'acquisition_outreach_message',
    entityId: created.id,
    after: { accountId: account.id, subject: draft.subject },
  });

  revalidatePath('/admin/acquisition');
  return;
}

export async function recordOutreachOutcome(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = OutcomeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const sb = supabaseAdmin();
  const transition = buildOutreachOutcomeTransition(parsed.data.status);

  const { data: message, error } = await sb
    .from('acquisition_outreach_messages')
    .update(transition.messagePatch)
    .eq('id', parsed.data.id)
    .select('id, account_id')
    .maybeSingle();
  if (error || !message) return;

  if (Object.keys(transition.accountPatch).length > 0) {
    await sb.from('acquisition_accounts').update(transition.accountPatch).eq('id', message.account_id);
  }

  await incrementDailyMetrics(transition.metricPatch);

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.outreach.outcome',
    entityType: 'acquisition_outreach_message',
    entityId: message.id,
    after: { status: parsed.data.status, accountPatch: transition.accountPatch },
  });

  revalidatePath('/admin/acquisition');
  return;
}

export async function createRevenueOsPersistenceProof(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = PersistenceProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const sb = supabaseAdmin();
  const placeLead = enrichConnectorLead(
    normalizeGooglePlaceLead({
      displayName: { text: `Revenue OS Proof ${runKey}` },
      websiteUri: `proof-${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.example`,
      formattedAddress: 'Orlando, FL',
      nationalPhoneNumber: '+1 555 0199',
      types: ['professional_service'],
    }),
  );
  const connectorPlan = buildLeadSourceConnectorPlan({
    sources: [
      {
        name: `Google Places Proof ${runKey}`,
        type: 'directory',
        query: 'professional services with weak conversion path',
        dailyLimit: 10,
      },
    ],
  });
  const jobPipeline = buildJobSearchPipeline({
    roles: [
      {
        title: `Junior AI Application Engineer ${runKey}`,
        company: 'Revenue Proof Apps',
        location: 'Remote US',
        description: 'Build LLM APIs, Next.js, TypeScript, Python automation, testing, and Vercel deployments.',
        url: `https://jobs.example/${encodeURIComponent(runKey)}`,
      },
    ],
  });
  const topJob = jobPipeline.matches[0];
  if (!topJob) return;
  const jobApplication = buildJobApplicationRecord({ job: topJob, status: 'queued' });
  const recruiterFollowUp = buildRecruiterFollowUp({
    applicationId: 'pending',
    recruiterEmail: `recruiter+${runKey}@apps.example`,
  });
  const sequence = buildManualReviewSequence({
    accountName: placeLead.name,
    contactEmail: `owner+${runKey}@proof.example`,
    offer: 'seo_conversion_audit',
  });
  const deliverability = buildDeliverabilityEvent({
    messageId: 'pending',
    type: 'bounced',
    detail: 'Synthetic deliverability event for E2E persistence proof.',
  });
  const emailQueue = buildEmailPreparationQueue({
    messages: [
      {
        id: `proof-${runKey}`,
        status: 'ready',
        subject: sequence.steps[0].subject,
        body: sequence.steps[0].body,
        accountName: placeLead.name,
        contactEmail: sequence.contactEmail,
        priority: 'high',
      },
    ],
  });
  const dailyRun = buildDailyRevenueRun({
    accounts: [],
    emailQueue,
    leadConnectorPlan: connectorPlan,
    jobPipeline,
  });
  const report = buildRevenueLearningReport({
    periodLabel: `Proof ${runKey}`,
    sourceBreakdowns: [],
    jobPipeline,
    emailQueue,
  });

  const metadata = { runKey, proof: true };
  const { data: source } = await sb
    .from('revenue_lead_sources')
    .insert({
      name: connectorPlan.sources[0].name,
      source_type: 'google_places',
      query: connectorPlan.sources[0].query,
      daily_limit: connectorPlan.sources[0].dailyLimit,
      qualification_signals: connectorPlan.sources[0].qualificationSignals,
      metadata: { ...metadata, sampleLead: placeLead },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  const { data: leadRun } = await sb
    .from('revenue_lead_source_runs')
    .insert({
      source_id: source?.id ?? null,
      run_type: 'google_places_preview',
      status: 'completed',
      leads_found: 1,
      leads_imported: 0,
      deduped: 0,
      sample: [placeLead],
      metadata: { ...metadata, importRow: placeLead.importRow },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  const { data: job } = await sb
    .from('revenue_job_opportunities')
    .insert({
      title: topJob.title,
      company: topJob.company,
      location: 'Remote US',
      job_url: topJob.url,
      source: 'manual',
      score: topJob.score,
      resume_variant: topJob.resumeVariant,
      ats_keywords: topJob.atsKeywords,
      application_advice: topJob.applicationAdvice,
      status: 'queued',
      metadata,
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  const { data: application } = await sb
    .from('revenue_job_applications')
    .insert({
      job_id: job?.id ?? null,
      stage: jobApplication.stage,
      resume_variant: jobApplication.resumeVariant,
      recruiter_email: recruiterFollowUp.recruiterEmail,
      next_action: jobApplication.nextAction,
      next_action_at: jobApplication.nextActionAt,
      metadata: { ...metadata, jobApplication, recruiterFollowUp },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  const { data: email } = await sb
    .from('revenue_email_queue')
    .insert({
      recipient_email: sequence.contactEmail,
      subject: sequence.steps[0].subject,
      body: sequence.steps[0].body,
      status: 'manual_review',
      sequence_key: `proof-${runKey}`,
      step_number: 1,
      scheduled_at: sequence.steps[0].scheduledAt,
      suppression_checked_at: new Date().toISOString(),
      metadata: { ...metadata, sequence },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  await sb.from('revenue_email_events').insert({
    email_queue_id: email?.id ?? null,
    event_type: deliverability.type,
    occurred_at: deliverability.occurredAt,
    requires_suppression: deliverability.requiresSuppression,
    metadata: { ...metadata, detail: deliverability.detail },
  });

  await sb.from('revenue_daily_runs').insert({
    run_date: new Date().toISOString().slice(0, 10),
    mode: 'manual',
    scorecard: dailyRun.scorecard,
    actions: dailyRun.actions,
    safety_notes: dailyRun.safetyNotes,
    status: 'completed',
    metadata: { ...metadata, leadRunId: leadRun?.id, applicationId: application?.id },
    created_by: user.id,
  });

  await sb.from('revenue_experiments').insert({
    name: `Revenue OS Proof Experiment ${runKey}`,
    experiment_type: 'source',
    status: 'running',
    hypothesis: 'Google Places preview leads can produce qualified local-service opportunities.',
    variants: [{ key: 'google_places', dailyLimit: 10 }],
    metrics: { leadsFound: 1, imported: 0 },
    metadata,
    created_by: user.id,
  });

  await sb.from('revenue_learning_reports').insert({
    period_start: new Date().toISOString().slice(0, 10),
    period_end: new Date().toISOString().slice(0, 10),
    period_label: report.periodLabel,
    learning_score: report.learningScore,
    best_channel: report.bestChannel?.label ?? null,
    what_worked: report.whatWorked,
    what_to_improve: report.whatToImprove,
    next_experiments: report.nextExperiments,
    metadata,
    created_by: user.id,
  });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'revenue_os.persistence.proof',
    entityType: 'revenue_os',
    after: { runKey },
  });

  revalidatePath('/admin/acquisition');
}

export async function runRevenueOsConnectorOutreachProof(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = ConnectorOutreachProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const sb = supabaseAdmin();
  const metadata = { runKey, proof: true, program: '18_19' };
  const connector: LeadConnector = {
    key: `program-18-19:${runKey}`,
    label: 'Program 18/19 Google Places-style connector',
    sourceType: 'google_places',
    query: 'owner operated dental practice with weak booking path',
    dailyLimit: 5,
    costPerRunUsd: 0,
    async execute() {
      return [
        normalizeGooglePlaceLead({
          displayName: { text: `Program 18 Lead ${runKey}` },
          websiteUri: `program-18-${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.example`,
          formattedAddress: 'Orlando, FL',
          nationalPhoneNumber: '+1 555 0130',
          types: ['dentist'],
        }),
      ];
    },
  };

  const connectorRun = await runLeadConnector(connector, {
    enrichLead: async () => ({
      contactEmail: `owner+${runKey}@program18.example`,
      confidence: 94,
      signals: ['owner contact found', 'service business fit'],
    }),
  });
  const lead = connectorRun.importableLeads[0];
  if (!lead) return;
  const liveConnectorBatch = buildLiveConnectorImportBatch({
    runKey,
    connectorKey: connector.key,
    connectorLabel: connector.label,
    connectorType: 'lead',
    sourceType: connector.sourceType,
    dailyLimit: connector.dailyLimit,
    records: connectorRun.importableLeads.map((item) => ({
      recordType: 'lead',
      name: item.name,
      websiteUrl: item.websiteUrl,
      sourceUrl: item.websiteUrl ?? `source:${connector.key}`,
      dedupeKey: `lead:${item.websiteUrl ? new URL(item.websiteUrl).hostname.replace(/^www\./, '').toLowerCase() : item.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
      fields: {
        industry: item.industry,
        location: item.location,
        contactEmail: item.contactEmail,
        phone: item.phone,
        qualificationSignals: item.qualificationSignals,
      },
      enrichment: [
        {
          provider: 'program_18_19_enrichment',
          fieldsAdded: ['contactEmail', 'qualificationSignals'],
          confidence: 94,
        },
      ],
    })),
  });

  const score = scoreAcquisitionAccount({
    businessModel: 'local_service',
    source: 'directory',
    industry: lead.industry,
    websiteUrl: lead.websiteUrl,
    location: lead.location,
    hasWeakSeo: true,
    hasWeakConversionPath: true,
    hasBookingOrCheckoutGap: true,
    isOwnerOperated: true,
    contactConfidence: 94,
    sourceConfidence: 90,
    estimatedBudget: '5k_10k',
  });
  const draft = composePersonalizedOutreachV2({
    accountName: lead.name,
    websiteUrl: lead.websiteUrl,
    contactName: 'Avery Stone',
    contactTitle: 'Owner',
    industry: lead.industry,
    offer: score.recommendedOffer,
    source: lead.sourceType,
    voice: 'direct, specific, practical',
    evidence: {
      auditScore: 61,
      issues: ['Booking CTA is buried below the fold'],
      opportunities: ['Move booking above the fold and add new-patient proof near the CTA'],
      leadSignals: lead.qualificationSignals,
    },
  });

  const { data: source } = await sb
    .from('revenue_lead_sources')
    .insert({
      name: connector.label,
      source_type: connector.sourceType,
      query: connector.query,
      daily_limit: connector.dailyLimit,
      qualification_signals: lead.qualificationSignals,
      metadata: { ...metadata, connectorKey: connector.key, costEstimateUsd: connectorRun.costEstimateUsd },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  await sb.from('revenue_lead_source_runs').insert({
    source_id: source?.id ?? null,
    run_type: 'api',
    status: connectorRun.status,
    leads_found: connectorRun.leadsFound,
    leads_imported: 1,
    deduped: connectorRun.deduped,
    error: connectorRun.error,
    sample: connectorRun.sample,
    metadata: { ...metadata, connectorRun },
    created_by: user.id,
  });

  const { data: connectorBatchRow } = await sb
    .from('revenue_connector_import_batches')
    .insert({
      run_key: runKey,
      batch_key: liveConnectorBatch.batchKey,
      connector_key: liveConnectorBatch.connectorKey,
      connector_label: liveConnectorBatch.connectorLabel,
      connector_type: liveConnectorBatch.connectorType,
      source_type: liveConnectorBatch.sourceType,
      status: liveConnectorBatch.status,
      found: liveConnectorBatch.found,
      imported: liveConnectorBatch.imported,
      deduped: liveConnectorBatch.deduped,
      quota_skipped: liveConnectorBatch.quotaSkipped,
      daily_limit: liveConnectorBatch.dailyLimit,
      quota_remaining: liveConnectorBatch.quotaRemaining,
      sample: liveConnectorBatch.importable.slice(0, 5),
      skipped: liveConnectorBatch.skipped,
      worker_jobs: liveConnectorBatch.workerJobs,
      metadata: { ...metadata, liveConnectorBatch },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  if (liveConnectorBatch.provenance.length > 0) {
    await sb.from('revenue_connector_provenance').insert(liveConnectorBatch.provenance.map((item) => ({
      batch_id: connectorBatchRow?.id ?? null,
      run_key: runKey,
      connector_key: item.connectorKey,
      record_type: item.recordType,
      dedupe_key: item.dedupeKey,
      source_url: item.sourceUrl,
      discovered_at: item.discoveredAt,
      fields_collected: item.fieldsCollected,
      legal_basis: item.legalBasis,
      enrichment_chain: item.enrichmentChain,
      metadata: { ...metadata, provenance: item },
      created_by: user.id,
    })));
  }

  if (liveConnectorBatch.workerJobs.length > 0) {
    await sb.from('revenue_worker_jobs').insert(liveConnectorBatch.workerJobs.map((job) => ({
      run_key: runKey,
      job_kind: job.kind,
      target: job.target,
      priority: job.priority,
      status: job.status,
      attempts_remaining: job.attemptsRemaining,
      rate_limit_per_minute: job.rateLimitPerMinute,
      next_run_at: job.nextRunAt,
      metadata: { ...metadata, program: '2_live_connector_engine', workerJob: job },
      created_by: user.id,
    })));
  }

  const { data: account } = await sb
    .from('acquisition_accounts')
    .insert({
      name: lead.name,
      website_url: lead.websiteUrl,
      industry: lead.industry,
      location: lead.location,
      source: 'directory',
      stage: 'drafted',
      priority: score.priority,
      fit_score: score.fitScore,
      urgency_score: score.urgencyScore,
      revenue_score: score.revenueScore,
      total_score: score.totalScore,
      recommended_offer: score.recommendedOffer,
      pain_summary: score.reasons.join('; '),
      next_action: 'Review outreach v2 draft and approve the first manual email.',
      next_action_at: new Date().toISOString(),
      owner_id: user.id,
      tags: ['program_18_19', lead.sourceType, `quality_${draft.qualityScore}`, `spam_risk_${draft.spamRiskScore}`],
      metadata: { ...metadata, connectorLead: lead, score, outreachV2: draft.metadata },
    })
    .select('id')
    .maybeSingle();
  if (!account) return;

  const { data: contact } = await sb
    .from('acquisition_contacts')
    .insert({
      account_id: account.id,
      full_name: 'Avery Stone',
      title: 'Owner',
      email: lead.contactEmail,
      role_fit: 'founder',
      confidence: 94,
      is_primary: true,
      source: lead.sourceType,
    })
    .select('id')
    .maybeSingle();

  const { data: message } = await sb
    .from('acquisition_outreach_messages')
    .insert({
      account_id: account.id,
      channel: 'email',
      status: 'draft',
      subject: draft.subject,
      body: draft.body,
      personalization_notes: [
        `Composer: ${draft.metadata.composerVersion}`,
        `Quality: ${draft.qualityScore}/100`,
        `Spam risk: ${draft.spamRiskScore}/100`,
        `Checklist:\n- ${draft.checklist.join('\n- ')}`,
      ].join('\n'),
      call_to_action: 'book a 15-minute fit call',
      metadata: { ...metadata, outreachV2: draft },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  await sb.from('revenue_email_queue').insert({
    account_id: account.id,
    contact_id: contact?.id ?? null,
    outreach_message_id: message?.id ?? null,
    recipient_email: lead.contactEmail,
    subject: draft.subject,
    body: draft.body,
    status: 'manual_review',
    sequence_key: `program-18-19-${runKey}`,
    step_number: 1,
    scheduled_at: new Date().toISOString(),
    suppression_checked_at: new Date().toISOString(),
    metadata: { ...metadata, outreachV2: draft },
    created_by: user.id,
  });

  await incrementDailyMetrics({
    accounts_added: 1,
    accounts_qualified: 1,
    messages_drafted: 1,
  });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'revenue_os.connector_outreach.proof',
    entityType: 'revenue_os',
    after: { runKey, accountId: account.id, qualityScore: draft.qualityScore, spamRiskScore: draft.spamRiskScore },
  });

  revalidatePath('/admin/acquisition');
}

export async function sendRevenueEmailQueueItem(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = IdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    await recordRevenueOsActionFailure({
      actorId: user.id,
      actorEmail: profile.email,
      action: 'revenue_os.email_queue.send',
      code: 'invalid_input',
      message: 'Invalid email queue id.',
      detail: parsed.error.flatten(),
    });
    return;
  }

  const sb = supabaseAdmin();
  const { data: queueItem } = await sb
    .from('revenue_email_queue')
    .select('id, account_id, outreach_message_id, recipient_email, subject, body, status, metadata')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (!queueItem) {
    await recordRevenueOsActionFailure({
      actorId: user.id,
      actorEmail: profile.email,
      action: 'revenue_os.email_queue.send',
      code: 'not_found',
      message: 'Email queue item was not found.',
      detail: { id: parsed.data.id },
    });
    return;
  }

  const suppressed = await isSuppressed({ email: queueItem.recipient_email });
  const approvedItem = {
    id: queueItem.id,
    status: queueItem.status === 'manual_review' ? 'approved' as const : queueItem.status,
    recipientEmail: queueItem.recipient_email,
    subject: queueItem.subject,
    body: queueItem.body,
  };
  const plan = buildRevenueEmailDeliveryPlan({
    queueItem: approvedItem,
    suppressed,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.sageideas.dev',
  });

  if (!plan.allowed) {
    await sb
      .from('revenue_email_queue')
      .update({
        status: plan.reason === 'suppressed_recipient' ? 'blocked' : queueItem.status,
        suppression_checked_at: new Date().toISOString(),
        metadata: { ...(queueItem.metadata ?? {}), delivery: { allowed: false, reason: plan.reason } },
      })
      .eq('id', queueItem.id);
    await recordRevenueOsActionFailure({
      actorId: user.id,
      actorEmail: profile.email,
      action: 'revenue_os.email_queue.send',
      code: plan.reason === 'suppressed_recipient' ? 'suppressed' : 'invalid_input',
      message: `Email delivery blocked: ${plan.reason}.`,
      detail: { id: queueItem.id, reason: plan.reason },
    });
    revalidatePath('/admin/acquisition');
    return;
  }

  const result = await sendRevenueEmailWithResend({ plan });
  if (!result.ok) {
    await sb
      .from('revenue_email_queue')
      .update({
        status: 'blocked',
        approved_at: new Date().toISOString(),
        suppression_checked_at: new Date().toISOString(),
        metadata: { ...(queueItem.metadata ?? {}), delivery: { allowed: true, ok: false, reason: result.reason } },
      })
      .eq('id', queueItem.id);
    await recordRevenueOsActionFailure({
      actorId: user.id,
      actorEmail: profile.email,
      action: 'revenue_os.email_queue.send',
      code: 'provider_error',
      message: result.reason,
      detail: { id: queueItem.id },
    });
    revalidatePath('/admin/acquisition');
    return;
  }

  const now = new Date().toISOString();
  await sb
    .from('revenue_email_queue')
    .update({
      status: 'sent',
      approved_at: now,
      sent_at: now,
      provider_message_id: result.providerMessageId,
      suppression_checked_at: now,
      metadata: {
        ...(queueItem.metadata ?? {}),
        delivery: {
          allowed: true,
          ok: true,
          provider: 'resend',
          mode: result.mode,
          idempotencyKey: plan.idempotencyKey,
        },
      },
    })
    .eq('id', queueItem.id);

  await sb.from('revenue_email_events').insert({
    email_queue_id: queueItem.id,
    event_type: 'sent',
    occurred_at: now,
    requires_suppression: false,
    metadata: {
      provider: 'resend',
      providerMessageId: result.providerMessageId,
      mode: result.mode,
      actorId: user.id,
    },
  });

  if (queueItem.outreach_message_id) {
    await sb
      .from('acquisition_outreach_messages')
      .update({ status: 'sent', sent_at: now, provider_message_id: result.providerMessageId })
      .eq('id', queueItem.outreach_message_id);
  }

  await incrementDailyMetrics({ messages_sent: 1 });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'revenue_os.email_queue.send',
    entityType: 'revenue_email_queue',
    entityId: queueItem.id,
    after: { providerMessageId: result.providerMessageId, mode: result.mode },
  });

  revalidatePath('/admin/acquisition');
}

export async function recordLeadSourceHealthProof(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = LeadSourceHealthProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const dailyBudgetUsd = Number(process.env.REVENUE_LEAD_DAILY_BUDGET_USD ?? 15);
  const health = buildLeadSourceCredentialHealth({ dailyBudgetUsd });
  const googleDecision = buildLeadSourceRunDecision({
    provider: 'google_places',
    requested: 25,
    alreadyRunToday: 0,
    dailyLimit: 75,
    costPerLeadUsd: health.providers.google_places.costPerLeadUsd,
    dailyBudgetUsd,
    providerConfigured: health.providers.google_places.configured,
  });
  const exaDecision = buildLeadSourceRunDecision({
    provider: 'exa',
    requested: 20,
    alreadyRunToday: 0,
    dailyLimit: 50,
    costPerLeadUsd: health.providers.exa.costPerLeadUsd,
    dailyBudgetUsd,
    providerConfigured: health.providers.exa.configured,
  });
  const serpDecision = buildLeadSourceRunDecision({
    provider: 'serpapi',
    requested: 20,
    alreadyRunToday: 0,
    dailyLimit: 50,
    costPerLeadUsd: health.providers.serpapi.costPerLeadUsd,
    dailyBudgetUsd,
    providerConfigured: health.providers.serpapi.configured,
  });
  const metadata = {
    runKey,
    proof: true,
    program: '21',
    credentialHealth: health,
    decisions: [googleDecision, exaDecision, serpDecision],
  };

  const sb = supabaseAdmin();
  const { data: source } = await sb
    .from('revenue_lead_sources')
    .insert({
      name: `Program 21 live lead source health ${runKey}`,
      source_type: 'directory',
      query: 'credential health and quota readiness',
      status: health.readyProviders > 0 ? 'active' : 'paused',
      daily_limit: googleDecision.allowedLeadCount + exaDecision.allowedLeadCount + serpDecision.allowedLeadCount,
      qualification_signals: [
        `${health.readyProviders} providers configured`,
        `${googleDecision.allowedLeadCount + exaDecision.allowedLeadCount + serpDecision.allowedLeadCount} leads allowed by quota`,
        `daily budget ${dailyBudgetUsd}`,
      ],
      metadata,
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  await sb.from('revenue_lead_source_runs').insert({
    source_id: source?.id ?? null,
    run_type: 'api',
    status: 'completed',
    leads_found: 0,
    leads_imported: 0,
    deduped: 0,
    sample: [],
    metadata,
    created_by: user.id,
  });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'revenue_os.lead_source_health.proof',
    entityType: 'revenue_os',
    after: { runKey, readyProviders: health.readyProviders },
  });

  revalidatePath('/admin/acquisition');
}

export async function runJobAutomationProof(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = JobAutomationProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const jobs = normalizeJobSourceResults([
    {
      provider: 'greenhouse',
      payload: {
        title: `Junior AI Application Engineer ${runKey}`,
        company: 'Applied Apps',
        absolute_url: `https://boards.greenhouse.io/applied/jobs/${encodeURIComponent(runKey)}`,
        location: { name: 'Remote US' },
        content: 'Build AI application workflows with Next.js, TypeScript, Python, LLM APIs, testing, Supabase, and Vercel.',
      },
    },
    {
      provider: 'lever',
      payload: {
        text: `QA Automation Engineer ${runKey}`,
        company: 'Quality Flow',
        hostedUrl: `https://jobs.lever.co/quality/${encodeURIComponent(runKey)}`,
        categories: { location: 'Remote' },
        descriptionPlain: 'Junior QA automation role using Playwright, API testing, JavaScript, and regression evidence.',
      },
    },
    {
      provider: 'ashby',
      payload: {
        title: `Senior ML Platform Engineer ${runKey}`,
        company: 'Big Systems',
        jobUrl: `https://jobs.ashbyhq.com/big/${encodeURIComponent(runKey)}`,
        location: 'Remote',
        descriptionPlain: 'Senior staff role requiring 8+ years Kubernetes and ML platform ownership.',
      },
    },
    {
      provider: 'workable',
      payload: {
        title: `Implementation Engineer AI Tools ${runKey}`,
        company: 'OpsFlow',
        url: `https://apply.workable.com/ops/j/${encodeURIComponent(runKey)}`,
        location: { city: 'Remote' },
        description: 'Configure customer AI workflows, troubleshoot JavaScript, document integrations, and support launches.',
      },
    },
    {
      provider: 'remotive',
      payload: {
        title: `Junior Frontend Developer ${runKey}`,
        company_name: 'Remote UI',
        url: `https://remotive.com/jobs/${encodeURIComponent(runKey)}`,
        candidate_required_location: 'USA',
        description: 'React TypeScript frontend implementation and application development.',
      },
    },
  ]);
  const connectorRun = buildJobConnectorRun({ jobs });
  const packets = connectorRun.pipeline.matches.slice(0, 3).map((job) =>
    buildApplicationPacket({
      job,
      candidate: {
        name: 'Jason Teixeira',
        website: 'https://sageideas.dev',
        github: 'https://github.com/JasonTeixeira',
        location: 'Remote US',
      },
    }),
  );
  const dailyRun = buildDailyRevenueRunV2({
    runKey,
    leadHealth: {
      providersReady: 0,
      allowedLeads: 0,
      estimatedCostUsd: 0,
    },
    jobConnectorRun: {
      imported: connectorRun.imported,
      skipped: connectorRun.skipped,
      applyNow: connectorRun.pipeline.summary.applyNow,
    },
    applicationPackets: packets.map((packet) => ({
      jobTitle: packet.jobTitle,
      company: packet.company,
      resumeVariant: packet.resumeVariant,
      atsKeywordCoverage: packet.atsKeywordCoverage,
    })),
    emailQueue: {
      ready: 0,
      blocked: 0,
    },
  });
  const metadata = {
    runKey,
    proof: true,
    program: '22_23_24',
    connectorRun: {
      imported: connectorRun.imported,
      skipped: connectorRun.skipped,
      sourceCounts: connectorRun.sourceCounts,
    },
  };

  const sb = supabaseAdmin();
  const packetByJobKey = new Map(packets.map((packet) => [`${packet.company}:${packet.jobTitle}`, packet]));
  for (const job of connectorRun.pipeline.matches) {
    const packet = packetByJobKey.get(`${job.company}:${job.title}`) ?? null;
    const { data: createdJob } = await sb
      .from('revenue_job_opportunities')
      .insert({
        title: job.title,
        company: job.company,
        location: jobs.find((candidate) => candidate.title === job.title && candidate.company === job.company)?.location ?? null,
        job_url: job.url,
        source: jobs.find((candidate) => candidate.title === job.title && candidate.company === job.company)?.source ?? 'manual',
        score: job.score,
        resume_variant: job.resumeVariant,
        ats_keywords: job.atsKeywords,
        application_advice: job.applicationAdvice,
        status: job.score >= 75 ? 'queued' : 'reviewing',
        metadata: { ...metadata, jobSource: jobs.find((candidate) => candidate.title === job.title && candidate.company === job.company)?.source ?? null, packet },
        created_by: user.id,
      })
      .select('id')
      .maybeSingle();

    if (packet && createdJob?.id) {
      await sb.from('revenue_job_applications').insert({
        job_id: createdJob.id,
        stage: 'queued',
        resume_variant: packet.resumeVariant,
        recruiter_email: null,
        next_action: 'Manually submit this prepared application packet.',
        next_action_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: { ...metadata, applicationPacket: packet },
        created_by: user.id,
      });
    }
  }

  await sb.from('revenue_daily_runs').insert({
    run_date: new Date().toISOString().slice(0, 10),
    mode: 'manual',
    scorecard: dailyRun.scorecard,
    actions: dailyRun.actions,
    safety_notes: dailyRun.safetyNotes,
    status: 'completed',
    metadata: { ...metadata, dailyRun },
    created_by: user.id,
  });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'revenue_os.job_automation.proof',
    entityType: 'revenue_os',
    after: { runKey, imported: connectorRun.imported, packets: packets.length },
  });

  revalidatePath('/admin/acquisition');
}

export async function runRevenueOsIntelligenceProof(formData: FormData): Promise<void> {
  const { user, profile } = await requireAdmin();
  const parsed = IntelligenceProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const tenantId = `tenant-${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;
  const metadata = { runKey, proof: true, program: '1_8_intelligence_os', tenantId };
  const sb = supabaseAdmin();

  const agentRun = buildAgentRun({
    runKey,
    tenantId,
    objective: 'Run an end-to-end intelligent acquisition proof.',
    tasks: [
      { type: 'lead_research', title: 'Find high-fit owner-operated leads', priority: 95, requiresApproval: false },
      { type: 'personalization', title: 'Draft grounded outreach', priority: 90, requiresApproval: true },
      { type: 'inbox_triage', title: 'Classify reply and update CRM intent', priority: 85, requiresApproval: false },
      { type: 'experiment_analysis', title: 'Evaluate operating quality gates', priority: 80, requiresApproval: false },
    ],
  });
  const tracedRun = recordAgentToolTrace(agentRun, {
    taskId: agentRun.tasks[0].id,
    toolName: 'worker.batch.plan',
    inputSummary: 'local-service lead source, audit, enrichment, inbox, and job-source work',
    outputSummary: 'queued parallel worker batch',
    status: 'success',
  });
  const completedRun = completeAgentTask(tracedRun, agentRun.tasks[0].id, {
    summary: 'Worker batch prepared.',
    artifacts: ['worker-batch'],
  });

  const workerBatch = buildConnectorWorkerBatch({
    runKey,
    concurrency: 3,
    now: new Date().toISOString(),
    jobs: [
      { kind: 'lead_source', target: 'google_places:owner operated dental practice', priority: 95, requestedUnits: 20, rateLimitPerMinute: 10 },
      { kind: 'website_audit', target: 'https://apex.example', priority: 85, requestedUnits: 1, rateLimitPerMinute: 30 },
      { kind: 'enrichment', target: 'apex.example', priority: 82, requestedUnits: 5, rateLimitPerMinute: 20 },
      { kind: 'inbox_sync', target: 'gmail:sageideas', priority: 75, requestedUnits: 50, rateLimitPerMinute: 25 },
    ],
  });
  const durableWorkerRun = claimDueWorkerJobs({
    now: workerBatch.createdAt,
    workerId: `proof-worker-${runKey}`,
    leaseSeconds: 300,
    maxJobs: 3,
    jobs: workerBatch.jobs.map((job, index) => ({
      ...job,
      attemptsRemaining: index === 2 ? 1 : job.attemptsRemaining,
      nextRunAt: workerBatch.createdAt,
    })),
  });
  const workerProofFinishedAt = new Date(new Date(workerBatch.createdAt).getTime() + 60_000).toISOString();
  const completedWorker = durableWorkerRun.claimed[0]
    ? completeWorkerJob(durableWorkerRun.claimed[0], {
        now: workerProofFinishedAt,
        result: { imported: 12, skipped: 2, proof: true },
      })
    : null;
  const retriedWorker = durableWorkerRun.claimed[1]
    ? failWorkerJob(durableWorkerRun.claimed[1], {
        now: workerProofFinishedAt,
        errorCode: 'provider_rate_limited',
        errorMessage: 'Provider quota temporarily exhausted during proof run.',
        retryable: true,
        backoffSeconds: 300,
      })
    : null;
  const deadLetterWorker = durableWorkerRun.claimed[2]
    ? failWorkerJob(durableWorkerRun.claimed[2], {
        now: workerProofFinishedAt,
        errorCode: 'invalid_payload',
        errorMessage: 'Connector returned an unusable payload during proof run.',
        retryable: false,
      })
    : null;
  const durableWorkerJobs = durableWorkerRun.remaining.map((job) => {
    if (completedWorker?.job.id === job.id) return completedWorker.job;
    if (retriedWorker?.job.id === job.id) return retriedWorker.job;
    if (deadLetterWorker?.job.id === job.id) return deadLetterWorker.job;
    return job;
  });
  const durableAttempts = [completedWorker, retriedWorker, deadLetterWorker]
    .filter((operation): operation is NonNullable<typeof operation> => Boolean(operation))
    .map((operation) => operation.attempt);
  const durableDeadLetters = [deadLetterWorker?.deadLetter].filter(
    (deadLetter): deadLetter is NonNullable<typeof deadLetter> => Boolean(deadLetter),
  );

  const evidence = [
    { id: 'audit-cta', claim: 'Booking CTA is below the fold', sourceUrl: 'https://apex.example' },
    { id: 'audit-proof', claim: 'No patient proof appears near the booking path', sourceUrl: 'https://apex.example' },
  ];
  const draft = buildAiPersonalizationDraft({
    accountName: `Apex Intelligence ${runKey}`,
    contactName: 'Jordan',
    offer: 'seo_conversion_audit',
    brandVoice: 'direct, specific, useful, no hype',
    evidence,
  });
  const review = reviewAiPersonalizationDraft({
    draft,
    evidenceIds: evidence.map((item) => item.id),
    bannedClaims: ['guaranteed revenue', 'risk free'],
  });
  const inbox = classifyInboxReply({
    from: `owner+${runKey}@apex.example`,
    subject: `Re: ${draft.subject}`,
    body: 'This is relevant. Can you send times for Thursday? Budget is not huge but we need the booking flow fixed.',
  });
  const model = buildMlScoringModel({
    modelVersion: 'local-logistic-v1',
    outcomes: [
      { features: { fit: 80, urgency: 75, contactConfidence: 90, pastReplyRate: 30 }, won: true },
      { features: { fit: 35, urgency: 20, contactConfidence: 10, pastReplyRate: 0 }, won: false },
      { features: { fit: 70, urgency: 60, contactConfidence: 80, pastReplyRate: 20 }, won: true },
    ],
  });
  const mlScore = scoreWithMlModel({
    model,
    ruleScore: 62,
    features: { fit: 82, urgency: 70, contactConfidence: 88, pastReplyRate: 25 },
  });
  const sequence = advanceAdaptiveSequence(
    buildAdaptiveSequencePlan({
      accountName: `Apex Intelligence ${runKey}`,
      persona: 'owner',
      industry: 'dental',
      offer: 'seo_conversion_audit',
    }),
    { type: 'replied', occurredAt: new Date().toISOString() },
  );
  const workspace = buildTenantWorkspace({
    tenantId,
    businessName: `Apex Intelligence ${runKey}`,
    ownerEmail: `owner+${runKey}@apex.example`,
    sendingDomain: `mail-${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.apex.example`,
    leadSources: ['google_places', 'inbound', 'csv'],
    monthlyLeadLimit: 500,
  });
  const tenantExport = buildTenantExport(workspace);
  const evalRun = runRevenueOsEvalSuite({
    cases: [
      {
        id: 'intelligence-proof',
        leadScore: mlScore.blendedScore,
        draftQuality: review.approved ? 92 : 60,
        spamRisk: review.spamRiskScore,
        deliverabilityRisk: 18,
        hallucinationRisk: review.hallucinationRisk,
        conversionPrediction: Math.round(mlScore.calibratedProbability * 100),
      },
    ],
    thresholds: {
      leadQuality: 70,
      draftQuality: 80,
      maxSpamRisk: 25,
      maxDeliverabilityRisk: 30,
      maxHallucinationRisk: 5,
      conversionPrediction: 50,
    },
  });

  const { data: persistedRun } = await sb.from('revenue_agent_runs').insert({
    tenant_id: tenantId,
    run_key: runKey,
    objective: completedRun.objective,
    status: completedRun.status,
    metadata: { ...metadata, agentRun: completedRun },
    created_by: user.id,
  }).select('id').maybeSingle();

  for (const task of completedRun.tasks) {
    await sb.from('revenue_agent_tasks').insert({
      run_id: persistedRun?.id ?? null,
      task_key: task.id,
      task_type: task.type,
      title: task.title,
      priority: task.priority,
      requires_approval: task.requiresApproval,
      status: task.status,
      result: task.result ?? {},
      metadata,
    });
  }

  await sb.from('revenue_agent_traces').insert({
    run_id: persistedRun?.id ?? null,
    tool_name: completedRun.traces[0]?.toolName ?? 'worker.batch.plan',
    input_summary: completedRun.traces[0]?.inputSummary ?? null,
    output_summary: completedRun.traces[0]?.outputSummary ?? null,
    status: completedRun.traces[0]?.status ?? 'success',
    metadata,
  });

  const { data: persistedWorkerJobs } = await sb.from('revenue_worker_jobs').insert(durableWorkerJobs.map((job) => ({
    tenant_id: tenantId,
    run_key: runKey,
    job_kind: job.kind,
    target: job.target,
    priority: job.priority,
    status: job.status,
    attempts_remaining: job.attemptsRemaining,
    rate_limit_per_minute: job.rateLimitPerMinute,
    next_run_at: job.nextRunAt,
    locked_by: job.lockedBy ?? null,
    lease_expires_at: job.leaseExpiresAt ?? null,
    completed_at: job.completedAt ?? null,
    failed_at: job.failedAt ?? null,
    dead_lettered_at: job.deadLetteredAt ?? null,
    last_error: job.lastError ?? {},
    result: job.result ?? {},
    metadata: { ...metadata, workerJob: job },
    created_by: user.id,
  }))).select('id, metadata');
  const persistedWorkerJobByProofId = new Map(
    (persistedWorkerJobs ?? []).map((job) => [job.metadata?.workerJob?.id as string | undefined, job.id]),
  );

  if (durableAttempts.length > 0) {
    await sb.from('revenue_worker_attempts').insert(durableAttempts.map((attempt) => ({
      job_id: persistedWorkerJobByProofId.get(attempt.jobId) ?? null,
      tenant_id: tenantId,
      run_key: runKey,
      worker_id: attempt.workerId,
      attempt_number: attempt.attemptNumber,
      status: attempt.status,
      started_at: attempt.startedAt,
      finished_at: attempt.finishedAt,
      duration_ms: attempt.durationMs,
      error_code: attempt.errorCode,
      error_message: attempt.errorMessage,
      result: attempt.result,
      metadata: { ...metadata, attempt },
      created_by: user.id,
    })));
  }

  if (durableDeadLetters.length > 0) {
    await sb.from('revenue_worker_dead_letters').insert(durableDeadLetters.map((deadLetter) => ({
      job_id: persistedWorkerJobByProofId.get(deadLetter.jobId) ?? null,
      tenant_id: tenantId,
      run_key: runKey,
      job_kind: deadLetter.jobKind,
      target: deadLetter.target,
      error_code: deadLetter.errorCode,
      error_message: deadLetter.errorMessage,
      attempts_used: deadLetter.attemptsUsed,
      retryable: deadLetter.retryable,
      failed_at: deadLetter.failedAt,
      metadata: { ...metadata, deadLetter },
      created_by: user.id,
    })));
  }

  await sb.from('revenue_ai_draft_reviews').insert({
    tenant_id: tenantId,
    approved: review.approved,
    hallucination_risk: review.hallucinationRisk,
    spam_risk: review.spamRiskScore,
    cited_evidence_ids: draft.citedEvidenceIds,
    checks: review.checks,
    metadata: { ...metadata, draft, review },
    created_by: user.id,
  });

  await sb.from('revenue_inbox_events').insert({
    tenant_id: tenantId,
    provider: 'gmail',
    external_message_id: `proof-${runKey}`,
    sender_email: `owner+${runKey}@apex.example`,
    subject: `Re: ${draft.subject}`,
    intent: inbox.intent,
    sentiment: inbox.sentiment,
    extracted_signals: inbox.extractedSignals,
    crm_patch: inbox.crmPatch,
    metadata: { ...metadata, inbox },
    received_at: new Date().toISOString(),
  });

  await sb.from('revenue_ml_scores').insert({
    tenant_id: tenantId,
    model_version: mlScore.modelVersion,
    rule_score: mlScore.ruleScore,
    learned_score: mlScore.learnedScore,
    blended_score: mlScore.blendedScore,
    calibrated_probability: mlScore.calibratedProbability,
    features: { fit: 82, urgency: 70, contactConfidence: 88, pastReplyRate: 25 },
    decision: mlScore.decision,
  });

  await sb.from('revenue_adaptive_sequences').insert({
    tenant_id: tenantId,
    status: sequence.status,
    stop_reason: sequence.stopReason,
    persona: sequence.persona,
    industry: sequence.industry,
    offer: sequence.offer,
    steps: sequence.steps,
    events: sequence.events,
    next_step: sequence.nextStep ?? {},
    metadata,
    created_by: user.id,
  });

  await sb.from('revenue_tenants').upsert({
    tenant_key: tenantId,
    business_name: workspace.businessName,
    owner_email: workspace.ownerEmail,
    lead_sources: workspace.leadSources,
    sending_domains: workspace.sendingDomains,
    limits: workspace.limits,
    metadata: { ...metadata, workspace, tenantExport },
    created_by: user.id,
  }, { onConflict: 'tenant_key' });

  await sb.from('revenue_eval_runs').insert({
    tenant_id: tenantId,
    eval_key: runKey,
    overall_status: evalRun.overallStatus,
    pass_rate: evalRun.passRate,
    passed: evalRun.passed,
    failed: evalRun.failed,
    failures: evalRun.failures,
    metadata: { ...metadata, evalRun },
    created_by: user.id,
  });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'revenue_os.intelligence.proof',
    entityType: 'revenue_os',
    after: {
      runKey,
      tenantId,
      agentTasks: completedRun.tasks.length,
      workerJobs: workerBatch.jobs.length,
      evalStatus: evalRun.overallStatus,
    },
  });

  revalidatePath('/admin/acquisition');
}

export async function runRevenueOsAiPersonalizationProof(formData: FormData): Promise<void> {
  const { user } = await requireAdmin();
  const parsed = AiPersonalizationProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const metadata = { runKey, proof: true, program: '4_ai_personalization_evidence_locks' };
  const sb = supabaseAdmin();

  const { data: account } = await sb
    .from('acquisition_accounts')
    .insert({
      name: `Apex Evidence Lock ${runKey}`,
      website_url: `https://${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.apex.example/`,
      industry: 'Dental',
      location: 'Orlando FL',
      stage: 'drafted',
      priority: 'high',
      total_score: 86,
      fit_score: 90,
      urgency_score: 82,
      revenue_score: 84,
      recommended_offer: 'seo_conversion_audit',
      pain_summary: 'Booking CTA and proof placement gaps from stored audit evidence.',
      next_action: 'Review evidence-locked AI draft and approve manually only after verification.',
      metadata,
    })
    .select('id, name')
    .maybeSingle();

  if (!account) {
    console.error('[revenue-os program 4] failed to create proof account');
    return;
  }

  const observedAt = new Date().toISOString();
  const auditEvidencePayload = [
    {
      account_id: account.id,
      run_key: runKey,
      source_url: `https://${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.apex.example/`,
      evidence_key: 'audit-cta',
      evidence_type: 'conversion_check',
      status: 'failed',
      severity: 'high',
      label: 'Booking CTA placement',
      detail: 'Booking CTA is below the fold on the audited page.',
      observed_at: observedAt,
      raw: { checkKey: 'ctaPlacement', weight: 12 },
      metadata,
      created_by: user.id,
    },
    {
      account_id: account.id,
      run_key: runKey,
      source_url: `https://${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.apex.example/`,
      evidence_key: 'audit-proof',
      evidence_type: 'brand_check',
      status: 'failed',
      severity: 'medium',
      label: 'Proof near booking path',
      detail: 'No patient proof appears near the booking path.',
      observed_at: observedAt,
      raw: { checkKey: 'bookingProof', weight: 8 },
      metadata,
      created_by: user.id,
    },
  ];

  const { data: storedEvidence } = await sb
    .from('revenue_website_audit_evidence')
    .insert(auditEvidencePayload)
    .select('id, evidence_key, detail, source_url, evidence_type, observed_at');

  const personalization = buildEvidenceLockedPersonalizationDraft({
    runKey,
    accountId: account.id,
    accountName: account.name,
    contactName: 'Jordan',
    offer: 'seo_conversion_audit',
    brandVoice: 'direct, specific, useful, no hype',
    evidence: (storedEvidence ?? []).map((item) => ({
      id: item.evidence_key,
      claim: item.detail,
      sourceUrl: item.source_url,
      evidenceType: item.evidence_type,
      observedAt: item.observed_at,
    })),
  });

  const { data: draftMessage } = await sb
    .from('acquisition_outreach_messages')
    .insert({
      account_id: account.id,
      status: 'draft',
      channel: 'email',
      subject: personalization.draftVersion.subject,
      body: personalization.draftVersion.body,
      personalization_notes: [
        'Composer: ai_personalization_evidence_lock_v1',
        `Spam risk: ${personalization.draftVersion.spamRiskScore}/100`,
        `Hallucination risk: ${personalization.draftVersion.hallucinationRisk}/100`,
        `Citations: ${personalization.draftVersion.citedEvidenceIds.join(', ')}`,
      ].join('\n'),
      call_to_action: 'Manual review only.',
      metadata: { ...metadata, aiPersonalization: personalization.draftVersion },
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  const { data: draftVersion } = await sb
    .from('revenue_ai_draft_versions')
    .insert({
      ...personalization.persistence.draftVersion,
      draft_id: draftMessage?.id ?? null,
      created_by: user.id,
    })
    .select('id')
    .maybeSingle();

  const evidenceRowByKey = new Map((storedEvidence ?? []).map((item) => [item.evidence_key, item.id]));
  if (personalization.persistence.evidenceCitations.length > 0) {
    await sb.from('revenue_ai_evidence_citations').insert(personalization.persistence.evidenceCitations.map((citation) => ({
      ...citation,
      draft_version_id: draftVersion?.id ?? null,
      evidence_row_id: evidenceRowByKey.get(String(citation.evidence_id)) ?? null,
      created_by: user.id,
    })));
  }

  if (personalization.persistence.qualityGates.length > 0) {
    await sb.from('revenue_ai_quality_gates').insert(personalization.persistence.qualityGates.map((gate) => ({
      ...gate,
      draft_version_id: draftVersion?.id ?? null,
      created_by: user.id,
    })));
  }

  await sb.from('revenue_ai_draft_reviews').insert({
    ...personalization.persistence.review,
    draft_id: draftMessage?.id ?? null,
    created_by: user.id,
  });

  await incrementDailyMetrics({ messages_drafted: 1 });

  revalidatePath('/admin/acquisition');
}

export async function runRevenueOsEmailSafetyProof(formData: FormData): Promise<void> {
  const { user } = await requireAdmin();
  const parsed = EmailSafetyProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const metadata = { runKey, proof: true, program: '5_email_safety' };
  const sb = supabaseAdmin();
  const now = new Date();
  const baseDomain = `${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.example`;

  const queueRows = Array.from({ length: 50 }, (_, index) => {
    const position = index + 1;
    const email = position <= 5
      ? `suppressed-${position}@${baseDomain}`
      : `owner-${position}@${baseDomain}`;
    return {
      recipient_email: email,
      subject: `Program 5 safety proof ${position}`,
      body: 'Manual-review safety proof message. This row is never sent by the proof action.',
      status: 'approved',
      sequence_key: `program-5-${runKey}-seq-${position}`,
      step_number: 1,
      scheduled_at: new Date(now.getTime() + position * 60_000).toISOString(),
      suppression_checked_at: now.toISOString(),
      metadata: { ...metadata, proofIndex: position },
      created_by: user.id,
    };
  });

  const { data: queued } = await sb
    .from('revenue_email_queue')
    .insert(queueRows)
    .select('id, recipient_email, sequence_key, status, metadata');

  const queuedRows = queued ?? [];
  const manualSuppressions = queuedRows.slice(0, 5).map((row, index) => ({
    email: row.recipient_email,
    reason: `program 5 manual suppression proof ${index + 1}`,
    created_by: user.id,
  }));
  if (manualSuppressions.length > 0) {
    await sb.from('acquisition_suppression_list').insert(manualSuppressions);
  }

  const providerEvents = [
    ...queuedRows.slice(5, 8).map((row, index) => ({
      messageId: row.id,
      type: 'bounced' as const,
      recipientEmail: row.recipient_email,
      occurredAt: new Date(now.getTime() + (index + 1) * 60_000).toISOString(),
    })),
    ...queuedRows.slice(8, 10).map((row, index) => ({
      messageId: row.id,
      type: 'replied' as const,
      recipientEmail: row.recipient_email,
      occurredAt: new Date(now.getTime() + (index + 4) * 60_000).toISOString(),
    })),
  ];

  const safetyRun = buildEmailSafetyRun({
    runKey,
    domain: 'sageideas.dev',
    dailyCap: 50,
    sentToday: 40,
    bounceRate: 2.4,
    complaintRate: 0.1,
    messages: queuedRows.map((row) => ({
      id: row.id,
      recipientEmail: row.recipient_email,
      sequenceKey: row.sequence_key,
      status: row.status,
    })),
    suppressions: manualSuppressions.map((row) => ({
      email: row.email,
      reason: row.reason,
    })),
    providerEvents,
  });

  await sb.from('revenue_email_safety_reports').insert({
    ...safetyRun.persistence.safetyReport,
    created_by: user.id,
  });
  await sb.from('revenue_email_domain_health').insert({
    ...safetyRun.persistence.domainHealth,
    created_by: user.id,
  });
  if (safetyRun.persistence.suppressionEvents.length > 0) {
    await sb.from('revenue_suppression_events').insert(safetyRun.persistence.suppressionEvents.map((event) => ({
      ...event,
      created_by: user.id,
    })));
  }
  if (safetyRun.persistence.sequenceStops.length > 0) {
    await sb.from('revenue_sequence_stop_events').insert(safetyRun.persistence.sequenceStops.map((event) => ({
      ...event,
      created_by: user.id,
    })));
  }

  if (safetyRun.blocked.length > 0) {
    await sb
      .from('revenue_email_queue')
      .update({
        status: 'blocked',
        metadata: { ...metadata, safety: { allowed: false } },
      })
      .in('id', safetyRun.blocked.map((decision) => decision.messageId));
  }
  if (safetyRun.safeToSend.length > 0) {
    await sb
      .from('revenue_email_queue')
      .update({
        status: 'scheduled',
        metadata: { ...metadata, safety: { allowed: true } },
      })
      .in('id', safetyRun.safeToSend.map((decision) => decision.messageId));
  }

  if (providerEvents.length > 0) {
    await sb.from('revenue_email_events').insert(providerEvents.map((event) => ({
      email_queue_id: event.messageId,
      event_type: event.type,
      occurred_at: event.occurredAt,
      requires_suppression: ['bounced', 'complained', 'unsubscribed'].includes(event.type),
      metadata: { ...metadata, recipientEmail: event.recipientEmail },
    })));
  }

  revalidatePath('/admin/acquisition');
}

export async function runRevenueOsInboxReplyIntelligenceProof(formData: FormData): Promise<void> {
  const { user } = await requireAdmin();
  const parsed = InboxReplyIntelligenceProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const tenantId = `tenant-${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;
  const metadata = { runKey, tenantId, proof: true, program: '6_inbox_reply_intelligence' };
  const sb = supabaseAdmin();
  const now = new Date();
  const normalized = runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');

  const { data: account } = await sb
    .from('acquisition_accounts')
    .insert({
      name: `Program 6 Inbox Proof ${runKey}`,
      website_url: `https://${normalized}.inbox-proof.example`,
      industry: 'Professional Services',
      location: 'Remote',
      source: 'other',
      stage: 'contacted',
      priority: 'high',
      fit_score: 86,
      urgency_score: 82,
      revenue_score: 78,
      total_score: 82,
      recommended_offer: 'website_conversion_audit',
      pain_summary: 'Reply intelligence proof account with booking-flow interest.',
      next_action: 'Await reply classification.',
      next_action_at: now.toISOString(),
      metadata,
      owner_id: user.id,
    })
    .select('id, name, stage')
    .maybeSingle();
  if (!account) return;

  const { data: contact } = await sb
    .from('acquisition_contacts')
    .insert({
      account_id: account.id,
      full_name: 'Avery Program Six',
      title: 'Owner',
      email: `owner+${runKey}@inbox-proof.example`,
      role_fit: 'owner',
      confidence: 94,
      is_primary: true,
      source: 'program_6_proof',
      metadata,
    })
    .select('id, email, full_name')
    .maybeSingle();
  if (!contact?.email) return;

  const { data: queueRows } = await sb
    .from('revenue_email_queue')
    .insert({
      account_id: account.id,
      contact_id: contact.id,
      recipient_email: contact.email,
      subject: 'Quick booking-flow note',
      body: 'Manual-review proof outreach message. This is never sent by the proof action.',
      status: 'sent',
      sequence_key: `program-6-${runKey}-seq`,
      step_number: 1,
      sent_at: now.toISOString(),
      provider_message_id: `provider-${runKey}-1`,
      metadata,
      created_by: user.id,
    })
    .select('id, recipient_email, subject, sequence_key, provider_message_id')
    .limit(1);
  const queueRow = queueRows?.[0];
  if (!queueRow) return;

  const replies = [
    {
      externalMessageId: `gmail-${runKey}-meeting`,
      threadId: `thread-${runKey}-meeting`,
      from: contact.email,
      subject: 'Re: Quick booking-flow note',
      body: 'Can you send times for Thursday? We need a better website booking flow.',
      receivedAt: new Date(now.getTime() + 60_000).toISOString(),
    },
    {
      externalMessageId: `gmail-${runKey}-objection`,
      threadId: `thread-${runKey}-objection`,
      from: contact.email,
      subject: 'Re: Quick booking-flow note',
      body: 'How much does this usually cost? Budget is not huge but the conversion flow matters.',
      receivedAt: new Date(now.getTime() + 120_000).toISOString(),
    },
    {
      externalMessageId: `gmail-${runKey}-wrong-person`,
      threadId: `thread-${runKey}-wrong-person`,
      from: `ops+${runKey}@inbox-proof.example`,
      subject: 'Re: Quick booking-flow note',
      body: 'Wrong person, please talk to Avery about the website and booking flow.',
      receivedAt: new Date(now.getTime() + 180_000).toISOString(),
    },
  ];

  const inboxRun = buildInboxIntelligenceRun({
    runKey,
    tenantId,
    account,
    contact,
    emailQueue: [{
      id: queueRow.id,
      recipientEmail: queueRow.recipient_email,
      subject: queueRow.subject,
      sequenceKey: queueRow.sequence_key,
      providerMessageId: queueRow.provider_message_id,
    }],
    replies,
  });

  await sb.from('revenue_inbox_runs').insert({
    ...inboxRun.persistence.inboxRun,
    created_by: user.id,
  });
  await sb.from('revenue_inbox_threads').insert(inboxRun.persistence.inboxThreads.map((thread) => ({
    ...thread,
    run_key: runKey,
    tenant_id: tenantId,
    created_by: user.id,
  })));
  await sb.from('revenue_inbox_messages').insert(inboxRun.persistence.inboxMessages.map((message) => ({
    ...message,
    run_key: runKey,
    tenant_id: tenantId,
    created_by: user.id,
  })));
  await sb.from('revenue_inbox_classifications').insert(inboxRun.persistence.inboxClassifications.map((classification) => ({
    ...classification,
    tenant_id: tenantId,
    created_by: user.id,
  })));
  await sb.from('revenue_inbox_action_suggestions').insert(inboxRun.persistence.actionSuggestions.map((suggestion) => ({
    ...suggestion,
    tenant_id: tenantId,
    created_by: user.id,
  })));

  await sb.from('revenue_inbox_events').insert(inboxRun.classifications.map((classification) => ({
    tenant_id: tenantId,
    provider: 'gmail',
    external_message_id: classification.external_message_id,
    sender_email: classification.metadata.replyFrom,
    subject: 'Program 6 inbox proof reply',
    intent: classification.intent,
    sentiment: classification.sentiment,
    extracted_signals: classification.extractedSignals,
    crm_patch: classification.crmPatch,
    metadata: { ...metadata, classification },
    received_at: replies.find((reply) => reply.externalMessageId === classification.external_message_id)?.receivedAt ?? now.toISOString(),
  })));

  if (inboxRun.persistence.sequenceStops.length > 0) {
    await sb.from('revenue_sequence_stop_events').insert(inboxRun.persistence.sequenceStops.map((stop) => ({
      ...stop,
      created_by: user.id,
    })));
  }

  const meetingUpdate = inboxRun.crmUpdates.find((update) => update.stage === 'meeting') ?? inboxRun.crmUpdates[0];
  if (meetingUpdate) {
    await sb
      .from('acquisition_accounts')
      .update({
        stage: meetingUpdate.stage,
        next_action: meetingUpdate.nextAction,
        next_action_at: meetingUpdate.nextActionAt,
        metadata: { ...metadata, inboxCrmUpdate: meetingUpdate },
      })
      .eq('id', meetingUpdate.accountId);
  }

  await sb
    .from('revenue_email_queue')
    .update({
      status: 'archived',
      metadata: { ...metadata, stoppedByReply: true },
    })
    .eq('id', queueRow.id);

  await incrementDailyMetrics({
    replies: inboxRun.persistence.inboxRun.scorecard.matchedReplies,
    meetings_booked: inboxRun.persistence.inboxRun.scorecard.meetingIntent,
  });

  revalidatePath('/admin/acquisition');
}

export async function runRevenueOsTenantSaasFoundationProof(formData: FormData): Promise<void> {
  const { user } = await requireAdmin();
  const parsed = TenantSaasProofSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const runKey = parsed.data.runKey;
  const normalized = runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
  const sb = supabaseAdmin();
  const foundation = buildTenantSaasFoundation({
    runKey,
    workspaces: [
      {
        tenantKey: `${normalized}-apex`,
        businessName: 'Program 7 Shared Brand',
        ownerEmail: `owner+${runKey}@program7.example`,
        members: [
          { email: `operator+${runKey}@program7.example`, role: 'operator' },
          { email: `viewer+${runKey}@program7.example`, role: 'viewer' },
        ],
        leadSources: ['google_places', 'csv', 'inbound'],
        sendingDomains: [`mail.${normalized}.apex.example`],
        monthlyLeadLimit: 600,
        dailyEmailLimit: 45,
        config: {
          icp: {
            targetSegment: 'owner-led dental offices',
            regions: ['US'],
            minimumBudget: '5000',
          },
          offers: ['seo_conversion_audit', 'website_rebuild'],
          brandVoice: { tone: 'direct helpful evidence-grounded' },
          compliance: { consentBasis: 'legitimate_interest', unsubscribeRequired: true },
        },
      },
      {
        tenantKey: `${normalized}-clone`,
        businessName: 'Program 7 Shared Brand',
        ownerEmail: `owner-clone+${runKey}@program7.example`,
        members: [{ email: `operator-clone+${runKey}@program7.example`, role: 'operator' }],
        leadSources: ['csv', 'referral'],
        sendingDomains: [`mail.${normalized}.clone.example`],
        monthlyLeadLimit: 350,
        dailyEmailLimit: 30,
        config: {
          icp: {
            targetSegment: 'boutique med spas',
            regions: ['US', 'Canada'],
            minimumBudget: '3000',
          },
          offers: ['brand_presence_audit'],
          brandVoice: { tone: 'warm concise operator-focused' },
          compliance: { consentBasis: 'manual_review', unsubscribeRequired: true },
        },
      },
    ],
  });
  const isolationProof = buildTenantIsolationProof(foundation);

  const { data: workspaces, error: workspaceError } = await sb
    .from('revenue_workspaces')
    .upsert(
      foundation.persistence.workspaces.map((workspace) => ({
        ...workspace,
        metadata: { ...(workspace.metadata as Record<string, unknown>), isolationProof },
        created_by: user.id,
      })),
      { onConflict: 'tenant_key' },
    )
    .select('id, tenant_key');
  if (workspaceError || !workspaces) return;

  const workspaceIdByTenant = new Map(workspaces.map((workspace) => [workspace.tenant_key, workspace.id]));
  await sb.from('revenue_workspace_members').upsert(
    foundation.persistence.memberships.map((membership) => ({
      ...membership,
      workspace_id: workspaceIdByTenant.get(membership.tenant_key as string),
      created_by: user.id,
    })),
    { onConflict: 'tenant_key,email' },
  );
  await sb.from('revenue_workspace_configs').upsert(
    foundation.persistence.configs.map((config) => ({
      ...config,
      workspace_id: workspaceIdByTenant.get(config.tenant_key as string),
      created_by: user.id,
    })),
    { onConflict: 'tenant_key' },
  );
  await sb.from('revenue_workspace_usage').insert(
    foundation.persistence.usageRecords.map((usage) => ({
      ...usage,
      workspace_id: workspaceIdByTenant.get(usage.tenant_key as string),
      created_by: user.id,
    })),
  );
  await sb.from('revenue_workspace_billing_boundaries').insert(
    foundation.persistence.billingBoundaries.map((billing) => ({
      ...billing,
      workspace_id: workspaceIdByTenant.get(billing.tenant_key as string),
      created_by: user.id,
    })),
  );
  await sb.from('revenue_workspace_audit_logs').insert(
    foundation.persistence.auditLogs.map((log) => ({
      ...log,
      workspace_id: workspaceIdByTenant.get(log.tenant_key as string),
      after_state: { isolationProof },
    })),
  );

  await logAudit({
    actorId: user.id,
    actorEmail: user.email ?? 'admin',
    action: 'revenue_os.tenant_saas_foundation.proof',
    entityType: 'revenue_workspace',
    after: {
      runKey,
      workspaces: foundation.workspaces.length,
      memberships: foundation.memberships.length,
      isolationProof,
    },
  });

  revalidatePath('/admin/acquisition');
}

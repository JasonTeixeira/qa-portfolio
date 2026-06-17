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
    .select('id, website_url, metadata')
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

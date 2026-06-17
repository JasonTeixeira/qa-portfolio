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
import { parseAcquisitionLeadList } from '@/lib/acquisition/import';
import { buildOutreachDraft } from '@/lib/acquisition/outreach';
import { scoreAcquisitionAccount } from '@/lib/acquisition/scoring';
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
      tags: [input.businessModel, input.estimatedBudget, ...enrichment.signals],
      metadata: { signals, scoreReasons: score.reasons, enrichment },
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
        tags: ['bulk_import', ...enrichment.signals],
        metadata: { signals: lead.signals, scoreReasons: score.reasons, enrichment },
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
      metadata: { ...(account.metadata ?? {}), scoreReasons: score.reasons },
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

  await sb.from('acquisition_suppression_list').insert({
    account_id: account.id,
    email: contact?.email?.toLowerCase() ?? null,
    domain: domainFromUrl(account.website_url),
    reason: 'manual do-not-contact from Acquisition OS',
    created_by: user.id,
  });

  await sb
    .from('acquisition_accounts')
    .update({
      stage: 'do_not_contact',
      priority: 'low',
      next_action: 'Suppressed. Do not contact.',
      next_action_at: null,
    })
    .eq('id', account.id);

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
    .select('id, name, website_url, industry, recommended_offer, pain_summary')
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
    .select('issues, opportunities')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const draft = buildOutreachDraft({
    accountName: account.name,
    websiteUrl: account.website_url,
    contactName: contact?.full_name,
    contactTitle: contact?.title,
    industry: account.industry,
    painSummary: account.pain_summary,
    recommendedOffer: account.recommended_offer,
    auditIssues: Array.isArray(audit?.issues) ? audit.issues : [],
    auditOpportunities: Array.isArray(audit?.opportunities) ? audit.opportunities : [],
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
  const now = new Date().toISOString();
  const patch: Record<string, string | null> = { status: parsed.data.status };
  if (parsed.data.status === 'sent') patch.sent_at = now;
  if (parsed.data.status === 'replied' || parsed.data.status === 'booked') patch.replied_at = now;

  const { data: message, error } = await sb
    .from('acquisition_outreach_messages')
    .update(patch)
    .eq('id', parsed.data.id)
    .select('id, account_id')
    .maybeSingle();
  if (error || !message) return;

  const accountStage =
    parsed.data.status === 'booked'
      ? 'meeting'
      : parsed.data.status === 'replied'
        ? 'follow_up'
        : parsed.data.status === 'sent'
          ? 'contacted'
          : null;

  if (accountStage) {
    await sb.from('acquisition_accounts').update({ stage: accountStage }).eq('id', message.account_id);
  }

  await incrementDailyMetrics({
    messages_sent: parsed.data.status === 'sent' ? 1 : 0,
    replies: parsed.data.status === 'replied' ? 1 : 0,
    meetings_booked: parsed.data.status === 'booked' ? 1 : 0,
  });

  await logAudit({
    actorId: user.id,
    actorEmail: profile.email,
    action: 'acquisition.outreach.outcome',
    entityType: 'acquisition_outreach_message',
    entityId: message.id,
    after: { status: parsed.data.status },
  });

  revalidatePath('/admin/acquisition');
  return;
}

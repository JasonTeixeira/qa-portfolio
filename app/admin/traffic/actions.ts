'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';
import { buildLiveAnalyticsProofs, buildTrafficOsRun, type TrafficChannel } from '@/lib/traffic-os/core';

const ProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

function persistedActorId(actorId: string) {
  return actorId === '00000000-0000-0000-0000-000000000000' ? null : actorId;
}

export async function runTrafficOsProof(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const parsed = ProofSchema.safeParse({ runKey: formData.get('runKey') });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid run key');

  const runKey = parsed.data.runKey;
  const createdBy = persistedActorId(actor.user.id);
  const sb = supabaseAdmin();
  const run = buildTrafficOsRun({ liveAnalyticsConnected: false });

  const { error: sourcesError } = await sb.from('traffic_sources').insert(run.sources.map((source) => ({
    run_key: runKey,
    source_key: source.key,
    label: source.label,
    status: source.status,
    audience: source.audience,
    monthly_visit_goal: source.monthlyVisitGoal,
    cost_budget_usd: source.costBudgetUsd,
    metadata: { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (sourcesError) throw new Error(`Traffic sources persistence failed: ${sourcesError.message}`);

  const { error: campaignsError } = await sb.from('traffic_campaigns').insert(run.campaigns.map((campaign) => ({
    run_key: runKey,
    campaign_key: campaign.key,
    name: campaign.name,
    primary_channel: campaign.primaryChannel,
    intent: campaign.intent,
    landing_page: campaign.landingPage,
    utm_campaign: campaign.utmCampaign,
    target_visits: campaign.targetVisits,
    target_conversions: campaign.targetConversions,
    status: 'active',
    metadata: { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (campaignsError) throw new Error(`Traffic campaigns persistence failed: ${campaignsError.message}`);

  const { error: landingError } = await sb.from('traffic_landing_pages').insert(run.campaigns.map((campaign) => ({
    run_key: runKey,
    path: campaign.landingPage,
    page_type: campaign.landingPage.includes('tools') ? 'tool' : campaign.landingPage.includes('academy') ? 'academy' : 'service',
    primary_cta: campaign.intent === 'community_join' ? 'Join the community' : campaign.intent === 'lead_magnet' ? 'Run the audit' : 'Book a call',
    target_conversion: campaign.intent,
    status: 'active',
    metadata: { campaignKey: campaign.key },
    created_by: createdBy,
  })));
  if (landingError) throw new Error(`Landing page persistence failed: ${landingError.message}`);

  const { error: assetsError } = await sb.from('traffic_content_assets').insert(run.assets.map((asset) => ({
    run_key: runKey,
    asset_key: asset.key,
    title: asset.title,
    asset_type: asset.assetType,
    target_url: asset.targetUrl,
    topic: asset.topic,
    keywords: asset.keywords,
    status: asset.status,
    score: asset.score,
    metadata: { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (assetsError) throw new Error(`Content asset persistence failed: ${assetsError.message}`);

  const { error: distributionError } = await sb.from('traffic_distribution_posts').insert(run.distributionPosts.map((post) => ({
    run_key: runKey,
    asset_key: post.assetKey,
    channel: post.channel,
    post_angle: post.postAngle,
    cta_url: post.ctaUrl,
    scheduled_for: post.scheduledFor,
    expected_clicks: post.expectedClicks,
    status: 'planned',
    metadata: { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (distributionError) throw new Error(`Distribution post persistence failed: ${distributionError.message}`);

  const { error: keywordsError } = await sb.from('traffic_seo_keywords').insert(run.keywords.map((keyword) => ({
    run_key: runKey,
    keyword: keyword.keyword,
    intent: keyword.intent,
    difficulty: keyword.difficulty,
    monthly_searches: keyword.monthlySearches,
    business_value: keyword.businessValue,
    target_url: keyword.targetUrl,
    status: 'queued',
    metadata: { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (keywordsError) throw new Error(`SEO keyword persistence failed: ${keywordsError.message}`);

  const { error: eventsError } = await sb.from('traffic_events').insert(run.events.map((event) => ({
    run_key: runKey,
    source: event.source,
    url: event.url,
    event_type: event.eventType,
    event_count: event.count,
    metadata: event.metadata ?? { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (eventsError) throw new Error(`Traffic event persistence failed: ${eventsError.message}`);

  const { error: conversionsError } = await sb.from('traffic_conversions').insert(run.conversions.map((conversion) => ({
    run_key: runKey,
    source: conversion.source,
    landing_page: conversion.landingPage,
    conversion_type: conversion.conversionType,
    conversion_count: conversion.count,
    value_usd: conversion.valueUsd,
    metadata: { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (conversionsError) throw new Error(`Traffic conversion persistence failed: ${conversionsError.message}`);

  const { error: discordError } = await sb.from('traffic_discord_invites').insert(run.discordInvites.map((invite) => ({
    run_key: runKey,
    server_key: invite.serverKey,
    invite_code: invite.inviteCode,
    source: invite.source,
    target_audience: invite.targetAudience,
    joins: invite.joins,
    activated: invite.activated,
    retained_7d: invite.retained7d,
    metadata: { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (discordError) throw new Error(`Discord invite persistence failed: ${discordError.message}`);

  const { error: experimentsError } = await sb.from('traffic_growth_experiments').insert(run.campaigns.map((campaign) => ({
    run_key: runKey,
    name: `${campaign.name} CTA test`,
    channel: campaign.primaryChannel,
    hypothesis: `A sharper ${campaign.intent} CTA will increase qualified traffic conversions.`,
    variants: [{ key: 'control', cta: 'Learn more' }, { key: 'challenger', cta: campaign.intent === 'book_call' ? 'Book the audit' : 'Start here' }],
    metric: 'conversion_rate',
    status: 'running',
    metadata: { campaignKey: campaign.key },
    created_by: createdBy,
  })));
  if (experimentsError) throw new Error(`Growth experiment persistence failed: ${experimentsError.message}`);

  const { error: actionsError } = await sb.from('traffic_next_best_actions').insert(run.actions.map((action) => ({
    run_key: runKey,
    rank: action.rank,
    channel: action.channel,
    action: action.action,
    rationale: action.rationale,
    expected_impact: action.expectedImpact,
    urgency: action.urgency,
    status: 'open',
    metadata: { source: 'traffic_os_proof' },
    created_by: createdBy,
  })));
  if (actionsError) throw new Error(`Traffic action persistence failed: ${actionsError.message}`);

  const { error: reportError } = await sb.from('traffic_weekly_reports').insert({
    run_key: runKey,
    visits: run.analytics.visits,
    conversions: run.analytics.conversions,
    conversion_rate: run.analytics.conversionRate,
    weighted_pipeline_usd: run.analytics.weightedPipelineUsd,
    discord_joins: run.analytics.discordJoins,
    best_channel: run.analytics.bestChannel,
    weakest_channel: run.analytics.weakestChannel,
    summary: run.weeklyReport,
    metadata: { source: 'traffic_os_proof', programs: run.programs },
    created_by: createdBy,
  });
  if (reportError) throw new Error(`Weekly report persistence failed: ${reportError.message}`);

  const { error: loadError } = await sb.from('traffic_load_proofs').insert({
    run_key: runKey,
    campaigns: run.loadProof.campaigns,
    assets: run.loadProof.assets,
    events: run.loadProof.events,
    p95_dashboard_ms: run.loadProof.p95DashboardMs,
    p95_ingestion_ms: run.loadProof.p95IngestionMs,
    status: run.loadProof.status,
    metadata: { source: 'local_traffic_os_load_proof', productionLike: false },
    created_by: createdBy,
  });
  if (loadError) throw new Error(`Traffic load proof persistence failed: ${loadError.message}`);

  const { error: auditError } = await sb.from('traffic_readiness_audits').insert({
    run_key: runKey,
    score: run.readiness.score,
    grade: run.readiness.grade,
    passed: run.readiness.passed,
    gaps: run.readiness.gaps,
    program_count: run.programs.length,
    metadata: { source: 'traffic_os_proof', analytics: run.analytics, programs: run.programs },
    created_by: createdBy,
  });
  if (auditError) throw new Error(`Traffic readiness audit persistence failed: ${auditError.message}`);

  await logAudit({
    actorId: actor.user.id,
    actorEmail: actor.profile.email,
    action: 'traffic_os.proof',
    entityType: 'traffic_os',
    entityId: runKey,
    after: {
      runKey,
      programs: run.programs.length,
      visits: run.analytics.visits,
      conversions: run.analytics.conversions,
      readinessScore: run.readiness.score,
    },
  });

  revalidatePath('/admin/traffic');
}

function acquisitionSource(source: TrafficChannel) {
  if (source === 'seo') return 'seo_audit';
  if (source === 'linkedin') return 'linkedin';
  if (source === 'partner') return 'referral';
  return 'inbound';
}

export async function activateTrafficToRevenuePipeline(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const parsed = ProofSchema.safeParse({ runKey: formData.get('runKey') });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid run key');

  const runKey = parsed.data.runKey;
  const createdBy = persistedActorId(actor.user.id);
  const sb = supabaseAdmin();
  const liveProofs = buildLiveAnalyticsProofs({ env: process.env });
  const liveAnalyticsConnected = liveProofs.some((proof) => proof.liveVerified);
  const run = buildTrafficOsRun({ liveAnalyticsConnected });

  const { error: liveProofError } = await sb.from('traffic_live_analytics_proofs').insert(liveProofs.map((proof) => ({
    run_key: runKey,
    provider: proof.provider,
    configured: proof.configured,
    live_verified: proof.liveVerified,
    rows_ingested: proof.rowsIngested,
    evidence: proof.evidence,
    metadata: { source: 'traffic_os_live_activation', secretValuesRedacted: true },
    created_by: createdBy,
  })));
  if (liveProofError) throw new Error(`Live analytics proof persistence failed: ${liveProofError.message}`);

  const { error: launchError } = await sb.from('traffic_campaign_launches').insert(run.campaigns.map((campaign) => ({
    run_key: runKey,
    campaign_key: campaign.key,
    channel: campaign.primaryChannel,
    launch_status: 'manual_review',
    distribution_url: `${campaign.landingPage}?utm_source=${campaign.primaryChannel}&utm_medium=traffic_os&utm_campaign=${campaign.utmCampaign}`,
    launch_notes: 'Ready for operator-approved publishing; no paid spend or external post was dispatched automatically.',
    metadata: { source: 'traffic_os_live_activation', campaign },
    created_by: createdBy,
  })));
  if (launchError) throw new Error(`Campaign launch persistence failed: ${launchError.message}`);

  for (const candidate of run.revenueFeedCandidates) {
    const { data: account, error: accountError } = await sb.from('acquisition_accounts').insert({
      name: candidate.accountName,
      website_url: candidate.websiteUrl,
      industry: 'Traffic-qualified inbound',
      source: acquisitionSource(candidate.source),
      stage: candidate.score >= 70 ? 'qualified' : 'prospect',
      priority: candidate.score >= 85 ? 'urgent' : candidate.score >= 70 ? 'high' : 'medium',
      fit_score: Math.min(100, candidate.score),
      urgency_score: Math.min(100, candidate.score - 5),
      revenue_score: Math.min(100, Math.round(candidate.estimatedValueUsd / 100)),
      total_score: candidate.score,
      recommended_offer: candidate.recommendedOffer,
      pain_summary: candidate.evidence,
      next_action: 'Review Traffic OS evidence and draft Revenue OS outreach.',
      next_action_at: new Date().toISOString(),
      tags: ['traffic_os', 'inbound', candidate.source, candidate.campaignKey],
      metadata: {
        runKey,
        source: 'traffic_os_revenue_feed',
        traffic: candidate,
        liveAnalyticsConnected,
      },
      owner_id: createdBy,
    }).select('id').single();
    if (accountError) throw new Error(`Revenue OS account feed failed: ${accountError.message}`);

    const { error: feedError } = await sb.from('traffic_revenue_feed_events').insert({
      run_key: runKey,
      campaign_key: candidate.campaignKey,
      source: candidate.source,
      account_id: account.id,
      account_name: candidate.accountName,
      website_url: candidate.websiteUrl,
      score: candidate.score,
      estimated_value_usd: candidate.estimatedValueUsd,
      recommended_offer: candidate.recommendedOffer,
      evidence: candidate.evidence,
      status: 'fed_to_revenue_os',
      metadata: { source: 'traffic_os_live_activation', liveAnalyticsConnected },
      created_by: createdBy,
    });
    if (feedError) throw new Error(`Traffic revenue feed event failed: ${feedError.message}`);
  }

  await logAudit({
    actorId: actor.user.id,
    actorEmail: actor.profile.email,
    action: 'traffic_os.live_activation',
    entityType: 'traffic_os',
    entityId: runKey,
    after: {
      runKey,
      liveAnalyticsConnected,
      campaigns: run.campaigns.length,
      revenueFeedCandidates: run.revenueFeedCandidates.length,
      dispatchedExternalPosts: false,
      paidSpendStarted: false,
    },
  });

  revalidatePath('/admin/traffic');
  revalidatePath('/admin/acquisition');
}

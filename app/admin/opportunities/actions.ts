'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  buildOpportunityOsRun,
  classifyOpportunityMessage,
} from '@/lib/opportunity-os/core';

const ProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

function persistedActorId(actorId: string) {
  return actorId === '00000000-0000-0000-0000-000000000000' ? null : actorId;
}

export async function runOpportunityOsUnifiedProof(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const parsed = ProofSchema.safeParse({ runKey: formData.get('runKey') });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid run key');

  const runKey = parsed.data.runKey;
  const createdBy = persistedActorId(actor.user.id);
  const sb = supabaseAdmin();
  const run = buildOpportunityOsRun({ liveProviderVerified: false });

  const { data: items, error: itemError } = await sb.from('opportunity_unified_items').insert(run.opportunities.map((item) => ({
    run_key: runKey,
    source: item.source,
    source_id: item.sourceId,
    title: item.title,
    organization: item.organization,
    stage: item.stage,
    priority_score: item.priorityScore,
    expected_value_usd: item.expectedValueUsd,
    next_action: item.nextAction,
    next_action_at: item.nextActionAt,
    stale: item.stale,
    proof_gaps: item.proofGaps,
    tags: item.tags,
    metadata: { unifiedId: item.id, programs: run.programs.length },
    created_by: createdBy,
  }))).select('id, source, source_id');
  if (itemError) throw new Error(`Unified opportunity persistence failed: ${itemError.message}`);

  const itemIdByUnifiedId = new Map((items ?? []).map((item) => [`${item.source === 'job_os' ? 'job' : 'client'}:${item.source_id}`, item.id]));

  const { error: proofAssetError } = await sb.from('opportunity_proof_assets').insert(run.proofAssets.map((asset) => ({
    run_key: runKey,
    asset_type: asset.assetType,
    title: asset.title,
    applies_to: asset.appliesTo,
    keywords: asset.keywords,
    gap_covered: asset.gapCovered,
    priority: asset.priority,
    status: 'recommended',
    metadata: { source: 'opportunity_os_unified_proof' },
    created_by: createdBy,
  })));
  if (proofAssetError) throw new Error(`Proof asset persistence failed: ${proofAssetError.message}`);

  const { error: followUpError } = await sb.from('opportunity_follow_up_queue').insert(run.dailyQueue.map((action) => ({
    run_key: runKey,
    opportunity_item_id: itemIdByUnifiedId.get(action.opportunityId) ?? null,
    rank: action.rank,
    source: action.source,
    action: action.action,
    rationale: action.rationale,
    urgency: action.urgency,
    due_at: action.dueAt,
    status: 'open',
    metadata: { source: 'opportunity_os_unified_proof', opportunityId: action.opportunityId },
    created_by: createdBy,
  })));
  if (followUpError) throw new Error(`Follow-up queue persistence failed: ${followUpError.message}`);

  const communicationRows = run.opportunities.map((item) => {
    const body = item.source === 'job_os'
      ? 'Recruiter follow-up: interview availability and next round discussion.'
      : 'Client reply: interested in a short call about scope, budget, and proposal.';
    const intent = classifyOpportunityMessage({ sourceHint: item.source, body });
    return {
      run_key: runKey,
      source: item.source,
      source_id: item.sourceId,
      channel: item.source === 'job_os' ? 'gmail' : 'email',
      direction: 'inbound',
      intent,
      next_action: intent === 'recruiter_positive'
        ? 'Schedule interview prep and reply manually.'
        : 'Qualify scope and schedule sales follow-up.',
      confidence: 88,
      metadata: { source: 'opportunity_os_unified_proof', normalized: true },
      created_by: createdBy,
    };
  });
  const { error: communicationError } = await sb.from('opportunity_communication_events').insert(communicationRows);
  if (communicationError) throw new Error(`Communication event persistence failed: ${communicationError.message}`);

  const { error: outcomeError } = await sb.from('opportunity_outcome_events').insert(run.opportunities.map((item) => ({
    run_key: runKey,
    source: item.source,
    source_id: item.sourceId,
    outcome: item.source === 'job_os' ? 'reply' : 'meeting',
    value_usd: item.source === 'job_os' ? item.expectedValueUsd : Math.round(item.expectedValueUsd * 0.3),
    evidence: `Unified Opportunity OS proof outcome for ${item.organization}.`,
    metadata: { source: 'opportunity_os_unified_proof', stage: item.stage },
    created_by: createdBy,
  })));
  if (outcomeError) throw new Error(`Outcome event persistence failed: ${outcomeError.message}`);

  const { error: strategyError } = await sb.from('opportunity_strategy_recommendations').insert(run.strategy.map((recommendation, index) => ({
    run_key: runKey,
    priority: index + 1,
    recommendation,
    rationale: 'Unified system compared job and client opportunities inside one daily operating queue.',
    status: 'open',
    metadata: { source: 'opportunity_os_unified_proof' },
    created_by: createdBy,
  })));
  if (strategyError) throw new Error(`Strategy recommendation persistence failed: ${strategyError.message}`);

  const { error: loadError } = await sb.from('opportunity_load_proofs').insert({
    run_key: runKey,
    tenants: run.loadProof.tenants,
    opportunities: run.loadProof.opportunities,
    actions: run.loadProof.actions,
    p95_dashboard_ms: run.loadProof.p95DashboardMs,
    p95_adapter_ms: run.loadProof.p95AdapterMs,
    status: run.loadProof.status,
    metadata: { source: 'local_unified_opportunity_os_load_proof', productionLike: false },
    created_by: createdBy,
  });
  if (loadError) throw new Error(`Load proof persistence failed: ${loadError.message}`);

  const { error: auditError } = await sb.from('opportunity_readiness_audits').insert({
    run_key: runKey,
    score: run.readiness.score,
    grade: run.readiness.grade,
    passed: run.readiness.passed,
    gaps: run.readiness.gaps,
    program_count: run.programs.length,
    metadata: {
      source: 'opportunity_os_unified_proof',
      analytics: run.analytics,
      programs: run.programs,
    },
    created_by: createdBy,
  });
  if (auditError) throw new Error(`Readiness audit persistence failed: ${auditError.message}`);

  await logAudit({
    actorId: actor.user.id,
    actorEmail: actor.profile.email,
    action: 'opportunity_os.unified_proof',
    entityType: 'opportunity_os',
    entityId: runKey,
    after: {
      runKey,
      programs: run.programs.length,
      opportunities: run.opportunities.length,
      queueItems: run.dailyQueue.length,
      readinessScore: run.readiness.score,
    },
  });

  revalidatePath('/admin/opportunities');
}

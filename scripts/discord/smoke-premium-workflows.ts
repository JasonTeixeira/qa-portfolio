import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  answerPremiumQuestion,
  assignPremiumReviewRequest,
  completePremiumReviewRequest,
  createOfficeHoursQueueItem,
  createPremiumReviewRequest,
} from '../../lib/discord/premium-workflows';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');
const aiOsEvidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const discordUserId = `premium-smoke-${Date.now()}`;
  const username = 'premium-smoke';
  const startedAt = new Date().toISOString();
  let answerId: string | null = null;
  let retrievalLogId: string | null = null;
  let reviewId: string | null = null;

  try {
    await sb.from('discord_members').upsert({
      discord_user_id: discordUserId,
      username,
      academy_member: true,
      premium_member: true,
      premium_status: 'active',
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'discord_user_id' });

    const review = await createPremiumReviewRequest({
      discordUserId,
      username,
      reviewType: 'ai',
      summary: 'Review my AI onboarding flow and identify the riskiest approval boundary.',
      link: 'https://example.com/spec',
    });
    reviewId = review.id;
    await assignPremiumReviewRequest({
      requestId: review.id,
      actor: 'premium-smoke-admin',
      assignedTo: 'premium-smoke-mentor',
    });
    const completion = await completePremiumReviewRequest({
      requestId: review.id,
      actor: 'premium-smoke-admin',
      response: 'Premium review completed: the riskiest approval boundary is letting members see the full server before they answer the application and accept the rules. Tighten the flow around one visible start channel, one reviewable application, one approval action, and one post-approval checklist. Next step: test the flow with a non-admin account and verify roles, database rows, and welcome checklist state.',
      judgmentBasis: 'Based on the submitted onboarding flow, the Sage Ideas quality bar, and the premium promise for priority project review.',
    });
    const officeHours = await createOfficeHoursQueueItem({
      discordUserId,
      username,
      question: 'What should I fix first in my AI project scope?',
    });
    const answer = await answerPremiumQuestion({
      discordUserId,
      username,
      question: 'How should I design a premium review workflow for an education Discord?',
      context: 'Need priority review, deeper answers, and office hours.',
    });
    answerId = answer.answerId;
    retrievalLogId = answer.retrievalLogId;

    const [reviewRow, events] = await Promise.all([
      sb
        .from('discord_premium_review_requests')
        .select('id, status, assigned_to, sla_due_at, completed_at, follow_up_due_at, response_quality_score, judgment_basis')
        .eq('id', review.id)
        .maybeSingle(),
      sb
        .from('discord_premium_workflow_events')
        .select('event_type, status, actor')
        .eq('request_id', review.id)
        .order('created_at', { ascending: true }),
    ]);
    if (reviewRow.error) throw reviewRow.error;
    if (events.error) throw events.error;

    const evidence = {
      ok: Boolean(
        review.id
          && officeHours.id
          && answer.id
          && answer.answerId
          && answer.answer.length > 80
          && officeHours.premiumMember
          && reviewRow.data?.status === 'answered'
          && reviewRow.data?.assigned_to === 'premium-smoke-mentor'
          && Number(reviewRow.data?.response_quality_score ?? 0) >= 80
          && events.data?.some((event) => event.event_type === 'assigned')
          && events.data?.some((event) => event.event_type === 'answered'),
      ),
      review,
      completion,
      reviewRow: reviewRow.data,
      lifecycleEvents: events.data,
      officeHours,
      answer: {
        id: answer.id,
        answerId: answer.answerId,
        retrievalLogId: answer.retrievalLogId,
        model: answer.model,
        answerPreview: answer.answer.slice(0, 400),
      },
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await mkdir(evidenceDir, { recursive: true });
    const evidencePath = path.join(evidenceDir, 'premium-workflows-smoke.json');
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    await mkdir(aiOsEvidenceDir, { recursive: true });
    const phaseEvidencePath = path.join(aiOsEvidenceDir, 'phase-15-premium-workflows-proof.json');
    await writeFile(phaseEvidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ ...evidence, evidencePath, phaseEvidencePath }, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } finally {
    if (reviewId) await sb.from('discord_premium_workflow_events').delete().eq('request_id', reviewId);
    await sb.from('discord_premium_review_requests').delete().eq('discord_user_id', discordUserId);
    await sb.from('discord_premium_answer_requests').delete().eq('discord_user_id', discordUserId);
    await sb.from('discord_office_hours_queue').delete().eq('discord_user_id', discordUserId);
    await sb.from('discord_members').delete().eq('discord_user_id', discordUserId);
    if (answerId) await sb.from('rag_answers').delete().eq('id', answerId);
    if (retrievalLogId) await sb.from('rag_retrieval_logs').delete().eq('id', retrievalLogId);
  }
}

main().catch(async (error) => {
  const evidence = { ok: false, error: error instanceof Error ? error.message : String(error), finishedAt: new Date().toISOString() };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'premium-workflows-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  await mkdir(aiOsEvidenceDir, { recursive: true });
  const phaseEvidencePath = path.join(aiOsEvidenceDir, 'phase-15-premium-workflows-proof.json');
  await writeFile(phaseEvidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath, phaseEvidencePath }, null, 2));
  process.exit(1);
});

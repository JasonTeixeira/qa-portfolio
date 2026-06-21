import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { answerPremiumQuestion, createOfficeHoursQueueItem, createPremiumReviewRequest } from '../../lib/discord/premium-workflows';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

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

    const evidence = {
      ok: Boolean(review.id && officeHours.id && answer.id && answer.answerId && answer.answer.length > 80 && officeHours.premiumMember),
      review,
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
    console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } finally {
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
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});

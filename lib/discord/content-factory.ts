import type { SupabaseClient } from '@supabase/supabase-js';
import { createDiscordContentDraft } from './content-approval';
import { evaluateDiscordContentDraft } from './content-quality';
import { recordDiscordEvent } from './analytics';
import {
  SAGEBOT_PERSONALITY_VERSION,
  SAGEBOT_PROMPT_VERSIONS,
  scoreSageBotPolicyOutput,
} from './sagebot-personality';

export const DISCORD_CONTENT_FACTORY_VERSION = 'discord-content-factory-v1';
export const DISCORD_CONTENT_FACTORY_PROMPT_VERSION = 'sagebot_content_factory_v1';

export type DiscordContentFactorySlot = {
  key: string;
  dayOffset: number;
  targetChannelBaseName: string;
  draftType: 'daily_signal' | 'quiz' | 'challenge' | 'resource_drop' | 'weekly_recap' | 'lesson' | 'announcement';
  title: string;
  topic: string;
  objective: string;
  actionLabel: string;
  deliverable: string;
};

export type DiscordContentFactoryResult = {
  ok: boolean;
  runKey: string;
  version: string;
  dryRun: boolean;
  created: number;
  planned: number;
  skipped: number;
  failed: number;
  drafts: Array<{
    factoryKey: string;
    draftId: string | null;
    status: 'created' | 'planned' | 'skipped' | 'failed';
    title: string;
    targetChannelBaseName: string;
    draftType: DiscordContentFactorySlot['draftType'];
    topic: string;
    dayOffset: number;
    qualityScore: number | null;
    error: string | null;
  }>;
};

const weeklyTopics = [
  {
    label: 'Approval-gated AI apps',
    build: 'Map one AI feature with input, output, approval step, failure state, and owner.',
    question: 'Where should a human approve the result before it reaches a user?',
    resource: 'A one-page checklist for blocking bad AI output before public posting.',
  },
  {
    label: 'Websites that convert from proof',
    build: 'Turn one shipped artifact into a proof block with claim, screenshot/link, and next action.',
    question: 'What proof would make a buyer trust the system faster?',
    resource: 'A before/after audit rubric for a high-trust service page.',
  },
  {
    label: 'Content engines from real questions',
    build: 'Convert one repeated question into a reusable answer, resource, and draft post.',
    question: 'What question keeps coming up that should become a durable asset?',
    resource: 'A source-first content workflow: capture, approve, draft, evaluate, publish, sync.',
  },
  {
    label: 'Cloud and automation reliability',
    build: 'Document one scheduled job with idempotency key, retry rule, dead letter, and dashboard signal.',
    question: 'What failure should become visible instead of silent?',
    resource: 'A durable-job checklist for cron, workers, retries, and admin recovery.',
  },
  {
    label: 'Review-driven building',
    build: 'Submit one small artifact for critique with goal, user, what changed, and what feels weak.',
    question: 'What specific review would make your current build stronger?',
    resource: 'A review template that produces useful critique instead of vague feedback.',
  },
  {
    label: 'Growth loops and public proof',
    build: 'Turn one internal win into a privacy-safe public proof draft.',
    question: 'What can be shared publicly without exposing private member details?',
    resource: 'A public-proof checklist: source, permission, privacy, quality, CTA, metric.',
  },
  {
    label: 'Weekly synthesis',
    build: 'Pick the strongest question, build, resource, and lesson from the week.',
    question: 'What should become next week’s challenge or resource drop?',
    resource: 'A weekly recap structure: signal, challenge, useful answer, resource, next build.',
  },
];

export function buildDiscordContentFactorySlots(startDate = new Date(), days = 7): DiscordContentFactorySlot[] {
  const slots: DiscordContentFactorySlot[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + offset);
    const topic = weeklyTopics[date.getUTCDay()];
    const dateKey = date.toISOString().slice(0, 10);
    slots.push(
      {
        key: `${dateKey}:daily-signal`,
        dayOffset: offset,
        targetChannelBaseName: 'daily-signal',
        draftType: 'daily_signal',
        title: `Daily Signal - ${topic.label}`,
        topic: topic.label,
        objective: 'Give members one specific builder action for today.',
        actionLabel: 'Build prompt',
        deliverable: topic.build,
      },
      {
        key: `${dateKey}:daily-question`,
        dayOffset: offset,
        targetChannelBaseName: 'questions',
        draftType: 'announcement',
        title: `Daily Question - ${topic.label}`,
        topic: topic.label,
        objective: 'Create a useful discussion that can become future source material.',
        actionLabel: 'Question',
        deliverable: topic.question,
      },
      {
        key: `${dateKey}:build-lab`,
        dayOffset: offset,
        targetChannelBaseName: 'build-lab',
        draftType: 'challenge',
        title: `Build Lab - ${topic.label}`,
        topic: topic.label,
        objective: 'Create one reviewable artifact members can ship or submit.',
        actionLabel: 'Challenge',
        deliverable: topic.build,
      },
      {
        key: `${dateKey}:resource-drop`,
        dayOffset: offset,
        targetChannelBaseName: 'resources',
        draftType: 'resource_drop',
        title: `Resource Drop - ${topic.label}`,
        topic: topic.label,
        objective: 'Give members one reusable checklist or template.',
        actionLabel: 'Resource',
        deliverable: topic.resource,
      },
    );
  }

  const weekKey = startDate.toISOString().slice(0, 10);
  slots.push(
    {
      key: `${weekKey}:weekly-announcement`,
      dayOffset: 0,
      targetChannelBaseName: 'announcements',
      draftType: 'announcement',
      title: 'Weekly Launch - what to build, ask, and submit',
      topic: 'Weekly operating rhythm',
      objective: 'Give approved members a clear weekly map without adding more channels.',
      actionLabel: 'This week',
      deliverable: 'Post the weekly theme, main challenge, live-room reminder, and what counts for points.',
    },
    {
      key: `${weekKey}:intro-prompt`,
      dayOffset: 0,
      targetChannelBaseName: 'introductions',
      draftType: 'announcement',
      title: 'Intro Prompt - make your first ask useful',
      topic: 'Member activation',
      objective: 'Convert newly approved members into routed, useful participants.',
      actionLabel: 'Intro',
      deliverable: 'Share your path, level, current build, blocker, and one thing you want feedback on this week.',
    },
    {
      key: `${weekKey}:project-submissions`,
      dayOffset: 2,
      targetChannelBaseName: 'project-submissions',
      draftType: 'challenge',
      title: 'Project Submission Window - ship one artifact',
      topic: 'Project proof',
      objective: 'Move members from discussion into reviewable work.',
      actionLabel: 'Submission',
      deliverable: 'Submit one link, screenshot, repo, doc, or demo with goal, user, what changed, and next risk.',
    },
    {
      key: `${weekKey}:review-queue`,
      dayOffset: 3,
      targetChannelBaseName: 'review-queue',
      draftType: 'announcement',
      title: 'Review Queue - request specific critique',
      topic: 'Review-driven building',
      objective: 'Teach members to ask for critique that improves the artifact.',
      actionLabel: 'Review request',
      deliverable: 'Ask for one specific review: copy, UX, code, architecture, AI behavior, SEO, cloud, or growth.',
    },
    {
      key: `${weekKey}:content-queue`,
      dayOffset: 4,
      targetChannelBaseName: 'content-queue',
      draftType: 'lesson',
      title: 'Content Queue - turn a question into a durable asset',
      topic: 'Content engine from real activity',
      objective: 'Capture reusable lessons from questions, answers, builds, and reviews.',
      actionLabel: 'Content candidate',
      deliverable: 'Nominate one question, answer, build, resource gap, or repeated confusion that should become a resource.',
    },
    {
      key: `${weekKey}:office-hours`,
      dayOffset: 4,
      targetChannelBaseName: 'office-hours',
      draftType: 'announcement',
      title: 'Office Hours Queue - bring the real blocker',
      topic: 'Live help',
      objective: 'Prepare live sessions around concrete member blockers.',
      actionLabel: 'Queue item',
      deliverable: 'Post the artifact, blocker, decision needed, and what would make the session useful.',
    },
    {
      key: `${weekKey}:accountability`,
      dayOffset: 5,
      targetChannelBaseName: 'accountability',
      draftType: 'announcement',
      title: 'Accountability Check - what shipped this week',
      topic: 'Shipping rhythm',
      objective: 'Create a weekly habit around committed work and visible progress.',
      actionLabel: 'Check-in',
      deliverable: 'Post what you committed to, what shipped, what slipped, and the smallest next action.',
    },
    {
      key: `${weekKey}:weekly-recap`,
      dayOffset: 6,
      targetChannelBaseName: 'wins-showcase',
      draftType: 'weekly_recap',
      title: 'Weekly Recap - builds, questions, wins, and next challenge',
      topic: 'Weekly synthesis',
      objective: 'Summarize the operating loop and point members at the next useful action.',
      actionLabel: 'Weekly recap',
      deliverable: 'Select one useful question, one build prompt, one resource, one win, and one next-week challenge.',
    },
  );

  return slots;
}

export function buildDiscordContentFactoryBody(slot: DiscordContentFactorySlot, date = new Date()): string {
  const dateKey = date.toISOString().slice(0, 10);
  return [
    `# ${slot.title}`,
    `**Theme:** ${slot.topic}`,
    `**Purpose:** ${slot.objective}`,
    `**${slot.actionLabel}:** ${slot.deliverable}`,
    '**How to participate:** Reply with your artifact, blocker, or decision. Good replies can become approved resources, RAG knowledge, or public proof after review.',
    '**Quality bar:** Be specific. Include context, what you tried, what failed, and the next decision you need help with.',
    `**Deliverable:** Post one concrete artifact or answer by the end of ${dateKey}.`,
  ].join('\n\n');
}

export function evaluateDiscordContentFactorySlot(
  slot: DiscordContentFactorySlot,
  input: { startDate?: Date } = {},
): {
  factoryKey: string;
  title: string;
  targetChannelBaseName: string;
  body: string;
  qualityScore: number;
  contentQualityScore: number;
  policyScore: number;
  contentQualityPassed: boolean;
  policyPassed: boolean;
  contentQualityReasons: string[];
  policyReasons: string[];
  reasons: string[];
} {
  const startDate = input.startDate ?? new Date();
  const date = new Date(startDate);
  date.setUTCDate(date.getUTCDate() + slot.dayOffset);
  const factoryKey = `${DISCORD_CONTENT_FACTORY_VERSION}:${slot.key}`;
  const body = buildDiscordContentFactoryBody(slot, date);
  const contentQuality = evaluateDiscordContentDraft({
    id: factoryKey,
    draft_type: slot.draftType,
    title: slot.title,
    body,
    target_channel_base_name: slot.targetChannelBaseName,
  });
  const policy = scoreSageBotPolicyOutput(body, { maxLength: 2200 });
  const qualityScore = Math.min(contentQuality.score, policy.score);
  const reasons = [...contentQuality.reasons, ...policy.reasons];
  return {
    factoryKey,
    title: slot.title,
    targetChannelBaseName: slot.targetChannelBaseName,
    body,
    qualityScore,
    contentQualityScore: contentQuality.score,
    policyScore: policy.score,
    contentQualityPassed: contentQuality.passed,
    policyPassed: policy.passed,
    contentQualityReasons: contentQuality.reasons,
    policyReasons: policy.reasons,
    reasons,
  };
}

export async function runDiscordContentFactory(
  sb: SupabaseClient<any>,
  input: {
    startDate?: Date;
    days?: number;
    force?: boolean;
    dryRun?: boolean;
    runKey?: string;
    now?: Date;
  } = {},
): Promise<DiscordContentFactoryResult> {
  const startDate = input.startDate ?? new Date();
  const now = input.now ?? new Date();
  const days = Math.max(1, Math.min(28, input.days ?? 7));
  const runKey = input.runKey ?? `content-factory-${startDate.toISOString().slice(0, 10)}-${now.toISOString().replace(/[:.]/g, '-')}`;
  const slots = buildDiscordContentFactorySlots(startDate, days);
  const drafts: DiscordContentFactoryResult['drafts'] = [];
  const dryRun = Boolean(input.dryRun);

  for (const slot of slots) {
    const planned = evaluateDiscordContentFactorySlot(slot, { startDate });
    const factoryKey = planned.factoryKey;
    try {
      if (!planned.contentQualityPassed || !planned.policyPassed || planned.qualityScore < 80) {
        throw new Error(`Content factory slot failed quality gate: ${planned.reasons.join('; ') || `score ${planned.qualityScore}`}`);
      }

      if (dryRun) {
        drafts.push({
          factoryKey,
          draftId: null,
          status: 'planned',
          title: planned.title,
          targetChannelBaseName: planned.targetChannelBaseName,
          draftType: slot.draftType,
          topic: slot.topic,
          dayOffset: slot.dayOffset,
          qualityScore: planned.qualityScore,
          error: null,
        });
        continue;
      }

      if (!input.force) {
        const { data: existing, error: existingError } = await sb
          .from('discord_content_drafts')
          .select('id, quality_score')
          .contains('metadata', { factory_key: factoryKey })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existingError) throw existingError;
        if (existing?.id) {
          drafts.push({
            factoryKey,
            draftId: String(existing.id),
            status: 'skipped',
            title: slot.title,
            targetChannelBaseName: slot.targetChannelBaseName,
            draftType: slot.draftType,
            topic: slot.topic,
            dayOffset: slot.dayOffset,
            qualityScore: Number(existing.quality_score ?? 0),
            error: null,
          });
          continue;
        }
      }

      const draft = await createDiscordContentDraft({
        draftType: slot.draftType,
        targetChannelBaseName: slot.targetChannelBaseName,
        title: slot.title,
        body: planned.body,
        promptVersion: DISCORD_CONTENT_FACTORY_PROMPT_VERSION,
        qualityScore: planned.qualityScore,
        status: 'pending_approval',
        metadata: {
          source: DISCORD_CONTENT_FACTORY_VERSION,
          source_kind: 'editorial_seed',
          factory_key: factoryKey,
          run_key: runKey,
          requires_admin_approval: true,
          publish_allowed_before_approval: false,
          topic: slot.topic,
          slot,
          policy_score: planned.policyScore,
          policy_passed: planned.policyPassed,
          policy_reasons: planned.policyReasons,
          content_quality_score: planned.contentQualityScore,
          content_quality_passed: planned.contentQualityPassed,
          content_quality_reasons: planned.contentQualityReasons,
          content_factory_dry_run: false,
          personality_version: SAGEBOT_PERSONALITY_VERSION,
          prompt_versions: SAGEBOT_PROMPT_VERSIONS,
        },
      }, sb);

      drafts.push({
        factoryKey,
        draftId: draft.id,
        status: 'created',
        title: slot.title,
        targetChannelBaseName: slot.targetChannelBaseName,
        draftType: slot.draftType,
        topic: slot.topic,
        dayOffset: slot.dayOffset,
        qualityScore: planned.qualityScore,
        error: null,
      });
    } catch (error) {
      drafts.push({
        factoryKey,
        draftId: null,
        status: 'failed',
        title: slot.title,
        targetChannelBaseName: slot.targetChannelBaseName,
        draftType: slot.draftType,
        topic: slot.topic,
        dayOffset: slot.dayOffset,
        qualityScore: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const created = drafts.filter((draft) => draft.status === 'created').length;
  const planned = drafts.filter((draft) => draft.status === 'planned').length;
  const skipped = drafts.filter((draft) => draft.status === 'skipped').length;
  const failed = drafts.filter((draft) => draft.status === 'failed').length;
  if (!dryRun) {
    await recordDiscordEvent({
      eventType: failed ? 'content_factory_run_blocked' : 'content_factory_run_completed',
      commandName: 'content_factory',
      metadata: {
        run_key: runKey,
        version: DISCORD_CONTENT_FACTORY_VERSION,
        created,
        planned,
        skipped,
        failed,
        days,
      },
    });
  }

  return {
    ok: failed === 0,
    runKey,
    version: DISCORD_CONTENT_FACTORY_VERSION,
    dryRun,
    created,
    planned,
    skipped,
    failed,
    drafts,
  };
}

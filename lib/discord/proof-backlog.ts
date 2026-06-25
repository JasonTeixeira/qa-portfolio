import type { OperatingCycleMetrics } from './operating-proof-cycle-rules';

export type DiscordProofBacklogLane = {
  key: string;
  title: string;
  currentCount: number;
  targetCount: number;
  status: 'passed' | 'blocked';
  sourceTables: string[];
  safeLocalCommand: string | null;
  liveActionRequired: string;
  evidenceRequired: string;
};

export type DiscordProofBacklogReport = {
  ok: true;
  version: 'discord-proof-backlog-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  status: 'passed' | 'blocked';
  lanes: DiscordProofBacklogLane[];
  nextActions: string[];
};

function lane(input: Omit<DiscordProofBacklogLane, 'status'>): DiscordProofBacklogLane {
  return {
    ...input,
    status: input.currentCount >= input.targetCount ? 'passed' : 'blocked',
  };
}

export function buildDiscordProofBacklogReport(input: {
  generatedAt: string;
  metrics: OperatingCycleMetrics;
}): DiscordProofBacklogReport {
  const lanes = [
    lane({
      key: 'approved_discord_knowledge',
      title: 'Approved Discord knowledge',
      currentCount: input.metrics.approvedDiscordKnowledgeSources,
      targetCount: 10,
      sourceTables: [
        'discord_questions',
        'discord_answers',
        'discord_content_queue',
        'discord_content_drafts',
      ],
      safeLocalCommand: 'npm run discord:operating-cycle:dry-run',
      liveActionRequired: 'Approve high-signal questions, answers, resources, wins, reviews, or drafts from /admin/discord.',
      evidenceRequired: 'At least 10 approved Discord knowledge sources before RAG sync and scorecard improvement.',
    }),
    lane({
      key: 'rag_discord_sources',
      title: 'Discord knowledge synced into RAG',
      currentCount: input.metrics.ragDiscordSources,
      targetCount: 10,
      sourceTables: ['rag_sources', 'rag_documents', 'rag_chunks'],
      safeLocalCommand: 'npm run discord:operating-cycle:dry-run',
      liveActionRequired: 'Run the approved Discord RAG sync after approving knowledge candidates.',
      evidenceRequired: 'RAG sources include approved Discord question/answer/content/draft records, not raw unapproved chatter.',
    }),
    lane({
      key: 'public_proof_assets',
      title: 'Public proof growth assets',
      currentCount: input.metrics.pendingPublicDrafts + input.metrics.publishedPublicDrafts,
      targetCount: 4,
      sourceTables: [
        'discord_public_proof_sources',
        'discord_public_growth_drafts',
        'discord_growth_events',
      ],
      safeLocalCommand: 'npm run discord:operating-cycle:dry-run',
      liveActionRequired: 'Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly.',
      evidenceRequired: 'Four weekly proof drafts or published assets with application/source tracking.',
    }),
    lane({
      key: 'premium_workflow_proof',
      title: 'Premium workflow proof',
      currentCount: input.metrics.premiumMembers,
      targetCount: 1,
      sourceTables: [
        'discord_members',
        'discord_premium_review_requests',
        'discord_office_hours_queue',
      ],
      safeLocalCommand: 'npm run discord:smoke-premium-workflows',
      liveActionRequired: 'Run one premium review, deeper-answer, or office-hours flow with a real or intentionally seeded premium scenario.',
      evidenceRequired: 'At least one premium member/request path proves authorization, SLA, and fulfillment behavior.',
    }),
  ];

  const blocked = lanes.filter((item) => item.status === 'blocked');
  return {
    ok: true,
    version: 'discord-proof-backlog-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    status: blocked.length === 0 ? 'passed' : 'blocked',
    lanes,
    nextActions: blocked.map((item) => item.liveActionRequired),
  };
}

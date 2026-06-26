export const DISCORD_FINAL_SCORECARD_VERSION = 'discord-final-scorecard-v2';

export type DiscordScorecardCategory =
  | 'server_access_onboarding'
  | 'role_routing_member_state'
  | 'gateway_capture_classification'
  | 'rag_corpus_quality'
  | 'retrieval_answer_faithfulness'
  | 'eval_coverage'
  | 'sagebot_command_ux_personality'
  | 'content_engine_quality'
  | 'quiz_challenge_learning_engine'
  | 'points_leaderboard_integrity'
  | 'member_intelligence'
  | 'admin_dashboard'
  | 'job_reliability'
  | 'observability'
  | 'premium_workflows'
  | 'growth_loop'
  | 'security_privacy'
  | 'scale_readiness';

export type DiscordScorecardBlocker = {
  owner: string;
  reason: string;
  nextAction: string;
};

export type DiscordScorecardItem = {
  category: DiscordScorecardCategory;
  score: number;
  evidence: string[];
  knownGaps: string[];
  nextAction: string;
  blocker?: DiscordScorecardBlocker;
};

export type DiscordOperatingRhythm = {
  weekly: string[];
  monthly: string[];
  quarterly: string[];
};

export type DiscordReleaseGate = {
  name: string;
  passed: boolean;
  evidence: string;
};

export type DiscordFinalScorecardSummary = {
  averageScore: number;
  categoryCount: number;
  blockedBelow95: DiscordScorecardCategory[];
  worldClassEligible: boolean;
  worldClassThreshold: number;
  requiredOperatingProof: string[];
};

export const REQUIRED_PHASE_EVIDENCE = [
  'docs/evidence/discord-ai-os/phase-8-rag-health-eval-drilldown.json',
  'docs/evidence/discord-ai-os/phase-9-real-discord-capture.json',
  'docs/evidence/discord-ai-os/phase-10-content-jobs-v2.json',
  'docs/evidence/discord-ai-os/phase-11-learning-lab-v2-proof.json',
  'docs/evidence/discord-ai-os/phase-12-learning-lab-scheduler-proof.json',
  'docs/evidence/discord-ai-os/phase-12-member-intelligence-v2-proof.json',
  'docs/evidence/discord-ai-os/phase-13-admin-cockpit-v2-proof.json',
  'docs/evidence/discord-ai-os/phase-14-durable-jobs-proof.json',
  'docs/evidence/discord-ai-os/phase-14-railway-gateway-deploy-proof.json',
  'docs/evidence/discord-ai-os/phase-15-premium-workflows-proof.json',
  'docs/evidence/discord-ai-os/phase-16-public-proof-growth-proof.json',
  'docs/evidence/discord-ai-os/phase-17-observability-quality-v2.json',
  'docs/evidence/discord-ai-os/phase-18-security-privacy-abuse.json',
  'docs/evidence/discord-ai-os/phase-19-scale-failure-readiness.json',
  'docs/evidence/discord-ai-os/phase-22-content-factory-dry-run.json',
  'docs/evidence/rag/eval-latest.json',
  'docs/evidence/rag/eval-missing-plan.json',
  'docs/evidence/rag/eval-coverage-readiness.json',
  'docs/evidence/rag/eval-execution-packet.json',
  'docs/evidence/rag/eval-seed-quality.json',
  'docs/evidence/engineering-loop/proof-rehearsal-readiness-latest.json',
  'docs/evidence/engineering-loop/content-factory-readiness-latest.json',
  'docs/evidence/engineering-loop/discord-proof-source-volume-scan-latest.json',
  'docs/evidence/engineering-loop/discord-proof-source-recovery-plan-latest.json',
];

export function buildDiscordFinalScorecard(): DiscordScorecardItem[] {
  return withRequiredBlockers([
    {
      category: 'server_access_onboarding',
      score: 93,
      evidence: [
        'docs/evidence/discord-ai-os/phase-18-security-privacy-abuse.json',
        'docs/evidence/discord-ai-os/phase-9-real-discord-capture.json',
      ],
      knownGaps: ['Native Discord application answers remain Discord-managed; SageBot only sees what members later provide or what admins approve.'],
      nextAction: 'Weekly check pending applications, stuck approvals, and unapproved visibility.',
    },
    {
      category: 'role_routing_member_state',
      score: 92,
      evidence: [
        'docs/evidence/discord-ai-os/phase-13-admin-cockpit-v2-proof.json',
        'docs/evidence/discord-ai-os/phase-18-security-privacy-abuse.json',
      ],
      knownGaps: ['Role routing should be rechecked after any manual Discord role hierarchy changes.'],
      nextAction: 'Run role/onboarding smoke after changing roles or channel permissions.',
    },
    {
      category: 'gateway_capture_classification',
      score: 88,
      evidence: [
        'docs/evidence/discord-ai-os/phase-9-real-discord-capture.json',
        'docs/evidence/discord-ai-os/phase-14-railway-gateway-deploy-proof.json',
      ],
      knownGaps: ['Capture quality improves as real member questions accumulate.'],
      nextAction: 'Review weekly capture volume and dead letters.',
    },
    {
      category: 'rag_corpus_quality',
      score: 45,
      evidence: [
        'docs/evidence/discord-ai-os/phase-5-authoritative-rag-ingestion.json',
        'docs/evidence/discord-ai-os/phase-8-rag-health-eval-drilldown.json',
        'docs/evidence/rag/eval-latest.json',
      ],
      knownGaps: ['The authoritative Discord corpus still needs more sustained real member questions, answers, and approved resources.'],
      nextAction: 'Approve high-signal Discord candidates weekly and re-run RAG sync/re-embed.',
      blocker: {
        owner: 'community operator',
        reason: 'Corpus quality cannot honestly score 95+ until more real member knowledge exists and is approved into RAG.',
        nextAction: 'Collect two weeks of real questions/reviews/resources, approve candidates, then rerun eval and scorecard.',
      },
    },
    {
      category: 'retrieval_answer_faithfulness',
      score: 89,
      evidence: [
        'docs/evidence/rag/eval-latest.json',
        'docs/evidence/discord-ai-os/phase-3-reranking.json',
        'docs/evidence/discord-ai-os/phase-4-personality-kernel.json',
      ],
      knownGaps: ['Average usefulness can still improve with more high-quality approved Discord sources.'],
      nextAction: 'Review failed/low-scoring eval examples monthly and add source fixes.',
    },
    {
      category: 'eval_coverage',
      score: 84,
      evidence: [
        'docs/evidence/rag/eval-latest.json',
        'docs/evidence/rag/eval-seed-quality.json',
        'docs/evidence/discord-ai-os/phase-8-rag-health-eval-drilldown.json',
        'docs/discord/WORLD_CLASS_PROOF_OPERATING_CONTROLS.md',
      ],
      knownGaps: ['Eval set now covers proof controls, but it must keep expanding from real failures.'],
      nextAction: 'Add eval questions from top weekly RAG failures and member questions.',
    },
    {
      category: 'sagebot_command_ux_personality',
      score: 91,
      evidence: [
        'docs/evidence/discord-ai-os/phase-4-personality-kernel.json',
        'docs/evidence/discord-ai-os/phase-18-security-privacy-abuse.json',
      ],
      knownGaps: ['Slash command UX should be rechecked after every command description update.'],
      nextAction: 'Run Discord smoke after command changes.',
    },
    {
      category: 'content_engine_quality',
      score: 84,
      evidence: [
        'docs/evidence/discord-ai-os/phase-10-content-jobs-v2.json',
        'docs/evidence/discord-ai-os/phase-17-observability-quality-v2.json',
        'docs/evidence/discord-ai-os/phase-22-content-factory-dry-run.json',
      ],
      knownGaps: ['The content factory now has approval-gated dry-run proof, but real approved posts, member responses, public proof drafts, and conversion feedback are still early.'],
      nextAction: 'Run the content factory weekly, approve/reject drafts, publish approved items, and tag member/content outcomes.',
    },
    {
      category: 'quiz_challenge_learning_engine',
      score: 87,
      evidence: [
        'docs/evidence/discord-ai-os/phase-11-learning-lab-v2-proof.json',
        'docs/evidence/discord-ai-os/phase-12-learning-lab-scheduler-proof.json',
      ],
      knownGaps: ['Needs real learner outcome review as membership grows.'],
      nextAction: 'Review quiz/challenge completion and quality weekly.',
    },
    {
      category: 'points_leaderboard_integrity',
      score: 86,
      evidence: [
        'docs/evidence/discord-ai-os/phase-11-learning-lab-v2-proof.json',
        'docs/evidence/discord-ai-os/phase-19-scale-failure-readiness.json',
      ],
      knownGaps: ['Leaderboard anomaly checks need weekly human review.'],
      nextAction: 'Audit top point earners weekly for farming or duplicate awards.',
    },
    {
      category: 'member_intelligence',
      score: 86,
      evidence: [
        'docs/evidence/discord-ai-os/phase-12-member-intelligence-v2-proof.json',
        'docs/evidence/discord-ai-os/phase-13-admin-cockpit-v2-proof.json',
      ],
      knownGaps: ['Segmentation improves with larger member activity history.'],
      nextAction: 'Review stuck/inactive/premium-lead nudges weekly.',
    },
    {
      category: 'admin_dashboard',
      score: 90,
      evidence: [
        'docs/evidence/discord-ai-os/phase-13-admin-cockpit-v2-proof.json',
        'docs/evidence/discord-ai-os/phase-19-scale-failure-readiness.json',
      ],
      knownGaps: ['Dashboard performance should be watched as tables grow.'],
      nextAction: 'Run Phase 19 dashboard query smoke monthly.',
    },
    {
      category: 'job_reliability',
      score: 88,
      evidence: [
        'docs/evidence/discord-ai-os/phase-14-durable-jobs-proof.json',
        'docs/evidence/discord-ai-os/phase-19-scale-failure-readiness.json',
      ],
      knownGaps: ['Provider outages still require operator review.'],
      nextAction: 'Review failed/dead-lettered jobs every operating day.',
    },
    {
      category: 'observability',
      score: 86,
      evidence: [
        'docs/evidence/discord-ai-os/phase-17-observability-quality-v2.json',
        'docs/evidence/discord-ai-os/phase-19-scale-failure-readiness.json',
      ],
      knownGaps: ['Trace coverage needs monitoring as new jobs are added.'],
      nextAction: 'Review cost, quality, trace coverage, and job success weekly.',
    },
    {
      category: 'premium_workflows',
      score: 74,
      evidence: [
        'docs/evidence/discord-ai-os/phase-15-premium-workflows-proof.json',
        'docs/evidence/discord-ai-os/phase-17-observability-quality-v2.json',
      ],
      knownGaps: ['Premium promise must be checked against real fulfillment and Stripe economics.'],
      nextAction: 'Review open premium requests and SLA weekly.',
    },
    {
      category: 'growth_loop',
      score: 58,
      evidence: [
        'docs/evidence/discord-ai-os/phase-16-public-proof-growth-proof.json',
        'docs/evidence/discord-ai-os/phase-17-observability-quality-v2.json',
      ],
      knownGaps: ['Growth loop needs real public conversion data from published proof assets and member invites.'],
      nextAction: 'Publish approved public proof weekly and track applications from it.',
      blocker: {
        owner: 'growth operator',
        reason: 'Growth cannot honestly be 95+ until published proof outputs produce measurable application/member conversion.',
        nextAction: 'Run four weekly public proof cycles and measure applications, approvals, and active members.',
      },
    },
    {
      category: 'security_privacy',
      score: 88,
      evidence: [
        'docs/evidence/discord-ai-os/phase-18-security-privacy-abuse.json',
        'docs/discord/SECURITY_PRIVACY_ABUSE_RUNBOOK.md',
      ],
      knownGaps: ['Manual moderation decisions remain operator-owned.'],
      nextAction: 'Run security/privacy smoke after permission, command, or RAG policy changes.',
    },
    {
      category: 'scale_readiness',
      score: 82,
      evidence: [
        'docs/evidence/discord-ai-os/phase-19-scale-failure-readiness.json',
        'docs/discord/SCALE_FAILURE_READINESS_RUNBOOK.md',
      ],
      knownGaps: ['Synthetic load is not the same as a real 5,000-member live event.'],
      nextAction: 'Repeat Phase 19 after each major growth milestone.',
    },
  ]);
}

function withRequiredBlockers(items: DiscordScorecardItem[]): DiscordScorecardItem[] {
  return items.map((item) => {
    if (item.score >= 95 || item.blocker) return item;
    return {
      ...item,
      blocker: {
        owner: 'system operator',
        reason: item.knownGaps[0] ?? `${item.category} still needs stronger proof before it can honestly score 95+.`,
        nextAction: item.nextAction,
      },
    };
  });
}

export function buildDiscordOperatingRhythm(): DiscordOperatingRhythm {
  return {
    weekly: [
      'Review pending Discord applications and rejected/approved counts.',
      'Nudge approved members stuck before /onboard or first contribution.',
      'Answer or route unanswered questions.',
      'Approve, reject, or block pending knowledge candidates.',
      'Review failed RAG evals and create source-fix tasks.',
      'Approve or reject pending daily/weekly content drafts.',
      'Retry, resolve, or escalate failed jobs and dead letters.',
      'Audit leaderboard anomalies and reverse bad point awards with compensating entries.',
      'Review premium requests, SLA, and office-hours queue.',
      'Publish approved public proof and track application source.',
    ],
    monthly: [
      'Refresh the RAG eval set from real failures and top community questions.',
      'Review RAG corpus health and remove stale, private, or low-quality sources.',
      'Update source registry and news/action themes.',
      'Review content conversion from Discord proof to applications.',
      'Review member segments, stuck cohorts, and premium leads.',
      'Review premium fulfillment quality, SLA, and economics.',
      'Archive stale drafts, stale candidates, and low-quality content queue items.',
    ],
    quarterly: [
      'Run scale readiness and failure smoke against current table sizes.',
      'Run security/privacy/permission audit and review abuse reports.',
      'Review DeepSeek/RAG/job cost posture and budget thresholds.',
      'Review premium price, margin, fulfillment load, and promise.',
      'Review community quality bar, moderation decisions, and channel sprawl.',
    ],
  };
}

export function validateDiscordFinalScorecard(scorecard: DiscordScorecardItem[]): {
  ok: boolean;
  failures: string[];
  categoryCount: number;
  averageScore: number;
  blockedBelow95: DiscordScorecardCategory[];
} {
  const categories = new Set<DiscordScorecardCategory>();
  const failures: string[] = [];
  for (const item of scorecard) {
    categories.add(item.category);
    if (!Number.isInteger(item.score) || item.score < 0 || item.score > 99) failures.push(`${item.category}:invalid_score`);
    if (item.evidence.length === 0) failures.push(`${item.category}:missing_evidence`);
    if (!item.nextAction.trim()) failures.push(`${item.category}:missing_next_action`);
    if (item.score >= 95 && item.evidence.length < 2) failures.push(`${item.category}:score_95_without_multiple_evidence_items`);
    if (item.score < 95 && !item.blocker) failures.push(`${item.category}:below_95_without_blocker`);
    if (item.blocker && (!item.blocker.owner || !item.blocker.reason || !item.blocker.nextAction)) failures.push(`${item.category}:incomplete_blocker`);
  }
  const expectedCount = 18;
  if (categories.size !== expectedCount) failures.push(`expected_${expectedCount}_categories_got_${categories.size}`);
  const averageScore = Math.round(scorecard.reduce((sum, item) => sum + item.score, 0) / Math.max(1, scorecard.length));
  const blockedBelow95 = scorecard.filter((item) => item.score < 95).map((item) => item.category);
  return {
    ok: failures.length === 0,
    failures,
    categoryCount: categories.size,
    averageScore,
    blockedBelow95,
  };
}

export function buildDiscordFinalScorecardSummary(scorecard: DiscordScorecardItem[]): DiscordFinalScorecardSummary {
  const validation = validateDiscordFinalScorecard(scorecard);
  const requiredOperatingProof = Array.from(new Set(scorecard
    .filter((item) => item.score < 95)
    .map((item) => item.blocker?.nextAction || item.nextAction)
    .filter((action) => action.trim().length > 0)));
  return {
    averageScore: validation.averageScore,
    categoryCount: validation.categoryCount,
    blockedBelow95: validation.blockedBelow95,
    worldClassEligible: validation.ok && validation.averageScore >= 95 && validation.blockedBelow95.length === 0,
    worldClassThreshold: 95,
    requiredOperatingProof,
  };
}

export function validateDiscordOperatingRhythm(rhythm: DiscordOperatingRhythm): {
  ok: boolean;
  failures: string[];
} {
  const failures = [
    rhythm.weekly.length >= 10 ? null : 'weekly_checklist_incomplete',
    rhythm.monthly.length >= 7 ? null : 'monthly_checklist_incomplete',
    rhythm.quarterly.length >= 5 ? null : 'quarterly_checklist_incomplete',
  ].filter(Boolean) as string[];
  return { ok: failures.length === 0, failures };
}

export type DiscordContentFactoryReadinessInput = {
  generatedAt: string;
  evidence: any;
  minPlannedDrafts?: number;
  minQualityScore?: number;
};

export type DiscordContentFactoryReadinessReport = {
  ok: boolean;
  version: 'discord-content-factory-readiness-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  sourceEvidence: string;
  dryRun: boolean;
  planned: number;
  created: number;
  skipped: number;
  failed: number;
  draftCount: number;
  minQualityScore: number | null;
  channelCoverage: string[];
  draftTypeCoverage: string[];
  topicCoverageCount: number;
  approvalGate: {
    noPublicPublish: boolean;
    adminApprovalRequired: boolean;
    readOnly: boolean;
  };
  failures: string[];
  releaseMeaning: string;
};

function uniqueSorted(values: unknown[]): string[] {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))].sort();
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function buildDiscordContentFactoryReadinessReport(
  input: DiscordContentFactoryReadinessInput,
): DiscordContentFactoryReadinessReport {
  const minPlannedDrafts = input.minPlannedDrafts ?? 28;
  const minQualityScore = input.minQualityScore ?? 90;
  const evidence = input.evidence ?? {};
  const drafts = Array.isArray(evidence.drafts) ? evidence.drafts : [];
  const qualityScores = drafts
    .map((draft: any) => finiteNumber(draft?.qualityScore))
    .filter((score: number | null): score is number => score !== null);
  const observedMinQualityScore = qualityScores.length ? Math.min(...qualityScores) : finiteNumber(evidence.safety?.minQualityScore);
  const channelCoverage = uniqueSorted(evidence.safety?.channelCoverage ?? drafts.map((draft: any) => draft?.targetChannelBaseName));
  const draftTypeCoverage = uniqueSorted(evidence.safety?.draftTypeCoverage ?? drafts.map((draft: any) => draft?.draftType));
  const topicCoverage = uniqueSorted(evidence.safety?.topicCoverage ?? drafts.map((draft: any) => draft?.topic));
  const failures: string[] = [];

  if (evidence.ok !== true) failures.push('source_evidence_not_ok');
  if (evidence.version !== 'discord-content-factory-v1') failures.push('wrong_content_factory_version');
  if (evidence.dryRun !== true || evidence.safety?.dryRun !== true) failures.push('not_dry_run');
  if (evidence.created !== 0 || evidence.safety?.createdDrafts !== 0) failures.push('dry_run_created_drafts');
  if (evidence.skipped !== 0 || evidence.safety?.skippedDrafts !== 0) failures.push('dry_run_skipped_drafts');
  if (evidence.failed !== 0 || evidence.safety?.failedDrafts !== 0) failures.push('dry_run_failed_drafts');
  if (evidence.safety?.readOnly !== true) failures.push('dry_run_not_read_only');
  if (evidence.safety?.noPublicPublish !== true) failures.push('public_publish_not_blocked');
  if (evidence.safety?.adminApprovalRequired !== true) failures.push('admin_approval_not_required');
  if (evidence.channelValidation?.ok !== true || evidence.safety?.canonicalChannels !== true) failures.push('canonical_channel_validation_failed');
  if ((evidence.channelValidation?.unknownChannels ?? evidence.safety?.unknownChannels ?? []).length > 0) failures.push('unknown_channels_present');
  if (Number(evidence.planned ?? 0) < minPlannedDrafts) failures.push('insufficient_planned_drafts');
  if (drafts.length !== Number(evidence.planned ?? drafts.length)) failures.push('draft_count_mismatch');
  if (!drafts.every((draft: any) => draft?.status === 'planned' && draft?.draftId === null)) failures.push('dry_run_drafts_not_planned_only');
  if (observedMinQualityScore === null || observedMinQualityScore < minQualityScore) failures.push('quality_score_below_gate');
  if (channelCoverage.length < 10) failures.push('insufficient_channel_coverage');
  if (draftTypeCoverage.length < 5) failures.push('insufficient_draft_type_coverage');
  if (topicCoverage.length < 7) failures.push('insufficient_topic_coverage');

  return {
    ok: failures.length === 0,
    version: 'discord-content-factory-readiness-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    sourceEvidence: 'docs/evidence/discord-ai-os/phase-22-content-factory-dry-run.json',
    dryRun: evidence.dryRun === true,
    planned: Number(evidence.planned ?? 0),
    created: Number(evidence.created ?? 0),
    skipped: Number(evidence.skipped ?? 0),
    failed: Number(evidence.failed ?? 0),
    draftCount: drafts.length,
    minQualityScore: observedMinQualityScore,
    channelCoverage,
    draftTypeCoverage,
    topicCoverageCount: topicCoverage.length,
    approvalGate: {
      noPublicPublish: evidence.safety?.noPublicPublish === true,
      adminApprovalRequired: evidence.safety?.adminApprovalRequired === true,
      readOnly: evidence.safety?.readOnly === true,
    },
    failures,
    releaseMeaning: 'Content factory readiness only proves local dry-run quality and approval gates. Real operating proof still requires admin-approved publishing, member responses, and weekly growth-cycle evidence.',
  };
}

export function validateDiscordContentFactoryReadinessReport(report: DiscordContentFactoryReadinessReport): {
  ok: boolean;
  failures: string[];
} {
  const failures = [...report.failures];
  if (report.version !== 'discord-content-factory-readiness-v1') failures.push('wrong_readiness_version');
  if (report.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (!report.releaseMeaning.includes('Real operating proof still requires admin-approved publishing')) {
    failures.push('missing_operating_proof_disclaimer');
  }
  return {
    ok: report.ok === true && failures.length === 0,
    failures,
  };
}

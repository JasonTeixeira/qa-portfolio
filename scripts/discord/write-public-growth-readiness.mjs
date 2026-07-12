import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'public-growth-readiness-latest.json');

const paths = {
  publicProof: 'docs/evidence/discord-ai-os/phase-16-public-proof-growth-proof.json',
  publicProofLib: 'lib/discord/public-proof.ts',
  operatingCycle: 'lib/discord/operating-proof-cycle.ts',
  operatingCycleRules: 'lib/discord/operating-proof-cycle-rules.ts',
  proofBacklog: 'lib/discord/proof-backlog.ts',
  adminActions: 'app/(main)/admin/discord/actions.ts',
  adminPage: 'app/(main)/admin/discord/page.tsx',
  landingPage: 'app/(main)/discord/page.tsx',
  migration: 'supabase/migrations/0090_discord_public_proof_growth.sql',
  packageJson: 'package.json',
};

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function includesAll(text, patterns) {
  return patterns.every((pattern) => text.includes(pattern));
}

function validatePublicGrowthReadiness(evidence) {
  const failures = [];
  const checkNames = new Set((evidence.checks ?? []).map((check) => check.name));
  const failedChecks = (evidence.checks ?? []).filter((check) => check.passed !== true).map((check) => check.name);

  if (evidence.version !== 'public-growth-readiness-v1') failures.push('invalid_version');
  if (evidence.mutationMode !== 'local_file_evidence_only') failures.push('invalid_mutation_mode');
  if (evidence.ok !== (failedChecks.length === 0)) failures.push('ok_does_not_match_check_failures');
  if ((evidence.failures ?? []).join('|') !== failedChecks.join('|')) failures.push('failures_do_not_match_failed_checks');
  if (!checkNames.has('seeded_public_growth_proof_passes')) failures.push('missing_seeded_public_growth_proof_check');
  if (!checkNames.has('privacy_and_quality_gates_wired')) failures.push('missing_privacy_quality_gate_check');
  if (!checkNames.has('operating_cycle_tracks_growth_metrics')) failures.push('missing_growth_metrics_check');
  if (evidence.proofSummary?.seededProofOk !== true) failures.push('seeded_proof_not_ok');
  if (evidence.proofSummary?.privacyBlocksPrivateData !== true) failures.push('privacy_block_not_proven');
  if (evidence.proofSummary?.sourceCreated !== true || evidence.proofSummary?.draftCreated !== true) failures.push('public_growth_source_or_draft_missing');
  if (evidence.proofSummary?.draftStatus !== 'pending_approval') failures.push('draft_not_approval_gated');
  if (Number(evidence.proofSummary?.privacyScore ?? 0) < 90) failures.push('privacy_score_below_gate');
  if (Number(evidence.proofSummary?.qualityScore ?? 0) < 80) failures.push('quality_score_below_gate');
  if (evidence.proofSummary?.utmCampaign !== 'discord_public_proof') failures.push('utm_campaign_missing');
  if (!(evidence.releaseMeaning ?? '').includes('does not mutate Supabase, publish externally, create growth events')) failures.push('release_meaning_overclaims');
  if (!(evidence.antiFakeRules ?? []).some((rule) => rule.includes('four weekly public proof cycles'))) failures.push('missing_weekly_cycle_anti_fake_rule');
  if (!(evidence.antiFakeRules ?? []).some((rule) => rule.includes('UTM/source attribution'))) failures.push('missing_attribution_anti_fake_rule');
  if (!(evidence.nextOperatingProofRequired ?? []).some((item) => item.includes('four privacy-safe public proof drafts'))) failures.push('missing_four_cycle_next_proof');

  return {
    ok: failures.length === 0,
    validator: 'public-growth-readiness-validator-v1',
    validatedAt: new Date().toISOString(),
    failures,
  };
}

async function main() {
  const [
    proofRaw,
    publicProofLib,
    operatingCycle,
    operatingCycleRules,
    proofBacklog,
    adminActions,
    adminPage,
    landingPage,
    migration,
    packageRaw,
  ] = await Promise.all([
    read(paths.publicProof),
    read(paths.publicProofLib),
    read(paths.operatingCycle),
    read(paths.operatingCycleRules),
    read(paths.proofBacklog),
    read(paths.adminActions),
    read(paths.adminPage),
    read(paths.landingPage),
    read(paths.migration),
    read(paths.packageJson),
  ]);
  const proof = JSON.parse(proofRaw);
  const packageJson = JSON.parse(packageRaw);

  const checks = [
    {
      name: 'seeded_public_growth_proof_passes',
      passed: proof.ok === true
        && proof.checks?.privacy_blocks_private_data === true
        && proof.checks?.source_created === true
        && proof.checks?.draft_created === true
        && proof.checks?.provenance_visible === true
        && proof.checks?.funnel_page_present === true
        && proof.checks?.growth_tables_present === true
        && Number(proof.draftRow?.privacy_score ?? 0) >= 90
        && Number(proof.draftRow?.quality_score ?? 0) >= 80,
      evidence: paths.publicProof,
    },
    {
      name: 'privacy_and_quality_gates_wired',
      passed: publicProofLib.includes('PUBLIC_PROOF_MIN_PRIVACY_SCORE = 90')
        && publicProofLib.includes('PUBLIC_PROOF_MIN_QUALITY_SCORE = 80')
        && publicProofLib.includes('scorePublicProofPrivacy')
        && publicProofLib.includes('public_proof_source_blocked')
        && publicProofLib.includes('pending_approval'),
      evidence: paths.publicProofLib,
    },
    {
      name: 'growth_schema_wired',
      passed: includesAll(migration, [
        'discord_public_proof_sources',
        'discord_public_growth_drafts',
        'discord_growth_events',
        'permission_status',
        'privacy_score',
        'quality_score',
        'utm_campaign',
      ]),
      evidence: paths.migration,
    },
    {
      name: 'admin_review_and_publish_actions_wired',
      passed: adminActions.includes('public_proof_source_reviewed')
        && adminActions.includes('public_growth_draft_reviewed')
        && adminActions.includes('public_growth_draft_published')
        && adminActions.includes('requireAdmin'),
      evidence: paths.adminActions,
    },
    {
      name: 'admin_dashboard_growth_surfaces_wired',
      passed: includesAll(adminPage, [
        'Public proof source permissions',
        'Public proof growth drafts',
        'Public proof growth event ledger',
        'data-testid="discord-public-proof-growth-lane"',
        'data-testid="discord-public-proof-growth-events"',
      ]),
      evidence: paths.adminPage,
    },
    {
      name: 'public_funnel_attribution_wired',
      passed: landingPage.includes('Sage Ideas Discord')
        && landingPage.includes('Apply to join')
        && landingPage.includes('utm_campaign=discord_public_proof'),
      evidence: paths.landingPage,
    },
    {
      name: 'operating_cycle_tracks_growth_metrics',
      passed: operatingCycle.includes("discord_growth_events")
        && operatingCycle.includes("countRows(sb, 'discord_growth_events', 'event_type', 'apply_click')")
        && operatingCycle.includes("event_type: 'source_created'")
        && operatingCycle.includes("event_type: 'draft_created'")
        && operatingCycle.includes('discord_public_growth_drafts')
        && operatingCycle.includes('discord_public_proof_sources')
        && operatingCycleRules.includes('public_proof_draft_created')
        && operatingCycleRules.includes('growth_metrics_tracked'),
      evidence: `${paths.operatingCycle}, ${paths.operatingCycleRules}`,
    },
    {
      name: 'backlog_requires_real_public_proof_cycles',
      passed: proofBacklog.includes('public_proof_assets')
        && proofBacklog.includes('Application or attribution path can track the growth cycle')
        && proofBacklog.includes('Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly'),
      evidence: paths.proofBacklog,
    },
    {
      name: 'public_growth_smoke_command_available',
      passed: packageJson.scripts?.['discord:smoke-public-proof-growth'] === 'tsx --env-file=.env.local scripts/discord/smoke-public-proof-growth.ts',
      evidence: 'package.json',
    },
  ];

  const failures = checks.filter((check) => check.passed !== true).map((check) => check.name);
  const evidence = {
    ok: failures.length === 0,
    version: 'public-growth-readiness-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    sourceEvidence: paths,
    checks,
    proofSummary: {
      seededProofOk: proof.ok === true,
      privacyBlocksPrivateData: proof.checks?.privacy_blocks_private_data === true,
      sourceCreated: proof.checks?.source_created === true,
      draftCreated: proof.checks?.draft_created === true,
      draftStatus: proof.draftRow?.status ?? null,
      privacyScore: Number(proof.draftRow?.privacy_score ?? 0),
      qualityScore: Number(proof.draftRow?.quality_score ?? 0),
      utmCampaign: proof.draftRow?.utm_campaign ?? null,
    },
    antiFakeRules: [
      'Do not count public proof drafts without approved or anonymized source provenance.',
      'Do not count privacy-blocked or private member content as public growth proof.',
      'Do not count a public proof asset toward growth proof without UTM/source attribution.',
      'Do not count seeded smoke proof as four weekly public proof cycles or real application conversion.',
    ],
    nextOperatingProofRequired: [
      'Create four privacy-safe public proof drafts from approved Discord source material.',
      'Approve or reject each public proof draft in /admin/discord before external publishing.',
      'Publish at least one approved public proof asset with tracked apply/join attribution.',
      'Measure applications, approvals, active members, and premium conversions after each public proof cycle.',
    ],
    failures,
    releaseMeaning: 'Public growth readiness proves local wiring and seeded smoke proof only. It does not mutate Supabase, publish externally, create growth events, or prove four weekly public proof cycles.',
  };
  evidence.validation = validatePublicGrowthReadiness(evidence);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  if (!evidence.ok || evidence.validation.ok !== true) {
    console.error(JSON.stringify(evidence, null, 2));
    process.exit(1);
  }
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

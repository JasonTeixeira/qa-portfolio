import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'premium-workflow-readiness-latest.json');

const paths = {
  premiumProof: 'docs/evidence/discord-ai-os/phase-15-premium-workflows-proof.json',
  premiumWorkflows: 'lib/discord/premium-workflows.ts',
  premiumStripe: 'lib/discord/premium.ts',
  commands: 'lib/discord/sage-commands.ts',
  register: 'scripts/discord/register-sage-commands.mjs',
  adminActions: 'app/admin/discord/actions.ts',
  adminPage: 'app/admin/discord/page.tsx',
  migrationV1: 'supabase/migrations/0072_discord_premium_workflows.sql',
  migrationV2: 'supabase/migrations/0089_discord_premium_workflows_v2.sql',
  packageJson: 'package.json',
};

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function includesAll(text, patterns) {
  return patterns.every((pattern) => text.includes(pattern));
}

function eventTypes(events) {
  return new Set((Array.isArray(events) ? events : []).map((event) => String(event?.event_type ?? event?.eventType ?? '')));
}

async function main() {
  const [
    proofRaw,
    premiumWorkflows,
    premiumStripe,
    commands,
    register,
    adminActions,
    adminPage,
    migrationV1,
    migrationV2,
    packageRaw,
  ] = await Promise.all([
    read(paths.premiumProof),
    read(paths.premiumWorkflows),
    read(paths.premiumStripe),
    read(paths.commands),
    read(paths.register),
    read(paths.adminActions),
    read(paths.adminPage),
    read(paths.migrationV1),
    read(paths.migrationV2),
    read(paths.packageJson),
  ]);
  const proof = JSON.parse(proofRaw);
  const packageJson = JSON.parse(packageRaw);
  const events = eventTypes(proof.lifecycleEvents);

  const checks = [
    {
      name: 'seeded_premium_proof_passes',
      passed: proof.ok === true
        && proof.review?.priority === 95
        && proof.reviewRow?.status === 'answered'
        && Number(proof.reviewRow?.response_quality_score ?? 0) >= 80
        && proof.officeHours?.premiumMember === true
        && Boolean(proof.answer?.answerId)
        && Boolean(proof.answer?.retrievalLogId),
      evidence: paths.premiumProof,
    },
    {
      name: 'premium_lifecycle_events_present',
      passed: ['requested', 'assigned', 'answered'].every((event) => events.has(event)),
      evidence: [...events].sort().join(', '),
    },
    {
      name: 'premium_authorization_gate_wired',
      passed: premiumWorkflows.includes('isPremiumDiscordMember')
        && premiumWorkflows.includes("throw new Error('Premium answers require Premium Member access.')")
        && premiumWorkflows.includes('validateRagUserInputSecurity'),
      evidence: paths.premiumWorkflows,
    },
    {
      name: 'premium_quality_and_sla_gates_wired',
      passed: premiumWorkflows.includes('PREMIUM_REVIEW_SLA_HOURS = 48')
        && premiumWorkflows.includes('PREMIUM_RESPONSE_MIN_QUALITY_SCORE = 80')
        && premiumWorkflows.includes('evaluatePremiumResponseQuality')
        && premiumWorkflows.includes('Premium response failed quality gate'),
      evidence: paths.premiumWorkflows,
    },
    {
      name: 'premium_storage_schema_wired',
      passed: includesAll(migrationV1, [
        'discord_premium_review_requests',
        'discord_premium_answer_requests',
        'discord_office_hours_queue',
      ]) && includesAll(migrationV2, [
        'discord_premium_workflow_events',
        'response_quality_score',
        'sla_due_at',
        'follow_up_due_at',
      ]),
      evidence: `${paths.migrationV1}, ${paths.migrationV2}`,
    },
    {
      name: 'premium_slash_commands_registered',
      passed: includesAll(commands, ["name: 'premium-review'", "name: 'premium-ask'", "name: 'premium'"])
        && includesAll(register, ["name: 'premium-review'", "name: 'premium-ask'", "name: 'premium'"]),
      evidence: `${paths.commands}, ${paths.register}`,
    },
    {
      name: 'premium_admin_review_actions_wired',
      passed: adminActions.includes('requireAdmin')
        && adminActions.includes('assignDiscordPremiumReviewAction')
        && adminActions.includes('completeDiscordPremiumReviewAction')
        && adminActions.includes('premium_review_completed'),
      evidence: paths.adminActions,
    },
    {
      name: 'premium_admin_dashboard_wired',
      passed: includesAll(adminPage, [
        'Premium operations',
        'Premium proof ledger',
        'Premium leads',
        'PremiumProofReviewRow',
        'PremiumWorkflowEventRow',
      ]),
      evidence: paths.adminPage,
    },
    {
      name: 'stripe_role_sync_wired',
      passed: premiumStripe.includes('STRIPE_PRICE_DISCORD_PREMIUM')
        && premiumStripe.includes('syncDiscordPremiumFromCheckout')
        && premiumStripe.includes('syncDiscordPremiumFromSubscription')
        && premiumStripe.includes("assignRole(discordUserId, 'Premium Member')")
        && premiumStripe.includes("removeRole(discordUserId, 'Premium Member')"),
      evidence: paths.premiumStripe,
    },
    {
      name: 'premium_smoke_command_available',
      passed: packageJson.scripts?.['discord:smoke-premium-workflows'] === 'tsx --env-file=.env.local scripts/discord/smoke-premium-workflows.ts',
      evidence: 'package.json',
    },
  ];

  const failures = checks.filter((check) => check.passed !== true).map((check) => check.name);
  const evidence = {
    ok: failures.length === 0,
    version: 'premium-workflow-readiness-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    sourceEvidence: paths,
    checks,
    proofSummary: {
      seededProofOk: proof.ok === true,
      reviewStatus: proof.reviewRow?.status ?? null,
      qualityScore: Number(proof.reviewRow?.response_quality_score ?? 0),
      lifecycleEvents: [...events].sort(),
      officeHoursPremiumMember: proof.officeHours?.premiumMember === true,
      ragAnswerPresent: Boolean(proof.answer?.answerId),
      retrievalLogPresent: Boolean(proof.answer?.retrievalLogId),
    },
    antiFakeRules: [
      'Do not count Premium Member role alone as premium workflow fulfillment.',
      'Do not count queued premium requests without an answered/completed outcome.',
      'Do not count seeded smoke proof as live Stripe economics proof.',
      'Do not grant premium-only answer workflows to users who fail the premium_member authorization check.',
    ],
    nextOperatingProofRequired: [
      'Fulfill one real premium review, premium answer, or office-hours item with a real premium member or explicitly seeded premium scenario.',
      'Verify Stripe checkout/subscription role sync in the live environment before claiming monetization proof.',
      'Review premium SLA, response quality, and fulfillment load weekly from /admin/discord.',
      'Record premium economics separately before changing price or promise.',
    ],
    failures,
    releaseMeaning: 'Premium workflow readiness proves local wiring and a seeded proof artifact only. It does not mutate Supabase, call RAG, create Stripe sessions, change Discord roles, or prove live premium fulfillment/economics.',
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  if (!evidence.ok) {
    console.error(JSON.stringify(evidence, null, 2));
    process.exit(1);
  }
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

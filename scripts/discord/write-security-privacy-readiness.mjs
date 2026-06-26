import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'security-privacy-readiness-latest.json');

const paths = {
  securityPrivacy: 'lib/discord/security-privacy.ts',
  securitySmoke: 'scripts/discord/smoke-security-privacy-abuse.ts',
  securityProof: 'docs/evidence/discord-ai-os/phase-18-security-privacy-abuse.json',
  runbook: 'docs/discord/SECURITY_PRIVACY_ABUSE_RUNBOOK.md',
  migration: 'supabase/migrations/0092_discord_security_audit_runs.sql',
  interactionRoute: 'app/api/discord/interactions/route.ts',
  signature: 'lib/discord/signature.ts',
  askSage: 'lib/discord/ask-sage.ts',
  premiumWorkflows: 'lib/discord/premium-workflows.ts',
  sageCommands: 'lib/discord/sage-commands.ts',
  publicProof: 'lib/discord/public-proof.ts',
  adminActions: 'app/admin/discord/actions.ts',
  packageJson: 'package.json',
};

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function includesAll(text, patterns) {
  return patterns.every((pattern) => text.includes(pattern));
}

async function main() {
  const [
    securityPrivacy,
    securitySmoke,
    securityProofRaw,
    runbook,
    migration,
    interactionRoute,
    signature,
    askSage,
    premiumWorkflows,
    sageCommands,
    publicProof,
    adminActions,
    packageRaw,
  ] = await Promise.all([
    read(paths.securityPrivacy),
    read(paths.securitySmoke),
    read(paths.securityProof),
    read(paths.runbook),
    read(paths.migration),
    read(paths.interactionRoute),
    read(paths.signature),
    read(paths.askSage),
    read(paths.premiumWorkflows),
    read(paths.sageCommands),
    read(paths.publicProof),
    read(paths.adminActions),
    read(paths.packageJson),
  ]);
  const securityProof = JSON.parse(securityProofRaw);
  const packageJson = JSON.parse(packageRaw);
  const proofChecks = securityProof.checks ?? {};

  const checks = [
    {
      name: 'security_privacy_core_guards_wired',
      passed: includesAll(securityPrivacy, [
        'DISCORD_SECURITY_PRIVACY_VERSION',
        'sanitizeDiscordOutboundText',
        'detectPromptInjection',
        'scoreDiscordPrivacyRisk',
        'classifyDiscordAbuse',
        'validateRagUserInputSecurity',
        'auditDiscordPermissionMatrix',
        'auditAdminActionSource',
        'private_identifier_or_secret',
        'prompt_injection_instruction',
      ]),
      evidence: paths.securityPrivacy,
    },
    {
      name: 'rag_and_premium_inputs_use_security_guard',
      passed: includesAll(askSage, ['validateRagUserInputSecurity'])
        && includesAll(premiumWorkflows, ['validateRagUserInputSecurity']),
      evidence: `${paths.askSage}, ${paths.premiumWorkflows}`,
    },
    {
      name: 'discord_interactions_have_signature_freshness_and_rate_limit',
      passed: includesAll(signature, ['verifyDiscordRequestSignature', 'timestampFresh', 'maxAgeSeconds'])
        && includesAll(interactionRoute, ['verifyDiscordRequestSignature', 'checkRateLimitFromHeaders', 'discord-interactions']),
      evidence: `${paths.signature}, ${paths.interactionRoute}`,
    },
    {
      name: 'commands_sanitize_outputs_and_route_reports',
      passed: includesAll(sageCommands, [
        'sanitizeDiscordOutboundText',
        'classifyDiscordAbuse',
        'member_report_submitted',
        'team-ops',
      ]),
      evidence: paths.sageCommands,
    },
    {
      name: 'public_proof_privacy_gate_wired',
      passed: includesAll(publicProof, [
        'scorePublicProofPrivacy',
        'private_identifier_or_secret',
        'PUBLIC_PROOF_MIN_PRIVACY_SCORE = 90',
        'permission_status',
        'blocked',
      ]),
      evidence: paths.publicProof,
    },
    {
      name: 'admin_mutations_are_auth_guarded',
      passed: adminActions.includes("import { requireAdmin }")
        && (adminActions.match(/^export async function \w+/gm)?.length ?? 0) > 10
        && (adminActions.match(/requireAdmin\(/g)?.length ?? 0) >= (adminActions.match(/^export async function \w+/gm)?.length ?? 0),
      evidence: paths.adminActions,
    },
    {
      name: 'security_audit_schema_and_runbook_wired',
      passed: includesAll(migration, [
        'create table if not exists public.discord_security_audit_runs',
        'permission_ok boolean',
        'admin_auth_ok boolean',
        'ai_security_ok boolean',
        'privacy_ok boolean',
        'abuse_controls_ok boolean',
        'signature_freshness_ok boolean',
        'rate_limit_ok boolean',
        'alter table public.discord_security_audit_runs enable row level security',
      ]) && includesAll(runbook, [
        'Access Model',
        'Admin Mutations',
        'AI Input Safety',
        'Abuse Workflow',
        'Retention And Privacy',
        'Export And Delete Plan',
      ]),
      evidence: `${paths.migration}, ${paths.runbook}`,
    },
    {
      name: 'phase_18_smoke_proof_covers_live_permission_and_abuse_controls',
      passed: securityProof.ok === true
        && proofChecks.permission_audit_passes_safe_matrix === true
        && proofChecks.permission_audit_fails_bad_matrix === true
        && proofChecks.admin_actions_require_admin === true
        && proofChecks.prompt_injection_blocked === true
        && proofChecks.privacy_guard_blocks_private_data === true
        && proofChecks.abuse_classifier_routes_spam === true
        && proofChecks.outbound_mentions_suppressed === true
        && proofChecks.signature_freshness_wired === true
        && proofChecks.interaction_rate_limit_wired === true
        && proofChecks.rag_ai_guard_wired === true
        && proofChecks.report_abuse_wired === true
        && proofChecks.public_privacy_guard_present === true
        && proofChecks.retention_export_delete_runbook_present === true
        && proofChecks.live_permission_audit_passed === true,
      evidence: paths.securityProof,
    },
    {
      name: 'live_smoke_is_explicit_and_not_in_local_gate',
      passed: packageJson.scripts?.['discord:smoke-security-privacy'] === 'tsx --env-file=.env.local scripts/discord/smoke-security-privacy-abuse.ts'
        && packageJson.scripts?.['discord:security-privacy-readiness'] === 'node scripts/discord/write-security-privacy-readiness.mjs'
        && securitySmoke.includes('auditLiveDiscordPermissions')
        && securitySmoke.includes("sb.from('discord_security_audit_runs').insert"),
      evidence: `${paths.packageJson}, ${paths.securitySmoke}`,
    },
  ];

  const failures = checks.filter((check) => check.passed !== true).map((check) => check.name);
  const evidence = {
    ok: failures.length === 0,
    version: 'security-privacy-readiness-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    sourceEvidence: paths,
    checks,
    proofSummary: {
      smokeProofOk: securityProof.ok === true,
      livePermissionAuditPassed: proofChecks.live_permission_audit_passed === true,
      promptInjectionBlocked: proofChecks.prompt_injection_blocked === true,
      privacyGuardBlocksPrivateData: proofChecks.privacy_guard_blocks_private_data === true,
      reportAbuseWired: proofChecks.report_abuse_wired === true,
      adminActionsGuarded: checks.find((check) => check.name === 'admin_mutations_are_auth_guarded')?.passed === true,
      publicProofPrivacyGate: checks.find((check) => check.name === 'public_proof_privacy_gate_wired')?.passed === true,
    },
    antiFakeRules: [
      'Do not count this local readiness file as a fresh live Discord permission audit.',
      'Do not treat automated abuse classification as a moderator decision or ban/mute action.',
      'Do not publish public proof unless privacy score passes and permission status is explicit or anonymized.',
      'Do not process RAG or premium questions that include prompt injection, secrets, credentials, or private member/client data.',
    ],
    nextOperatingProofRequired: [
      'Run the live security/privacy smoke after role, channel permission, interaction, RAG, premium, or public-proof policy changes.',
      'Review moderator decisions for reported abuse and false positives during each operating cycle.',
      'Audit unapproved member visibility and premium/team-ops restrictions after Discord channel changes.',
      'Exercise export/delete handling when a real member privacy request arrives.',
    ],
    failures,
    releaseMeaning: 'Security/privacy readiness proves local guard wiring and reviews the latest Phase 18 smoke proof. It does not mutate Supabase, call Discord, create audit rows, moderate members, or prove a fresh live permission audit.',
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

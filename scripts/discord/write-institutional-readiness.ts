import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

type EnvCheck = {
  name: string;
  present: boolean;
  source: 'local' | 'vercel-production' | 'missing';
  requiredFor: string;
};

type CommandProbe = {
  command: string;
  ok: boolean;
  exitCode: number | null;
  stdoutTail: string;
  stderrTail: string;
};

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const jsonPath = path.join(evidenceDir, 'sagebot-institutional-readiness-latest.json');
const mdPath = path.join(evidenceDir, 'sagebot-institutional-readiness-latest.md');

const localEnvPath = path.join(root, '.env.local');
const localEnv = readLocalEnv(localEnvPath);
const vercelEnvNames = readVercelEnvNames();
const railwayProbe = probeCommand('railway status', 10_000);

const requiredEnv = [
  ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase reads/admin dashboard'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'server-side Discord/RAG jobs'],
  ['DISCORD_BOT_TOKEN', 'Discord slash commands/gateway worker'],
  ['DISCORD_GUILD_ID', 'Discord command registration and live guild checks'],
  ['DISCORD_PUBLIC_KEY', 'Discord interaction verification'],
  ['DEEPSEEK_API_KEY', 'SageBot generation and content drafts'],
  ['CRON_SECRET', 'scheduled job endpoint protection'],
  ['STRIPE_SECRET_KEY', 'premium checkout/webhooks'],
  ['STRIPE_WEBHOOK_SECRET', 'premium role sync'],
  ['STRIPE_PRICE_DISCORD_PREMIUM', 'premium Discord price'],
  ['LANGFUSE_PUBLIC_KEY', 'LLM trace visibility'],
  ['LANGFUSE_SECRET_KEY', 'LLM trace visibility'],
] as const;

const envChecks: EnvCheck[] = requiredEnv.map(([name, requiredFor]) => {
  if (localEnv.has(name)) return { name, present: true, source: 'local', requiredFor };
  if (vercelEnvNames.has(name)) return { name, present: true, source: 'vercel-production', requiredFor };
  return { name, present: false, source: 'missing', requiredFor };
});

const optionalEnv = [
  ['LANGFUSE_BASEURL', 'self-hosted/custom Langfuse endpoint'],
  ['NEXT_PUBLIC_SITE_URL', 'canonical site URLs'],
  ['DISCORD_CLIENT_ID', 'Discord OAuth/app metadata'],
  ['DISCORD_CLIENT_SECRET', 'Discord OAuth/admin auth flows'],
] as const;

const optionalEnvChecks: EnvCheck[] = optionalEnv.map(([name, requiredFor]) => {
  if (localEnv.has(name)) return { name, present: true, source: 'local', requiredFor };
  if (vercelEnvNames.has(name)) return { name, present: true, source: 'vercel-production', requiredFor };
  return { name, present: false, source: 'missing', requiredFor };
});

const evidenceFiles = {
  knowledgeBaseHarness: readJson('docs/evidence/engineering-loop/knowledge-base-engineering-harness-latest.json'),
  worldClassReadiness: readJson('docs/evidence/engineering-loop/world-class-readiness-latest.json'),
  ragEvalLatest: readJson('docs/evidence/rag/eval-latest.json'),
  localVerification: readJson('docs/evidence/engineering-loop/local-verification-latest.json'),
  finalScorecard: readJson('docs/evidence/discord-ai-os/phase-20-final-scorecard.json'),
};

const localProof = {
  knowledgeBaseHarnessOk: evidenceFiles.knowledgeBaseHarness?.ok === true,
  knowledgeBaseHarnessStatus: evidenceFiles.knowledgeBaseHarness?.status ?? 'missing',
  knowledgeBaseHarnessScore: numberValue(evidenceFiles.knowledgeBaseHarness?.score),
  worldClassReadinessOk: evidenceFiles.worldClassReadiness?.ok === true,
  worldClassCategoriesAtOrAbove95: numberValue(evidenceFiles.worldClassReadiness?.summary?.categoriesAtOrAbove95),
  worldClassCategoriesBelow95: numberValue(evidenceFiles.worldClassReadiness?.summary?.categoriesBelow95),
  ragEvalOk: evidenceFiles.ragEvalLatest?.ok === true,
  ragEvalPassRate: numberValue(evidenceFiles.ragEvalLatest?.summary?.passRate),
  ragEvalTotal: numberValue(evidenceFiles.ragEvalLatest?.summary?.total),
  localVerificationOk: evidenceFiles.localVerification?.ok === true,
  finalAverageScore: numberValue(evidenceFiles.finalScorecard?.averageScore),
  finalWorldClassEligible: evidenceFiles.finalScorecard?.worldClassEligible === true,
};

const missingRequiredEnv = envChecks.filter((item) => !item.present);
const blockedLiveProof = [
  {
    key: 'approved_discord_knowledge',
    current: numberValue(evidenceFiles.knowledgeBaseHarness?.phases?.find((phase: any) => phase.key === 'rag_readiness')?.gates?.find((gate: any) => gate.key === 'approved_knowledge_target_met')?.evidence?.match(/^(\d+)/)?.[1]),
    target: 10,
    action: 'Approve 10 reusable, privacy-safe Discord knowledge items through the admin workflow.',
  },
  {
    key: 'rag_discord_sources',
    current: numberValue(evidenceFiles.knowledgeBaseHarness?.phases?.find((phase: any) => phase.key === 'rag_readiness')?.gates?.find((gate: any) => gate.key === 'rag_sources_target_met')?.evidence?.match(/^(\d+)/)?.[1]),
    target: 10,
    action: 'With explicit approval, sync approved Discord knowledge into authoritative RAG and rerun evals.',
  },
  {
    key: 'public_proof_assets',
    current: numberValue(evidenceFiles.knowledgeBaseHarness?.phases?.find((phase: any) => phase.key === 'operating_proof')?.gates?.find((gate: any) => gate.key === 'public_proof_target_met')?.evidence?.match(/^(\d+)/)?.[1]),
    target: 4,
    action: 'Create four privacy-safe public proof assets from approved Discord knowledge.',
  },
  {
    key: 'premium_workflow_proof',
    current: numberValue(evidenceFiles.knowledgeBaseHarness?.phases?.find((phase: any) => phase.key === 'operating_proof')?.gates?.find((gate: any) => gate.key === 'premium_workflow_target_met')?.evidence?.match(/^(\d+)/)?.[1]),
    target: 1,
    action: 'Run one premium review/deeper answer/office-hours workflow with authorization and fulfillment evidence.',
  },
];

const integrationScore = Math.round((envChecks.filter((item) => item.present).length / envChecks.length) * 100);
const localProofScore = scoreLocalProof(localProof);
const liveProofScore = Math.round((blockedLiveProof.filter((item) => item.current >= item.target).length / blockedLiveProof.length) * 100);
const deploymentConnectivityScore = Math.round(([
  vercelEnvNames.size > 0,
  railwayProbe.ok,
].filter(Boolean).length / 2) * 100);

const score = Math.round((integrationScore * 0.25) + (localProofScore * 0.35) + (liveProofScore * 0.3) + (deploymentConnectivityScore * 0.1));
const status = score >= 95 && missingRequiredEnv.length === 0 && blockedLiveProof.every((item) => item.current >= item.target)
  ? 'institutional_ready'
  : missingRequiredEnv.length > 0
    ? 'blocked_missing_integrations'
    : 'locally_strong_waiting_on_live_operating_proof';

const report = {
  ok: missingRequiredEnv.length === 0,
  version: 'sagebot-institutional-readiness-v1',
  generatedAt: new Date().toISOString(),
  mutationMode: 'read_only_redacted_evidence',
  releaseMeaning: 'This readiness report checks redacted integration presence, local evidence posture, and live-proof blockers. It does not print secrets, deploy, push, publish, approve, sync RAG, post to Discord, or mutate Supabase/Stripe/Railway/Vercel.',
  status,
  score,
  targetScoreRange: '95-99',
  categoryScores: {
    integrations: integrationScore,
    localProof: localProofScore,
    liveOperatingProof: liveProofScore,
    deploymentConnectivity: deploymentConnectivityScore,
  },
  envChecks,
  optionalEnvChecks,
  deploymentConnectivity: {
    vercelProductionEnvNamesDetected: vercelEnvNames.size,
    railwayStatusOk: railwayProbe.ok,
    railwayStatusTail: redact(railwayProbe.stdoutTail || railwayProbe.stderrTail),
  },
  localProof,
  blockedLiveProof,
  nextInstitutionalActions: [
    'Run the guarded knowledge-base E2E proof after approving temporary Supabase rows: SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved npm run discord:knowledge-base-e2e.',
    'Approve 10 reusable Discord knowledge items, then run npm run discord:proof-source-scan and npm run discord:operating-cycle:dry-run.',
    'After explicit approval, sync approved Discord knowledge into authoritative RAG and run SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing.',
    'Create four approved public proof assets and one premium workflow proof before claiming 95-99 operating grade.',
    'Only after live proof passes: deploy/register/pin with separate approval.',
  ],
  antiFakeRules: [
    'Env presence is redacted and never proves secret correctness by itself.',
    'Generated source seeds do not count as approved Discord knowledge.',
    'Dry-run evidence does not count as public proof or premium fulfillment.',
    '95-99 requires live operating proof, not just local tests.',
  ],
};

mkdirSync(evidenceDir, { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(mdPath, renderMarkdown(report));
console.log(JSON.stringify({ ...report, evidencePath: path.relative(root, jsonPath), markdownPath: path.relative(root, mdPath) }, null, 2));

function readLocalEnv(filePath: string): Set<string> {
  if (!existsSync(filePath)) return new Set();
  const raw = readFileSync(filePath, 'utf8');
  const names = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => line.split('=')[0].trim())
    .filter(Boolean);
  return new Set(names);
}

function readVercelEnvNames(): Set<string> {
  const jsonResult = spawnSync('vercel env ls --format json --no-color', {
    cwd: root,
    shell: true,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 15_000,
  });
  if (jsonResult.status === 0) {
    try {
      const parsed = JSON.parse(jsonResult.stdout ?? '');
      const names = Array.isArray(parsed?.envs)
        ? parsed.envs.map((item: any) => item?.key).filter((name: any): name is string => typeof name === 'string')
        : [];
      if (names.length > 0) return new Set(names);
    } catch {
      // Fall through to table parsing for older CLI versions or unexpected output.
    }
  }

  const result = probeCommand('vercel env ls --no-color', 15_000);
  if (!result.ok) return new Set();
  const names = stripAnsi(result.stdoutTail)
    .split(/\r?\n/)
    .map((line) => line.match(/\b([A-Z][A-Z0-9_]{2,})\s+Encrypted\b/)?.[1])
    .filter((name): name is string => Boolean(name));
  return new Set(names);
}

function probeCommand(command: string, timeout: number): CommandProbe {
  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout,
  });
  return {
    command,
    ok: result.status === 0,
    exitCode: result.status,
    stdoutTail: redact((result.stdout ?? '').slice(-20_000)),
    stderrTail: redact((result.stderr ?? '').slice(-20_000)),
  };
}

function readJson(relativePath: string): any | null {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreLocalProof(proof: typeof localProof): number {
  const checks = [
    proof.knowledgeBaseHarnessOk,
    proof.worldClassReadinessOk,
    proof.ragEvalOk && proof.ragEvalPassRate >= 0.95 && proof.ragEvalTotal >= 50,
    proof.localVerificationOk,
    proof.finalAverageScore >= 80,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function redact(value: string): string {
  return stripAnsi(value)
    .replace(/([A-Za-z0-9_-]{24,})/g, '[redacted]')
    .replace(/(sk_live_|sk_test_|rk_live_|whsec_|dapi_|ghp_|xoxb-)[A-Za-z0-9_\-]+/g, '$1[redacted]');
}

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function renderMarkdown(report: any): string {
  const missing = report.envChecks.filter((item: EnvCheck) => !item.present);
  const blockers = report.blockedLiveProof.filter((item: any) => item.current < item.target);
  return [
    '# SageBot Institutional Readiness',
    '',
    `Generated: ${report.generatedAt}`,
    `Status: ${report.status}`,
    `Score: ${report.score}/100`,
    '',
    '## Category Scores',
    '',
    `- Integrations: ${report.categoryScores.integrations}/100`,
    `- Local proof: ${report.categoryScores.localProof}/100`,
    `- Live operating proof: ${report.categoryScores.liveOperatingProof}/100`,
    `- Deployment connectivity: ${report.categoryScores.deploymentConnectivity}/100`,
    '',
    '## Missing Required Integrations',
    '',
    ...(missing.length ? missing.map((item: EnvCheck) => `- ${item.name}: ${item.requiredFor}`) : ['- None detected locally or in Vercel production env names.']),
    '',
    '## Live Proof Blockers',
    '',
    ...(blockers.length ? blockers.map((item: any) => `- ${item.key}: ${item.current}/${item.target}. ${item.action}`) : ['- None.']),
    '',
    '## Next Actions',
    '',
    ...report.nextInstitutionalActions.map((item: string) => `- ${item}`),
    '',
    '## Boundary',
    '',
    report.releaseMeaning,
    '',
  ].join('\n');
}

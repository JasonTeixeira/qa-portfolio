import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

type AuditStatus = 'passed' | 'warning' | 'blocked';

type AuditFinding = {
  severity: 'high' | 'medium' | 'low';
  key: string;
  summary: string;
  evidence: unknown;
  recommendation: string;
};

type AuditCategory = {
  key: string;
  title: string;
  status: AuditStatus;
  score: number;
  maxScore: number;
  findings: AuditFinding[];
};

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const jsonPath = path.join(evidenceDir, 'sagebot-connectivity-audit-latest.json');
const markdownPath = path.join(evidenceDir, 'sagebot-connectivity-audit-latest.md');
const knipPath = path.join(evidenceDir, 'sagebot-knip-audit-latest.json');

const sageBotPrefixes = [
  'lib/discord/',
  'scripts/discord/',
  'app/api/discord/',
  'app/admin/discord/',
  'tools/engineering-loop/',
];

const liveProofBlockers = new Set([
  'approved_discord_knowledge_live_target',
  'discord_rag_sources_live_target',
  'public_proof_live_target',
  'premium_workflow_live_target',
  'approved_knowledge_target_met',
  'rag_sources_target_met',
  'public_proof_target_met',
  'premium_workflow_target_met',
]);

const scaffoldPatterns = [
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bXXX\b/i,
  /\bnot implemented\b/i,
  /\bplaceholder implementation\b/i,
  /\bmock-only\b/i,
  /\bstub\b/i,
  /\bscaffold\b/i,
];

async function readText(relativePath: string): Promise<string | null> {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return null;
  return readFile(absolutePath, 'utf8');
}

async function readJson(relativePath: string): Promise<any> {
  const text = await readText(relativePath);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function run(command: string): { ok: boolean; stdout: string; stderr: string; exitCode: number | null } {
  const result = spawnSync(command, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status,
  };
}

function listFiles(): string[] {
  const result = run("find lib/discord scripts/discord app/api/discord app/admin/discord tools/engineering-loop -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.mjs' \\) | sort");
  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function listProjectSourceFiles(): string[] {
  const result = run("find app components lib scripts tools tests -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.mjs' \\) | sort");
  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractReferencedPaths(value: string): string[] {
  const matches = value.match(/[A-Za-z0-9_./@-]+\.(?:ts|tsx|mjs|js|json|md)/g) ?? [];
  return matches
    .map((item) => item.replace(/^@\//, ''))
    .map((item) => item.replace(/^\.\//, ''))
    .filter((item) => sageBotPrefixes.some((prefix) => item.startsWith(prefix)));
}

function importCandidates(relativePath: string, source: string): string[] {
  const dir = path.dirname(relativePath);
  const imports = Array.from(source.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)).map((match) => match[1]);
  return imports.flatMap((specifier) => {
    if (specifier.startsWith('@/')) {
      const base = specifier.slice(2);
      return ['', '.ts', '.tsx', '.mjs', '.js', '/index.ts', '/index.tsx'].map((suffix) => `${base}${suffix}`);
    }
    if (!specifier.startsWith('.')) return [];
    const base = path.normalize(path.join(dir, specifier)).replaceAll(path.sep, '/');
    return ['', '.ts', '.tsx', '.mjs', '.js', '/index.ts', '/index.tsx'].map((suffix) => `${base}${suffix}`);
  });
}

function category(input: { key: string; title: string; maxScore: number; penalty: number; findings: AuditFinding[] }): AuditCategory {
  const score = Math.max(0, input.maxScore - input.penalty);
  const status: AuditStatus = input.findings.some((finding) => finding.severity === 'high')
    ? 'blocked'
    : input.findings.length
      ? 'warning'
      : 'passed';
  return {
    key: input.key,
    title: input.title,
    status,
    score,
    maxScore: input.maxScore,
    findings: input.findings,
  };
}

function scorePercent(score: number, maxScore: number): number {
  if (!maxScore) return 0;
  return Math.round((score / maxScore) * 100);
}

function renderMarkdown(report: any): string {
  return [
    '# SageBot Connectivity Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Status: ${report.status}`,
    `Score: ${report.score}/100`,
    '',
    '## Category Scores',
    '',
    ...report.categories.map((item: AuditCategory) => `- ${item.title}: ${scorePercent(item.score, item.maxScore)}/100 (${item.status})`),
    '',
    '## Findings',
    '',
    ...(report.findings.length
      ? report.findings.map((finding: AuditFinding) => `- **${finding.severity.toUpperCase()} ${finding.key}:** ${finding.summary}`)
      : ['- None.']),
    '',
    '## Suspected Dead Or Disconnected SageBot Files',
    '',
    ...(report.suspectedDeadOrDisconnectedFiles.length
      ? report.suspectedDeadOrDisconnectedFiles.map((file: string) => `- ${file}`)
      : ['- None from SageBot-owned paths.']),
    '',
    '## Remaining Production Gaps',
    '',
    ...(report.remainingProductionGaps.length
      ? report.remainingProductionGaps.map((gap: string) => `- ${gap}`)
      : ['- None detected by the local harness.']),
    '',
  ].join('\n');
}

async function main() {
  const generatedAt = new Date().toISOString();
  const packageJson = await readJson('package.json');
  const scripts = packageJson?.scripts ?? {};
  const sourceFiles = listFiles();
  const projectSourceFiles = listProjectSourceFiles();
  const sourceMap = new Map<string, string>();
  for (const file of sourceFiles) {
    sourceMap.set(file, (await readText(file)) ?? '');
  }
  const projectSourceMap = new Map<string, string>();
  for (const file of projectSourceFiles) {
    projectSourceMap.set(file, (await readText(file)) ?? '');
  }

  const scriptReferencedFiles = new Set<string>();
  const missingScriptTargets: string[] = [];
  for (const [name, command] of Object.entries<string>(scripts)) {
    if (!name.includes('discord') && !name.includes('sageforge') && !name.includes('sagebot') && !name.includes('loop:')) continue;
    for (const referenced of extractReferencedPaths(command)) {
      scriptReferencedFiles.add(referenced);
      if (!existsSync(path.join(root, referenced))) missingScriptTargets.push(`${name}:${referenced}`);
    }
  }

  const importReferencedFiles = new Set<string>();
  for (const [file, source] of projectSourceMap.entries()) {
    for (const candidate of importCandidates(file, source)) {
      if (sourceMap.has(candidate)) importReferencedFiles.add(candidate);
    }
  }

  const entrypointFiles = new Set<string>([
    'app/api/discord/interactions/route.ts',
    'app/admin/discord/page.tsx',
    'app/admin/discord/actions.ts',
  ]);
  for (const file of sourceFiles) {
    if (file.startsWith('scripts/discord/') && scriptReferencedFiles.has(file)) entrypointFiles.add(file);
    if (file.startsWith('tools/engineering-loop/') && scriptReferencedFiles.has(file)) entrypointFiles.add(file);
  }

  const connectedFiles = sourceFiles.filter((file) =>
    entrypointFiles.has(file)
    || importReferencedFiles.has(file)
    || scriptReferencedFiles.has(file)
    || file.endsWith('/route.ts')
    || file.endsWith('/page.tsx')
    || file.endsWith('/actions.ts'));

  const disconnectedFiles = sourceFiles.filter((file) => !connectedFiles.includes(file));

  const knip = await readJson(path.relative(root, knipPath));
  const knipUnusedSageBotFiles = ((knip?.files ?? []) as string[])
    .filter((file) => sageBotPrefixes.some((prefix) => file.startsWith(prefix)));

  const scaffoldHits: Array<{ file: string; line: number; text: string }> = [];
  for (const [file, source] of sourceMap.entries()) {
    if (file === 'scripts/discord/audit-sagebot-connectivity.ts') continue;
    source.split('\n').forEach((line, index) => {
      if (scaffoldPatterns.some((pattern) => pattern.test(line))) {
        scaffoldHits.push({ file, line: index + 1, text: line.trim().slice(0, 220) });
      }
    });
  }

  const institutionalHarness = await readJson('docs/evidence/engineering-loop/sageforge-institutional-harness-latest.json');
  const humanAppealHarness = await readJson('docs/evidence/engineering-loop/sagebot-human-appeal-harness-latest.json');
  const knowledgeHarness = await readJson('docs/evidence/engineering-loop/knowledge-base-engineering-harness-latest.json');
  const loopRun = await readJson('docs/evidence/engineering-loop/sageforge-institutional-loop-run-latest.json');

  const remainingProductionGaps = [
    ...((institutionalHarness?.failures ?? []) as string[]),
    ...((knowledgeHarness?.failures ?? []) as string[]),
  ].filter((item, index, all) => all.indexOf(item) === index);

  const findings: AuditFinding[] = [];
  if (missingScriptTargets.length) {
    findings.push({
      severity: 'high',
      key: 'missing_script_targets',
      summary: `${missingScriptTargets.length} package scripts reference missing files.`,
      evidence: missingScriptTargets,
      recommendation: 'Fix package.json script paths or delete the stale scripts.',
    });
  }
  if (knipUnusedSageBotFiles.length) {
    findings.push({
      severity: 'medium',
      key: 'knip_suspected_unused_sagebot_files',
      summary: `${knipUnusedSageBotFiles.length} SageBot-owned files were reported by knip as unused.`,
      evidence: knipUnusedSageBotFiles,
      recommendation: 'Review each file. Delete true dead files; add explicit package-script/test entrypoints for intentional operational scripts.',
    });
  }
  if (disconnectedFiles.length) {
    findings.push({
      severity: 'medium',
      key: 'local_graph_disconnected_files',
      summary: `${disconnectedFiles.length} SageBot-owned files are not connected by imports, Next routes, or package scripts in the local graph.`,
      evidence: disconnectedFiles,
      recommendation: 'Wire intentional files into package scripts/tests or remove dead files.',
    });
  }
  if (scaffoldHits.length) {
    findings.push({
      severity: 'low',
      key: 'scaffold_language_present',
      summary: `${scaffoldHits.length} scaffold/mock/TODO-style markers remain in SageBot-owned source files.`,
      evidence: scaffoldHits.slice(0, 30),
      recommendation: 'Review each marker. Keep only test-only mocks and delete or finish production placeholders.',
    });
  }
  if (humanAppealHarness?.ok !== true) {
    findings.push({
      severity: 'high',
      key: 'human_appeal_harness_not_passing',
      summary: 'Human appeal harness is not passing.',
      evidence: humanAppealHarness?.failures ?? 'missing evidence',
      recommendation: 'Run npm run discord:human-appeal-harness and fix embed/voice regressions.',
    });
  }
  if (institutionalHarness?.ok !== true) {
    findings.push({
      severity: 'high',
      key: 'institutional_harness_not_passing',
      summary: 'Institutional harness is not passing.',
      evidence: institutionalHarness?.failures ?? 'missing evidence',
      recommendation: 'Run npm run discord:sageforge-institutional-harness and fix local failures.',
    });
  }
  const liveProofGaps = remainingProductionGaps.filter((gap) => {
    const key = gap.split(':').pop() ?? gap;
    return [...liveProofBlockers].some((blocker) => gap.includes(blocker) || key.includes(blocker));
  });
  if (liveProofGaps.length) {
    findings.push({
      severity: 'medium',
      key: 'live_operating_proof_missing',
      summary: `${liveProofGaps.length} live operating proof targets are still unmet.`,
      evidence: liveProofGaps,
      recommendation: 'Approve real Discord knowledge, sync it into RAG, create public proof assets, and run one premium workflow proof.',
    });
  }

  const categories = [
    category({
      key: 'entrypoint_connectivity',
      title: 'Entrypoint Connectivity',
      maxScore: 25,
      penalty: missingScriptTargets.length ? 25 : Math.min(15, disconnectedFiles.length * 2),
      findings: findings.filter((finding) => ['missing_script_targets', 'local_graph_disconnected_files'].includes(finding.key)),
    }),
    category({
      key: 'dead_code_static_scan',
      title: 'Dead Code Static Scan',
      maxScore: 20,
      penalty: Math.min(20, knipUnusedSageBotFiles.length * 3),
      findings: findings.filter((finding) => finding.key === 'knip_suspected_unused_sagebot_files'),
    }),
    category({
      key: 'scaffold_marker_scan',
      title: 'Scaffold Marker Scan',
      maxScore: 15,
      penalty: Math.min(15, scaffoldHits.length),
      findings: findings.filter((finding) => finding.key === 'scaffold_language_present'),
    }),
    category({
      key: 'harness_health',
      title: 'Harness Health',
      maxScore: 25,
      penalty: (humanAppealHarness?.ok === true ? 0 : 12) + (institutionalHarness?.ok === true ? 0 : 13),
      findings: findings.filter((finding) => ['human_appeal_harness_not_passing', 'institutional_harness_not_passing'].includes(finding.key)),
    }),
    category({
      key: 'live_proof_posture',
      title: 'Live Proof Posture',
      maxScore: 15,
      penalty: Math.min(15, liveProofGaps.length * 4),
      findings: findings.filter((finding) => finding.key === 'live_operating_proof_missing'),
    }),
  ];

  const score = scorePercent(
    categories.reduce((sum, item) => sum + item.score, 0),
    categories.reduce((sum, item) => sum + item.maxScore, 0),
  );

  const report = {
    ok: !findings.some((finding) => finding.severity === 'high'),
    version: 'sagebot-connectivity-audit-v1',
    generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This audit checks local source connectivity, package-script targets, knip static results, scaffold markers, and existing SageBot harness evidence. It does not push, deploy, mutate Discord, mutate Supabase, publish content, or approve knowledge.',
    status: findings.some((finding) => finding.severity === 'high')
      ? 'blocked_missing_connections'
      : findings.length
        ? 'connected_with_review_items'
        : 'fully_connected_locally',
    score,
    fileCounts: {
      sourceFiles: sourceFiles.length,
      connectedFiles: connectedFiles.length,
      disconnectedFiles: disconnectedFiles.length,
      scriptReferencedFiles: scriptReferencedFiles.size,
      importReferencedFiles: importReferencedFiles.size,
      knipUnusedSageBotFiles: knipUnusedSageBotFiles.length,
      scaffoldHits: scaffoldHits.length,
    },
    categories,
    findings,
    connectedEntryPoints: [...entrypointFiles].sort(),
    suspectedDeadOrDisconnectedFiles: [...new Set([...knipUnusedSageBotFiles, ...disconnectedFiles])].sort(),
    scaffoldHits,
    remainingProductionGaps,
    harnessSummaries: {
      institutional: {
        ok: institutionalHarness?.ok ?? false,
        score: institutionalHarness?.score ?? null,
        status: institutionalHarness?.status ?? 'missing',
        failures: institutionalHarness?.failures ?? [],
      },
      humanAppeal: {
        ok: humanAppealHarness?.ok ?? false,
        score: humanAppealHarness?.score ?? null,
        status: humanAppealHarness?.status ?? 'missing',
        failures: humanAppealHarness?.failures ?? [],
      },
      knowledgeBase: {
        ok: knowledgeHarness?.ok ?? false,
        score: knowledgeHarness?.score ?? null,
        status: knowledgeHarness?.status ?? 'missing',
        failures: knowledgeHarness?.failures ?? [],
      },
      latestLoop: {
        ok: loopRun?.ok ?? false,
        stopReason: loopRun?.stopReason ?? 'missing',
      },
    },
    evidenceInputs: {
      knipPath: path.relative(root, knipPath),
      institutionalHarnessPath: 'docs/evidence/engineering-loop/sageforge-institutional-harness-latest.json',
      humanAppealHarnessPath: 'docs/evidence/engineering-loop/sagebot-human-appeal-harness-latest.json',
      knowledgeHarnessPath: 'docs/evidence/engineering-loop/knowledge-base-engineering-harness-latest.json',
      loopRunPath: 'docs/evidence/engineering-loop/sageforge-institutional-loop-run-latest.json',
    },
  };

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, renderMarkdown(report));
  console.log(JSON.stringify({
    ok: report.ok,
    status: report.status,
    score: report.score,
    findings: report.findings.map((finding) => `${finding.severity}:${finding.key}`),
    evidencePath: path.relative(root, jsonPath),
    markdownPath: path.relative(root, markdownPath),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { RAG_EVAL_QUESTION_SEEDS, type RagEvalQuestionSeed } from '@/lib/rag/evals';
import { STATIC_RAG_RESOURCE_FILES } from '@/lib/rag/eval-seed-validation';

type SourceRecord = {
  title: string;
  path: string;
  exists: boolean;
  text: string;
};

type MissingEvalPreflightItem = {
  evalKey: string;
  category: RagEvalQuestionSeed['metadata']['category'] | 'missing_seed';
  question: string | null;
  expectedSources: string[];
  missingSources: string[];
  requiredTerms: string[];
  missingRequiredTerms: string[];
  sourceReady: boolean;
  termCoverageReady: boolean;
  readyForApprovedEval: boolean;
};

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'rag');
const coverageReadinessPath = path.join(evidenceDir, 'eval-coverage-readiness.json');
const missingPlanPath = path.join(evidenceDir, 'eval-missing-plan.json');
const executionPacketPath = path.join(evidenceDir, 'eval-execution-packet.json');
const outputPath = path.join(evidenceDir, 'eval-missing-preflight.json');

async function readJson(filePath: string): Promise<any> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function maybeReadText(filePath: string): Promise<{ exists: boolean; text: string }> {
  try {
    return { exists: true, text: await readFile(filePath, 'utf8') };
  } catch {
    return { exists: false, text: '' };
  }
}

async function collectStaticSources(): Promise<Map<string, SourceRecord>> {
  const records = new Map<string, SourceRecord>();

  for (const relativePath of STATIC_RAG_RESOURCE_FILES) {
    const absolutePath = path.join(root, relativePath);
    const { exists, text } = await maybeReadText(absolutePath);
    const title = path.basename(relativePath);
    records.set(normalizeSource(title), {
      title,
      path: relativePath,
      exists,
      text,
    });
  }

  return records;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function normalizeSource(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/[^a-z0-9$]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function termVariants(term: string): string[] {
  const normalized = normalizeText(term);
  return unique([
    normalized,
    normalizeText(term.replaceAll('_', ' ')),
    normalizeText(term.replaceAll('-', ' ')),
    normalizeText(term.replaceAll('RAG', 'rag')),
  ]);
}

function termAppearsInMaterial(term: string, material: string): boolean {
  const normalizedMaterial = normalizeText(material);
  return termVariants(term).some((variant) => variant && normalizedMaterial.includes(variant));
}

function buildPreflightItem(seed: RagEvalQuestionSeed | undefined, evalKey: string, sources: Map<string, SourceRecord>): MissingEvalPreflightItem {
  if (!seed) {
    return {
      evalKey,
      category: 'missing_seed',
      question: null,
      expectedSources: [],
      missingSources: [],
      requiredTerms: [],
      missingRequiredTerms: [],
      sourceReady: false,
      termCoverageReady: false,
      readyForApprovedEval: false,
    };
  }

  const sourceRecords = seed.expected_sources.map((source) => sources.get(normalizeSource(source)));
  const missingSources = seed.expected_sources.filter((source, index) => !sourceRecords[index]?.exists);
  const sourceMaterial = [
    seed.question,
    seed.expected_answer_notes,
    ...sourceRecords.map((record) => record?.text ?? ''),
  ].join('\n\n');
  const missingRequiredTerms = seed.metadata.required_terms.filter((term) => !termAppearsInMaterial(term, sourceMaterial));
  const sourceReady = missingSources.length === 0;
  const termCoverageReady = missingRequiredTerms.length === 0;

  return {
    evalKey,
    category: seed.metadata.category,
    question: seed.question,
    expectedSources: seed.expected_sources,
    missingSources,
    requiredTerms: seed.metadata.required_terms,
    missingRequiredTerms,
    sourceReady,
    termCoverageReady,
    readyForApprovedEval: sourceReady && termCoverageReady,
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const [coverageReadiness, missingPlan, executionPacket, sources] = await Promise.all([
    readJson(coverageReadinessPath),
    readJson(missingPlanPath),
    readJson(executionPacketPath),
    collectStaticSources(),
  ]);

  const missingEvalKeys = unique([
    ...(Array.isArray(coverageReadiness.missingEvalKeys) ? coverageReadiness.missingEvalKeys : []),
    ...(Array.isArray(missingPlan.selectedKeys) ? missingPlan.selectedKeys : []),
    ...(Array.isArray(executionPacket.missingEvalKeys) ? executionPacket.missingEvalKeys : []),
  ]).sort();
  const selectedKeys = Array.isArray(missingPlan.selectedKeys) ? missingPlan.selectedKeys.map(String).sort() : [];
  const executionPacketKeys = Array.isArray(executionPacket.missingEvalKeys) ? executionPacket.missingEvalKeys.map(String).sort() : [];
  const selectedMatchesCoverage = missingEvalKeys.length === selectedKeys.length
    && missingEvalKeys.every((key) => selectedKeys.includes(key))
    && missingEvalKeys.length === executionPacketKeys.length
    && missingEvalKeys.every((key) => executionPacketKeys.includes(key));
  const seedsByKey = new Map(RAG_EVAL_QUESTION_SEEDS.map((seed) => [seed.eval_key, seed]));
  const items = missingEvalKeys.map((evalKey) => buildPreflightItem(seedsByKey.get(evalKey), evalKey, sources));
  const sourceReadyCount = items.filter((item) => item.sourceReady).length;
  const termCoverageReadyCount = items.filter((item) => item.termCoverageReady).length;
  const readyForApprovedEvalCount = items.filter((item) => item.readyForApprovedEval).length;
  const blockers = [
    ...(!selectedMatchesCoverage ? ['missing_eval_keys_do_not_match_coverage_plan_or_execution_packet'] : []),
    ...items.filter((item) => !item.sourceReady).map((item) => `${item.evalKey}:missing_source:${item.missingSources.join(',')}`),
    ...items.filter((item) => !item.termCoverageReady).map((item) => `${item.evalKey}:missing_required_terms:${item.missingRequiredTerms.join(',')}`),
  ];

  const evidence = {
    ok: selectedMatchesCoverage && blockers.length === 0,
    version: 'rag-missing-eval-preflight-v1',
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This preflight checks local source readiness for missing eval keys. It does not seed Supabase, call DeepSeek, run retrieval, write rag_eval_results, or satisfy eval coverage.',
    status: blockers.length ? 'blocked' : 'ready_for_explicitly_approved_eval',
    sourceEvidence: {
      coverageReadiness: path.relative(root, coverageReadinessPath),
      missingPlan: path.relative(root, missingPlanPath),
      executionPacket: path.relative(root, executionPacketPath),
    },
    selectedMatchesCoverage,
    expectedQuestionCount: Number(coverageReadiness.expectedQuestionCount ?? 0),
    evaluatedQuestionCount: Number(coverageReadiness.evaluatedQuestionCount ?? 0),
    missingEvalKeys,
    selectedKeys,
    executionPacketKeys,
    summary: {
      missingEvalCount: missingEvalKeys.length,
      sourceReadyCount,
      termCoverageReadyCount,
      readyForApprovedEvalCount,
      blockerCount: blockers.length,
    },
    staticSources: [...sources.values()].map((source) => ({
      title: source.title,
      path: source.path,
      exists: source.exists,
      byteLength: Buffer.byteLength(source.text),
    })),
    items,
    approvedCommand: executionPacket.commandPlan?.approvedCommand ?? 'npm run rag:evaluate:missing',
    antiFakeRules: [
      'This preflight is not an eval run and must not be counted as eval coverage.',
      'Dry-run, seed-only, smoke-only, source-only, or preflight-only outputs do not satisfy eval coverage.',
      'Every missing eval key still needs an explicitly approved non-dry-run eval row before release gates can pass.',
      'A scorecard may not claim world-class while rag_eval_latest or rag_eval_coverage_readiness gates fail.',
    ],
    blockers,
    nextActions: blockers.length
      ? [
        'Fix missing local source files or missing required-term source coverage.',
        'Rerun npm run rag:evaluate:missing-preflight.',
        'Do not run the non-dry-run missing eval until this preflight is ready.',
      ]
      : [
        'Obtain explicit approval before running the non-dry-run missing eval command.',
        executionPacket.commandPlan?.approvedCommand ?? 'npm run rag:evaluate:missing',
        'Refresh final scorecard and local verification evidence after the approved eval run.',
      ],
    startedAt,
    finishedAt: new Date().toISOString(),
  };

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath: outputPath }, null, 2));
  if (!evidence.ok) {
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    version: 'rag-missing-eval-preflight-v1',
    mutationMode: 'local_file_evidence_only',
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath: outputPath }, null, 2));
  process.exit(1);
});

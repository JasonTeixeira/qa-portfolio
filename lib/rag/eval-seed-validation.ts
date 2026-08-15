import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { RAG_EVAL_QUESTION_SEEDS, type RagEvalQuestionSeed } from './evals';

export type RagEvalSeedValidationIssue = {
  severity: 'error' | 'warning';
  evalKey: string | null;
  field: string;
  message: string;
};

export type RagEvalSeedValidationResult = {
  ok: boolean;
  seedCount: number;
  categoryCounts: Record<RagEvalQuestionSeed['metadata']['category'], number>;
  expectedCategoryCounts: Record<RagEvalQuestionSeed['metadata']['category'], number>;
  knownSourceCount: number;
  knownSources: string[];
  issues: RagEvalSeedValidationIssue[];
};

const EXPECTED_CATEGORY_COUNTS: Record<RagEvalQuestionSeed['metadata']['category'], number> = {
  onboarding: 10,
  content_engine: 20,
  quiz_challenge_points: 10,
  premium: 10,
  rag_ai_build: 15,
};

export const STATIC_RAG_RESOURCE_FILES = [
  'docs/DISCORD_EDUCATION_SERVER_RUNBOOK.md',
  'docs/DISCORD_COMMUNITY_OPERATING_SYSTEM.md',
  'docs/discord/SAGEBOT_DISCORD_OPERATING_FAQ.md',
  'docs/discord/WORLD_CLASS_PROOF_OPERATING_CONTROLS.md',
  'docs/specs/rag-system-build-plan.txt',
] as const;

export async function collectLocalRagEvalSourceTitles(rootDir = process.cwd()): Promise<string[]> {
  const titles = new Set<string>();
  for (const file of STATIC_RAG_RESOURCE_FILES) {
    titles.add(path.basename(file));
  }

  const blogDir = path.join(rootDir, 'content', 'blog');
  const blogFiles = (await readdir(blogDir)).filter((file) => file.endsWith('.mdx'));
  for (const file of blogFiles) {
    const raw = await readFile(path.join(blogDir, file), 'utf8');
    const title = readFrontmatterTitle(raw) ?? file.replace(/\.mdx$/, '');
    titles.add(title);
  }

  return [...titles].sort((a, b) => a.localeCompare(b));
}

export function validateRagEvalSeeds(input: {
  seeds?: RagEvalQuestionSeed[];
  knownSources: string[];
}): RagEvalSeedValidationResult {
  const seeds = input.seeds ?? RAG_EVAL_QUESTION_SEEDS;
  const knownSourceSet = new Set(input.knownSources.map(normalizeSource));
  const issues: RagEvalSeedValidationIssue[] = [];
  const seenKeys = new Set<string>();
  const seenQuestions = new Map<string, string>();
  const categoryCounts = emptyCategoryCounts();

  for (const seed of seeds) {
    categoryCounts[seed.metadata.category] += 1;

    if (seenKeys.has(seed.eval_key)) {
      issues.push(issue('error', seed.eval_key, 'eval_key', `Duplicate eval key "${seed.eval_key}".`));
    }
    seenKeys.add(seed.eval_key);

    if (!/^rag_(onboarding|content|points|premium|ai)_\d{3}$/.test(seed.eval_key)) {
      issues.push(issue('error', seed.eval_key, 'eval_key', 'Eval key does not match the expected rag_<lane>_### format.'));
    }

    const normalizedQuestion = normalizeQuestion(seed.question);
    const duplicateQuestionKey = seenQuestions.get(normalizedQuestion);
    if (duplicateQuestionKey) {
      issues.push(issue('error', seed.eval_key, 'question', `Question duplicates ${duplicateQuestionKey}.`));
    }
    seenQuestions.set(normalizedQuestion, seed.eval_key);

    if (seed.question.trim().length < 24 || !seed.question.trim().endsWith('?')) {
      issues.push(issue('error', seed.eval_key, 'question', 'Question must be a complete, specific question.'));
    }

    if (!seed.tags.includes('phase_2') || !seed.tags.includes(seed.metadata.category)) {
      issues.push(issue('error', seed.eval_key, 'tags', 'Tags must include phase_2 and the metadata category.'));
    }

    if (seed.expected_sources.length < 1) {
      issues.push(issue('error', seed.eval_key, 'expected_sources', 'At least one expected source is required.'));
    }

    for (const source of seed.expected_sources) {
      if (!knownSourceSet.has(normalizeSource(source))) {
        issues.push(issue('error', seed.eval_key, 'expected_sources', `Unknown expected source "${source}".`));
      }
    }

    if (seed.metadata.required_terms.length < 3) {
      issues.push(issue('error', seed.eval_key, 'required_terms', 'At least three required terms are needed for deterministic scoring.'));
    }

    for (const term of seed.metadata.required_terms) {
      if (!seed.expected_answer_notes.toLowerCase().includes(term.toLowerCase())) {
        issues.push(issue('warning', seed.eval_key, 'expected_answer_notes', `Expected notes do not mention required term "${term}".`));
      }
    }
  }

  for (const [category, expectedCount] of Object.entries(EXPECTED_CATEGORY_COUNTS) as Array<[RagEvalQuestionSeed['metadata']['category'], number]>) {
    if (categoryCounts[category] !== expectedCount) {
      issues.push(issue('error', null, 'categoryCounts', `${category} has ${categoryCounts[category]} seeds; expected ${expectedCount}.`));
    }
  }

  return {
    ok: !issues.some((item) => item.severity === 'error'),
    seedCount: seeds.length,
    categoryCounts,
    expectedCategoryCounts: { ...EXPECTED_CATEGORY_COUNTS },
    knownSourceCount: input.knownSources.length,
    knownSources: [...input.knownSources].sort((a, b) => a.localeCompare(b)),
    issues,
  };
}

function emptyCategoryCounts(): Record<RagEvalQuestionSeed['metadata']['category'], number> {
  return {
    onboarding: 0,
    content_engine: 0,
    quiz_challenge_points: 0,
    premium: 0,
    rag_ai_build: 0,
  };
}

function issue(
  severity: RagEvalSeedValidationIssue['severity'],
  evalKey: string | null,
  field: string,
  message: string,
): RagEvalSeedValidationIssue {
  return { severity, evalKey, field, message };
}

function readFrontmatterTitle(raw: string): string | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const titleLine = match[1].split('\n').find((line) => /^title:\s*/.test(line));
  if (!titleLine) return null;
  return titleLine.replace(/^title:\s*/, '').trim().replace(/^['"]|['"]$/g, '') || null;
}

function normalizeQuestion(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeSource(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

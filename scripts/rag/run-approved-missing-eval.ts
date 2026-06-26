import { spawnSync } from 'node:child_process';
import process from 'node:process';

const REQUIRED_APPROVAL = 'approved';
const APPROVAL_ENV = 'SAGE_ALLOW_NON_DRY_RAG_EVAL';

const commandPlan = [
  ['npm', ['run', 'rag:evaluate:missing']],
  ['npm', ['run', 'rag:evaluate:coverage-readiness']],
  ['npm', ['run', 'discord:smoke-final-scorecard']],
  ['npm', ['run', 'verify:local:evidence']],
] as const;

function approved(): boolean {
  return process.env[APPROVAL_ENV]?.trim() === REQUIRED_APPROVAL;
}

function commandLabel(command: string, args: readonly string[]): string {
  return [command, ...args].join(' ');
}

if (!approved()) {
  console.error([
    'Refusing to run non-dry RAG eval coverage repair.',
    `Set ${APPROVAL_ENV}=${REQUIRED_APPROVAL} only after explicit approval for this eval run.`,
    'This runner can call DeepSeek, run retrieval, write Supabase eval rows, and refresh local release evidence.',
    `Approved command: ${APPROVAL_ENV}=${REQUIRED_APPROVAL} npm run rag:evaluate:approved-missing`,
  ].join('\n'));
  process.exit(1);
}

for (const [command, args] of commandPlan) {
  console.log(`\n> ${commandLabel(command, args)}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

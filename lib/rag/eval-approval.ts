export const NON_DRY_RAG_EVAL_APPROVAL_ENV = 'SAGE_ALLOW_NON_DRY_RAG_EVAL';
export const NON_DRY_RAG_EVAL_APPROVAL_VALUE = 'approved';

export function assertNonDryRunRagEvalApproved(input: {
  dryRun: boolean;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
}) {
  if (input.dryRun) return;
  const env = input.env ?? process.env;
  if (env[NON_DRY_RAG_EVAL_APPROVAL_ENV] === NON_DRY_RAG_EVAL_APPROVAL_VALUE) return;
  throw new Error(
    `Non-dry RAG eval blocked. Set ${NON_DRY_RAG_EVAL_APPROVAL_ENV}=${NON_DRY_RAG_EVAL_APPROVAL_VALUE} only after explicit approval; this command can call DeepSeek and write Supabase eval rows.`,
  );
}

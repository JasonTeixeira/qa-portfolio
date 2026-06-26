export type RagEvalRecoveryMissingItem = {
  evalKey: string;
  category: string;
  question: string | null;
  expectedSources: string[];
  requiredTerms: string[];
  readyForApprovedEval: boolean;
  blocker: string | null;
  nextAction: string;
};

export type RagEvalRecoveryFailedItem = {
  evalKey: string;
  question: string;
  score: number;
  retrievalHitRate: number;
  citationCoverage: number;
  faithfulness: number;
  missingSources: string[];
  missingRequiredTerms: string[];
  severity: 'critical' | 'watch';
  nextAction: string;
};

export type RagEvalRecoveryPlan = {
  ok: boolean;
  version: 'rag-eval-recovery-plan-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  status: 'ready' | 'blocked';
  releaseMeaning: string;
  latestEval: {
    ok: boolean;
    seededQuestionCount: number;
    evaluatedQuestionCount: number;
    passRate: number | null;
    failedCount: number;
  };
  coverage: {
    expectedQuestionCount: number;
    missingEvalCount: number;
    missingEvalKeys: string[];
    releaseReady: boolean;
    blockers: string[];
  };
  missingEvalBacklog: RagEvalRecoveryMissingItem[];
  failedEvalBacklog: RagEvalRecoveryFailedItem[];
  antiFakeRules: string[];
  approvedCommand: string;
  nextActions: string[];
};

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function missingEvalNextAction(input: {
  readyForApprovedEval: boolean;
  missingSources: string[];
  missingRequiredTerms: string[];
}): { blocker: string | null; nextAction: string } {
  if (input.readyForApprovedEval) {
    return {
      blocker: null,
      nextAction: 'Run the explicitly approved missing-eval command so this key gets a real persisted eval result.',
    };
  }
  if (input.missingSources.length) {
    return {
      blocker: `missing_sources:${input.missingSources.join(',')}`,
      nextAction: 'Add or restore the expected local RAG source before running the approved eval.',
    };
  }
  if (input.missingRequiredTerms.length) {
    return {
      blocker: `missing_required_terms:${input.missingRequiredTerms.join(',')}`,
      nextAction: 'Update the expected source material so required eval terms are covered before running the approved eval.',
    };
  }
  return {
    blocker: 'unknown_preflight_blocker',
    nextAction: 'Inspect the preflight row before running a non-dry-run eval.',
  };
}

function failedEvalNextAction(input: RagEvalRecoveryFailedItem): string {
  if (input.retrievalHitRate === 0 || input.missingSources.length) {
    return `Add or approve a stronger source for ${input.missingSources.join(', ') || input.evalKey}, then rerun eval.`;
  }
  if (input.citationCoverage < 0.85) return 'Improve retrieval/reranking so the expected source is cited.';
  if (input.faithfulness < 0.9) return 'Tighten answer/refusal policy so unsupported claims are removed.';
  if (input.missingRequiredTerms.length) return `Improve answer usefulness for missing terms: ${input.missingRequiredTerms.join(', ')}.`;
  return 'Inspect the retrieval trace and create a targeted source or prompt fix.';
}

export function buildRagEvalRecoveryPlan(input: {
  generatedAt: string;
  latestEval: any;
  coverageReadiness: any;
  missingPreflight: any;
}): RagEvalRecoveryPlan {
  const latestResults: any[] = Array.isArray(input.latestEval.results) ? input.latestEval.results : [];
  const latestFailures: any[] = latestResults.filter((result: any) => result?.passed !== true);
  const missingItems = Array.isArray(input.missingPreflight.items) ? input.missingPreflight.items : [];
  const missingEvalKeys = stringArray(input.coverageReadiness.missingEvalKeys);

  const missingEvalBacklog = missingEvalKeys.map((evalKey) => {
    const item = missingItems.find((candidate: any) => String(candidate?.evalKey) === evalKey);
    const action = missingEvalNextAction({
      readyForApprovedEval: Boolean(item?.readyForApprovedEval),
      missingSources: stringArray(item?.missingSources),
      missingRequiredTerms: stringArray(item?.missingRequiredTerms),
    });
    return {
      evalKey,
      category: String(item?.category ?? 'unknown'),
      question: typeof item?.question === 'string' ? item.question : null,
      expectedSources: stringArray(item?.expectedSources),
      requiredTerms: stringArray(item?.requiredTerms),
      readyForApprovedEval: Boolean(item?.readyForApprovedEval),
      blocker: action.blocker,
      nextAction: action.nextAction,
    };
  });

  const failedEvalBacklog: RagEvalRecoveryFailedItem[] = latestFailures.map((result: any) => {
    const failed: RagEvalRecoveryFailedItem = {
      evalKey: String(result?.evalKey ?? 'unknown_eval'),
      question: String(result?.question ?? result?.evalKey ?? 'Unknown eval question'),
      score: numberValue(result?.score),
      retrievalHitRate: numberValue(result?.retrievalHitRate),
      citationCoverage: numberValue(result?.citationCoverage),
      faithfulness: numberValue(result?.faithfulness),
      missingSources: stringArray(result?.missingSources),
      missingRequiredTerms: stringArray(result?.missingRequiredTerms),
      severity: numberValue(result?.score) < 0.5 || numberValue(result?.retrievalHitRate) === 0 ? 'critical' : 'watch',
      nextAction: '',
    };
    return { ...failed, nextAction: failedEvalNextAction(failed) };
  });

  const blockers = [
    ...stringArray(input.coverageReadiness.blockers),
    ...missingEvalBacklog.filter((item) => !item.readyForApprovedEval).map((item) => `${item.evalKey}:${item.blocker ?? 'not_ready'}`),
    ...failedEvalBacklog.map((item) => `${item.evalKey}:failed_eval_score:${item.score}`),
  ];
  const status = blockers.length || missingEvalBacklog.length || failedEvalBacklog.length ? 'blocked' : 'ready';
  const approvedCommand = String(
    input.missingPreflight.approvedCommand
      ?? 'SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing',
  );

  return {
    ok: true,
    version: 'rag-eval-recovery-plan-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    status,
    releaseMeaning: 'This recovery plan reads local RAG eval evidence only. It does not seed Supabase, call DeepSeek, run retrieval, write eval results, or satisfy eval coverage.',
    latestEval: {
      ok: input.latestEval.ok === true,
      seededQuestionCount: numberValue(input.latestEval.seededQuestionCount),
      evaluatedQuestionCount: numberValue(input.latestEval.evaluatedQuestionCount),
      passRate: input.latestEval.summary ? numberValue(input.latestEval.summary.passRate, 0) : null,
      failedCount: latestFailures.length,
    },
    coverage: {
      expectedQuestionCount: numberValue(input.coverageReadiness.expectedQuestionCount),
      missingEvalCount: missingEvalKeys.length,
      missingEvalKeys,
      releaseReady: input.coverageReadiness.releaseReady === true,
      blockers: stringArray(input.coverageReadiness.blockers),
    },
    missingEvalBacklog,
    failedEvalBacklog,
    antiFakeRules: [
      'This plan is not an eval run and must not be counted as eval coverage.',
      'Dry-run, preflight, source-only, or plan-only output does not close rag_eval_latest or rag_eval_coverage_readiness.',
      'Every missing eval key needs a persisted non-dry-run eval result after explicit approval.',
      'Every failed eval needs either source, retrieval, citation, faithfulness, or usefulness remediation before score claims improve.',
    ],
    approvedCommand,
    nextActions: [
      ...(missingEvalBacklog.length
        ? ['Get explicit approval and run the approved missing-eval command after preflight remains ready.']
        : []),
      ...(failedEvalBacklog.length
        ? ['Fix failed eval source/retrieval/prompt issues, then rerun the relevant eval command with explicit approval.']
        : []),
      ...(status === 'ready'
        ? ['No local eval recovery action is pending. Keep adding real failure-derived evals during weekly operations.']
        : []),
      'Regenerate eval coverage readiness, final scorecard, world-class readiness, and local verification after any approved eval run.',
    ],
  };
}

export function validateRagEvalRecoveryPlan(plan: RagEvalRecoveryPlan): { ok: boolean; failures: string[] } {
  const failures: string[] = [];
  if (plan.version !== 'rag-eval-recovery-plan-v1') failures.push('wrong_version');
  if (plan.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (!plan.releaseMeaning.includes('does not seed Supabase, call DeepSeek, run retrieval, write eval results, or satisfy eval coverage')) {
    failures.push('missing_non_mutation_disclaimer');
  }
  if (plan.coverage.missingEvalCount !== plan.coverage.missingEvalKeys.length) failures.push('missing_eval_count_mismatch');
  if (plan.missingEvalBacklog.length !== plan.coverage.missingEvalCount) failures.push('missing_backlog_count_mismatch');
  if (plan.missingEvalBacklog.some((item) => item.readyForApprovedEval && item.blocker)) failures.push('ready_missing_eval_has_blocker');
  if (!plan.antiFakeRules.some((rule) => /plan-only/i.test(rule))) failures.push('missing_plan_only_antifake_rule');
  if (!plan.approvedCommand.includes('rag:evaluate:approved-missing') && !plan.approvedCommand.includes('rag:evaluate:missing')) failures.push('missing_approved_missing_eval_command');
  return { ok: plan.ok === true && failures.length === 0, failures };
}

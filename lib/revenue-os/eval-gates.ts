export type RevenueOsEvalCase = {
  id: string;
  leadScore: number;
  draftQuality: number;
  spamRisk: number;
  deliverabilityRisk: number;
  hallucinationRisk: number;
  conversionPrediction: number;
};

export type RevenueOsEvalThresholds = {
  leadQuality: number;
  draftQuality: number;
  maxSpamRisk: number;
  maxDeliverabilityRisk: number;
  maxHallucinationRisk: number;
  conversionPrediction: number;
};

export function runRevenueOsEvalSuite(input: {
  cases: RevenueOsEvalCase[];
  thresholds: RevenueOsEvalThresholds;
}) {
  const caseResults = input.cases.map((testCase) => {
    const reasons = [
      testCase.leadScore < input.thresholds.leadQuality ? 'lead quality below threshold' : null,
      testCase.draftQuality < input.thresholds.draftQuality ? 'draft quality below threshold' : null,
      testCase.spamRisk > input.thresholds.maxSpamRisk ? 'spam risk above threshold' : null,
      testCase.deliverabilityRisk > input.thresholds.maxDeliverabilityRisk ? 'deliverability risk above threshold' : null,
      testCase.hallucinationRisk > input.thresholds.maxHallucinationRisk ? 'hallucination risk above threshold' : null,
      testCase.conversionPrediction < input.thresholds.conversionPrediction ? 'conversion prediction below threshold' : null,
    ].filter((reason): reason is string => Boolean(reason));
    return {
      id: testCase.id,
      status: reasons.length === 0 ? 'pass' as const : 'fail' as const,
      reasons,
    };
  });
  const passed = caseResults.filter((result) => result.status === 'pass').length;
  const failed = caseResults.length - passed;
  return {
    overallStatus: failed === 0 ? 'pass' as const : 'fail' as const,
    passed,
    failed,
    passRate: caseResults.length ? Math.round((passed / caseResults.length) * 100) : 0,
    failures: caseResults.filter((result) => result.status === 'fail'),
    caseResults,
  };
}

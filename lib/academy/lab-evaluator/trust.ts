import {
  isTrustedLabEvaluation,
  type TrustedLabEvaluation,
} from './signing'

export type { TrustedLabEvaluation } from './signing'

export type MasteryEvidenceAuthorization = {
  allowed: boolean
  eventTypes: ('lab_verified' | 'sprint_artifact_created')[]
}

export function authorizeMasteryEvidence(
  evaluation: TrustedLabEvaluation | null,
): MasteryEvidenceAuthorization {
  if (
    !evaluation ||
    !isTrustedLabEvaluation(evaluation) ||
    evaluation.verdict !== 'passed' ||
    evaluation.reason !== 'all_private_cases_passed' ||
    evaluation.tests.total < 1 ||
    evaluation.tests.passed !== evaluation.tests.total
  ) {
    return { allowed: false, eventTypes: [] }
  }
  return { allowed: true, eventTypes: ['lab_verified', 'sprint_artifact_created'] }
}

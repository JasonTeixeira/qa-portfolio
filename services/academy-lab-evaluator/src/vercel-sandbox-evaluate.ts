import { buildEvaluationRequest } from '../../../lib/academy/lab-evaluator/client-core'
import type {
  LabLanguage,
  PrivateCaseResult,
  PrivateLabCase,
  PrivateLabSpec,
} from '../../../lib/academy/lab-evaluator/contract'
import {
  signEvaluatorResponse,
  verifyEvaluatorResponse,
  type TrustedLabEvaluation,
} from '../../../lib/academy/lab-evaluator/signing'
import { evaluateSubmission } from './evaluate'
import {
  executePrivateCaseInVercelSandbox,
  type VercelSandboxCreate,
} from './vercel-sandbox-executor'

export type SandboxRuntimeImages = Record<LabLanguage, string>

export type VercelSandboxEvaluationDependencies = {
  secret: string
  images: SandboxRuntimeImages
  loadSpec: (labKey: string) => Promise<PrivateLabSpec | null>
  createSandbox?: VercelSandboxCreate
  executeCase?: (
    code: string,
    testCase: PrivateLabCase,
    spec: PrivateLabSpec,
  ) => Promise<PrivateCaseResult>
  requestId?: string
  now?: () => number
  newId?: () => string
}

export async function evaluateLabWithVercelSandbox(input: {
  courseSlug: string
  lessonSlug: string
  code: string
}, deps: VercelSandboxEvaluationDependencies): Promise<TrustedLabEvaluation> {
  const now = deps.now ?? Date.now
  const request = buildEvaluationRequest({
    ...input,
    requestId: deps.requestId,
    issuedAt: now(),
  })

  const response = await evaluateSubmission(request, {
    now,
    newId: deps.newId,
    loadSpec: deps.loadSpec,
    executeCase: deps.executeCase ?? ((code, testCase, spec) => executePrivateCaseInVercelSandbox({
      language: spec.language,
      code,
      testCase,
      spec,
      image: deps.images[spec.language],
      requestId: request.requestId,
    }, { createSandbox: deps.createSandbox })),
  })

  return verifyEvaluatorResponse(
    signEvaluatorResponse(response, deps.secret),
    deps.secret,
    request,
    { now: now() },
  )
}

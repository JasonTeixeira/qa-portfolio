import { OFFER_LABELS } from '@/lib/acquisition/resources';
import type { AcquisitionOffer } from '@/lib/acquisition/types';

export type PersonalizationEvidence = {
  id: string;
  claim: string;
  sourceUrl?: string | null;
  evidenceType?: string | null;
  observedAt?: string | null;
};

export type AiPersonalizationDraft = {
  subject: string;
  body: string;
  sendMode: 'manual_review';
  citedEvidenceIds: string[];
  brandVoice: string;
  spamRiskScore: number;
};

export type EvidenceLockedClaim = {
  claim: string;
  evidenceId: string;
};

export type EvidenceLockedDraftVersion = {
  provider: 'local_structured' | 'openai' | 'vercel_ai_gateway';
  model: string;
  promptVersion: string;
  subject: string;
  body: string;
  sendMode: 'manual_review';
  brandVoice: string;
  citedEvidenceIds: string[];
  spamRiskScore: number;
  hallucinationRisk: number;
  structuredOutput: {
    subject: string;
    body: string;
    claims: EvidenceLockedClaim[];
    uncertainty: string;
    reviewerNotes: string[];
  };
};

export type EvidenceLockedQualityGate = {
  gateKey:
    | 'evidence_citations'
    | 'manual_review'
    | 'spam_risk'
    | 'prompt_injection'
    | 'brand_voice'
    | 'unsubscribe_compliance';
  status: 'pass' | 'fail';
  severity: 'low' | 'medium' | 'high';
  detail: string;
};

export type EvidenceLockedPersonalization = {
  runKey: string;
  accountId: string;
  draftVersion: EvidenceLockedDraftVersion;
  qualityGates: EvidenceLockedQualityGate[];
  review: ReturnType<typeof reviewAiPersonalizationDraft>;
  persistence: {
    draftVersion: Record<string, unknown>;
    evidenceCitations: Array<Record<string, unknown>>;
    qualityGates: Array<Record<string, unknown>>;
    review: Record<string, unknown>;
  };
};

function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || null;
}

function offerLabel(offer: string) {
  return OFFER_LABELS[offer as AcquisitionOffer] ?? offer.replaceAll('_', ' ');
}

export function buildAiPersonalizationDraft(input: {
  accountName: string;
  contactName?: string | null;
  offer: string;
  brandVoice: string;
  evidence: PersonalizationEvidence[];
}): AiPersonalizationDraft {
  const cited = input.evidence.slice(0, 3);
  const greeting = firstName(input.contactName) ? `Hi ${firstName(input.contactName)},` : 'Hi,';
  const evidenceLines = cited.map((item) => `- [${item.id}] ${item.claim}`).join('\n');
  const primary = cited[0]?.claim ?? 'there is a visible conversion opportunity';
  const body = `${greeting}

I reviewed ${input.accountName} and found a specific ${offerLabel(input.offer)} opportunity: ${primary} [${cited[0]?.id ?? 'evidence-needed'}].

Evidence I would use before making any recommendation:
${evidenceLines}

I can turn this into a short, practical fix list. Worth sending the top 3 changes I would make first?`;

  return {
    subject: `${input.accountName} ${offerLabel(input.offer)}`,
    body,
    sendMode: 'manual_review',
    citedEvidenceIds: cited.map((item) => item.id),
    brandVoice: input.brandVoice,
    spamRiskScore: /guarantee|risk[- ]free|act now/i.test(body) ? 75 : 12,
  };
}

export function reviewAiPersonalizationDraft(input: {
  draft: AiPersonalizationDraft;
  evidenceIds: string[];
  bannedClaims: string[];
}) {
  const missing = input.draft.citedEvidenceIds.filter((id) => !input.evidenceIds.includes(id));
  const banned = input.bannedClaims.filter((claim) => input.draft.body.toLowerCase().includes(claim.toLowerCase()));
  const uncitedClaimRisk = /\b\d+%|\bguarantee\b|\bdouble\b/i.test(input.draft.body) ? 1 : 0;
  const hallucinationRisk = missing.length * 30 + banned.length * 40 + uncitedClaimRisk * 25;
  const checks = [
    missing.length === 0 ? 'all claims cite supplied evidence' : 'missing evidence citations',
    banned.length === 0 ? 'no banned claims detected' : 'banned claim detected',
    input.draft.sendMode === 'manual_review' ? 'manual review enforced' : 'manual review missing',
  ];
  return {
    approved: hallucinationRisk === 0 && input.draft.spamRiskScore <= 25,
    hallucinationRisk,
    spamRiskScore: input.draft.spamRiskScore,
    checks,
    blockers: [...missing.map((id) => `missing evidence ${id}`), ...banned.map((claim) => `banned claim ${claim}`)],
  };
}

function spamRiskScore(text: string) {
  let score = 8;
  if (/guarantee|risk[- ]free|act now|limited time|double your/i.test(text)) score += 45;
  if (/\$\d+|\b\d+%/.test(text)) score += 20;
  if ((text.match(/!/g) ?? []).length > 1) score += 10;
  return Math.min(100, score);
}

function hasPromptInjectionRisk(evidence: PersonalizationEvidence[]) {
  return evidence.some((item) => /ignore previous|system prompt|developer message|tool call|send email now/i.test(item.claim));
}

function buildQualityGates(input: {
  draft: EvidenceLockedDraftVersion;
  evidenceIds: string[];
  promptInjectionRisk: boolean;
}): EvidenceLockedQualityGate[] {
  const missing = input.draft.citedEvidenceIds.filter((id) => !input.evidenceIds.includes(id));
  return [
    {
      gateKey: 'evidence_citations',
      status: missing.length === 0 && input.draft.citedEvidenceIds.length > 0 ? 'pass' : 'fail',
      severity: missing.length === 0 ? 'low' : 'high',
      detail: missing.length === 0
        ? 'Every generated claim cites stored audit evidence.'
        : `Missing stored evidence for: ${missing.join(', ')}`,
    },
    {
      gateKey: 'manual_review',
      status: input.draft.sendMode === 'manual_review' ? 'pass' : 'fail',
      severity: input.draft.sendMode === 'manual_review' ? 'low' : 'high',
      detail: 'Draft is locked to manual review before any send action.',
    },
    {
      gateKey: 'spam_risk',
      status: input.draft.spamRiskScore <= 25 ? 'pass' : 'fail',
      severity: input.draft.spamRiskScore <= 25 ? 'low' : 'high',
      detail: `Spam risk score is ${input.draft.spamRiskScore}/100.`,
    },
    {
      gateKey: 'prompt_injection',
      status: input.promptInjectionRisk ? 'fail' : 'pass',
      severity: input.promptInjectionRisk ? 'high' : 'low',
      detail: input.promptInjectionRisk
        ? 'Untrusted evidence contains prompt-injection language and must be reviewed.'
        : 'Untrusted evidence was treated as data only.',
    },
    {
      gateKey: 'brand_voice',
      status: input.draft.brandVoice.trim().length > 0 ? 'pass' : 'fail',
      severity: input.draft.brandVoice.trim().length > 0 ? 'low' : 'medium',
      detail: `Brand voice applied: ${input.draft.brandVoice || 'missing'}.`,
    },
    {
      gateKey: 'unsubscribe_compliance',
      status: 'pass',
      severity: 'low',
      detail: 'Draft stays in manual review; unsubscribe handling is enforced at sequence/send time.',
    },
  ];
}

export function buildEvidenceLockedPersonalizationDraft(input: {
  runKey: string;
  accountId: string;
  accountName: string;
  contactName?: string | null;
  offer: string;
  brandVoice: string;
  evidence: PersonalizationEvidence[];
  provider?: EvidenceLockedDraftVersion['provider'];
  model?: string;
}): EvidenceLockedPersonalization {
  const citedEvidence = input.evidence.slice(0, 3);
  const citedEvidenceIds = citedEvidence.map((item) => item.id);
  const greeting = firstName(input.contactName) ? `Hi ${firstName(input.contactName)},` : 'Hi,';
  const offer = offerLabel(input.offer);
  const claims = citedEvidence.map((item) => ({
    claim: item.claim,
    evidenceId: item.id,
  }));
  const evidenceLines = claims.map((item) => `- ${item.claim} [${item.evidenceId}]`).join('\n');
  const body = `${greeting}

I reviewed ${input.accountName} and found a specific ${offer} opportunity worth checking before you spend on more traffic.

The evidence I would use:
${evidenceLines}

I can turn those notes into a short fix list for the first improvements I would make. Worth sending that over?`;
  const score = spamRiskScore(body);
  const promptInjectionRisk = hasPromptInjectionRisk(input.evidence);
  const draftVersion: EvidenceLockedDraftVersion = {
    provider: input.provider ?? 'local_structured',
    model: input.model ?? 'deterministic-evidence-lock-v1',
    promptVersion: 'revenue-os-personalization-v2',
    subject: `${input.accountName} ${offer} notes`,
    body,
    sendMode: 'manual_review',
    brandVoice: input.brandVoice,
    citedEvidenceIds,
    spamRiskScore: score,
    hallucinationRisk: citedEvidence.length === 0 || promptInjectionRisk ? 50 : 0,
    structuredOutput: {
      subject: `${input.accountName} ${offer} notes`,
      body,
      claims,
      uncertainty: citedEvidence.length > 0
        ? 'Only claims backed by stored audit evidence are included.'
        : 'No evidence was available; draft should not be used.',
      reviewerNotes: [
        'Verify the website evidence before approving.',
        'Keep send mode manual_review until compliance and suppression checks pass.',
      ],
    },
  };
  const qualityGates = buildQualityGates({
    draft: draftVersion,
    evidenceIds: input.evidence.map((item) => item.id),
    promptInjectionRisk,
  });
  const review = reviewAiPersonalizationDraft({
    draft: draftVersion,
    evidenceIds: input.evidence.map((item) => item.id),
    bannedClaims: ['guaranteed revenue', 'risk free', 'double your revenue'],
  });
  const approved = review.approved && qualityGates.every((gate) => gate.status === 'pass');

  return {
    runKey: input.runKey,
    accountId: input.accountId,
    draftVersion,
    qualityGates,
    review: {
      ...review,
      approved,
      blockers: approved
        ? review.blockers
        : [
            ...review.blockers,
            ...qualityGates.filter((gate) => gate.status === 'fail').map((gate) => `${gate.gateKey}: ${gate.detail}`),
          ],
    },
    persistence: {
      draftVersion: {
        account_id: input.accountId,
        run_key: input.runKey,
        provider: draftVersion.provider,
        model: draftVersion.model,
        prompt_version: draftVersion.promptVersion,
        subject: draftVersion.subject,
        body: draftVersion.body,
        send_mode: draftVersion.sendMode,
        brand_voice: draftVersion.brandVoice,
        cited_evidence_ids: draftVersion.citedEvidenceIds,
        spam_risk: draftVersion.spamRiskScore,
        hallucination_risk: draftVersion.hallucinationRisk,
        structured_output: draftVersion.structuredOutput,
        metadata: {
          evidenceLocked: true,
          offer: input.offer,
          accountName: input.accountName,
        },
      },
      evidenceCitations: citedEvidence.map((item) => ({
        account_id: input.accountId,
        run_key: input.runKey,
        evidence_id: item.id,
        claim: item.claim,
        source_url: item.sourceUrl ?? null,
        evidence_type: item.evidenceType ?? null,
        observed_at: item.observedAt ?? null,
        metadata: {
          accountName: input.accountName,
          offer: input.offer,
        },
      })),
      qualityGates: qualityGates.map((gate) => ({
        account_id: input.accountId,
        run_key: input.runKey,
        gate_key: gate.gateKey,
        status: gate.status,
        severity: gate.severity,
        detail: gate.detail,
        metadata: {
          accountName: input.accountName,
          offer: input.offer,
        },
      })),
      review: {
        account_id: input.accountId,
        approved,
        hallucination_risk: draftVersion.hallucinationRisk,
        spam_risk: draftVersion.spamRiskScore,
        cited_evidence_ids: draftVersion.citedEvidenceIds,
        checks: [
          ...review.checks,
          ...qualityGates.map((gate) => `${gate.gateKey}: ${gate.status}`),
        ],
        metadata: {
          runKey: input.runKey,
          program: '4_ai_personalization_evidence_locks',
          draftVersion,
          review,
          qualityGates,
        },
      },
    },
  };
}

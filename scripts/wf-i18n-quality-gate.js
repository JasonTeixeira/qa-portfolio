export const meta = {
  name: 'i18n-quality-gate',
  description: 'Adversarially audit funnel translations across the 5 priority languages before ship',
  phases: [
    { title: 'Audit', detail: 'one agent per priority language, reads catalog vs source' },
    { title: 'Verify', detail: 'independent skeptic re-checks each flagged issue' },
    { title: 'Synthesize', detail: 'aggregate to a ship/hold verdict' },
  ],
}

const REPO = '/Users/Sage/code/active/sageideas.dev'

const LANGS = [
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'fr', name: 'French' },
]

const AUDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    code: { type: 'string' },
    keyCount: { type: 'number', description: 'total keys in the locale file' },
    untranslatedLeakage: {
      type: 'array',
      description: 'keys whose value is still English (excluding legit brand/proper-noun/code passthrough)',
      items: { type: 'string' },
      maxItems: 40,
    },
    placeholderOrHtmlBreaks: {
      type: 'array',
      description: 'keys where a {placeholder}, HTML tag, or symbol was dropped/mangled vs the English source',
      items: { type: 'string' },
      maxItems: 40,
    },
    brandNameViolations: {
      type: 'array',
      description: 'keys where a brand/proper name (Sage Academy, Sage Ideas, Jason Teixeira, Stripe, AWS) was wrongly translated',
      items: { type: 'string' },
      maxItems: 20,
    },
    faithfulnessScore: { type: 'number', description: 'mean 1-5 across ~15 sampled funnel-critical strings' },
    fluencyScore: { type: 'number', description: 'mean 1-5 across the same sample' },
    worstExamples: {
      type: 'array',
      description: 'up to 5 concrete bad translations: {key, got, why}',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { key: { type: 'string' }, got: { type: 'string' }, why: { type: 'string' } },
        required: ['key', 'got', 'why'],
      },
      maxItems: 5,
    },
    verdict: { type: 'string', enum: ['PASS', 'MINOR_ISSUES', 'FAIL'] },
    summary: { type: 'string' },
  },
  required: ['code', 'keyCount', 'untranslatedLeakage', 'placeholderOrHtmlBreaks', 'brandNameViolations', 'faithfulnessScore', 'fluencyScore', 'verdict', 'summary'],
}

phase('Audit')

const audits = await parallel(
  LANGS.map((l) => () =>
    agent(
      `You are a strict bilingual localization QA reviewer for ${l.name}. In the repo ${REPO}, compare the machine-translated UI catalog \`lib/i18n/messages/${l.code}.json\` against the English source \`lib/i18n/messages/en.json\`. Both are flat JSON objects: keys are the English source strings, values are the ${l.name} translations.\n\n` +
        `Do this:\n` +
        `1. UNTRANSLATED LEAKAGE: find keys whose value is still identical (or near-identical) to the English key, where it SHOULD have been translated. Legitimately-unchanged values are OK: brand/proper names (Sage Academy, Sage Ideas, Jason Teixeira, Stripe, AWS, Next.js, AI), pure code/file tokens, single symbols, and short technical tokens. List the real leakage keys.\n` +
        `2. PLACEHOLDER/HTML/SYMBOL BREAKS: find keys where a {placeholder}, an HTML tag, or a meaningful symbol (©, ·, →, —) present in the English was dropped or mangled in the translation.\n` +
        `3. BRAND VIOLATIONS: keys where a brand/proper name was wrongly translated.\n` +
        `4. QUALITY SAMPLE: pick ~15 funnel-critical strings (hero headlines, CTAs like "Start learning"/"Start free", pricing/guarantee copy, the anti-cert lines) and rate mean faithfulness and fluency 1-5 for a native ${l.name} speaker evaluating a paid education product. Capture up to 5 worst examples.\n\n` +
        `Read the two JSON files directly (they are ~560 keys; read fully). Be concrete and cite exact keys. Verdict: PASS (ship-ready), MINOR_ISSUES (ship, fix later), or FAIL (do not ship this language).`,
      { label: `audit:${l.code}`, phase: 'Audit', schema: AUDIT_SCHEMA, model: 'sonnet' },
    ),
  ),
)

const clean = audits.filter(Boolean)

// Verify: for any language that FAILED or flagged leakage, a second independent
// skeptic re-checks the specific claims (cheap, catches false positives).
phase('Verify')

const RECHECK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    code: { type: 'string' },
    confirmedRealIssues: { type: 'number' },
    falsePositives: { type: 'number' },
    stillShippable: { type: 'boolean' },
    note: { type: 'string' },
  },
  required: ['code', 'confirmedRealIssues', 'falsePositives', 'stillShippable', 'note'],
}

const needsRecheck = clean.filter(
  (a) => a.verdict === 'FAIL' || a.untranslatedLeakage.length > 3 || a.brandNameViolations.length > 0,
)

const rechecks = await parallel(
  needsRecheck.map((a) => () =>
    agent(
      `Independent re-check for ${a.code}. A first reviewer flagged these issues in ${REPO}/lib/i18n/messages/${a.code}.json (vs en.json):\n` +
        `- untranslated leakage keys: ${JSON.stringify(a.untranslatedLeakage.slice(0, 15))}\n` +
        `- brand violations: ${JSON.stringify(a.brandNameViolations)}\n` +
        `- worst examples: ${JSON.stringify(a.worstExamples || [])}\n\n` +
        `Open both files and verify each claim. Many "leakage" flags are false positives (words that are legitimately identical across English and ${a.code}, or brand names). Report how many are REAL defects vs false positives, and whether this language is still shippable (real defects are few/cosmetic).`,
      { label: `verify:${a.code}`, phase: 'Verify', schema: RECHECK_SCHEMA, model: 'sonnet' },
    ),
  ),
)

phase('Synthesize')

const recheckByCode = Object.fromEntries(rechecks.filter(Boolean).map((r) => [r.code, r]))

const report = clean.map((a) => {
  const rc = recheckByCode[a.code]
  return {
    code: a.code,
    verdict: a.verdict,
    keyCount: a.keyCount,
    faithfulness: a.faithfulnessScore,
    fluency: a.fluencyScore,
    leakage: a.untranslatedLeakage.length,
    breaks: a.placeholderOrHtmlBreaks.length,
    brandViolations: a.brandNameViolations.length,
    confirmedRealIssues: rc ? rc.confirmedRealIssues : null,
    stillShippable: rc ? rc.stillShippable : a.verdict !== 'FAIL',
    summary: a.summary,
  }
})

const blockers = report.filter((r) => !r.stillShippable)
const shipReady = blockers.length === 0

return {
  gate: shipReady ? 'PASS' : 'HOLD',
  languages: report,
  blockers: blockers.map((b) => b.code),
}

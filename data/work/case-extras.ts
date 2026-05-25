// Phase 7+: per-case-study editorial extras layered on top of the base CaseStudy schema.
// "Almost happened" honesty blocks, code samples, and pull quotes.

export type AlmostHappened = {
  before: string // what was about to happen / what was on the table
  after: string  // what we did instead
  cost: string   // one-line consequence
}

export type CodeSample = {
  title: string
  caption?: string
  lang: 'ts' | 'tsx' | 'js' | 'python' | 'bash' | 'sql' | 'yaml' | 'json'
  code: string
}

export type CaseExtras = {
  almostHappened?: AlmostHappened[]
  codeSamples?: CodeSample[]
  pullQuote?: string
  scrollyDiagram?: boolean // turn on the SVG-path scrolly architecture
}

export const caseExtras: Record<string, CaseExtras> = {
  // ──────────────────────────────────────────────────────────────────
  // ALPHASTREAM — ML signal engine, open source, explainable.
  // ──────────────────────────────────────────────────────────────────
  alphastream: {
    pullQuote:
      "A signal you can't explain is a signal you can't ship. Every prediction comes back with its feature importances attached.",
    almostHappened: [
      {
        before:
          'Backtests were going to use the same data the models trained on. A subtle look-ahead bug — the kind that makes Sharpe ratios look magical and PnL look real.',
        after:
          'Strict purged k-fold cross-validation with embargo bars. Splits are walk-forward, no overlap, and the engine refuses to score a model whose train window touches the eval window.',
        cost: 'Sharpe dropped from ~3.1 (fake) to ~1.4 (real). Still beats the SPY benchmark out-of-sample.',
      },
      {
        before:
          'Feature engineering pipeline was about to ship as a notebook — 200+ indicators computed inline, no versioning, no reproducibility.',
        after:
          'Each indicator is a pure function in `features/`, registered in a manifest, tagged with a semver. Backtests log the exact feature-set hash they used.',
        cost: 'Two extra weeks. Now every published result is replayable from one commit.',
      },
    ],
    codeSamples: [
      {
        title: 'Purged walk-forward split',
        caption: 'No look-ahead. The split refuses to leak future bars into the training window.',
        lang: 'python',
        code: `# features/cv.py — production excerpt
def purged_kfold(idx: pd.Index, n_splits: int, embargo: int) -> Iterator[Split]:
    """Walk-forward CV with a hard embargo gap between train and test.

    embargo: number of bars to drop on each side of the test window
             so leakage from rolling-window features cannot bleed in.
    """
    fold_size = len(idx) // (n_splits + 1)
    for k in range(n_splits):
        test_start = (k + 1) * fold_size
        test_end = test_start + fold_size
        train_end = max(0, test_start - embargo)
        train = idx[:train_end]
        test = idx[test_start:test_end]
        yield Split(train=train, test=test, k=k)
`,
      },
      {
        title: 'Explainable prediction envelope',
        caption: 'Every signal carries its top-N feature attributions — in the API response, not a separate dashboard.',
        lang: 'python',
        code: `# api/predict.py
@app.post("/predict")
def predict(req: PredictRequest) -> PredictResponse:
    x = build_feature_row(req.symbol, req.ts)
    proba = model.predict_proba(x)[0, 1]
    shap_values = explainer(x)
    top = sorted(
        zip(FEATURE_NAMES, shap_values),
        key=lambda kv: abs(kv[1]),
        reverse=True,
    )[:5]
    return PredictResponse(
        symbol=req.symbol,
        proba=float(proba),
        signal="long" if proba > 0.55 else "flat",
        attributions=[{"feature": f, "shap": float(v)} for f, v in top],
        model_version=MODEL_VERSION,
        feature_hash=FEATURE_HASH,
    )
`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // JOBPOISE — citation-grounded AI job copilot.
  // ──────────────────────────────────────────────────────────────────
  jobpoise: {
    pullQuote:
      "An AI that lies about your resume is worse than no AI at all. Every claim it generates has to point at a line you actually wrote.",
    almostHappened: [
      {
        before:
          'The cover-letter generator was about to ship as a free-form GPT-4 prompt. Hallucinated job titles, fake company names, claims you never made — all eloquent, all wrong.',
        after:
          'Constrained generation: the model can only quote spans from the parsed resume. Every sentence in the output has a citation back to a source line. If it can\'t cite, it doesn\'t write.',
        cost: 'Higher latency (~600ms p95). Acceptable trade for zero hallucinated work history.',
      },
      {
        before:
          'Chrome extension was about to inject DOM into LinkedIn pages — the kind of integration that breaks every two weeks when LinkedIn ships a redesign.',
        after:
          'Extension reads the page, never writes to it. UI lives in a side panel the user opens. Zero brittle selectors against third-party DOM.',
        cost: 'Slightly less seamless. Survives every LinkedIn release. Two-line update beats two-day firefight.',
      },
    ],
    codeSamples: [
      {
        title: 'Citation-grounded generation',
        caption: "The model literally can't write a sentence without a source span.",
        lang: 'ts',
        code: `// lib/generate.ts — production excerpt
export async function generateBullet(
  jd: JobDescription,
  resume: ParsedResume,
): Promise<CitedBullet> {
  const candidates = await llm.generate({
    system: SYSTEM_PROMPT,
    user: prompt(jd, resume),
    schema: BulletSchema, // forces { text, citations: SpanRef[] }
  })

  // Reject any output whose citations don't resolve to real resume spans
  for (const cite of candidates.citations) {
    const span = resume.spans.get(cite.id)
    if (!span) throw new HallucinationError(cite.id)
    if (!candidates.text.includes(span.text.slice(0, 12))) {
      throw new HallucinationError('paraphrase too loose')
    }
  }
  return candidates
}
`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // TRAYD — bilingual AI for the trades.
  // ──────────────────────────────────────────────────────────────────
  trayd: {
    pullQuote:
      "The contractor opens the app on a roof in July. If it takes more than one tap to write an estimate, it doesn't get used.",
    almostHappened: [
      {
        before:
          'Bilingual UX was going to live behind a settings toggle. EN by default, switch to ES in preferences.',
        after:
          'The whole UI auto-detects from device locale and exposes a one-tap toggle in the top bar. The diagnostic AI accepts mixed Spanglish input — "el unit no enfr\xEDa" works.',
        cost: 'Two extra weeks on the language model side. Daily active users in the Spanish-first segment doubled in beta.',
      },
      {
        before:
          'Estimate builder was going to require a stable internet connection. HVAC techs in attics and crawlspaces would lose drafts.',
        after:
          'Offline-first with a service worker, IndexedDB queue, and sync-on-reconnect. Estimates draft, save, and finalize without a connection.',
        cost: 'Three weeks of SW + conflict-resolution work. Zero lost estimates in field testing.',
      },
    ],
    codeSamples: [
      {
        title: 'Bilingual diagnostic prompt',
        caption: 'One model, two languages. The output keys are locked so the UI always knows where to put the answer.',
        lang: 'ts',
        code: `// lib/diagnose.ts — production excerpt
const DIAGNOSTIC_SCHEMA = z.object({
  likely_cause: z.string(),
  next_check: z.string(),
  parts_needed: z.array(z.string()),
  est_time_minutes: z.number(),
  language: z.enum(['en', 'es']),
})

export async function diagnose(symptoms: string, locale: 'en' | 'es') {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_schema', json_schema: SCHEMA },
    messages: [
      { role: 'system', content: SYSTEM[locale] },
      { role: 'user', content: symptoms },
    ],
  })
  return DIAGNOSTIC_SCHEMA.parse(JSON.parse(res.choices[0].message.content!))
}
`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // AWS LANDING ZONE — infrastructure that doesn't need babysitting.
  // ──────────────────────────────────────────────────────────────────
  'aws-landing-zone': {
    pullQuote:
      "Click-ops is how AWS bills get to $40k. Every resource we create is a pull request, every change has a plan, every plan has an approver.",
    almostHappened: [
      {
        before:
          'CI was going to use long-lived AWS access keys stored in GitHub secrets. The kind that leak in build logs and live in `~/.aws/credentials` forever.',
        after:
          'GitHub OIDC federation. Workflows assume a scoped IAM role per environment, valid for the job duration, with no key material on disk anywhere.',
        cost: 'One afternoon of setup. Permanent removal of the worst secret-leak class.',
      },
      {
        before:
          'Default VPC was going to stay enabled in every account. The classic AWS footgun — wide-open egress and a 10.0.0.0/16 nobody documented.',
        after:
          'Service Control Policy denies VPC default creation. Bootstrap module provisions a hardened VPC with explicit subnets, flow logs, and a NAT pattern that scales down on weekends.',
        cost: 'A few hours of SCP debugging. ~$180/mo saved on a NAT we no longer keep warm at 3am.',
      },
    ],
    codeSamples: [
      {
        title: 'GitHub OIDC → IAM role',
        caption: 'No long-lived keys. The trust policy pins workflow + branch + repo.',
        lang: 'yaml',
        code: `# .github/workflows/deploy.yml
permissions:
  id-token: write   # required for OIDC
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::\${{ vars.PROD_ACCOUNT }}:role/gha-deploy-prod
          role-session-name: gha-\${{ github.run_id }}
          aws-region: us-east-1
      # role is valid for ~1 hour; no AWS_ACCESS_KEY_ID in this repo, ever.
      - run: terraform apply -auto-approve
`,
      },
      {
        title: 'SCP — deny default VPC creation',
        caption: 'Org-wide guardrail. No workload account can create a default VPC, period.',
        lang: 'json',
        code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyDefaultVpc",
      "Effect": "Deny",
      "Action": ["ec2:CreateDefaultVpc", "ec2:CreateDefaultSubnet"],
      "Resource": "*"
    }
  ]
}`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // QUALITY TELEMETRY — 13 frameworks, zero guesswork.
  // ──────────────────────────────────────────────────────────────────
  'quality-telemetry': {
    pullQuote:
      "If the dashboard can't tell you whether last night's deploy was safe, it's wallpaper.",
    almostHappened: [
      {
        before:
          'CI was going to run all 13 frameworks on every PR. Pipeline wall time approached 40 minutes, devs started force-merging around it.',
        after:
          'Selective execution by changed-path — a docs change runs Lighthouse + lint, a backend change runs unit + contract + Pact, a release branch runs all 13.',
        cost: 'A weekend writing the path-router. p50 PR time dropped from 38min to 7min.',
      },
      {
        before:
          'Visual regression was set to fail any pixel diff over 0.1%. Result: a font-rendering tweak in Chromium broke 200 snapshots overnight.',
        after:
          'Diffing is structural — a Pixelmatch threshold tuned per surface, plus a ratchet that lets diffs land if a human reviewer ack\'d them in the PR.',
        cost: 'Two days of tuning. Zero false positives in 90 days.',
      },
    ],
    codeSamples: [
      {
        title: 'Path-routed CI matrix',
        caption: 'Only the suites that can possibly be affected by the diff actually run.',
        lang: 'yaml',
        code: `# .github/workflows/ci.yml — path filtering
on:
  pull_request:
    paths:
      - 'apps/**'
      - 'packages/**'
      - '.github/workflows/**'

jobs:
  detect:
    runs-on: ubuntu-latest
    outputs:
      ui: \${{ steps.f.outputs.ui }}
      api: \${{ steps.f.outputs.api }}
    steps:
      - uses: dorny/paths-filter@v3
        id: f
        with:
          filters: |
            ui: ['apps/web/**']
            api: ['apps/api/**']

  e2e:
    needs: detect
    if: needs.detect.outputs.ui == 'true'
    uses: ./.github/workflows/playwright.yml

  contract:
    needs: detect
    if: needs.detect.outputs.api == 'true'
    uses: ./.github/workflows/pact.yml
`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // BRAND SPRINT — two-week identity rebuild.
  // ──────────────────────────────────────────────────────────────────
  'brand-sprint-rebuild': {
    pullQuote:
      "An identity system has to survive a contractor who's tired and a designer who isn't there. Tokens, not vibes.",
    almostHappened: [
      {
        before:
          'Brand voice was about to ship as a moodboard — three Pinterest pins and a font choice.',
        after:
          'A locked voice doc with do/don\'t pairs, banned words, and three sample paragraphs at H1 / body / microcopy length. Anyone writing for the brand has a reference, not a guess.',
        cost: 'Two extra days. The next dozen pages were on-brand without a review cycle.',
      },
    ],
    codeSamples: [
      {
        title: 'Design tokens as code',
        caption: 'Brand color isn\'t a Figma hex — it\'s a typed token the app imports.',
        lang: 'ts',
        code: `// tokens/brand.ts
export const brand = {
  color: {
    cyan: '#0ED3CF',
    coral: '#E85D3A',
    lime: '#A8C633',
    magenta: '#C7236E',
  },
  surface: {
    base: '#09090B',
    raised: '#12110F',
    overlay: '#1A1917',
  },
  ink: {
    primary: '#F4F2EF',
    muted: '#A8A29E',
    subtle: '#B8B0AB',
  },
} as const

export type BrandColor = keyof typeof brand.color
`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // SITE CARE RETAINER — 12 months, zero downtime.
  // ──────────────────────────────────────────────────────────────────
  'site-care-retainer': {
    pullQuote:
      "The most valuable retainer hour is the one nobody noticed. The deploy that didn't break. The dependency you didn't have to read about.",
    almostHappened: [
      {
        before:
          'Renovate was going to merge dependency PRs automatically, including a major Next.js bump that would have shipped on a Friday afternoon.',
        after:
          'Auto-merge gated by suite color + a freeze window that closes for the weekend. Majors require a human ack regardless of CI.',
        cost: 'Slightly slower upgrade cadence. Zero weekend rollbacks in 12 months.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // NEXURAL — flagship (Phase 7).
  // ──────────────────────────────────────────────────────────────────
  nexural: {
    scrollyDiagram: true,
    pullQuote:
      "185 tables isn't a vanity number. It's the data model that needed to be right before anything else could be built on top of it.",
    almostHappened: [
      {
        before:
          'Webhook handler retries on Stripe were going to double-charge in 6 of the 47 event types we cared about.',
        after:
          'Built an idempotency table keyed on (event_id, customer_id) with a transactional INSERT-OR-NOOP and replay the side-effect from the persisted row.',
        cost: '~$0 in customer refunds. Zero billing incidents since launch.',
      },
      {
        before:
          'First architecture sketch put RLS on the API layer — the application would enforce tenant isolation in code.',
        after:
          'Moved every multi-tenant table to Postgres RLS with role-bound policies. The DB refuses cross-tenant reads even if the app forgets to filter.',
        cost: 'Two extra weeks. One catastrophic bug class permanently impossible.',
      },
      {
        before:
          'Real-time portfolio was about to be polled every 5s from the client — 12 RPS per active session.',
        after:
          'Supabase realtime channels with row-level filters; client subscribes, server pushes. Same data, ~0.2 RPS per session.',
        cost: 'Server bill stayed under $80/mo at 200+ AI queries/week.',
      },
    ],
    codeSamples: [
      {
        title: 'Stripe webhook idempotency',
        caption: 'Replay-safe by construction. Same event delivered twice does nothing the second time.',
        lang: 'python',
        code: `# webhook_handler.py — production excerpt
@router.post("/stripe/webhook")
async def handle_stripe(req: Request, db: Db):
    event = stripe.Webhook.construct_event(
        await req.body(),
        req.headers["stripe-signature"],
        STRIPE_WEBHOOK_SECRET,
    )

    # idempotency: insert-or-noop on (event_id) primary key
    inserted = await db.fetchval("""
        INSERT INTO stripe_events (event_id, type, payload, status)
        VALUES ($1, $2, $3, 'pending')
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
    """, event["id"], event["type"], event.data.object)

    if inserted is None:
        # we've seen this event. ack and exit.
        return {"ok": True, "replay": True}

    # side-effect runs exactly once, inside a transaction
    async with db.transaction():
        await process_event(event, db)
        await db.execute(
            "UPDATE stripe_events SET status='processed' WHERE event_id=$1",
            event["id"],
        )
    return {"ok": True}
`,
      },
      {
        title: 'Row-level security on portfolios',
        caption: 'Tenant isolation enforced by Postgres, not by the application.',
        lang: 'sql',
        code: `-- migrations/2026_03_rls_portfolios.sql
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY portfolios_owner_select
  ON portfolios FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY portfolios_owner_modify
  ON portfolios FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Even an authenticated client running raw SQL via PostgREST
-- cannot read another user's row. Verified in 14 contract tests.
`,
      },
      {
        title: 'Discord AI bot — function-calling against the live API',
        caption: 'The bot does not hallucinate positions. It calls the same endpoint the dashboard does.',
        lang: 'ts',
        code: `// bots/discord/tools.ts — production excerpt
export const tools = [
  {
    type: 'function',
    function: {
      name: 'get_position',
      description: 'Fetch a live position for the calling user',
      parameters: {
        type: 'object',
        properties: { symbol: { type: 'string' } },
        required: ['symbol'],
      },
    },
  },
] as const

export async function execute(tool: ToolCall, ctx: BotCtx) {
  if (tool.function.name === 'get_position') {
    const { symbol } = JSON.parse(tool.function.arguments)
    // Real API call — same auth, same RLS as the web app.
    return await api.get('/positions/' + symbol, { token: ctx.userToken })
  }
  throw new Error('unknown tool')
}
`,
      },
    ],
  },
}

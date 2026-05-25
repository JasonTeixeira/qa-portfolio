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

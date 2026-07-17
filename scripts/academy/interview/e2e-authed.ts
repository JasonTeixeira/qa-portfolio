/**
 * Interview Academy — authed browser E2E (Phase 1 closer).
 *
 * Mints a REAL Supabase session for the dev-preview learner, drives the live
 * app in Chromium through the core loop, and asserts the real DB rows. Stage 1
 * (STAGE=1, default): auth + seed a clean profile/session + screenshot Cockpit,
 * Session, Onboarding so we SEE the real UI. Stage 2 (STAGE=2): drive the mock
 * (type -> Marlowe streams -> run lying-test -> End & debrief -> verdict) and
 * assert turns/artifact/verdict/readiness rows.
 *
 *   npx tsx --env-file=.env.local scripts/academy/interview/e2e-authed.ts
 *   STAGE=2 SESSION_ID=<id> npx tsx --env-file=.env.local scripts/academy/interview/e2e-authed.ts
 */
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BASE = 'http://localhost:3040'
const EMAIL = 'preview.learner@sageideas.dev'
const SHOT = '/private/tmp/claude-501/-Users-Sage/ec288626-fae9-4b32-96bf-21b7a3587e19/scratchpad'
const STAGE = process.env.STAGE ?? '1'

const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } })

async function mintCookies(): Promise<Array<{ name: string; value: string; url: string }>> {
  const { data: link, error: le } = await admin.auth.admin.generateLink({ type: 'magiclink', email: EMAIL })
  if (le || !link?.properties?.hashed_token) throw new Error(`generateLink failed: ${le?.message}`)
  const anon = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } })
  let session
  for (const type of ['magiclink', 'email'] as const) {
    const { data, error } = await anon.auth.verifyOtp({ token_hash: link.properties.hashed_token, type })
    if (!error && data?.session) { session = data.session; break }
  }
  if (!session) throw new Error('verifyOtp produced no session')

  const jar: Array<{ name: string; value: string }> = []
  const capture = createServerClient(URL, ANON, {
    cookies: {
      getAll: () => [],
      setAll: (cs: Array<{ name: string; value: string }>) => { for (const c of cs) jar.push({ name: c.name, value: c.value }) },
    },
  })
  await capture.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token })
  if (!jar.length) throw new Error('no auth cookie captured')
  return jar.map((c) => ({ name: c.name, value: c.value, url: BASE }))
}

async function userId(): Promise<string> {
  const { data } = await admin.auth.admin.listUsers()
  const u = data.users.find((x) => x.email === EMAIL)
  if (!u) throw new Error('preview learner not found')
  return u.id
}

async function main(): Promise<void> {
  const uid = await userId()
  const cookies = await mintCookies()
  console.log(`✓ minted session for ${EMAIL} (${uid}); ${cookies.length} auth cookie(s)`)

  if (STAGE === '1') {
    // Clean slate for this user, then seed an onboarded profile + a live session.
    for (const t of ['interview_verdicts', 'interview_readiness', 'interview_readiness_snapshots',
      'interview_artifacts', 'interview_turns', 'interview_sessions', 'interview_drills',
      'interview_profiles']) {
      await admin.from(t).delete().eq('user_id', uid)
    }
    const { data: scen } = await admin.from('interview_scenarios').select('id, title, description')
      .eq('slug', 'the-lying-test-suite').single()
    await admin.from('interview_profiles').insert({
      user_id: uid, target_role: 'Software Engineer', target_level: 'senior',
      timeline: 'six_weeks', cadence: '4–5 reps/week', onboarded_at: new Date().toISOString(),
    })
    const { data: sess, error: se } = await admin.from('interview_sessions').insert({
      user_id: uid, scenario_id: scen!.id, track: 'coding', level: 'senior', mode: 'typed',
      interviewer_style: 'skeptical', status: 'live', question_title: scen!.title, question_body: scen!.description,
    }).select('id').single()
    if (se) throw new Error(`seed session failed: ${se.message}`)
    console.log(`✓ seeded onboarded profile + live session ${sess!.id}`)
    console.log(`\n→ next: STAGE=2 SESSION_ID=${sess!.id} npx tsx --env-file=.env.local scripts/academy/interview/e2e-authed.ts`)

    const browser = await chromium.launch()
    const ctx = await browser.newContext()
    await ctx.addCookies(cookies)
    const page = await ctx.newPage()
    for (const [name, path] of [
      ['cockpit', '/academy/interview'],
      ['session', `/academy/interview/session/${sess!.id}`],
      ['onboarding', '/academy/interview/onboarding'],
    ] as const) {
      const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      const finalUrl = page.url()
      const authed = !finalUrl.includes('/login')
      await page.screenshot({ path: `${SHOT}/e2e-${name}.png`, fullPage: true })
      console.log(`  ${name}: ${resp?.status()} → ${finalUrl}  ${authed ? '✓ AUTHED' : '✗ REDIRECTED TO LOGIN'}`)
    }
    await browser.close()
    console.log('\nStage 1 done — review the 3 screenshots, then run Stage 2.')
    return
  }

  // ── STAGE 2: drive the live mock + assert real rows ──────────────────────
  const sessionId = process.env.SESSION_ID
  if (!sessionId) throw new Error('STAGE 2 needs SESSION_ID=<id>')

  const SOLUTION = [
    'def merge_intervals(intervals):',
    '    intervals = sorted(intervals)',
    '    out = []',
    '    for iv in intervals:',
    '        if out and iv[0] <= out[-1][1]:',
    '            out[-1][1] = max(out[-1][1], iv[1])',
    '        else:',
    '            out.append(list(iv))',
    '    return out',
  ].join('\n')
  const ANSWER =
    'The invariant: the output stays sorted by start and every interval in it is disjoint. ' +
    'When the next start is <= the last output end they overlap, so I merge by extending the end; otherwise I push a new interval.'

  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addCookies(cookies)
  const page = await ctx.newPage()
  page.setDefaultTimeout(45000)
  await page.goto(`${BASE}/academy/interview/session/${sessionId}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  // 1) Fill the code editor (the textarea whose value has the seed function).
  const areas = page.locator('textarea')
  const n = await areas.count()
  let editor = -1
  for (let i = 0; i < n; i += 1) {
    if ((await areas.nth(i).inputValue()).includes('merge_intervals')) { editor = i; break }
  }
  if (editor < 0) throw new Error('code editor textarea not found')
  await areas.nth(editor).fill(SOLUTION)
  console.log('✓ typed a correct (sorted) solution')

  // 2) Run the lying-test suite (Pyodide — first load is slow).
  await page.getByRole('button', { name: /run tests/i }).click()
  await page.waitForTimeout(18000) // Pyodide cold start + run
  await page.screenshot({ path: `${SHOT}/e2e-after-run.png`, fullPage: true })
  console.log('✓ ran tests (Pyodide)')

  // 3) Answer Marlowe → live SSE reply.
  await page.getByPlaceholder(/answer marlowe/i).fill(ANSWER)
  await page.getByRole('button', { name: /^send$/i }).click()
  await page.waitForTimeout(15000) // Marlowe streams
  console.log('✓ sent an answer; Marlowe replied')

  // 4) End & debrief → gradeSession (live) → verdict route.
  const endBtn = page.getByRole('button', { name: /end.*debrief|debrief|end mock/i }).first()
  await endBtn.scrollIntoViewIfNeeded()
  await endBtn.click()
  await page.waitForURL(/\/verdict\//, { timeout: 60000 }).catch(() => {})
  await page.waitForTimeout(6000)
  await page.screenshot({ path: `${SHOT}/e2e-verdict.png`, fullPage: true })
  console.log(`✓ ended; now at ${page.url()}`)
  await browser.close()

  // ── Assert the REAL rows (service role) ──────────────────────────────────
  const uidS = uid
  const [turns, arts, verd, ready] = await Promise.all([
    admin.from('interview_turns').select('speaker,content').eq('session_id', sessionId),
    admin.from('interview_artifacts').select('kind,payload').eq('session_id', sessionId),
    admin.from('interview_verdicts').select('score,verdict,dims,evidence').eq('session_id', sessionId).maybeSingle(),
    admin.from('interview_readiness').select('dimension_slug,score,bar_status').eq('user_id', uidS),
  ])
  const turnRows = turns.data ?? []
  const marlowe = turnRows.filter((t) => t.speaker === 'interviewer').length
  const cand = turnRows.filter((t) => t.speaker === 'candidate').length
  const codeArt = (arts.data ?? []).find((a) => a.kind === 'code')
  const caught = (codeArt?.payload as { caught_the_lie?: boolean } | undefined)?.caught_the_lie
  const dims = (verd.data?.dims as unknown[] | undefined)?.length ?? 0
  const minDim = verd.data ? Math.min(...(verd.data.dims as Array<{ score: number }>).map((d) => d.score)) : -1

  console.log('\n=== REAL DB ROWS AFTER THE LIVE MOCK ===')
  console.log(`  interview_turns:      ${turnRows.length} (marlowe ${marlowe}, candidate ${cand})`)
  console.log(`  interview_artifacts:  code artifact ${codeArt ? 'present' : 'MISSING'}, caught_the_lie=${caught}`)
  console.log(`  interview_verdicts:   ${verd.data ? `score ${verd.data.score} · ${verd.data.verdict} · ${dims} dims · min ${minDim} · evidence ${(verd.data.evidence as unknown[]).length}` : 'MISSING'}`)
  console.log(`  interview_readiness:  ${(ready.data ?? []).length} rows`)

  const pass =
    marlowe >= 1 && cand >= 1 && !!codeArt && caught === true &&
    !!verd.data && dims === 6 && verd.data!.score === minDim && (ready.data ?? []).length === 6
  console.log(`\n═══ AUTHED E2E: ${pass ? 'PASS' : 'FAIL'} ═══`)
  if (!pass) process.exit(1)
}

main().catch((e) => { console.error('E2E FAIL:', e); process.exit(1) })

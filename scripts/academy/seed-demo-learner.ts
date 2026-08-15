/**
 * Seed the SHOWCASE academy learner so every loop surface renders FULL, not empty.
 *
 *   tsx --env-file=.env.local scripts/academy/seed-demo-learner.ts
 *
 * Target: the showcase account (SHOWCASE_EMAIL below). Populates a coherent
 * "~6 weeks in, finished Programming Fundamentals" story across the dashboard,
 * mastery map, leagues, review board, profile, and community surfaces.
 *
 * SAFE TO RE-RUN (idempotent):
 *   - single-row tables (streaks/xp/daily_goals/profiles) upsert by user_id
 *   - progress/assessments/certificates/league_members/friendships upsert by their
 *     natural unique key
 *   - academy_evidence_events is APPEND-ONLY: we skip emitting for any
 *     (course, lesson, unit) that already has events
 *
 * NEVER touches client1+test (the enforcement/journey e2e depend on it staying
 * evidence-empty). Only ever writes for the showcase user (+ uses other existing
 * test users purely as league standings / a friend).
 *
 * Service-role client is built DIRECTLY here (no '@/lib/...' server-only imports,
 * which don't resolve under tsx).
 */

import { createClient } from '@supabase/supabase-js'

// ──────────────────────────────────────────────────────────────── constants
const SHOWCASE_EMAIL = 'client2+test@sageideas.org'
const COURSE_SLUG = 'programming-fundamentals'

// Other EXISTING test users used only as league standings / a friend.
const FRIEND_EMAIL = 'client1+test@sageideas.org'
const LEAGUE_PEER_EMAILS = [
  'client1+test@sageideas.org',
  'sage+admin@sageideas.org',
  'pending+test@sageideas.org',
]
// Human display names for the labelled showcase peers so the standings name a real
// rival ("71 XP to pass Maya R.") instead of an anonymous "Learner 9013". These are
// seeded ONLY on these fixture peer rows — never on a real logged-in learner.
const LEAGUE_PEER_NAMES: Record<string, string> = {
  'client1+test@sageideas.org': 'Maya R.',
  'sage+admin@sageideas.org': 'Devon K.',
  'pending+test@sageideas.org': 'Priya N.',
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

// ──────────────────────────────────────────────────────────────── date helpers
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
/** Monday (UTC) of this week, matching lib/academy isoWeekStart. */
function mondayThisWeek(): string {
  const d = new Date()
  const dow = (d.getUTCDay() + 6) % 7 // Mon=0
  d.setUTCDate(d.getUTCDate() - dow)
  return isoDate(d)
}
function todayUtc(): string {
  return isoDate(new Date())
}
function yesterdayUtc(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return isoDate(d)
}
function daysAgoIso(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

// ──────────────────────────────────────────────────────────────── user resolution
type UserMap = Record<string, string> // email -> id

async function resolveUsers(emails: string[]): Promise<UserMap> {
  const wanted = new Set(emails.map((e) => e.toLowerCase()))
  const found: UserMap = {}
  // Paginate listUsers until we've seen them all (or run out of pages).
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    for (const u of data.users) {
      const email = (u.email ?? '').toLowerCase()
      if (wanted.has(email)) found[email] = u.id
    }
    if (data.users.length < 200) break
    if (Object.keys(found).length === wanted.size) break
  }
  return found
}

// ──────────────────────────────────────────────────────────────── evidence sequence
// The full required sequence so deriveUnitState -> 'complete' and the mastery
// map lights up (REQUIRED_FOR_COMPLETE in lib/academy/evidence-events-logic.ts),
// plus the payload-flag events the score-cap signals read.
function evidenceSequence(): Array<{ event_type: string; payload: Record<string, unknown> }> {
  return [
    { event_type: 'diagnostic_completed', payload: {} },
    { event_type: 'retrieval_attempted', payload: {} },
    { event_type: 'sprint_artifact_created', payload: { brokenCaseHandled: true } },
    { event_type: 'lab_verified', payload: {} },
    { event_type: 'retrieval_attempted', payload: { explainBackGraded: true } },
    { event_type: 'lesson_completed', payload: { spacingScheduled: true } },
    { event_type: 'transfer_attempted', payload: {} },
    { event_type: 'portfolio_item_created', payload: { boardAsset: true } },
  ]
}

// ──────────────────────────────────────────────────────────────── section runner
async function section(name: string, fn: () => Promise<string>): Promise<void> {
  try {
    const detail = await fn()
    console.log(`  ✓ ${name}: ${detail}`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`  ✗ ${name}: FAILED — ${msg}`)
  }
}

// ──────────────────────────────────────────────────────────────── main
async function main() {
  console.log('Seeding showcase demo learner…\n')

  const allEmails = Array.from(
    new Set([SHOWCASE_EMAIL, FRIEND_EMAIL, ...LEAGUE_PEER_EMAILS].map((e) => e.toLowerCase())),
  )
  const users = await resolveUsers(allEmails)
  const userId = users[SHOWCASE_EMAIL.toLowerCase()]
  if (!userId) {
    console.error(`Showcase user ${SHOWCASE_EMAIL} not found in auth.users. Aborting.`)
    process.exit(1)
  }
  console.log(`Showcase user: ${SHOWCASE_EMAIL} → ${userId}\n`)

  const today = todayUtc()
  const yesterday = yesterdayUtc()
  const weekStart = mondayThisWeek()

  // ── 1. streaks ───────────────────────────────────────────────────────────
  await section('academy_streaks', async () => {
    const { error } = await admin.from('academy_streaks').upsert(
      {
        user_id: userId,
        current_length: 12,
        longest_length: 18,
        last_active_date: today,
        freeze_used_dates: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    return 'current 12 / longest 18, active today'
  })

  // ── 2. xp / level ──────────────────────────────────────────────────────────
  await section('academy_xp', async () => {
    const { error } = await admin.from('academy_xp').upsert(
      {
        user_id: userId,
        total_xp: 860,
        weekly_xp: 340,
        week_start: weekStart,
        level: 6,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    return 'total 860 / weekly 340 / level 6'
  })

  // ── 3. daily goal ──────────────────────────────────────────────────────────
  await section('academy_daily_goals', async () => {
    const { error } = await admin.from('academy_daily_goals').upsert(
      {
        user_id: userId,
        goal_xp: 30,
        today_date: today,
        today_xp: 20,
        last_met_date: yesterday,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    return 'goal 30 / today 20 / last met yesterday'
  })

  // ── lessons of the course (drives progress + evidence) ─────────────────────
  const { data: lessons, error: lessonsErr } = await admin
    .from('academy_lessons')
    .select('slug')
    .eq('course_slug', COURSE_SLUG)
    .eq('status', 'published')
    .order('module_sort', { ascending: true })
    .order('sort', { ascending: true })
  if (lessonsErr) {
    console.error(`  ✗ academy_lessons: could not load lessons — ${lessonsErr.message}`)
  }
  const lessonSlugs = (lessons ?? []).map((l) => l.slug as string)
  console.log(`  • ${COURSE_SLUG}: ${lessonSlugs.length} published lessons`)

  // ── 4. progress: mark all lessons complete ─────────────────────────────────
  await section('academy_progress', async () => {
    if (lessonSlugs.length === 0) return 'no lessons to mark (skipped)'
    const completedAt = new Date().toISOString()
    const rows = lessonSlugs.map((slug) => ({
      user_id: userId,
      course_slug: COURSE_SLUG,
      lesson_slug: slug,
      status: 'completed',
      completed_at: completedAt,
      updated_at: completedAt,
    }))
    const { error } = await admin
      .from('academy_progress')
      .upsert(rows, { onConflict: 'user_id,lesson_slug' })
    if (error) throw error
    return `${rows.length} lessons marked completed`
  })

  // ── 5. evidence events (append-only; guard per lesson) ─────────────────────
  await section('academy_evidence_events', async () => {
    if (lessonSlugs.length === 0) return 'no lessons (skipped)'
    // Which (lesson,unit) already have events? Guard so re-runs don't duplicate.
    const { data: existing, error: exErr } = await admin
      .from('academy_evidence_events')
      .select('lesson_slug, unit_id')
      .eq('user_id', userId)
      .eq('course_slug', COURSE_SLUG)
    if (exErr) throw exErr
    const seen = new Set((existing ?? []).map((r) => `${r.lesson_slug}::${r.unit_id}`))

    const seq = evidenceSequence()
    const rows: Array<Record<string, unknown>> = []
    let seededLessons = 0
    let skippedLessons = 0
    // Spread events across the past ~6 weeks for a believable timeline.
    let lessonIndex = 0
    for (const slug of lessonSlugs) {
      const unitId = slug
      if (seen.has(`${slug}::${unitId}`)) {
        skippedLessons++
        lessonIndex++
        continue
      }
      // lesson 0 ~ 40 days ago … last lesson ~ a few days ago
      const baseDaysAgo = Math.max(2, 42 - lessonIndex * 5)
      // created_at exactness isn't load-bearing (state derives from event presence),
      // but a believable day anchor makes the evidence timeline look real.
      for (const ev of seq) {
        rows.push({
          user_id: userId,
          course_slug: COURSE_SLUG,
          lesson_slug: slug,
          unit_id: unitId,
          event_type: ev.event_type,
          payload: ev.payload,
          created_at: daysAgoIso(baseDaysAgo),
        })
      }
      seededLessons++
      lessonIndex++
    }

    if (rows.length === 0) return `all ${skippedLessons} lessons already have events (skipped)`
    const { error } = await admin.from('academy_evidence_events').insert(rows)
    if (error) throw error
    return `${rows.length} events across ${seededLessons} lessons (${skippedLessons} already present)`
  })

  // ── 5b. TODAY's quest activity (drives the quest board + variable bonus) ────
  // The quest panel reads *today's* window: a review done today arms the
  // daily-review quest (and the flat-bonus path), while NO lesson today keeps
  // the daily-lesson quest as the "what to do now" lead (and the multiplier
  // bonus armable). This makes the variable-ratio reward UI render alive for
  // the showcase whichever surprise today's seed picks. Append-only + guarded
  // so re-runs don't duplicate today's rows.
  await section('academy_evidence_events (today)', async () => {
    const todayStartIso = `${today}T00:00:00.000Z`
    const { data: todays, error: tErr } = await admin
      .from('academy_evidence_events')
      .select('event_type, created_at')
      .eq('user_id', userId)
      .eq('course_slug', COURSE_SLUG)
      .gte('created_at', todayStartIso)
    if (tErr) throw tErr
    const haveReviewToday = (todays ?? []).some((r) => r.event_type === 'retrieval_attempted')
    if (haveReviewToday) return "today's review event already present (skipped)"

    const reviewLesson = lessonSlugs[0] ?? 'demo-lesson'
    const { error } = await admin.from('academy_evidence_events').insert([
      {
        user_id: userId,
        course_slug: COURSE_SLUG,
        lesson_slug: reviewLesson,
        unit_id: `${reviewLesson}::today-review`,
        event_type: 'retrieval_attempted',
        payload: { quest_demo: true },
        created_at: new Date().toISOString(),
      },
    ])
    if (error) throw error
    return '1 review event today (daily-review armed; daily-lesson left as the lead)'
  })

  // ── 6. certificate ─────────────────────────────────────────────────────────
  await section('academy_certificates', async () => {
    const { error } = await admin.from('academy_certificates').upsert(
      {
        user_id: userId,
        course_slug: COURSE_SLUG,
        cert_code: 'SAGE-PROG-DEMO0001',
        recipient_name: 'Demo Learner',
      },
      { onConflict: 'user_id,course_slug' },
    )
    if (error) throw error
    return 'SAGE-PROG-DEMO0001 (Demo Learner)'
  })

  // ── 7. assessments: pretest 40 + posttest 85 (Hake's g 0.75) ───────────────
  await section('academy_assessments', async () => {
    const rows = [
      { user_id: userId, course_slug: COURSE_SLUG, kind: 'pretest', score: 40 },
      { user_id: userId, course_slug: COURSE_SLUG, kind: 'posttest', score: 85 },
    ]
    const { error } = await admin
      .from('academy_assessments')
      .upsert(rows, { onConflict: 'user_id,course_slug,kind' })
    if (error) throw error
    return 'pretest 40 + posttest 85 (g≈0.75)'
  })

  // ── 8. reviews: ~5 FSRS cards due now ──────────────────────────────────────
  await section('academy_reviews', async () => {
    const conceptsByLesson = lessonSlugs.slice(0, 5)
    // Fall back to synthetic concept keys if the course has < 5 lessons.
    const concepts =
      conceptsByLesson.length >= 5
        ? conceptsByLesson
        : [...conceptsByLesson, ...['trust-boundary', 'error-handling', 'pure-functions', 'types', 'control-flow']].slice(
            0,
            5,
          )
    const rows = concepts.map((c, i) => ({
      user_id: userId,
      concept_key: `${COURSE_SLUG}:${c}`,
      course_slug: COURSE_SLUG,
      lesson_slug: lessonSlugs[i] ?? null,
      prompt: `Recall the core idea behind "${c}".`,
      fsrs_difficulty: 5.2 + i * 0.3,
      fsrs_stability: 2 + i,
      fsrs_state: 2, // review
      // all due now-or-past so the Review board shows them
      fsrs_due_at: daysAgoIso(i), // today, yesterday, …
      reps: 2 + i,
      lapses: i % 2,
      last_grade: 3,
      last_reviewed_at: daysAgoIso(i + 3),
    }))
    const { error } = await admin
      .from('academy_reviews')
      .upsert(rows, { onConflict: 'user_id,concept_key' })
    if (error) throw error
    return `${rows.length} cards due (<= now)`
  })

  // ── 9. profile ─────────────────────────────────────────────────────────────
  await section('academy_profiles', async () => {
    // Keep existing handle if one exists (handle is globally unique).
    const { data: existing } = await admin
      .from('academy_profiles')
      .select('handle')
      .eq('user_id', userId)
      .maybeSingle()
    const handle = existing?.handle ?? 'demo-learner'
    const { error } = await admin.from('academy_profiles').upsert(
      {
        user_id: userId,
        handle,
        display_name: 'Demo Learner',
        bio: 'Shipping with AI.',
        is_public: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    return `@${handle} (public)`
  })

  await section('academy_tutor_memory', async () => {
    // Labelled showcase fixture: the demo learner previously struggled with
    // recursion — so the tutor's proactive opener + cross-session memory render
    // their real behavior (a real learner accrues this from actual tutor turns).
    const { error } = await admin.from('academy_tutor_memory').upsert(
      {
        user_id: userId,
        struggles: ['recursion', 'error handling'],
        summary:
          'Working through Programming Fundamentals — solid on syntax and control flow, but got stuck on recursion last session.',
        last_course_slug: 'programming-fundamentals',
        last_lesson_slug: 'input-validation',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    return 'recursion + error handling (proactive opener)'
  })

  // ── 10. artifacts (portfolio projects) ─────────────────────────────────────
  await section('academy_artifacts', async () => {
    // No natural unique key → guard by checking for our two titles first.
    const titles = ['Boundary Validator Toolkit', 'Resilient Job Runner']
    const { data: existing, error: exErr } = await admin
      .from('academy_artifacts')
      .select('title')
      .eq('user_id', userId)
      .in('title', titles)
    if (exErr) throw exErr
    const have = new Set((existing ?? []).map((r) => r.title as string))
    const toInsert = [
      {
        user_id: userId,
        course_slug: COURSE_SLUG,
        lesson_slug: lessonSlugs[0] ?? null,
        title: 'Boundary Validator Toolkit',
        repo_url: 'https://github.com/demo-learner/boundary-validator',
        demo_url: 'https://boundary-validator.demo.dev',
      },
      {
        user_id: userId,
        course_slug: COURSE_SLUG,
        lesson_slug: lessonSlugs[1] ?? null,
        title: 'Resilient Job Runner',
        repo_url: 'https://github.com/demo-learner/resilient-runner',
        demo_url: null,
      },
    ].filter((a) => !have.has(a.title))
    if (toInsert.length === 0) return 'both projects already present (skipped)'
    const { error } = await admin.from('academy_artifacts').insert(toInsert)
    if (error) throw error
    return `${toInsert.length} project(s) inserted`
  })

  // ── 11. leagues: seat showcase user + peers in a Silver weekly league ───────
  await section('academy_leagues', async () => {
    const SILVER_TIER = 1 // index into LEAGUE_TIERS (lib/academy/leagues-logic.ts)
    // Find or create this week's Silver league (unique on week_start,tier,instance).
    const { data: existingLeague } = await admin
      .from('academy_leagues')
      .select('id')
      .eq('week_start', weekStart)
      .eq('tier', SILVER_TIER)
      .eq('instance', 0)
      .maybeSingle()

    let leagueId = existingLeague?.id as string | undefined
    if (!leagueId) {
      const { data: created, error: cErr } = await admin
        .from('academy_leagues')
        .insert({ week_start: weekStart, tier: SILVER_TIER, instance: 0 })
        .select('id')
        .single()
      if (cErr) throw cErr
      leagueId = created.id as string
    }

    // Give each showcase peer a human display_name so standings name a real rival,
    // not "Learner XXXX". Preserve any existing globally-unique handle; only fill a
    // display_name (and a handle when the peer has no profile yet). Fixture peers only.
    for (const email of LEAGUE_PEER_EMAILS) {
      const id = users[email.toLowerCase()]
      const name = LEAGUE_PEER_NAMES[email.toLowerCase()]
      if (!id || id === userId || !name) continue
      const { data: existingProfile } = await admin
        .from('academy_profiles')
        .select('handle')
        .eq('user_id', id)
        .maybeSingle()
      const handle = (existingProfile?.handle as string | undefined) ?? email.split('@')[0].replace(/\+/g, '-')
      await admin
        .from('academy_profiles')
        .upsert(
          { user_id: id, handle, display_name: name, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
    }

    // Showcase user near the top with weekly_xp ~340; peers spread below/around.
    const peerXp: Record<string, number> = {
      [LEAGUE_PEER_EMAILS[0].toLowerCase()]: 410, // one peer above to make it a real race
      [LEAGUE_PEER_EMAILS[1].toLowerCase()]: 220,
      [LEAGUE_PEER_EMAILS[2].toLowerCase()]: 95,
    }

    const members: Array<{ league_id: string; user_id: string; week_start: string; weekly_xp: number }> = [
      { league_id: leagueId, user_id: userId, week_start: weekStart, weekly_xp: 340 },
    ]
    let peerCount = 0
    for (const email of LEAGUE_PEER_EMAILS) {
      const id = users[email.toLowerCase()]
      if (!id || id === userId) continue
      members.push({
        league_id: leagueId,
        user_id: id,
        week_start: weekStart,
        weekly_xp: peerXp[email.toLowerCase()] ?? 120,
      })
      peerCount++
    }

    // unique (week_start, user_id) — upsert on that so a user already seated this
    // week is moved/updated rather than duplicated.
    const { error } = await admin
      .from('academy_league_members')
      .upsert(members, { onConflict: 'week_start,user_id' })
    if (error) throw error
    return `Silver league, showcase 340xp + ${peerCount} peer(s)`
  })

  // ── 12. friendship: showcase <-> client1+test (accepted) ───────────────────
  await section('academy_friendships', async () => {
    const friendId = users[FRIEND_EMAIL.toLowerCase()]
    if (!friendId || friendId === userId) return 'friend user not found (skipped)'
    // unique (requester_id, addressee_id). Avoid a duplicate in the reverse
    // direction too — if a reverse row exists, just accept that one.
    const { data: reverse } = await admin
      .from('academy_friendships')
      .select('id')
      .eq('requester_id', friendId)
      .eq('addressee_id', userId)
      .maybeSingle()

    if (reverse) {
      const { error } = await admin
        .from('academy_friendships')
        .update({ status: 'accepted', friend_streak: 6, last_both_active: today, accepted_at: new Date().toISOString() })
        .eq('id', reverse.id)
      if (error) throw error
      return 'existing (reverse) friendship accepted, streak 6'
    }

    const { error } = await admin.from('academy_friendships').upsert(
      {
        requester_id: userId,
        addressee_id: friendId,
        status: 'accepted',
        friend_streak: 6,
        last_both_active: today,
        accepted_at: new Date().toISOString(),
      },
      { onConflict: 'requester_id,addressee_id' },
    )
    if (error) throw error
    return `accepted with ${FRIEND_EMAIL}, friend_streak 6`
  })

  console.log('\nDone.')
}

main().catch((e) => {
  console.error('Fatal:', e instanceof Error ? e.message : e)
  process.exit(1)
})

import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { deriveHandle, handleCandidates, isValidHandle } from '@/lib/academy/profile-logic'
import { getLearnerGains, type LearnerGain } from '@/lib/academy/efficacy'
import { levelForXp } from '@/lib/academy/gamification-logic'
import { seedTierForLevel, tierMeta } from '@/lib/academy/leagues-logic'

export interface AcademyProfile {
  userId: string
  handle: string
  displayName: string | null
  bio: string | null
  isPublic: boolean
  createdAt: string
}

export interface Artifact {
  id: string
  courseSlug: string | null
  lessonSlug: string | null
  title: string
  repoUrl: string | null
  demoUrl: string | null
  createdAt: string
}

export interface PublicCert {
  code: string
  courseSlug: string
  /** Real course title (academy_courses.title), falls back to the slug. */
  courseTitle: string
  issuedAt: string
  /** Real published lesson count for the course (academy_courses.lessons); 0 when unknown. */
  lessonCount: number
  /** Real count of this learner's proven proofs for the course. */
  proofsHeld: number
}

/**
 * One published, verified proof row for the public ledger. The Learning Engine
 * records a proof only AFTER a real checkpoint passes, so every published row is
 * genuinely PASSED — we never synthesize a mixed verdict. Rows with an open
 * repair (still failing grading) are excluded entirely, not shown as failing.
 */
export interface PublicEvidenceRow {
  /** Real claim — the lesson title the learner proved. */
  claim: string
  /** Real course title for context. */
  courseTitle: string
  /** ISO timestamp the proof was recorded. */
  at: string
  /** Real learner-attached artifact title, or null when none is attached. */
  artifactTitle: string | null
  /** repo_url ?? demo_url for the artifact, or null. */
  artifactUrl: string | null
}

/** Real engagement tier (single-word league name) and streak (in days). */
export interface PublicStanding {
  /** League tier name (Bronze…Diamond), or null when the learner has no XP yet. */
  tierName: string | null
  /** Current streak length in DAYS (academy_streaks.current_length); 0 when none. */
  streakDays: number
}

export interface PublicProfile {
  handle: string
  displayName: string
  bio: string | null
  joinedAt: string
  artifacts: Artifact[]
  certificates: PublicCert[]
  gains: LearnerGain[]
  /** Published, proven evidence rows (proven-only; never fabricated). */
  evidence: PublicEvidenceRow[]
  /** Total proven proofs held across all courses. */
  proofsHeld: number
  standing: PublicStanding
}

function mapProfile(row: Record<string, unknown>): AcademyProfile {
  return {
    userId: row.user_id as string,
    handle: row.handle as string,
    displayName: (row.display_name as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    isPublic: Boolean(row.is_public),
    createdAt: row.created_at as string,
  }
}

export async function getMyProfile(userId: string): Promise<AcademyProfile | null> {
  const admin = supabaseAdmin()
  const { data } = await admin.from('academy_profiles').select('*').eq('user_id', userId).maybeSingle()
  return data ? mapProfile(data) : null
}

/** Create the learner's profile on first need with a unique handle derived from their email. */
export async function ensureProfile(userId: string, emailOrSeed: string): Promise<AcademyProfile> {
  const existing = await getMyProfile(userId)
  if (existing) return existing

  const admin = supabaseAdmin()
  const base = deriveHandle(emailOrSeed.split('@')[0] || 'learner')
  for (const candidate of handleCandidates(base)) {
    if (!isValidHandle(candidate)) continue
    const { data, error } = await admin
      .from('academy_profiles')
      .insert({ user_id: userId, handle: candidate, is_public: false })
      .select('*')
      .single()
    if (!error && data) return mapProfile(data)
    // 23505 = unique violation on handle → try the next candidate.
    if (error && error.code !== '23505') break
  }
  // Fallback: a guaranteed-unique handle from the user id.
  const fallback = `learner-${userId.slice(0, 8)}`
  const { data } = await admin
    .from('academy_profiles')
    .upsert({ user_id: userId, handle: fallback, is_public: false }, { onConflict: 'user_id' })
    .select('*')
    .single()
  return mapProfile(data as Record<string, unknown>)
}

export async function setProfilePublic(userId: string, isPublic: boolean): Promise<void> {
  const admin = supabaseAdmin()
  await admin
    .from('academy_profiles')
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

export async function updateProfile(
  userId: string,
  patch: { displayName?: string | null; bio?: string | null },
): Promise<void> {
  const admin = supabaseAdmin()
  await admin
    .from('academy_profiles')
    .update({
      display_name: patch.displayName ?? null,
      bio: patch.bio ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
}

export async function listMyArtifacts(userId: string): Promise<Artifact[]> {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('academy_artifacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapArtifact)
}

function mapArtifact(row: Record<string, unknown>): Artifact {
  return {
    id: row.id as string,
    courseSlug: (row.course_slug as string | null) ?? null,
    lessonSlug: (row.lesson_slug as string | null) ?? null,
    title: row.title as string,
    repoUrl: (row.repo_url as string | null) ?? null,
    demoUrl: (row.demo_url as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

export async function addArtifact(
  userId: string,
  input: { title: string; repoUrl?: string | null; demoUrl?: string | null; courseSlug?: string | null },
): Promise<void> {
  const admin = supabaseAdmin()
  await admin.from('academy_artifacts').insert({
    user_id: userId,
    title: input.title.slice(0, 140),
    repo_url: input.repoUrl || null,
    demo_url: input.demoUrl || null,
    course_slug: input.courseSlug || null,
  })
}

export async function deleteArtifact(userId: string, id: string): Promise<void> {
  const admin = supabaseAdmin()
  await admin.from('academy_artifacts').delete().eq('user_id', userId).eq('id', id)
}

/**
 * Whether a handle exists and, if so, whether it is public. Lets the page render
 * an honest "this profile is private" state instead of a bare 404 for a real but
 * private learner.
 */
export type ProfileVisibility =
  | { kind: 'unknown' }
  | { kind: 'private'; handle: string; displayName: string }
  | { kind: 'public' }

export async function getProfileVisibility(handle: string): Promise<ProfileVisibility> {
  const admin = supabaseAdmin()
  const { data: profile } = await admin
    .from('academy_profiles')
    .select('handle, display_name, is_public')
    .eq('handle', handle.toLowerCase())
    .maybeSingle()
  if (!profile) return { kind: 'unknown' }
  if (!profile.is_public) {
    return {
      kind: 'private',
      handle: profile.handle as string,
      displayName: (profile.display_name as string | null) || (profile.handle as string),
    }
  }
  return { kind: 'public' }
}

/** Assemble the public profile view, or null when the handle is unknown or private. */
export async function getPublicProfile(handle: string): Promise<PublicProfile | null> {
  const admin = supabaseAdmin()
  const { data: profile } = await admin
    .from('academy_profiles')
    .select('*')
    .eq('handle', handle.toLowerCase())
    .maybeSingle()
  if (!profile || !profile.is_public) return null

  const userId = profile.user_id as string
  const [
    { data: artifacts },
    { data: certs },
    gains,
    { data: progress },
    { data: repairEvents },
    { data: xpRow },
    { data: streakRow },
  ] = await Promise.all([
    admin
      .from('academy_artifacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    admin
      .from('academy_certificates')
      .select('cert_code, course_slug, issued_at')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false }),
    getLearnerGains(userId),
    // Completed lessons = candidate proofs (proven unless an open repair says otherwise).
    admin
      .from('academy_progress')
      .select('course_slug, lesson_slug, status, updated_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false }),
    admin
      .from('academy_evidence_events')
      .select('course_slug, lesson_slug, unit_id, event_type')
      .eq('user_id', userId)
      .in('event_type', ['repair_created', 'repair_completed']),
    admin.from('academy_xp').select('total_xp').eq('user_id', userId).maybeSingle(),
    admin.from('academy_streaks').select('current_length').eq('user_id', userId).maybeSingle(),
  ])

  const artifactRows = artifacts ?? []
  const completed = progress ?? []

  // Fold repair events into per-lesson open counts (created > completed = open repair).
  const repairByLesson = new Map<string, number>()
  {
    const balance = new Map<string, number>()
    for (const e of repairEvents ?? []) {
      const unitKey = `${e.course_slug}:${e.lesson_slug}:${e.unit_id}`
      balance.set(unitKey, (balance.get(unitKey) ?? 0) + (e.event_type === 'repair_created' ? 1 : -1))
    }
    for (const [unitKey, bal] of balance) {
      if (bal <= 0) continue
      const [cs, ls] = unitKey.split(':')
      const lessonKey = `${cs}:${ls}`
      repairByLesson.set(lessonKey, (repairByLesson.get(lessonKey) ?? 0) + bal)
    }
  }

  // Real artifacts indexed by course:lesson (with a course-only fallback), mirroring
  // the authenticated evidence ledger so a claim links to the learner's own file.
  const artifactByLesson = new Map<string, { title: string; url: string | null }>()
  const artifactByCourse = new Map<string, { title: string; url: string | null }>()
  for (const a of artifactRows) {
    const url = (a.repo_url as string | null) || (a.demo_url as string | null) || null
    const entry = { title: a.title as string, url }
    if (a.course_slug && a.lesson_slug) {
      const k = `${a.course_slug}:${a.lesson_slug}`
      if (!artifactByLesson.has(k)) artifactByLesson.set(k, entry)
    }
    if (a.course_slug && !artifactByCourse.has(a.course_slug as string)) {
      artifactByCourse.set(a.course_slug as string, entry)
    }
  }

  // Resolve real course + lesson titles for the courses in play (certs + proofs).
  const courseSlugs = [
    ...new Set([...completed.map((r) => r.course_slug), ...(certs ?? []).map((c) => c.course_slug)]),
  ]
  const lessonSlugs = [...new Set(completed.map((r) => r.lesson_slug))]
  const [{ data: courseMetaRows }, { data: lessonMetaRows }] = await Promise.all([
    courseSlugs.length
      ? admin.from('academy_courses').select('slug, title, lessons').in('slug', courseSlugs)
      : Promise.resolve({ data: [] as { slug: string; title: string; lessons: number }[] }),
    lessonSlugs.length
      ? admin.from('academy_lessons').select('slug, title, course_slug').in('slug', lessonSlugs)
      : Promise.resolve({ data: [] as { slug: string; title: string; course_slug: string }[] }),
  ])
  const courseTitleBySlug = new Map((courseMetaRows ?? []).map((c) => [c.slug, c.title]))
  const courseLessonsBySlug = new Map((courseMetaRows ?? []).map((c) => [c.slug, c.lessons ?? 0]))
  const lessonTitleByKey = new Map(
    (lessonMetaRows ?? []).map((l) => [`${l.course_slug}:${l.slug}`, l.title]),
  )

  // Proven-only evidence rows (published = every proof this learner holds).
  const provenByCourse = new Map<string, number>()
  const evidence: PublicEvidenceRow[] = []
  for (const r of completed) {
    const lessonKey = `${r.course_slug}:${r.lesson_slug}`
    const isOpenRepair = (repairByLesson.get(lessonKey) ?? 0) > 0
    if (isOpenRepair) continue // needs-repair proofs are not published as passed
    provenByCourse.set(r.course_slug, (provenByCourse.get(r.course_slug) ?? 0) + 1)
    const artifact = artifactByLesson.get(lessonKey) ?? artifactByCourse.get(r.course_slug) ?? null
    evidence.push({
      claim: lessonTitleByKey.get(lessonKey) ?? r.lesson_slug.replace(/-/g, ' '),
      courseTitle: courseTitleBySlug.get(r.course_slug) ?? r.course_slug,
      at: r.updated_at as string,
      artifactTitle: artifact?.title ?? null,
      artifactUrl: artifact?.url ?? null,
    })
  }
  const proofsHeld = evidence.length

  // Real engagement tier (single-word league name) from XP; null when no XP yet.
  const totalXp = (xpRow?.total_xp as number | null) ?? 0
  const tierName = totalXp > 0 ? tierMeta(seedTierForLevel(levelForXp(totalXp))).name : null
  const streakDays = (streakRow?.current_length as number | null) ?? 0

  return {
    handle: profile.handle as string,
    displayName: (profile.display_name as string | null) || (profile.handle as string),
    bio: (profile.bio as string | null) ?? null,
    joinedAt: profile.created_at as string,
    artifacts: artifactRows.map(mapArtifact),
    certificates: (certs ?? []).map((c) => ({
      code: c.cert_code as string,
      courseSlug: c.course_slug as string,
      courseTitle: courseTitleBySlug.get(c.course_slug as string) ?? (c.course_slug as string),
      issuedAt: c.issued_at as string,
      lessonCount: courseLessonsBySlug.get(c.course_slug as string) ?? 0,
      proofsHeld: provenByCourse.get(c.course_slug as string) ?? 0,
    })),
    gains,
    evidence,
    proofsHeld,
    standing: { tierName, streakDays },
  }
}

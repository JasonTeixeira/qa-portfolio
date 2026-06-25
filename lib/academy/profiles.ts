import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { deriveHandle, handleCandidates, isValidHandle } from '@/lib/academy/profile-logic'
import { getLearnerGains, type LearnerGain } from '@/lib/academy/efficacy'

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
  issuedAt: string
}

export interface PublicProfile {
  handle: string
  displayName: string
  bio: string | null
  joinedAt: string
  artifacts: Artifact[]
  certificates: PublicCert[]
  gains: LearnerGain[]
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
  const [{ data: artifacts }, { data: certs }, gains] = await Promise.all([
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
  ])

  return {
    handle: profile.handle as string,
    displayName: (profile.display_name as string | null) || (profile.handle as string),
    bio: (profile.bio as string | null) ?? null,
    joinedAt: profile.created_at as string,
    artifacts: (artifacts ?? []).map(mapArtifact),
    certificates: (certs ?? []).map((c) => ({
      code: c.cert_code as string,
      courseSlug: c.course_slug as string,
      issuedAt: c.issued_at as string,
    })),
    gains,
  }
}

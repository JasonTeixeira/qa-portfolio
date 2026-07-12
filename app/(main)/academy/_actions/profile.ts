'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  ensureProfile,
  setProfilePublic,
  updateProfile,
  addArtifact,
  deleteArtifact,
  getMyProfile,
  type AcademyProfile,
} from '@/lib/academy/profiles'

async function requireUser() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  return user
}

/** Create-on-first-use; returns the learner's profile (with a unique handle). */
export async function ensureMyProfile(): Promise<AcademyProfile | null> {
  const user = await requireUser()
  if (!user) return null
  return ensureProfile(user.id, user.email ?? user.id)
}

export async function toggleProfilePublic(isPublic: boolean): Promise<{ ok: boolean; handle?: string }> {
  const user = await requireUser()
  if (!user) return { ok: false }
  const profile = await ensureProfile(user.id, user.email ?? user.id)
  await setProfilePublic(user.id, isPublic)
  revalidatePath(`/academy/u/${profile.handle}`)
  revalidatePath('/academy/profile')
  return { ok: true, handle: profile.handle }
}

const ProfilePatch = z.object({
  displayName: z.string().max(60).optional(),
  bio: z.string().max(280).optional(),
})

export async function saveProfile(patch: { displayName?: string; bio?: string }): Promise<{ ok: boolean }> {
  const parsed = ProfilePatch.safeParse(patch)
  if (!parsed.success) return { ok: false }
  const user = await requireUser()
  if (!user) return { ok: false }
  await ensureProfile(user.id, user.email ?? user.id)
  await updateProfile(user.id, {
    displayName: parsed.data.displayName?.trim() || null,
    bio: parsed.data.bio?.trim() || null,
  })
  const profile = await getMyProfile(user.id)
  if (profile) revalidatePath(`/academy/u/${profile.handle}`)
  return { ok: true }
}

const ArtifactInput = z.object({
  title: z.string().min(2).max(140),
  repoUrl: z.string().url().max(500).optional().or(z.literal('')),
  demoUrl: z.string().url().max(500).optional().or(z.literal('')),
  courseSlug: z.string().max(120).optional(),
})

export async function addMyArtifact(input: {
  title: string
  repoUrl?: string
  demoUrl?: string
  courseSlug?: string
}): Promise<{ ok: boolean }> {
  const parsed = ArtifactInput.safeParse(input)
  if (!parsed.success) return { ok: false }
  const user = await requireUser()
  if (!user) return { ok: false }
  await addArtifact(user.id, {
    title: parsed.data.title,
    repoUrl: parsed.data.repoUrl || null,
    demoUrl: parsed.data.demoUrl || null,
    courseSlug: parsed.data.courseSlug || null,
  })
  const profile = await getMyProfile(user.id)
  if (profile) revalidatePath(`/academy/u/${profile.handle}`)
  revalidatePath('/academy/profile')
  return { ok: true }
}

export async function removeMyArtifact(id: string): Promise<{ ok: boolean }> {
  if (!z.string().uuid().safeParse(id).success) return { ok: false }
  const user = await requireUser()
  if (!user) return { ok: false }
  await deleteArtifact(user.id, id)
  revalidatePath('/academy/profile')
  return { ok: true }
}

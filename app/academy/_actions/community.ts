'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendFriendRequest, acceptFriendRequest, joinCohort } from '@/lib/academy/community'
import type { FriendReason } from '@/lib/academy/community-logic'

async function requireUser() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  return user
}

export async function requestFriend(handle: string): Promise<{ ok: boolean; reason?: FriendReason }> {
  const parsed = z.string().min(2).max(32).safeParse(handle)
  if (!parsed.success) return { ok: false, reason: 'not_found' }
  const user = await requireUser()
  if (!user) return { ok: false, reason: 'not_found' }
  const res = await sendFriendRequest(user.id, parsed.data)
  if (res.ok) revalidatePath('/academy/community')
  return res
}

export async function acceptFriend(friendshipId: string): Promise<{ ok: boolean }> {
  const parsed = z.string().uuid().safeParse(friendshipId)
  if (!parsed.success) return { ok: false }
  const user = await requireUser()
  if (!user) return { ok: false }
  const ok = await acceptFriendRequest(user.id, parsed.data)
  if (ok) revalidatePath('/academy/community')
  return { ok }
}

export async function joinCohortAction(slug: string): Promise<{ ok: boolean }> {
  const parsed = z.string().min(1).max(64).safeParse(slug)
  if (!parsed.success) return { ok: false }
  const user = await requireUser()
  if (!user) return { ok: false }
  const ok = await joinCohort(user.id, parsed.data)
  if (ok) revalidatePath('/academy/community')
  return { ok }
}

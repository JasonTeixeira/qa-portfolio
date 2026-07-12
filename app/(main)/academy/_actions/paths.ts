'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/** Save the learner's built path to their account (one path per learner, upserted). */
export async function saveBuiltPath(
  courseSlugs: string[],
  name = 'My path',
): Promise<{ ok: boolean; signedIn: boolean }> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { ok: false, signedIn: false }

  const { data: existing } = await sb
    .from('academy_paths')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existing) {
    await sb
      .from('academy_paths')
      .update({ course_slugs: courseSlugs, name, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await sb.from('academy_paths').insert({ user_id: user.id, name, course_slugs: courseSlugs })
  }

  revalidatePath('/academy/dashboard')
  return { ok: true, signedIn: true }
}

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getEvidence } from '@/lib/academy/evidence'
import { getMyProfile, listMyArtifacts } from '@/lib/academy/profiles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * "Export everything" — a real JSON download of the signed-in learner's own
 * data: their profile, their build artifacts, and their full proof-of-work
 * ledger (every sprint proven, course completed, and certificate earned).
 * Everything here is pulled live from the learner's real records.
 */
export async function GET(): Promise<NextResponse> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  const [ledger, profile, artifacts] = await Promise.all([
    getEvidence(),
    getMyProfile(user.id),
    listMyArtifacts(user.id),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at ?? null,
    },
    profile: profile
      ? {
          handle: profile.handle,
          displayName: profile.displayName,
          bio: profile.bio,
          isPublic: profile.isPublic,
          createdAt: profile.createdAt,
        }
      : null,
    artifacts,
    ledger,
  }

  const body = JSON.stringify(payload, null, 2)
  const stamp = new Date().toISOString().slice(0, 10)

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="sage-academy-export-${stamp}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { askTutor } from '@/lib/academy/tutor'
import type { TutorTurn } from '@/lib/academy/tutor-logic'

/**
 * POST /api/academy/tutor — the Sage Academy AI tutor.
 *
 * Body: { message: string, history: {role,content}[], courseSlug?, lessonSlug? }
 * Returns: { available: boolean, reply: string } (200). Never crashes on a
 * missing LLM key or an LLM error — askTutor degrades to a warm "warming up"
 * reply. The userId is derived from the session, NEVER from the body.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_HISTORY = 50

/** Coerce arbitrary body input into a clean, bounded list of tutor turns. */
function sanitizeHistory(raw: unknown): TutorTurn[] {
  if (!Array.isArray(raw)) return []
  const out: TutorTurn[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const role = (item as { role?: unknown }).role
    const content = (item as { content?: unknown }).content
    if ((role === 'user' || role === 'assistant') && typeof content === 'string' && content.trim()) {
      out.push({ role, content })
    }
    if (out.length >= MAX_HISTORY) break
  }
  return out
}

export async function POST(req: NextRequest) {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
    }

    const message = typeof body.message === 'string' ? body.message : ''
    if (!message.trim()) {
      return NextResponse.json({ error: 'message_required' }, { status: 400 })
    }

    const courseSlug = typeof body.courseSlug === 'string' ? body.courseSlug : undefined
    const lessonSlug = typeof body.lessonSlug === 'string' ? body.lessonSlug : undefined
    const history = sanitizeHistory(body.history)

    const result = await askTutor({ message, history, courseSlug, lessonSlug }, user.id)
    return NextResponse.json({ available: result.available, reply: result.reply })
  } catch (err) {
    console.error('[api/academy/tutor] POST failed', err)
    // Never leak internals; degrade gracefully even on an unexpected fault.
    return NextResponse.json(
      { available: false, reply: 'Your tutor is warming up — ask me again in a moment.' },
      { status: 200 },
    )
  }
}

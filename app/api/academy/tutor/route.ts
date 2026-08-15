import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { askTutorStream, getTutorOpener } from '@/lib/academy/tutor'
import type { TutorTurn } from '@/lib/academy/tutor-logic'

/**
 * /api/academy/tutor — the Sage Academy AI tutor.
 *
 * GET  → { reply, hasMemory } : the proactive opener, grounded in the learner's
 *        stored cross-session memory (contextual greeting) or a cold-start opener.
 *
 * POST → text/event-stream : a real token stream. Body
 *        { message, history[], courseSlug?, lessonSlug? }. Each SSE frame is a
 *        JSON line:  data: {"type":"token","value":"…"}  then a terminal
 *        data: {"type":"done","reply":"…","available":true}. Never crashes on a
 *        missing key or LLM error — the stream degrades to a warm terminal frame.
 *
 * The userId is ALWAYS derived from the session, NEVER from the body — memory is
 * server-verified and not client-forgeable.
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

function sseFrame(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`
}

export async function GET() {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const opener = await getTutorOpener(user.id)
    return NextResponse.json(opener)
  } catch (err) {
    console.error('[api/academy/tutor] GET failed', err)
    return NextResponse.json(
      {
        reply:
          'Hey — I’m your Sage Academy tutor. Ask me anything about this lesson, or tell me where you’re stuck.',
        hasMemory: false,
      },
      { status: 200 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

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

    const userId = user.id
    const encoder = new TextEncoder()

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const frame of askTutorStream(
            { message, history, courseSlug, lessonSlug },
            userId,
            req.signal,
          )) {
            controller.enqueue(encoder.encode(sseFrame(frame)))
          }
        } catch (err) {
          console.error('[api/academy/tutor] stream error', err)
          controller.enqueue(
            encoder.encode(
              sseFrame({
                type: 'done',
                available: false,
                reply: 'Your tutor is warming up — ask me again in a moment.',
              }),
            ),
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[api/academy/tutor] POST failed', err)
    return NextResponse.json(
      { available: false, reply: 'Your tutor is warming up — ask me again in a moment.' },
      { status: 200 },
    )
  }
}

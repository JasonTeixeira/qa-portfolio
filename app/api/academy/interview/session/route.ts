import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { deepSeekChatStream } from '@/lib/rag/deepseek'
import {
  buildInterviewerMessages,
  looksLikeInjection,
  type InterviewScenarioSeed,
  type TranscriptTurn,
} from '@/lib/academy/interview/interviewer-logic'

/**
 * POST /api/academy/interview/session — one Marlowe turn in a live typed mock.
 *
 * Request body: { sessionId: string, message: string }
 *   - `message` is the candidate's latest utterance. Empty string on the OPENING
 *     turn of a fresh session (Marlowe greets + poses the first question).
 *
 * Response: text/event-stream. Each frame is one JSON line:
 *     data: {"type":"token","value":"…"}          — a Marlowe content delta
 *     data: {"type":"done","interviewerTurnId":"…","seq":N}   — terminal frame
 *   or, on a guard trip / no key:
 *     data: {"type":"done","available":false,"reply":"…"}
 *
 * SECURITY (hard requirements):
 *   - userId is ALWAYS derived from the Supabase session — NEVER from the body.
 *   - The session row must belong to the caller (RLS read) — 403 otherwise.
 *   - looksLikeInjection guards the candidate message before it enters the prompt.
 *   - BOTH the candidate turn AND Marlowe's turn are persisted via the SERVICE
 *     ROLE with server-computed seq / ts_seconds / user_id / speaker, so the
 *     graded transcript's interviewer side is not client-forgeable.
 *
 * Auth / validation failures return JSON (401/403/400). A mid-stream LLM fault
 * degrades to a terminal frame — it never 500s once streaming has begun.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_MESSAGE_CHARS = 4000
const INTERVIEWER_MAX_TOKENS = 320

function sseFrame(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`
}

type SessionRow = {
  id: string
  user_id: string
  scenario_id: string | null
  track: string
  level: string
  interviewer_style: string
  status: string
  started_at: string | null
}

type TurnRow = { seq: number; speaker: 'interviewer' | 'candidate'; content: string; ts_seconds: number | null }

/** Seconds elapsed since the session started (bounded ≥ 0), for ts_seconds. */
function elapsedSeconds(startedAt: string | null): number {
  if (!startedAt) return 0
  const started = new Date(startedAt).getTime()
  if (!Number.isFinite(started)) return 0
  return Math.max(0, Math.round((Date.now() - started) / 1000))
}

/** Load the scenario seed for the prompt — WITHOUT seed_tests (never leaks the hidden test). */
async function loadScenarioSeed(scenarioId: string | null, track: string): Promise<InterviewScenarioSeed> {
  const fallback: InterviewScenarioSeed = {
    slug: 'free-placement',
    track: (track as InterviewScenarioSeed['track']) ?? 'coding',
    title: 'Placement interview',
    description: 'An open placement round to establish a baseline across the dimensions.',
    interviewerPrompt: {},
  }
  if (!scenarioId) return fallback
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('interview_scenarios')
    // Deliberately NOT selecting seed_tests — the hidden test must never reach the prompt.
    .select('slug, track, title, description, interviewer_prompt')
    .eq('id', scenarioId)
    .maybeSingle()
  if (!data) return fallback
  const seed = (data.interviewer_prompt ?? {}) as InterviewScenarioSeed['interviewerPrompt']
  return {
    slug: String(data.slug ?? fallback.slug),
    track: (data.track as InterviewScenarioSeed['track']) ?? fallback.track,
    title: String(data.title ?? fallback.title),
    description: String(data.description ?? fallback.description),
    interviewerPrompt: seed && typeof seed === 'object' ? seed : {},
  }
}

/** Persist one turn via the service role with server-computed fields. Returns the new turn id. */
async function persistTurn(args: {
  sessionId: string
  userId: string
  seq: number
  speaker: 'interviewer' | 'candidate'
  content: string
  tsSeconds: number
}): Promise<string | null> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('interview_turns')
    .insert({
      session_id: args.sessionId,
      user_id: args.userId,
      seq: args.seq,
      speaker: args.speaker,
      content: args.content,
      ts_seconds: args.tsSeconds,
    })
    .select('id')
    .maybeSingle()
  if (error) {
    console.error('[api/academy/interview/session] persistTurn failed', error)
    return null
  }
  return (data?.id as string) ?? null
}

export async function POST(req: NextRequest) {
  // ── Auth: userId ONLY from the session ──────────────────────────────────
  let userId: string
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    userId = user.id

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
    }
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
    const rawMessage = typeof body.message === 'string' ? body.message : ''
    if (!sessionId) return NextResponse.json({ error: 'session_required' }, { status: 400 })
    if (rawMessage.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json({ error: 'message_too_long' }, { status: 400 })
    }
    const message = rawMessage.trim()

    // ── Ownership: RLS read of the caller's own session row (403 if not theirs) ──
    const { data: sessionRow } = await sb
      .from('interview_sessions')
      .select('id, user_id, scenario_id, track, level, interviewer_style, status, started_at')
      .eq('id', sessionId)
      .maybeSingle<SessionRow>()
    if (!sessionRow || sessionRow.user_id !== userId) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    // ── Injection guard: in-character redirect, no persist, no LLM spend ──
    if (message && looksLikeInjection(message)) {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const enc = new TextEncoder()
          controller.enqueue(
            enc.encode(
              sseFrame({
                type: 'done',
                available: true,
                reply: "Let's keep this to the interview — answer the question in your own words.",
              }),
            ),
          )
          controller.close()
        },
      })
      return sseResponse(stream)
    }

    // ── Assemble transcript + compute seq/ts via the service role ──
    const admin = supabaseAdmin()
    const { data: turnRows } = await admin
      .from('interview_turns')
      .select('seq, speaker, content, ts_seconds')
      .eq('session_id', sessionId)
      .order('seq', { ascending: true })
    const existing: TurnRow[] = Array.isArray(turnRows) ? (turnRows as TurnRow[]) : []
    const nextSeq = existing.reduce((max, t) => Math.max(max, t.seq), 0) + 1
    const ts = elapsedSeconds(sessionRow.started_at)

    // Persist the candidate turn (service role) BEFORE streaming, when present.
    let candidateSeq = nextSeq
    if (message) {
      await persistTurn({
        sessionId,
        userId,
        seq: candidateSeq,
        speaker: 'candidate',
        content: message,
        tsSeconds: ts,
      })
    } else {
      // Opening turn: no candidate line, Marlowe takes the first seq.
      candidateSeq = nextSeq - 1
    }

    const transcript: TranscriptTurn[] = existing.map((t) => ({
      speaker: t.speaker,
      content: t.content,
      ts_seconds: t.ts_seconds,
    }))
    if (message) transcript.push({ speaker: 'candidate', content: message, ts_seconds: ts })

    const scenario = await loadScenarioSeed(sessionRow.scenario_id, sessionRow.track)
    const messages = buildInterviewerMessages({
      scenario,
      level: sessionRow.level,
      style: sessionRow.interviewer_style,
      transcript: message ? transcript.slice(0, -1) : transcript,
      latestCandidateTurn: message || null,
    })

    // Honest degrade with no key — never crash.
    if (!process.env.DEEPSEEK_API_KEY?.trim()) {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const enc = new TextEncoder()
          controller.enqueue(
            enc.encode(
              sseFrame({
                type: 'done',
                available: false,
                reply: 'Marlowe is warming up — try again in a moment.',
              }),
            ),
          )
          controller.close()
        },
      })
      return sseResponse(stream)
    }

    const interviewerSeq = message ? candidateSeq + 1 : candidateSeq + 1
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let assembled = ''
        try {
          for await (const delta of deepSeekChatStream({
            messages,
            temperature: 0.4,
            maxTokens: INTERVIEWER_MAX_TOKENS,
            signal: req.signal,
          })) {
            assembled += delta
            controller.enqueue(encoder.encode(sseFrame({ type: 'token', value: delta })))
          }
        } catch (err) {
          console.error('[api/academy/interview/session] stream error', err)
        }

        const reply = assembled.trim()
        if (!reply) {
          controller.enqueue(
            encoder.encode(
              sseFrame({ type: 'done', available: false, reply: 'Marlowe is warming up — try again in a moment.' }),
            ),
          )
          controller.close()
          return
        }

        // Persist Marlowe's turn (service role) so the graded interviewer side
        // is not client-forgeable.
        const interviewerTurnId = await persistTurn({
          sessionId,
          userId,
          seq: interviewerSeq,
          speaker: 'interviewer',
          content: reply,
          tsSeconds: elapsedSeconds(sessionRow.started_at),
        })

        controller.enqueue(
          encoder.encode(
            sseFrame({ type: 'done', available: true, interviewerTurnId, seq: interviewerSeq, reply }),
          ),
        )
        controller.close()
      },
    })

    return sseResponse(stream)
  } catch (err) {
    console.error('[api/academy/interview/session] POST failed', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

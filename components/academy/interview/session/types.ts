/** Shared, serializable shapes handed from the Session server page into the
 *  client mock runner. Nothing here reaches Marlowe's prompt — the hidden test
 *  `expr` is only ever consumed by the client-side Pyodide runner, never rendered. */

export type InterviewTrack = 'coding' | 'system_design' | 'behavioral' | 'negotiation'

/** One seed test row (interview_scenarios.seed_tests). `expr` is a Python boolean
 *  expression evaluated deterministically in-browser; it is NEVER rendered in the UI. */
export type SeedTest = {
  name: string
  hidden: boolean
  passes_for_wrong_reason: boolean
  expr: string
}

/** The session, reduced to what the client needs (serializable). */
export type SessionData = {
  id: string
  track: InterviewTrack
  level: string
  interviewerStyle: string
  mode: string
  status: string
  questionTitle: string | null
  questionBody: string | null
  /** started_at in epoch ms — the clock + mm:ss stamps derive from this. */
  startedAtMs: number
}

/** The scenario coding seed (null for non-coding tracks). */
export type ScenarioData = {
  seedCode: string | null
  seedTests: SeedTest[]
} | null

/** One already-persisted transcript turn, for resume. */
export type InitialTurn = {
  seq: number
  speaker: 'interviewer' | 'candidate'
  content: string
  tsSeconds: number | null
}

/** A single Marlowe SSE frame (mirrors the session route's contract). */
export type MarloweFrame =
  | { type: 'token'; value: string }
  | { type: 'done'; available: boolean; interviewerTurnId?: string | null; seq?: number; reply: string }

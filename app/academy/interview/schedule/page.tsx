import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { EmptyState } from '@/components/academy/interview/EmptyState'
import { ScheduleTaper, type ScheduleSlot } from '@/components/academy/interview/schedule/ScheduleTaper'
import { ReminderToggles, type ReminderState } from '@/components/academy/interview/schedule/ReminderToggles'
import { OnsiteRunningOrder, type OnsiteEntry } from '@/components/academy/interview/schedule/OnsiteRunningOrder'
import styles from '@/components/academy/interview/schedule/schedule.module.css'

export const metadata: Metadata = {
  title: 'Schedule — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/** The reminders the product offers. Real state comes from interview_reminders rows (merged below). */
const STANDARD_REMINDERS: readonly string[] = [
  'Session reminders · 1h before',
  'Morning-of checklist',
  'Post-onsite debrief prompt · log how it went',
]

/** Whole days from now until the target date, or null when there is no (valid, future-or-today) date. */
function daysOut(targetDate: string | null): number | null {
  if (!targetDate) return null
  const [y, m, d] = targetDate.split('-').map(Number)
  if (!y || !m || !d) return null
  const target = Date.UTC(y, m - 1, d)
  const now = new Date()
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const days = Math.round((target - todayUtc) / (1000 * 60 * 60 * 24))
  return days >= 0 ? days : null
}

/**
 * The taper / countdown schedule. Every panel is a real own-row server read:
 *   - the week grid is the learner's real interview_schedule slots (seeded via seedTaperFromProfile
 *     or hand-added — never fabricated on the client),
 *   - the countdown is real days-until-target_date (honest "no target date" when null),
 *   - reminder toggles reflect real interview_reminders rows,
 *   - "the real one" appears only when interview_pipeline has an onsite stage.
 */
export default async function InterviewSchedulePage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user) {
    return (
      <InterviewShell active="schedule">
        <EmptyState
          kicker="Schedule · taper"
          title="Your plan is built backward from your interview date."
          line="Sign in and set a target date — Marlowe lays out the taper: hard reps, dress rehearsals, then go-time, week by week."
          ctas={[{ href: '/academy/interview/onboarding', label: 'Set your target' }]}
        />
      </InterviewShell>
    )
  }

  const [{ data: profile }, { data: slotRows }, { data: reminderRows }, { data: onsiteRows }] =
    await Promise.all([
      sb
        .from('interview_profiles')
        .select('target_date, target_role, target_level, onboarded_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      sb
        .from('interview_schedule')
        .select('id, slot_date, slot_time, track, session_type, what, est_minutes, status')
        .eq('user_id', user.id)
        .order('slot_date', { ascending: true }),
      sb
        .from('interview_reminders')
        .select('label, enabled')
        .eq('user_id', user.id),
      sb
        .from('interview_pipeline')
        .select('company, role, next_at, stage')
        .eq('user_id', user.id)
        .eq('stage', 'onsite')
        .order('next_at', { ascending: true })
        .limit(1),
    ])

  const targetDate = (profile?.target_date as string | null) ?? null
  const days = daysOut(targetDate)

  const slots: ScheduleSlot[] = (slotRows ?? []).map((s) => ({
    id: s.id as string,
    slotDate: s.slot_date as string,
    slotTime: (s.slot_time as string | null) ?? null,
    track: (s.track as string | null) ?? null,
    sessionType: (s.session_type as string | null) ?? null,
    what: (s.what as string | null) ?? null,
    estMinutes: (s.est_minutes as number | null) ?? null,
    status: (s.status as string) ?? 'planned',
  }))

  // Merge the product's standard reminder set with the learner's real rows — enabled iff a real
  // row exists and is on. No fabricated "all reminders on" for a fresh learner.
  const enabledByLabel = new Map<string, boolean>()
  for (const r of reminderRows ?? []) {
    enabledByLabel.set(r.label as string, r.enabled === true)
  }
  const reminders: ReminderState[] = STANDARD_REMINDERS.map((label) => ({
    label,
    enabled: enabledByLabel.get(label) ?? false,
  }))

  const onsiteRow = (onsiteRows ?? [])[0]
  const onsite: OnsiteEntry | null = onsiteRow
    ? {
        company: onsiteRow.company as string,
        role: (onsiteRow.role as string | null) ?? null,
        nextAt: (onsiteRow.next_at as string | null) ?? null,
        rounds: [],
      }
    : null

  const countLine =
    days != null
      ? `Final stretch · ${days} day${days === 1 ? '' : 's'} to go`
      : 'Set a target date to start the countdown'

  return (
    <InterviewShell active="schedule">
      <div className={styles.head}>
        <div>
          <div className={styles.headKicker}>{countLine}</div>
          <h1 className={styles.headTitle}>
            {days != null ? 'Taper like an athlete.' : 'Build your taper.'}
          </h1>
        </div>
        <div className={styles.headNote}>hard reps early · light reps late · rest the day before</div>
      </div>

      <div className={styles.grid}>
        {/* WEEK GRID — real slots, add/edit/delete, or the seed action */}
        <div className={`${styles.card} ${styles.weekCard}`}>
          <div className={styles.weekHead}>
            <span className={styles.panelKicker}>
              {slots.length > 0 ? 'Your plan · add, mark done, or remove any slot' : 'Your taper plan'}
            </span>
            {days != null ? (
              <span className={styles.countPill}>
                ◆ {days} day{days === 1 ? '' : 's'} out
              </span>
            ) : null}
          </div>
          <ScheduleTaper slots={slots} hasTargetDate={!!targetDate} />
        </div>

        <div className={styles.rail}>
          {onsite ? <OnsiteRunningOrder onsite={onsite} /> : null}

          {/* TAPER RULES — static product guidance, not user data */}
          <div className={styles.card}>
            <div className={`${styles.panelKicker} ${styles.rulesKicker}`}>Why the plan tapers</div>
            <div className={styles.rules}>
              <div className={styles.rule}>
                <span className={styles.ruleMark}>◆</span>
                <span>
                  <b className={styles.ruleStrong}>6–4 days out:</b> hardest reps. New scenarios,
                  adversarial pressure. Growth happens here.
                </span>
              </div>
              <div className={styles.rule}>
                <span className={styles.ruleMark}>◆</span>
                <span>
                  <b className={styles.ruleStrong}>3–2 days out:</b> confidence reps. Re-run scenarios
                  you’ve beaten. Rehearse your stories out loud.
                </span>
              </div>
              <div className={styles.rule}>
                <span className={styles.ruleMark}>◆</span>
                <span>
                  <b className={styles.ruleStrong}>Day before:</b> nothing. Cramming the night before
                  measurably lowers next-day composure. Go outside.
                </span>
              </div>
            </div>
          </div>

          {/* REMINDERS — real interview_reminders rows */}
          <div className={styles.card}>
            <div className={`${styles.panelKicker} ${styles.remKicker}`}>Reminders</div>
            <ReminderToggles reminders={reminders} />
          </div>
        </div>
      </div>
    </InterviewShell>
  )
}

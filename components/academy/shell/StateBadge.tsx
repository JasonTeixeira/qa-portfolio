import type { UnitState } from '@/lib/academy/evidence-events-logic'

/**
 * The 8-state unit chip — the single source of unit-state display. State comes
 * from the enforcement spine (deriveUnitState), never set ad hoc. Color = state
 * (semantic only): locked/neutral, accent for active, gold for pending/proof,
 * danger for repair, mastery-green for complete. Token-driven (--ac-*).
 */
const STATE_META: Record<UnitState, { label: string; dot: string; fg: string }> = {
  locked: { label: 'Locked', dot: 'var(--ac-locked)', fg: 'var(--ac-ink-faint)' },
  ready: { label: 'Ready', dot: 'var(--ac-accent)', fg: 'var(--ac-ink-soft)' },
  in_progress: { label: 'In progress', dot: 'var(--ac-accent)', fg: 'var(--ac-ink)' },
  proof_pending: { label: 'Proof pending', dot: 'var(--ac-pending)', fg: 'var(--ac-ink)' },
  review_pending: { label: 'Review pending', dot: 'var(--ac-pending)', fg: 'var(--ac-ink)' },
  repair_required: { label: 'Repair', dot: 'var(--ac-danger)', fg: 'var(--ac-ink)' },
  transfer_due: { label: 'Transfer due', dot: 'var(--ac-pending)', fg: 'var(--ac-ink)' },
  complete: { label: 'Complete', dot: 'var(--ac-mastery)', fg: 'var(--ac-ink)' },
}

export function StateBadge({ state, className = '' }: { state: UnitState; className?: string }) {
  const meta = STATE_META[state]
  return (
    <span
      data-state={state}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${className}`}
      style={{ borderColor: 'var(--ac-rule)', background: 'var(--ac-surface)', color: meta.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} aria-hidden />
      {meta.label}
    </span>
  )
}

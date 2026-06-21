export type ScorecardItem = {
  label: string;
  score: number;
  note?: string;
};

export function Scorecard({ items }: { items: ScorecardItem[] }) {
  if (!items.length) return null;

  return (
    <dl className="my-10 grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const score = Math.max(0, Math.min(100, item.score));
        return (
          <div key={item.label} className="border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
              {item.label}
            </dt>
            <dd className="mt-4">
              <div className="flex items-end justify-between gap-4">
                <span className="text-3xl font-semibold tabular-nums text-[var(--sage-ink)]">{score}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                  /100
                </span>
              </div>
              <div className="mt-4 h-1.5 bg-[var(--sage-border)]" aria-hidden>
                <div
                  className="h-full bg-[linear-gradient(90deg,#3D5AFE,#7C3AED,#FF2D9B)]"
                  style={{ width: `${score}%` }}
                />
              </div>
              {item.note ? <p className="mt-3 text-xs leading-6 text-[var(--sage-ink-muted)]">{item.note}</p> : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

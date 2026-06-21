export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  if (!label || !value) return null;

  return (
    <div className="border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold leading-none text-[var(--sage-ink)]">{value}</p>
      {detail ? <p className="mt-3 text-xs leading-6 text-[var(--sage-ink-muted)]">{detail}</p> : null}
    </div>
  );
}

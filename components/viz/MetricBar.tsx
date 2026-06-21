import { metricMagnitude } from './metric-utils';

export function MetricBar({
  label,
  value,
  proportion,
}: {
  label: string;
  value: string;
  proportion?: number | null;
}) {
  if (!label || !value) return null;
  const parsed = metricMagnitude(value);
  const width = proportion ?? (parsed === null ? null : 0.08);

  return (
    <div className="grid gap-3 sm:grid-cols-[11rem_1fr_5rem] sm:items-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
        {label}
      </p>
      <div className="h-1.5 bg-[var(--sage-border)]" aria-hidden>
        {width !== null ? (
          <div
            className="h-full bg-[linear-gradient(90deg,#3D5AFE,#7C3AED,#FF2D9B)]"
            style={{ width: `${Math.min(1, Math.max(0.02, width)) * 100}%` }}
          />
        ) : null}
      </div>
      <p className="font-mono text-sm tabular-nums text-[var(--sage-ink)] sm:text-right">{value}</p>
    </div>
  );
}

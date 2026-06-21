import { MetricBar } from './MetricBar';
import { metricProportions, type MetricDatum } from './metric-utils';

export function MetricGrid({ metrics }: { metrics: MetricDatum[] }) {
  if (!metrics.length) return null;
  const rows = metricProportions(metrics);

  return (
    <div
      className="space-y-4 border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5"
      role="list"
      aria-label="Verified case study metrics"
    >
      {rows.map((row) => (
        <div role="listitem" key={row.label}>
          <MetricBar label={row.label} value={row.value} proportion={row.proportion} />
        </div>
      ))}
    </div>
  );
}

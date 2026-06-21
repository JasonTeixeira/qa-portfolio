export type MetricDatum = {
  label: string;
  value: string;
};

export function metricMagnitude(value: string): number | null {
  const match = value.match(/-?\d[\d,]*\.?\d*/);
  if (!match) return null;
  const parsed = Number(match[0].replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function metricProportions(metrics: MetricDatum[]) {
  const rows = metrics.map((metric) => ({ ...metric, magnitude: metricMagnitude(metric.value) }));
  const numeric = rows.filter((row) => row.magnitude !== null);
  const max = numeric.length ? Math.max(...numeric.map((row) => row.magnitude ?? 0)) : 0;

  return rows.map((row) => ({
    ...row,
    proportion: row.magnitude !== null && max > 0 ? Math.max(row.magnitude / max, 0.02) : null,
  }));
}

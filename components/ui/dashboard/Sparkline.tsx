import type { HealthStatus } from '@/lib/qualityMetrics';

function colorForStatus(s: HealthStatus) {
  switch (s) {
    case 'healthy':
      return '#22c55e'; // green-500
    case 'degraded':
      return '#f59e0b'; // amber-500
    case 'down':
      return '#ef4444'; // red-500
  }
}

function labelForStatus(s: HealthStatus) {
  switch (s) {
    case 'healthy':
      return 'healthy';
    case 'degraded':
      return 'degraded';
    case 'down':
      return 'down';
  }
}

export function Sparkline(props: { series: HealthStatus[]; size?: 'sm' | 'md' }) {
  const w = props.size === 'md' ? 84 : 64;
  const h = props.size === 'md' ? 16 : 14;
  const gap = 2;
  const n = Math.max(props.series.length, 1);
  const barW = Math.max(2, Math.floor((w - gap * (n - 1)) / n));

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`7-day status trend: ${props.series.map(labelForStatus).join(', ')}`}
    >
      <title>{props.series.map(labelForStatus).join(' • ')}</title>
      {props.series.map((s, idx) => (
        <rect
          key={idx}
          x={idx * (barW + gap)}
          y={0}
          width={barW}
          height={h}
          rx={2}
          fill={colorForStatus(s)}
          opacity={0.9}
        />
      ))}
    </svg>
  );
}

export function SparklineWithTooltip(props: {
  dates: string[];
  series: HealthStatus[];
  size?: 'sm' | 'md';
}) {
  // The native <title> tooltip is the most reliable + accessible option.
  // Keep formatting concise and deterministic (UTC date strings).
  const tooltip = props.series
    .map((s, i) => {
      const d = props.dates[i] ?? '';
      return `${d}: ${labelForStatus(s)}`;
    })
    .join('\n');

  return (
    <div title={tooltip} className="inline-flex">
      <Sparkline series={props.series} size={props.size} />
    </div>
  );
}

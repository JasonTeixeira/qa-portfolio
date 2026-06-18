type DiagramNode = {
  label: string
  detail?: string
}

type DeepSystemDiagramProps = {
  eyebrow: string
  title: string
  description: string
  nodes: DiagramNode[]
  stats?: Array<{ label: string; value: string }>
}

const fallbackNodes: DiagramNode[] = [
  { label: 'Surface', detail: 'UI' },
  { label: 'Logic', detail: 'rules' },
  { label: 'Data', detail: 'state' },
  { label: 'Ops', detail: 'handoff' },
]

export function DeepSystemDiagram({
  eyebrow,
  title,
  description,
  nodes,
  stats = [
    { label: 'surface', value: 'visible' },
    { label: 'system', value: 'mapped' },
    { label: 'route', value: 'clear' },
  ],
}: DeepSystemDiagramProps) {
  const paddedNodes = [...nodes, ...fallbackNodes].slice(0, 5)

  return (
    <figure className="relative overflow-hidden border border-[var(--sage-border)] bg-[rgba(20,20,24,0.66)]">
      <div
        className="absolute inset-0 opacity-65"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(242,239,233,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.052) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(100% 86% at 48% 35%, #000 18%, transparent 74%)',
        }}
      />
      <div className="relative z-10 grid gap-px bg-[var(--sage-border)] lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="bg-[rgba(11,11,14,0.72)] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--sage-accent-readable)]">
              {eyebrow}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
              Surface ⇄ System
            </p>
          </div>
          <svg
            className="h-[260px] w-full overflow-visible motion-reduce:[&_*]:animate-none"
            viewBox="0 0 860 330"
            role="img"
            aria-label={`${title} system diagram`}
          >
            <defs>
              <linearGradient id="deep-flow-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#3D5AFE" />
                <stop offset="52%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#FF2D9B" />
              </linearGradient>
              <filter id="deep-flow-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 70 202 C 166 82, 278 82, 392 162 S 612 250, 790 86"
              fill="none"
              stroke="url(#deep-flow-line)"
              strokeLinecap="round"
              strokeWidth="3"
              filter="url(#deep-flow-glow)"
            />
            <path
              d="M 86 258 C 220 188, 320 210, 474 122 S 660 110, 798 214"
              fill="none"
              stroke="rgba(242,239,233,0.16)"
              strokeLinecap="round"
              strokeWidth="1"
            />
            <path
              d="M 94 92 C 230 150, 330 260, 500 232 S 666 168, 806 246"
              fill="none"
              stroke="rgba(242,239,233,0.12)"
              strokeLinecap="round"
              strokeWidth="1"
            />
            <circle className="motion-reduce:hidden" r="5" fill="#FF2D9B">
              <animateMotion
                dur="5.8s"
                repeatCount="indefinite"
                path="M 70 202 C 166 82, 278 82, 392 162 S 612 250, 790 86"
              />
            </circle>
            <circle className="motion-reduce:hidden" r="4" fill="#3D5AFE">
              <animateMotion
                dur="7s"
                begin="-2s"
                repeatCount="indefinite"
                path="M 86 258 C 220 188, 320 210, 474 122 S 660 110, 798 214"
              />
            </circle>
            {[
              [70, 202],
              [260, 92],
              [430, 190],
              [620, 230],
              [790, 86],
            ].map(([x, y], index) => {
              const node = paddedNodes[index]
              return (
                <g key={`${node.label}-${index}`}>
                  <circle cx={x} cy={y} r="30" fill="rgba(61,90,254,0.055)" />
                  <circle cx={x} cy={y} r="9" fill="#0B0B0E" stroke="url(#deep-flow-line)" strokeWidth="2" />
                  <text
                    x={x}
                    y={y + (index === 1 || index === 4 ? -34 : 50)}
                    fill="#F2EFE9"
                    fontFamily="var(--font-mono)"
                    fontSize="12"
                    textAnchor="middle"
                    letterSpacing="1.7"
                  >
                    {node.label}
                  </text>
                  {node.detail ? (
                    <text
                      x={x}
                      y={y + (index === 1 || index === 4 ? -18 : 66)}
                      fill="#8A8A94"
                      fontFamily="var(--font-mono)"
                      fontSize="10"
                      textAnchor="middle"
                      letterSpacing="1.1"
                    >
                      {node.detail}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </svg>
          <figcaption className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
            {description}
          </figcaption>
        </div>
        <div className="grid gap-px bg-[var(--sage-border)]">
          <div className="bg-[rgba(11,11,14,0.78)] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              {title}
            </p>
            <p className="mt-5 text-sm leading-6 text-[var(--sage-ink-muted)]">
              The diagram is intentionally simplified: it shows the buying logic and operating path,
              not a decorative fantasy architecture.
            </p>
          </div>
          {stats.map((stat) => (
            <div className="bg-[rgba(11,11,14,0.78)] p-6" key={stat.label}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                {stat.label}
              </p>
              <p className="mt-3 text-xl font-semibold text-[var(--sage-ink)]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}

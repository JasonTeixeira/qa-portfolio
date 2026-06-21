export type SystemDiagramNode = {
  label: string;
  detail?: string;
};

export function SystemDiagram({
  title = 'Operating system',
  nodes,
}: {
  title?: string;
  nodes: SystemDiagramNode[];
}) {
  const safeNodes = nodes.slice(0, 5);
  if (!safeNodes.length) return null;

  return (
    <figure className="my-10 overflow-hidden border border-[var(--sage-border)] bg-[var(--sage-surface-1)]">
      <div className="border-b border-[var(--sage-border)] p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
          Surface ⇄ System
        </p>
        <figcaption className="mt-3 text-xl font-semibold text-[var(--sage-ink)]">{title}</figcaption>
      </div>
      <svg
        className="h-[280px] w-full overflow-visible p-4 motion-reduce:[&_*]:animate-none"
        viewBox="0 0 860 300"
        role="img"
        aria-label={`${title} diagram`}
      >
        <defs>
          <linearGradient id="mdx-system-flow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#3D5AFE" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#FF2D9B" />
          </linearGradient>
        </defs>
        <path
          d="M 80 165 C 200 72, 330 238, 460 148 S 670 80, 790 160"
          fill="none"
          stroke="url(#mdx-system-flow)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle className="motion-reduce:hidden" r="5" fill="#FF2D9B">
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path="M 80 165 C 200 72, 330 238, 460 148 S 670 80, 790 160"
          />
        </circle>
        {safeNodes.map((node, index) => {
          const x = 80 + index * (710 / Math.max(safeNodes.length - 1, 1));
          const y = index % 2 === 0 ? 165 : 118;
          return (
            <g key={`${node.label}-${index}`}>
              <circle cx={x} cy={y} r="25" fill="rgba(61,90,254,0.08)" />
              <circle cx={x} cy={y} r="8" fill="#0B0B0E" stroke="url(#mdx-system-flow)" strokeWidth="2" />
              <text
                x={x}
                y={y + 46}
                fill="#F2EFE9"
                fontFamily="var(--font-mono)"
                fontSize="12"
                textAnchor="middle"
                letterSpacing="1.5"
              >
                {node.label}
              </text>
              {node.detail ? (
                <text
                  x={x}
                  y={y + 63}
                  fill="#8A8A94"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  {node.detail}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

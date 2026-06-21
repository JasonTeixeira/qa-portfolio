import type { ReactNode } from 'react';

const tones = {
  note: 'border-[rgba(61,90,254,0.42)] bg-[rgba(61,90,254,0.08)]',
  warning: 'border-[rgba(255,184,77,0.42)] bg-[rgba(255,184,77,0.08)]',
  proof: 'border-[rgba(255,45,155,0.35)] bg-[rgba(255,45,155,0.07)]',
} as const;

export function Callout({
  title,
  children,
  tone = 'note',
}: {
  title?: string;
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <aside className={`my-8 border p-5 ${tones[tone]}`}>
      {title ? (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
          {title}
        </p>
      ) : null}
      <div className="text-sm leading-7 text-[var(--sage-ink-muted)]">{children}</div>
    </aside>
  );
}

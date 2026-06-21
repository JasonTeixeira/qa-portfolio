import type { ReactNode } from 'react';

export function CodePanel({
  label = 'system note',
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-8 overflow-hidden border border-[var(--sage-border)] bg-[var(--sage-surface-1)]">
      <figcaption className="border-b border-[var(--sage-border)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
        {label}
      </figcaption>
      <div className="overflow-x-auto p-4 text-sm leading-7 text-[var(--sage-ink)]">{children}</div>
    </figure>
  );
}

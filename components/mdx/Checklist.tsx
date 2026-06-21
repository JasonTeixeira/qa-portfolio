export type ChecklistItem = {
  label: string;
  done?: boolean;
};

export function Checklist({ items }: { items: ChecklistItem[] }) {
  if (!items.length) return null;

  return (
    <ul className="my-8 divide-y divide-[var(--sage-border)] border border-[var(--sage-border)] bg-[var(--sage-surface-1)]">
      {items.map((item) => (
        <li key={item.label} className="flex gap-3 p-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
          <span
            aria-hidden
            className={`mt-1.5 h-3 w-3 shrink-0 rounded-full border ${
              item.done
                ? 'border-[var(--sage-accent)] bg-[var(--sage-accent)]'
                : 'border-[var(--sage-ink-faint)]'
            }`}
          />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

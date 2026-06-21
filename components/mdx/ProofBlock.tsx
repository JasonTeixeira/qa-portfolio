export type ProofBlockItem = {
  label: string;
  value: string;
  detail?: string;
};

export function ProofBlock({
  eyebrow = 'proof',
  title,
  items,
}: {
  eyebrow?: string;
  title: string;
  items: ProofBlockItem[];
}) {
  if (!items.length) return null;

  return (
    <section className="my-10 border border-[var(--sage-border)] bg-[rgba(20,20,24,0.62)]">
      <div className="border-b border-[var(--sage-border)] p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
          {eyebrow}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--sage-ink)]">{title}</h3>
      </div>
      <dl className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="bg-[var(--sage-bg)] p-5">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
              {item.label}
            </dt>
            <dd className="mt-3 text-2xl font-semibold text-[var(--sage-ink)]">{item.value}</dd>
            {item.detail ? (
              <p className="mt-3 text-xs leading-6 text-[var(--sage-ink-muted)]">{item.detail}</p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

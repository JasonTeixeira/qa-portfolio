import Link from 'next/link';

export function OfferCTA({
  eyebrow = 'next step',
  title,
  body,
  href,
  label,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <aside className="my-10 grid gap-px border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-[1fr_auto]">
      <div className="bg-[var(--sage-bg)] p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
          {eyebrow}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--sage-ink)]">{title}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--sage-ink-muted)]">{body}</p>
      </div>
      <div className="flex items-center bg-[var(--sage-surface-1)] p-6">
        <Link
          href={href}
          className="inline-flex min-h-11 items-center rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-accent)]"
        >
          {label}
          <span aria-hidden className="ml-1">
            -&gt;
          </span>
        </Link>
      </div>
    </aside>
  );
}

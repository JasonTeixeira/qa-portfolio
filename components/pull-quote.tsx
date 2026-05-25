/**
 * Editorial pull-quote for long-form articles.
 * Large serif text with a vertical brand accent bar.
 *
 * Server component — uses CSS sage-rise utility for scroll-linked entrance
 * (replaces framer-motion to keep client bundle small).
 */
export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="sage-rise relative my-12 py-6 pl-8 border-l-[3px] border-[#0ED3CF]">
      <div
        className="text-2xl sm:text-3xl text-[#F4F2EF] leading-snug tracking-tight"
        style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
      >
        {children}
      </div>
    </blockquote>
  )
}

/**
 * Callout box for key takeaways or important notes.
 */
export function Callout({
  title,
  children,
  accent = 'teal',
}: {
  title: string
  children: React.ReactNode
  accent?: 'teal' | 'coral' | 'lime'
}) {
  const colors = {
    teal: 'border-[#0ED3CF]/30 bg-[#0ED3CF]/[0.04]',
    coral: 'border-[#E85D3A]/30 bg-[#E85D3A]/[0.04]',
    lime: 'border-[#A8C633]/30 bg-[#A8C633]/[0.04]',
  }
  const titleColors = {
    teal: 'text-[#0ED3CF]',
    coral: 'text-[#E85D3A]',
    lime: 'text-[#A8C633]',
  }

  return (
    <div className={`sage-rise my-10 rounded-xl border ${colors[accent]} p-6`}>
      <div className={`text-xs font-mono uppercase tracking-widest ${titleColors[accent]} mb-3`}>
        {title}
      </div>
      <div className="text-[#A8A29E] text-sm leading-relaxed">{children}</div>
    </div>
  )
}

/**
 * Section divider with brand accent dot.
 */
export function SectionDivider() {
  return (
    <div className="my-16 flex items-center justify-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2A2826] to-transparent" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#0ED3CF]" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2A2826] to-transparent" />
    </div>
  )
}

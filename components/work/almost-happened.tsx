// Phase 7: "What almost happened" — the honesty block.
// Before / After / Cost trio. Server component, no client JS.

import type { AlmostHappened } from '@/data/work/case-extras'

interface Props {
  items: AlmostHappened[]
}

export function AlmostHappenedBlock({ items }: Props) {
  return (
    <div className="not-prose space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-[#2A2826] bg-gradient-to-br from-[#12110F] to-[#0F0E0D] overflow-hidden"
        >
          {/* Index header */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#2A2826] bg-[#0F0E0D]/60">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#E85D3A]">
                {'// near-miss · '}{String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#57534E]">
              diff
            </span>
          </div>

          <div className="divide-y divide-[#2A2826]">
            {/* Before */}
            <div className="px-5 py-4 flex gap-4">
              <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#E85D3A]/15 border border-[#E85D3A]/40 text-[#E85D3A] text-[10px] font-mono leading-none mt-0.5">
                -
              </span>
              <div className="text-sm leading-relaxed text-[#A8A29E]">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#E85D3A] mr-2">before</span>
                {item.before}
              </div>
            </div>

            {/* After */}
            <div className="px-5 py-4 flex gap-4">
              <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#A8C633]/15 border border-[#A8C633]/40 text-[#A8C633] text-[10px] font-mono leading-none mt-0.5">
                +
              </span>
              <div className="text-sm leading-relaxed text-[#D4D4D8]">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#A8C633] mr-2">after</span>
                {item.after}
              </div>
            </div>

            {/* Cost */}
            <div className="px-5 py-3 flex gap-4 bg-[#0B0A09]">
              <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#0ED3CF]/15 border border-[#0ED3CF]/40 text-[#0ED3CF] text-[10px] font-mono leading-none mt-0.5">
                $
              </span>
              <div className="text-xs leading-relaxed text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#57534E] mr-2">cost</span>
                {item.cost}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

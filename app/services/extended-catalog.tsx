import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Workflow,
  Bot,
  RefreshCw,
  Compass,
  Package,
  Clock,
} from 'lucide-react'
import {
  extendedCategories,
  extendedTiersByCategory,
  type ExtendedCategoryMeta,
  type ExtendedTier,
} from '@/data/services/extended'

type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: string | number }
>

const iconFor: Record<ExtendedCategoryMeta['icon'], IconComponent> = {
  sparkles: Sparkles,
  workflow: Workflow,
  bot: Bot,
  refresh: RefreshCw,
  compass: Compass,
  package: Package,
}

function ServiceCard({ tier, accent }: { tier: ExtendedTier; accent: string }) {
  return (
    <Link
      href={`/services/${tier.slug}`}
      className="group rounded-2xl border border-[#27272A] bg-[#0F0F12] p-5 hover:border-[#3F3F46] transition-colors flex flex-col"
      style={{ ['--accent' as string]: accent }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-[#FAFAFA] leading-snug">{tier.name}</h3>
        <span
          className="shrink-0 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border"
          style={{
            color: accent,
            borderColor: `${accent}40`,
            backgroundColor: `${accent}10`,
          }}
        >
          {tier.price}
        </span>
      </div>
      <p className="text-sm text-[#A1A1AA] leading-snug mb-4 flex-1">{tier.tagline}</p>
      <div className="flex items-center justify-between text-xs font-mono text-[#71717A] pt-3 border-t border-[#27272A]">
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {tier.timeline}
        </span>
        <span
          className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5"
          style={{ color: accent }}
        >
          Details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}

export function ExtendedCatalog() {
  return (
    <div className="space-y-16">
      {extendedCategories.map((cat) => {
        const Icon = iconFor[cat.icon]
        const items = extendedTiersByCategory[cat.key]
        if (items.length === 0) return null
        return (
          <section
            key={cat.key}
            id={`cat-${cat.key}`}
            className="scroll-mt-24"
            aria-labelledby={`cat-heading-${cat.key}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: cat.accent }} aria-hidden />
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: cat.accent }}
              >
                {cat.label}
              </span>
            </div>
            <h2
              id={`cat-heading-${cat.key}`}
              className="text-3xl font-bold text-[#FAFAFA] mb-2"
            >
              {cat.label}
            </h2>
            <p className="text-[#A1A1AA] mb-8 max-w-2xl">{cat.tagline}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((t) => (
                <ServiceCard key={t.slug} tier={t} accent={cat.accent} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function ExtendedCategoryNav() {
  return (
    <nav
      aria-label="Service categories"
      className="flex flex-wrap items-center gap-2 text-xs font-mono"
    >
      {extendedCategories.map((cat) => (
        <a
          key={cat.key}
          href={`#cat-${cat.key}`}
          className="px-3 py-1.5 rounded-full border border-[#27272A] bg-[#0F0F12] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3F3F46] transition-colors"
        >
          {cat.label}
        </a>
      ))}
    </nav>
  )
}

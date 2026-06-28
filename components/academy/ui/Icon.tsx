import type { SVGProps } from 'react'

/**
 * The academy's single icon system — clean, consistent line icons (Lucide-style,
 * 24px grid, 1.6 stroke, currentColor) that REPLACE the unicode/emoji grab-bag
 * (emoji + decorative geometric glyphs) scattered across the UI. No emoji, no glyphs.
 * Use `<Icon name="…" />`; it inherits color + sizes via the `size` prop.
 * Always decorative by default (aria-hidden) — pair with a text label for meaning.
 */
export type IconName =
  | 'check'
  | 'x'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up-right'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'flame'
  | 'bolt'
  | 'target'
  | 'circle'
  | 'star'
  | 'sparkle'
  | 'refresh'
  | 'search'
  | 'play'
  | 'plus'
  | 'lock'
  | 'trophy'
  | 'book'
  | 'compass'
  | 'users'
  | 'bell'
  | 'bell-off'
  | 'alert'
  | 'award'
  | 'shield'
  | 'swap'
  | 'dot'

const P: Record<IconName, React.ReactNode> = {
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  'arrow-right': <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  'arrow-left': <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
  'arrow-up-right': <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-up': <path d="m18 15-6-6-6 6" />,
  flame: <path d="M12 3c2 3 4 5 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3 .3 1 1 1.5 1.5 1.5C9.5 7.5 12 6 12 3Z" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>,
  circle: <circle cx="12" cy="12" r="8" />,
  star: <path d="m12 3 2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.7 6.7 19.5l1.1-6L3.4 9.3l6-.8L12 3Z" />,
  sparkle: <path d="M12 3v6m0 6v6m-9-9h6m6 0h6M6.3 6.3l2.8 2.8m5.8 5.8 2.8 2.8m0-11.4-2.8 2.8m-5.8 5.8-2.8 2.8" />,
  refresh: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-3.6-3.6" /></>,
  play: <path d="M7 5v14l11-7-11-7Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  trophy: <><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 19h6M10 16v3M14 16v3" /></>,
  book: <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm0 0v14M18 18a2 2 0 0 0 2 2" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 5.7M20 20a5 5 0 0 0-3.5-4.8" /></>,
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10.5 20a2 2 0 0 0 3 0" />,
  'bell-off': <><path d="M8.5 5.5A6 6 0 0 1 18 9c0 3 .8 4.6 1.5 5.4M5.8 5.8A6 6 0 0 0 6 9c0 5-2 6-2 6h11M10.5 20a2 2 0 0 0 3 0" /><path d="m3 3 18 18" /></>,
  alert: <><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4M12 17.5v.5" /></>,
  award: <><circle cx="12" cy="9" r="5.5" /><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5" /></>,
  shield: <path d="M12 3 5 6v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3Z" />,
  swap: <><path d="M7 7h11l-3-3M17 17H6l3 3" /></>,
  dot: <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />,
}

export function Icon({
  name,
  size = 16,
  ...props
}: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {P[name]}
    </svg>
  )
}

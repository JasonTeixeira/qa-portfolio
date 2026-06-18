import { cn } from '@/lib/utils'

type SageLivingMarkProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'h-9 w-9 rounded-[11px]',
  md: 'h-10 w-10 rounded-[12px]',
  lg: 'h-12 w-12 rounded-[14px]',
}

const svgSizeClass = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
}

export function SageLivingMark({ className, size = 'md' }: SageLivingMarkProps) {
  const gradientId = `sage-living-mark-${size}`

  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border border-[rgba(242,239,233,0.12)] bg-[#0B0B0E] shadow-[0_0_0_1px_rgba(61,90,254,0.12),0_18px_44px_rgba(0,0,0,0.42)]',
        sizeClass[size],
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(242,239,233,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(242,239,233,0.055)_1px,transparent_1px)] [background-size:12px_12px]" />
      <svg viewBox="0 0 42 42" className={cn('relative', svgSizeClass[size])} role="img">
        <defs>
          <linearGradient id={gradientId} x1="4" x2="38" y1="8" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3D5AFE" />
            <stop offset="0.55" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#FF2D9B" />
          </linearGradient>
        </defs>
        <path
          d="M28.8 7.6c-7.8 1.2-16.3 7-17.5 12.1-.8 3.4 2.2 5.1 8.2 6.7 5.8 1.5 8.8 2.8 8.4 5.3-.5 3.3-7.1 5.1-14.9 4.3"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth="4.6"
        />
        <circle cx="30" cy="8" r="3.8" fill="#3D5AFE" />
        <circle cx="13.5" cy="35.7" r="2.8" fill="#FF2D9B" />
      </svg>
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#3D5AFE,#7C3AED,#FF2D9B,transparent)]" />
    </span>
  )
}

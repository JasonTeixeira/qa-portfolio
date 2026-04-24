interface SectionLabelProps {
  children: React.ReactNode
  color?: 'cyan' | 'violet'
}

export function SectionLabel({ children, color = 'cyan' }: SectionLabelProps) {
  const colorClasses = {
    cyan: 'text-[#06B6D4]',
    violet: 'text-[#8B5CF6]',
  }

  return (
    <span className={`text-xs font-mono uppercase tracking-[0.05em] ${colorClasses[color]}`}>
      {children}
    </span>
  )
}

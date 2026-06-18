interface SectionLabelProps {
  children: React.ReactNode
  color?: 'cyan' | 'violet'
}

export function SectionLabel({ children, color = 'cyan' }: SectionLabelProps) {
  const colorClasses = {
    cyan: 'text-[#3D5AFE]',
    violet: 'text-[#E85D3A]',
  }

  return (
    <span className={`text-xs font-mono uppercase tracking-[0.05em] ${colorClasses[color]}`}>
      {children}
    </span>
  )
}

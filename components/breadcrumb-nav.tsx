// Phase 10: RSC — no client state, no event handlers, no hooks.

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
      <Link
        href="/"
        className="text-[#78716C] hover:text-[#3D5AFE] transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
      </Link>
      
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-[#3D3A37]" aria-hidden="true" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-[#78716C] hover:text-[#3D5AFE] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#A8A29E]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

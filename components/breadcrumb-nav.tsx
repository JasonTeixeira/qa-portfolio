'use client'

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
        className="text-[#71717A] hover:text-[#06B6D4] transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-[#3F3F46]" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-[#71717A] hover:text-[#06B6D4] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#A1A1AA]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

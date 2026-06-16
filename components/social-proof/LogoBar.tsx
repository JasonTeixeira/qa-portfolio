'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { PermissionedLogo } from '@/data/social-proof/attributed'

type Props = {
  logos: PermissionedLogo[]
  label?: string
}

export function LogoBar({ logos, label = 'Permissioned proof' }: Props) {
  if (logos.length === 0) return null

  return (
    <section aria-label={label}>
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
        {label}
      </p>
      <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-4">
        {logos.map((entry) => {
          const logo = (
            <div className="flex min-h-28 items-center justify-center bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)]">
              <Image
                src={entry.logo}
                alt={entry.label}
                width={160}
                height={64}
                className="max-h-14 w-auto object-contain opacity-80"
              />
            </div>
          )

          return entry.href ? (
            <Link href={entry.href} key={entry.id}>
              {logo}
            </Link>
          ) : (
            <div key={entry.id}>{logo}</div>
          )
        })}
      </div>
    </section>
  )
}

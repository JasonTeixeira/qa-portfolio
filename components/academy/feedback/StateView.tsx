import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/academy/ui/Icon'
import styles from './feedback.module.css'

/** A designed empty / error / not-found state. Server-renderable; pass action nodes as children. */
export function StateView({
  glyph = 'sparkle',
  title,
  body,
  children,
}: {
  glyph?: IconName
  title: string
  body?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className={styles.state} role="status">
      <span className={styles.glyph} aria-hidden="true"><Icon name={glyph} size={28} /></span>
      <h1 className={styles.stateTitle}>{title}</h1>
      {body ? <p className={styles.stateBody}>{body}</p> : null}
      {children ? <div className={styles.actions}>{children}</div> : null}
    </section>
  )
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={styles.primary}>{children}</Link>
}

export function GhostLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={styles.ghost}>{children}</Link>
}

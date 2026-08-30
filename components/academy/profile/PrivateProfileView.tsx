import Link from 'next/link'
import { SageMark } from '@/components/academy/brand/SageMark'
import styles from './public-profile.module.css'

/** Initials monogram (max two letters). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '·'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Honest state for a real learner whose ledger is set to private. We confirm the
 * handle exists but disclose nothing about their work — no counts, no claims.
 */
export function PrivateProfileView({ handle, displayName }: { handle: string; displayName: string }) {
  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <Link href="/academy" className={styles.brand}>
          <SageMark size={24} radius={7} />
          <span className={styles.brandName}>Sage Academy</span>
        </Link>
        <span className={styles.topPath}>public profile · sageideas.dev/academy/u/{handle}</span>
        <Link href="/academy" className={styles.topCta}>
          build your own ledger →
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.head}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(displayName)}
          </span>
          <div className={styles.headText}>
            <h1 className={styles.name}>This profile is private</h1>
            <div className={styles.meta}>@{handle} · ledger not published</div>
          </div>
        </section>

        <div className={styles.privateNote}>
          This learner keeps their proof-of-work ledger private. There is nothing to show here.
        </div>

        <footer className={styles.foot}>
          <p className={styles.footQuote}>&ldquo;Proof is only proof when the owner chooses to share it.&rdquo;</p>
          <div className={styles.footNote}>verified by Sage Academy</div>
        </footer>
      </main>
    </div>
  )
}

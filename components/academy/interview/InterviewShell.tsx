import Link from 'next/link'
import { SageMark } from '@/components/academy/brand/SageMark'
import styles from './interview.module.css'

/** Nav keys that light exactly one destination per page. */
export type InterviewNavKey = 'prep' | 'library' | 'progress' | 'schedule' | 'pairs' | 'mastery' | null

type NavItem = { href: string; label: string; key: Exclude<InterviewNavKey, null> }

/**
 * The interview add-on nav. Only base (non-dynamic) surfaces appear — session / verdict /
 * debrief / brief are reached contextually (they need an id), so linking them from the nav
 * would be a dead end. Honest nav > complete-but-broken nav.
 */
const NAV: readonly NavItem[] = [
  { href: '/academy/interview', label: 'Prep', key: 'prep' },
  { href: '/academy/interview/library', label: 'Library', key: 'library' },
  { href: '/academy/interview/progress', label: 'Progress', key: 'progress' },
  { href: '/academy/interview/schedule', label: 'Schedule', key: 'schedule' },
  { href: '/academy/interview/pairs', label: 'Peer loops', key: 'pairs' },
]

type Props = {
  active?: InterviewNavKey
  /** Where the "← Academy" back link points. Defaults to the academy dashboard. */
  backHref?: string
  children: React.ReactNode
}

/**
 * The standalone Interview Mastery chrome — a gold-accent variant of the Sage lesson skin on
 * the --sa-* tokens. It is NOT the academy marketing shell (that runs on --ac-*); the interview
 * surfaces are full-bleed prep-cockpit pages like the lesson player. Every interview screen
 * wraps its content in this shell so the brand, nav, and "← Academy" back link stay consistent.
 */
export function InterviewShell({ active = null, backHref = '/academy/dashboard', children }: Props) {
  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/academy/interview" className={styles.brand}>
            <SageMark
              size={26}
              radius={8}
              bg="linear-gradient(135deg, #e0a93e, #d99a2b)"
              fg="#0B0B0E"
              glow={false}
              style={{ boxShadow: '0 0 18px rgba(224, 169, 62, 0.4)' }}
            />
            <span>
              <span className={styles.brandTitle}>Interview Mastery</span>
              <span className={styles.brandKicker}>Prep cockpit</span>
            </span>
          </Link>
          <nav className={styles.nav} aria-label="Interview Mastery">
            {NAV.map((item) => {
              const on = active === item.key
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={on ? 'page' : undefined}
                  className={on ? styles.navLinkActive : styles.navLink}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className={styles.spacer} />
          <Link href={backHref} className={styles.back}>
            ← Academy
          </Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}

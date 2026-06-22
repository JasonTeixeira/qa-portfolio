import Link from 'next/link'
import styles from './studio.module.css'

export function Gate() {
  return (
    <div className={styles.page}>
      <div className={styles.gate}>
        <p className={styles.kicker}>Authoring studio</p>
        <h1 className={styles.h1}>Admins only</h1>
        <p className={styles.sub}>Sign in with an admin account to author academy content.</p>
        <Link href="/login?next=/academy-admin" className={styles.save} style={{ display: 'inline-block', marginTop: '1.2rem', textDecoration: 'none' }}>
          Sign in →
        </Link>
      </div>
    </div>
  )
}

import type { CSSProperties } from 'react'
import styles from './feedback.module.css'

/** A single shimmering placeholder. Width/height are passed through inline. */
export function Skeleton({ w, h, r, className = '' }: { w?: string | number; h?: string | number; r?: string | number; className?: string }) {
  const style: CSSProperties = {
    width: w ?? '100%',
    height: h ?? '0.85rem',
    borderRadius: r,
  }
  return <span className={`${styles.skeleton} ${className}`} style={style} aria-hidden="true" />
}

/** An article-shaped skeleton — used by the course overview + lesson loading states. */
export function ArticleSkeleton({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className={styles.shell} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <Skeleton w="22%" h="0.8rem" r={6} />
      <div style={{ height: '1rem' }} />
      <Skeleton w="68%" h="2.4rem" r={10} />
      <div style={{ height: '1.6rem' }} />
      {[92, 88, 95, 80, 0, 90, 85, 70].map((w, i) =>
        w === 0 ? <div key={i} style={{ height: '0.8rem' }} /> : (
          <div key={i} style={{ marginBottom: '0.7rem' }}><Skeleton w={`${w}%`} h="0.85rem" r={6} /></div>
        ),
      )}
      <div style={{ height: '1.4rem' }} />
      <Skeleton h="160px" r={14} />
    </div>
  )
}

/** A grid of course-card skeletons — used by catalog/dashboard/build loading states. */
export function CourseGridSkeleton({ count = 6, label = 'Loading courses…' }: { count?: number; label?: string }) {
  return (
    <div className={styles.shell} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className={styles.shellHead}>
        <Skeleton w="30%" h="1.6rem" r={8} />
        <Skeleton w="52%" h="0.9rem" r={6} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton h="120px" r={12} />
            <Skeleton w="70%" h="1.1rem" r={6} />
            <Skeleton w="92%" h="0.8rem" r={6} />
            <Skeleton w="84%" h="0.8rem" r={6} />
            <div className={styles.cardRow}>
              <Skeleton w="64px" h="1.5rem" r={20} />
              <Skeleton w="80px" h="1.5rem" r={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

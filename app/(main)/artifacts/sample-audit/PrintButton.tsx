'use client'

import styles from './artifact.module.css'

export function PrintButton() {
  return (
    <button type="button" className={styles.print} onClick={() => window.print()}>
      ⎙ Save as PDF
    </button>
  )
}

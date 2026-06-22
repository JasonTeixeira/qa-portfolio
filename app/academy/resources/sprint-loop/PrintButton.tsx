'use client'

import styles from './reference.module.css'

export function PrintButton() {
  return (
    <button type="button" className={styles.print} onClick={() => window.print()}>
      ⎙ Print / Save as PDF
    </button>
  )
}

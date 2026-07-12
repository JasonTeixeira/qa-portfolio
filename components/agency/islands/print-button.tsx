'use client'

/** "PRINT / SAVE AS PDF" — triggers the browser print dialog; hidden in print output. */
export function PrintButton() {
  return (
    <button type="button" className="ag-btn ag-cap-print-btn" onClick={() => window.print()}>
      PRINT / SAVE AS PDF
    </button>
  )
}

/**
 * Shared category → tint / course-route mapping for field notes, one-for-one
 * with the design source ("Sage Field Notes.dc.html" DCLogic notes()).
 */

export const CATEGORY_TINT: Record<string, string> = {
  'Repair log': '#E5484D',
  Systems: '#8FA0FF',
  AI: '#FF2D9B',
  Audit: '#E0A93E',
  Career: '#18B663',
  Growth: '#7C3AED',
}

export const CATEGORY_ROUTE: Record<string, string> = {
  'Repair log': 'Backend Engineering',
  Systems: 'Engineering Judgment',
  AI: 'AI Engineering & RAG',
  Audit: 'AI Engineering & RAG',
  Career: 'Interview & Portfolio',
  Growth: 'Product Execution',
}

export function tintFor(category: string): string {
  return CATEGORY_TINT[category] ?? '#8FA0FF'
}

export function routeFor(category: string): string {
  return CATEGORY_ROUTE[category] ?? 'Sage Academy'
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

const WORDS_PER_MINUTE = 200

export function estimateReadMin(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

/** Serializable row shape passed from the server page into the client list. */
export interface FieldNoteRow {
  slug: string
  title: string
  category: string
  dateLabel: string
  readMin: number
  route: string
  tint: string
}

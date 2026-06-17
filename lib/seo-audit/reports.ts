import { randomBytes } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { SeoReport } from './analyzer'

export type PublicAuditReport = {
  id: string
  share_id: string
  created_at: string
  url: string
  host: string
  score: number
  report: SeoReport
  metadata: Record<string, unknown>
}

export function createShareId() {
  return randomBytes(9).toString('base64url')
}

export async function persistAuditReport(input: {
  url: string
  score: number
  report: SeoReport
  metadata?: Record<string, unknown>
}): Promise<{ shareId: string } | null> {
  try {
    const shareId = createShareId()
    const host = new URL(input.url).host.replace(/^www\./, '')
    const sb = supabaseAdmin()
    const { error } = await sb.from('audit_reports').insert({
      share_id: shareId,
      url: input.url,
      host,
      score: input.score,
      report: input.report,
      metadata: input.metadata ?? {},
    })

    if (error) {
      console.error('[audit_reports] persist error:', error.message)
      return null
    }

    return { shareId }
  } catch (error) {
    console.error('[audit_reports] persist failed:', error)
    return null
  }
}

export async function getPublicAuditReport(shareId: string): Promise<PublicAuditReport | null> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('audit_reports')
      .select('id, share_id, created_at, url, host, score, report, metadata')
      .eq('share_id', shareId)
      .maybeSingle()

    if (error || !data) return null
    return data as PublicAuditReport
  } catch {
    return null
  }
}

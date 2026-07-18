import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import { BriefComposer } from '@/components/academy/interview/brief/BriefComposer'
import styles from '@/components/academy/interview/brief/brief.module.css'

export const metadata: Metadata = {
  title: 'Company brief — Interview Mastery',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type BriefListRow = {
  id: string
  company: string | null
  role: string | null
  created_at: string | null
}

function shortDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Company-brief index. The "decode a job description" form IS the page — a brief only exists
 * after a real JD is pasted and generateBrief grounds it in that posting + the member's own
 * history. Below the form we list the caller's existing briefs (own-row) linking to their view.
 * Nothing is fabricated: with no briefs, the form stands alone with an honest explainer.
 */
export default async function InterviewBriefIndexPage() {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/interview/brief')

  const { data: briefRows } = await sb
    .from('interview_company_briefs')
    .select('id, company, role, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const briefs: BriefListRow[] = Array.isArray(briefRows) ? (briefRows as BriefListRow[]) : []

  return (
    <InterviewShell active={null} backHref="/academy/interview">
      <div className={styles.canvas}>
        <div className={styles.composerHead}>
          <div className={styles.composerKicker}>Company brief</div>
          <h1 className={styles.composerTitle}>Decode a job description.</h1>
          <p className={styles.composerExplainer}>
            Paste a real JD — Marlowe decodes it into the loop you&rsquo;ll likely face, your edge and
            risk from your own mock history, and a tuned scenario queue. Grounded only in the posting
            and your own history — no private company data.
          </p>
        </div>

        <BriefComposer />

        {briefs.length > 0 ? (
          <section className={styles.listSection}>
            <div className={styles.listLabel}>Your briefs</div>
            <div className={styles.briefsList}>
              {briefs.map((b) => {
                const date = shortDate(b.created_at)
                return (
                  <Link key={b.id} href={`/academy/interview/brief/${b.id}`} className={styles.briefRow}>
                    <span className={styles.briefRowMain}>
                      <span className={styles.briefCompany}>{b.company || 'Untitled brief'}</span>
                      {b.role ? <span className={styles.briefRole}>{b.role}</span> : null}
                    </span>
                    {date ? <span className={styles.briefMeta}>{date}</span> : null}
                  </Link>
                )
              })}
            </div>
          </section>
        ) : null}
      </div>
    </InterviewShell>
  )
}

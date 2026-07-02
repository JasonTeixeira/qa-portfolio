'use client'

import { useState, useTransition } from 'react'
import { verifyArtifact } from '@/app/academy/_actions/evidence'
import { deriveRequirements, gradeArtifact, ARTIFACT_MIN_CHARS } from '@/lib/academy/artifact-logic'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './sprint.module.css'

type Props = {
  proof: string
  outcome: string
  courseSlug?: string
  lessonSlug?: string
}

/** Interactive artifact builder for a sprint-contract's `proof` deliverable. The learner
 *  drafts the artifact; a live checklist (derived from the proof spec) shows which required
 *  elements are covered; saving re-verifies server-side and records `sprint_artifact_created`.
 *  The non-code analog of the lab, for judgment/design/leadership lessons. */
export function ArtifactComposer({ proof, outcome, courseSlug, lessonSlug }: Props) {
  const requirements = deriveRequirements(proof)
  const [draft, setDraft] = useState('')
  const [verified, setVerified] = useState(false)
  const [serverMet, setServerMet] = useState<{ label: string; met: boolean }[] | null>(null)
  const [pending, startTransition] = useTransition()

  // No requirements parseable → nothing to build here; render nothing extra.
  if (!requirements.length) return null

  const grade = gradeArtifact(draft, requirements)
  const shown = serverMet ?? grade.results
  const filename = (proof.match(/^[\w./-]+\.\w{1,5}/)?.[0] ?? 'artifact.md').replace(/[^\w.-]/g, '_')

  const save = () => {
    if (pending || verified || !grade.ok || !courseSlug || !lessonSlug) return
    startTransition(async () => {
      const res = await verifyArtifact(courseSlug, lessonSlug, draft)
      setServerMet(res.results)
      if (res.verified) setVerified(true)
    })
  }

  const download = () => {
    const md = `# ${filename.replace(/\.\w+$/, '')}\n\n> ${outcome}\n\n${draft}\n`
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.composer}>
      <div className={styles.composerHead}>
        <span className={styles.contractKicker}><Icon name="bolt" size={13} /> Build the artifact · {filename}</span>
        <span className={styles.composerCount} data-ok={draft.trim().length >= ARTIFACT_MIN_CHARS}>
          {draft.trim().length}/{ARTIFACT_MIN_CHARS}
        </span>
      </div>

      <ul className={styles.reqList} aria-label="Required elements">
        {shown.map((r) => (
          <li key={r.label} className={styles.reqItem} data-met={r.met}>
            <Icon name={r.met ? 'check' : 'target'} size={14} />
            <span>{r.label}</span>
          </li>
        ))}
      </ul>

      <textarea
        className={styles.input}
        value={draft}
        onChange={(e) => { setDraft(e.target.value); setServerMet(null) }}
        placeholder={`Draft your ${filename} — cover each required element above.`}
        aria-label="Artifact draft"
        rows={10}
        disabled={verified}
      />

      {verified ? (
        <div className={styles.reveal} role="status" aria-live="polite">
          <span className={styles.revealTag}><Icon name="check" size={13} /> Artifact verified — saved to your progress.</span>
          <p>You produced a deliverable that covers every element the contract required.</p>
        </div>
      ) : (
        <div className={styles.composerActions}>
          <button type="button" className={styles.ghostBtn} onClick={save} disabled={pending || !grade.ok}>
            {pending ? 'Verifying…' : grade.ok ? (<>Verify &amp; save artifact <Icon name="arrow-right" size={14} /></>) : 'Cover every element to save'}
          </button>
          <button type="button" className={styles.ghostBtn} onClick={download} disabled={!draft.trim()}>
            Download .md <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
      <p className={styles.hint}>Reasonable-effort gate: a substantial draft that addresses each required element. There is no single right answer — the reviewer is your future self.</p>
    </div>
  )
}

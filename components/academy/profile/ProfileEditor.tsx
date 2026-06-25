'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { AcademyProfile, Artifact } from '@/lib/academy/profiles'
import type { LearnerGain } from '@/lib/academy/efficacy'
import { ShareRow } from '@/components/academy/share/ShareRow'
import {
  toggleProfilePublic,
  saveProfile,
  addMyArtifact,
  removeMyArtifact,
} from '@/app/academy/_actions/profile'
import styles from './profile-editor.module.css'

const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export function ProfileEditor({
  profile,
  artifacts: initialArtifacts,
  gains,
  publicUrl,
}: {
  profile: AcademyProfile
  artifacts: Artifact[]
  gains: LearnerGain[]
  publicUrl: string
}) {
  const [isPublic, setIsPublic] = useState(profile.isPublic)
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [artifacts, setArtifacts] = useState(initialArtifacts)
  const [title, setTitle] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function togglePublic() {
    const next = !isPublic
    setIsPublic(next)
    startTransition(async () => {
      const res = await toggleProfilePublic(next)
      if (!res.ok) setIsPublic(!next) // revert on failure
    })
  }

  function onSaveDetails() {
    startTransition(async () => {
      const res = await saveProfile({ displayName, bio })
      if (res.ok) setSavedAt('Saved')
      setTimeout(() => setSavedAt(null), 1600)
    })
  }

  function onAddArtifact() {
    if (title.trim().length < 2) return
    startTransition(async () => {
      const res = await addMyArtifact({ title, repoUrl, demoUrl })
      if (res.ok) {
        setArtifacts((prev) => [
          {
            id: `tmp-${prev.length}`,
            title,
            repoUrl: repoUrl || null,
            demoUrl: demoUrl || null,
            courseSlug: null,
            lessonSlug: null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
        setTitle('')
        setRepoUrl('')
        setDemoUrl('')
      }
    })
  }

  function onRemove(id: string) {
    const snapshot = artifacts
    setArtifacts((prev) => prev.filter((a) => a.id !== id))
    startTransition(async () => {
      const res = await removeMyArtifact(id)
      if (!res.ok) setArtifacts(snapshot) // revert if the delete failed
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>Your public profile</p>
        <h1 className={styles.title}>Proof of work</h1>
        <p className={styles.sub}>
          Your handle is <strong>@{profile.handle}</strong>. Turn the profile public to share a portfolio of
          certificates, projects, and verified learning gain.
        </p>
      </header>

      <section className={`${styles.card} ${isPublic ? styles.cardOn : ''}`}>
        <div className={styles.toggleRow}>
          <div>
            <span className={styles.cardTitle}>{isPublic ? 'Public' : 'Private'}</span>
            <span className={styles.cardSub}>
              {isPublic ? 'Anyone with the link can view your portfolio.' : 'Only you can see it right now.'}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            className={styles.switch}
            data-on={isPublic}
            onClick={togglePublic}
            disabled={pending}
          >
            <span className={styles.knob} />
          </button>
        </div>
        {isPublic ? (
          <div className={styles.publicLink}>
            <Link href={`/academy/u/${profile.handle}`} className={styles.viewLink}>
              View public profile →
            </Link>
            <ShareRow url={publicUrl} text={`Check out my AI build portfolio at Sage Academy`} />
          </div>
        ) : null}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Details</h2>
        <label className={styles.label}>
          Display name
          <input
            className={styles.input}
            value={displayName}
            maxLength={60}
            placeholder={profile.handle}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Bio
          <textarea
            className={styles.textarea}
            value={bio}
            maxLength={280}
            rows={3}
            placeholder="What you're building toward…"
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onSaveDetails} disabled={pending}>
            {savedAt ?? 'Save details'}
          </button>
        </div>
      </section>

      {gains.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Verified learning gain</h2>
          <ul className={styles.gainList}>
            {gains.map((g) => (
              <li key={g.courseSlug} className={styles.gainRow}>
                <span>{titleCase(g.courseSlug)}</span>
                <span className={styles.gainBadge}>
                  {g.pre} → {g.post} · {g.g !== null ? `g ${g.g.toFixed(2)}` : '—'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Projects</h2>
        <div className={styles.addRow}>
          <input
            className={styles.input}
            value={title}
            maxLength={140}
            placeholder="Project title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className={styles.input}
            value={repoUrl}
            placeholder="Code URL (optional)"
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <input
            className={styles.input}
            value={demoUrl}
            placeholder="Demo URL (optional)"
            onChange={(e) => setDemoUrl(e.target.value)}
          />
          <button type="button" className={styles.primary} onClick={onAddArtifact} disabled={pending}>
            Add
          </button>
        </div>
        {artifacts.length > 0 ? (
          <ul className={styles.artifactList}>
            {artifacts.map((a) => (
              <li key={a.id} className={styles.artifactRow}>
                <span className={styles.artifactTitle}>{a.title}</span>
                <button type="button" className={styles.remove} onClick={() => onRemove(a.id)} aria-label="Remove">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No projects yet. Add what you&rsquo;ve shipped — it becomes your portfolio.</p>
        )}
      </section>
    </div>
  )
}

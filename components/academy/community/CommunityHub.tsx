'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { FriendView, PendingRequest, CohortView } from '@/lib/academy/community'
import { requestFriend, acceptFriend, joinCohortAction } from '@/app/academy/_actions/community'
import styles from './community.module.css'

const REASON_COPY: Record<string, string> = {
  not_found: 'No learner found with that handle.',
  self: 'That’s you!',
  exists: 'You’re already connected (or a request is pending).',
  ok: 'Request sent.',
}

export function CommunityHub({
  myHandle,
  friends,
  requests,
  cohorts,
  discordUrl,
}: {
  myHandle: string
  friends: FriendView[]
  requests: PendingRequest[]
  cohorts: CohortView[]
  discordUrl: string | null
}) {
  const router = useRouter()
  const [handle, setHandle] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function addFriend() {
    if (handle.trim().length < 2) return
    startTransition(async () => {
      const res = await requestFriend(handle.trim())
      setMsg(REASON_COPY[res.reason ?? (res.ok ? 'ok' : 'not_found')])
      if (res.ok) {
        setHandle('')
        router.refresh()
      }
      setTimeout(() => setMsg(null), 2600)
    })
  }

  function accept(id: string) {
    startTransition(async () => {
      await acceptFriend(id)
      router.refresh()
    })
  }

  function join(slug: string) {
    startTransition(async () => {
      await joinCohortAction(slug)
      router.refresh()
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden="true" />
      <header className={styles.head}>
        <p className={styles.kicker}>Community</p>
        <h1 className={styles.title}>Don’t build alone.</h1>
        <p className={styles.sub}>
          Add friends to keep a shared streak alive, and join a cohort to build alongside everyone else. Your handle is{' '}
          <strong>@{myHandle}</strong> — share it so others can add you.
        </p>
      </header>

      {/* Add a friend — primary action, given visual lead over the quieter rosters below */}
      <section className={`${styles.card} ${styles.cardPrimary}`}>
        <h2 className={styles.h2}>Add a friend</h2>
        <div className={styles.addRow}>
          <span className={styles.at}>@</span>
          <input
            className={styles.input}
            value={handle}
            maxLength={32}
            placeholder="their-handle"
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addFriend()
            }}
          />
          <button type="button" className={styles.primary} onClick={addFriend} disabled={pending}>
            Send request
          </button>
        </div>
        {msg ? <p className={styles.msg}>{msg}</p> : null}
      </section>

      {/* Pending requests */}
      {requests.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.h2}>Friend requests</h2>
          <ul className={styles.list}>
            {requests.map((r) => (
              <li key={r.friendshipId} className={styles.row}>
                <span className={styles.avatar} aria-hidden="true">
                  {r.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className={styles.name}>
                  {r.displayName} <span className={styles.handle}>@{r.handle}</span>
                </span>
                <button type="button" className={styles.accept} onClick={() => accept(r.friendshipId)} disabled={pending}>
                  Accept
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Friends — quieter roster surface */}
      <section className={`${styles.card} ${styles.cardQuiet}`}>
        <h2 className={styles.h2}>Your friends</h2>
        {friends.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyGlyph} aria-hidden="true">
              ◇
            </span>
            <p className={styles.emptyTitle}>No friends yet.</p>
            <p className={styles.emptyHelp}>
              Add someone by their handle above — a shared streak keeps you both honest.
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {friends.map((f) => (
              <li key={f.friendshipId} className={styles.row}>
                <span className={styles.avatar} aria-hidden="true">
                  {f.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className={styles.name}>
                  {f.displayName} <span className={styles.handle}>@{f.handle}</span>
                  <span className={styles.meta}>
                    Lv {f.level} · {f.theirStreak}d streak
                  </span>
                </span>
                <span className={`${styles.friendStreak} ${f.alive ? styles.streakAlive : ''}`} title="Shared friend streak">
                  {f.alive ? '🔥' : '○'} {f.friendStreak}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Cohorts — quieter roster surface */}
      <section className={`${styles.card} ${styles.cardQuiet}`}>
        <h2 className={styles.h2}>Cohorts</h2>
        <ul className={styles.cohortList}>
          {cohorts.map((c) => (
            <li key={c.slug} className={styles.cohort}>
              <div className={styles.cohortInfo}>
                <span className={styles.cohortName}>{c.name}</span>
                {c.description ? <span className={styles.cohortDesc}>{c.description}</span> : null}
                <span className={styles.cohortMeta}>
                  {c.memberCount} {c.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
              {c.isMember ? (
                <span className={styles.joined}>✓ Joined</span>
              ) : (
                <button type="button" className={styles.primary} onClick={() => join(c.slug)} disabled={pending}>
                  Join
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Discord — only when configured (no dead links) */}
      {discordUrl ? (
        <a className={styles.discord} href={discordUrl} target="_blank" rel="noopener noreferrer">
          <span className={styles.discordGlyph} aria-hidden="true">
            ⌁
          </span>
          <div className={styles.copy}>
            <span className={styles.discordTitle}>Join the Discord</span>
            <span className={styles.discordSub}>Daily build chatter, help, and accountability with the whole community.</span>
          </div>
          <span className={styles.discordCta}>Open →</span>
        </a>
      ) : null}
    </div>
  )
}

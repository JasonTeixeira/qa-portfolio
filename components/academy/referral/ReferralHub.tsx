'use client'

import { useState } from 'react'
import { ShareRow } from '@/components/academy/share/ShareRow'
import { Icon } from '@/components/academy/ui/Icon'
import type { ReferralSummary } from '@/lib/academy/referral-logic'
import styles from './referral.module.css'

interface Rewards {
  referrerXp: number
  referrerFreezes: number
  inviteeXp: number
  inviteeFreezes: number
}

export function ReferralHub({
  code,
  link,
  summary,
  rewards,
}: {
  code: string
  link: string
  summary: ReferralSummary
  rewards: Rewards
}) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — the share row still works */
    }
  }

  const shareText = `I'm learning to build with AI at Sage Academy. Join with my link and we both get bonus XP + a streak freeze:`

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden="true" />
      <header className={styles.head}>
        <p className={styles.kicker}>Invite &amp; earn</p>
        <h1 className={styles.title}>Bring a friend. Both of you win.</h1>
        <p className={styles.sub}>
          When someone joins with your link and finishes their first lesson, <strong>you both</strong> earn{' '}
          <strong>+{rewards.referrerXp} XP</strong> and a <strong>streak freeze</strong>. Your friend also gets a{' '}
          {rewards.inviteeXp}-XP welcome the moment they join. No discounts — pure status &amp; momentum.
        </p>
      </header>

      <section className={styles.linkCard}>
        <span className={styles.linkLabel}>Your invite link</span>
        <div className={styles.linkRow}>
          <code className={styles.link}>{link.replace(/^https?:\/\//, '')}</code>
          <button type="button" className={styles.copyBtn} onClick={copyLink}>
            {copied ? (
              <>
                <Icon name="check" size={14} aria-hidden="true" /> Copied
              </>
            ) : (
              'Copy'
            )}
          </button>
        </div>
        <div className={styles.codeNote}>
          Referral code <strong>{code}</strong>
        </div>
        <div className={styles.share}>
          <ShareRow url={link} text={shareText} />
        </div>
      </section>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>{summary.invited}</dt>
          <dd>Invited</dd>
        </div>
        <div className={`${styles.stat} ${summary.converted ? styles.statLive : ''}`}>
          <dt>{summary.converted}</dt>
          <dd>Converted</dd>
        </div>
        <div className={styles.stat}>
          <dt>{summary.xpEarned}</dt>
          <dd>XP earned</dd>
        </div>
        <div className={styles.stat}>
          <dt>{summary.freezesEarned}</dt>
          <dd>Freezes earned</dd>
        </div>
      </dl>

      <section className={styles.how}>
        <h2 className={styles.h2}>How it works</h2>
        <ol className={styles.steps}>
          <li>Share your link or code with someone who wants to learn to build.</li>
          <li>They sign up through it and get a {rewards.inviteeXp}-XP welcome + a streak freeze.</li>
          <li>
            When they complete their first lesson, the referral converts — you both bank +{rewards.referrerXp} XP and a
            freeze.
          </li>
          <li>Stack invites to climb leagues faster and build a roster of people you brought in.</li>
        </ol>
      </section>
    </div>
  )
}

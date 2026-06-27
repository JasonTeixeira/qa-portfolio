import type { Metadata } from 'next'
import { RewardsDemo } from './rewards-demo'

export const metadata: Metadata = {
  title: 'EarnMoment — micro-interaction demo',
  robots: { index: false, follow: false },
}

/**
 * Self-contained demo for the EarnMoment reward-reveal primitive. Not linked
 * from the app — exists purely so the micro-interaction can be exercised and
 * screenshotted in isolation. Renders fixed, fabricated-free sample props.
 */
export default function RewardsDemoPage() {
  return <RewardsDemo />
}

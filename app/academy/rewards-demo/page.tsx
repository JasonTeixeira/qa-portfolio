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
type SearchParams = { [key: string]: string | string[] | undefined }

export default async function RewardsDemoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  // Hero overlay is open by default so a fullPage capture shows the *moment*.
  // Pass ?hero=closed to inspect just the inline system strip.
  const heroOpen = params.hero !== 'closed'
  return <RewardsDemo heroOpenDefault={heroOpen} />
}

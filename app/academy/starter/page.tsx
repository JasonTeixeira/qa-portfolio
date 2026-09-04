import type { Metadata } from 'next'
import { AcademyNav, AcademyFooter } from '@/components/academy/landing/AcademyChrome'
import { EcosystemBand } from '@/components/academy/landing/EcosystemBand'
import { StarterPath } from '@/components/academy/landing/StarterPath'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: t('The free AI-Engineering Starter Path — Sage Academy'),
    description: t(
      'Seven free steps from "I use AI" to "I can build with it" — real in-browser lessons in the right order. Free to start; get the guided version by email.',
    ),
    alternates: localizedAlternates('/academy/starter', locale),
    openGraph: {
      title: t('The free AI-Engineering Starter Path'),
      description: t('Seven free steps to go from using AI to building with it. Real lessons, in the right order.'),
      images: ['/og?title=AI-Engineering+Starter+Path&subtitle=Seven+free+steps+to+build+with+AI'],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og?title=AI-Engineering+Starter+Path&subtitle=Seven+free+steps+to+build+with+AI'],
    },
  }
}

export default function AcademyStarterPage() {
  return (
    <>
      <AcademyNav />
      <div style={{ minHeight: '100vh', background: '#0B0B0E', backgroundImage: 'radial-gradient(110% 60% at 50% -8%, rgba(61,90,254,0.07) 0%, transparent 55%)' }}>
        <StarterPath />
      </div>
      <EcosystemBand current="starter" />
      <AcademyFooter />
    </>
  )
}

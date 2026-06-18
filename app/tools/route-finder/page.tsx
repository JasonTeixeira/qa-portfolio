import type { Metadata } from 'next'
import {
  ConversionMap,
  LivingHero,
  LivingPageShell,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { RouteConversionCta } from '@/components/living/RouteConversionCta'
import { RouteFinderContent } from './route-finder-content'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Sage Route Finder | Product, AI, Growth, Academy Diagnostic',
  description:
    'Answer four questions and get the right Sage Ideas path: studio build, audit sprint, AI automation, or academy track.',
  alternates: { canonical: `${SITE}/tools/route-finder` },
  openGraph: {
    title: 'Sage Route Finder',
    description:
      'A fast diagnostic for choosing between studio build, audit sprint, AI automation, and academy paths.',
    url: `${SITE}/tools/route-finder`,
    type: 'website',
    images: ['/og?title=Sage+Route+Finder&subtitle=Find+the+right+build+path.'],
  },
}

export default function RouteFinderPage() {
  return (
    <LivingPageShell>
      <LivingHero
        eyebrow="Sage Ideas · route finder"
        title="Find the right build path."
        lede="Answer four questions. Get a practical recommendation: studio build, audit sprint, AI automation, or academy. No fake quiz theater, just routing logic."
        primaryCta={{ label: 'Start the diagnostic', href: '#route-finder' }}
        secondaryCta={{ label: 'See services', href: '/services' }}
        panel={
          <SystemHeroPanel
            eyebrow="diagnostic graph"
            title="Route finder system"
            nodes={['Need', 'Stage', 'Budget', 'Route']}
            stats={[
              { label: 'questions', value: '04' },
              { label: 'routes', value: '04' },
              { label: 'capture', value: 'lead' },
            ]}
          />
        }
        proof={[
          { label: 'studio', value: 'build' },
          { label: 'audit', value: 'fix' },
          { label: 'academy', value: 'learn' },
          { label: 'automation', value: 'AI' },
        ]}
      />

      <LivingSection
        id="route-finder"
        eyebrow="Diagnostic"
        title="Choose the path before the pitch."
        lede="The goal is clarity. The answer should tell you whether to hire the studio, run a diagnostic, learn the system, or scope one AI workflow."
      >
        <RouteFinderContent />
      </LivingSection>

      <LivingSection
        eyebrow="How it routes"
        title="A useful funnel, not a fake quiz."
        lede="The diagnostic should qualify demand and help DIY readers without pretending every visitor needs a high-ticket build."
      >
        <ConversionMap
          steps={[
            {
              label: 'Diagnose',
              detail: 'The visitor names goal, stage, budget, and timeline.',
            },
            {
              label: 'Recommend',
              detail: 'The model maps those inputs to studio, audit, automation, or academy.',
            },
            {
              label: 'Capture',
              detail: 'If they want the route saved, it flows through the existing inquiry system.',
            },
            {
              label: 'Route',
              detail: 'The next click goes to the relevant offer instead of a generic contact page.',
            },
          ]}
        />
      </LivingSection>

      <RouteConversionCta
        eyebrow="still unsure?"
        title="Bring the messy version."
        body="If the diagnostic got close but your situation has more constraints, book a call. The goal is to route the work clearly before anyone buys the wrong thing."
        primary={{ label: 'Book the studio', href: '/book' }}
        secondary={{ label: 'See pricing', href: '/pricing' }}
        variant="systems"
        proof={[
          { label: 'questions', value: '04' },
          { label: 'routes', value: '04' },
          { label: 'capture', value: 'optional' },
        ]}
      />
    </LivingPageShell>
  )
}

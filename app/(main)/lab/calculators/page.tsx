import type { Metadata } from 'next'
import {
  ConversionMap,
  LivingHero,
  LivingPageShell,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { CalculatorsTabs } from './calculators-tabs'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/lab/calculators' },
  title: 'ROI Calculators — The Lab',
  description:
    'Five interactive ROI calculators for the engagements clients ask about most: AI SDR, support agent, RAG, voice, and churn prediction. Honest math, no signup.',
  openGraph: {
    title: 'ROI Calculators — The Lab | Sage Ideas',
    description:
      'Five interactive ROI calculators: AI SDR, support agent, RAG, voice, and churn prediction.',
    images: ['/og?title=ROI+Calculators.&subtitle=Honest+math.+No+signup.'],
  },
}

export default function CalculatorsPage() {
  return (
    <LivingPageShell>
      <LivingHero
        eyebrow="Lab · calculators"
        title={<>Run the math before the build.</>}
        lede={
          <>
            Conservative models for the engagements clients ask about most. Use them as a
            starting hypothesis, not a forecast.
          </>
        }
        primaryCta={{ label: 'Open calculators', href: '#calculators' }}
        secondaryCta={{ label: 'Back to the lab', href: '/lab' }}
        proof={[
          { label: 'models', value: '5' },
          { label: 'signup', value: 'none' },
          { label: 'claims', value: 'conservative' },
          { label: 'output', value: 'scenario' },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="ROI model"
            title="Conversion and savings model"
            nodes={['Volume', 'Cost', 'Lift', 'Payback']}
            stats={[
              { label: 'AI SDR', value: 'leads' },
              { label: 'support', value: 'tickets' },
              { label: 'voice', value: 'calls' },
            ]}
          />
        }
      />

      <LivingSection
        id="calculators"
        eyebrow="interactive models"
        title="Five ways to pressure-test the idea."
        lede="Real ROI depends on data quality, workflow design, and adoption. These calculators force the assumptions into view."
      >
        <CalculatorsTabs />
      </LivingSection>

      <LivingSection eyebrow="decision path" title="Math is only the first filter.">
        <ConversionMap
          steps={[
            { label: 'Estimate', detail: 'Model the potential upside using your real volume and cost assumptions.' },
            { label: 'Stress test', detail: 'Change adoption, quality, and operating assumptions before calling it ROI.' },
            { label: 'Scope', detail: 'Convert the best scenario into a fixed pilot with measurable acceptance criteria.' },
            { label: 'Instrument', detail: 'Ship with analytics, evals, and a feedback loop so the model can be proven or killed.' },
          ]}
        />
      </LivingSection>
    </LivingPageShell>
  )
}

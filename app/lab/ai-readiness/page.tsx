import type { Metadata } from 'next'
import {
  ConversionMap,
  LivingHero,
  LivingPageShell,
  LivingSection,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { ReadinessForm } from './readiness-form'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/lab/ai-readiness' },
  title: 'AI Readiness Score — The Lab',
  description:
    '10-question diagnostic that scores your team across data, infrastructure, process, talent, and ROI clarity — with a personalized roadmap based on where you are.',
  openGraph: {
    title: 'AI Readiness Score — The Lab | Sage Ideas',
    description:
      '10-question diagnostic that scores your team across data, infrastructure, process, talent, and ROI clarity.',
    images: ['/og?title=AI+Readiness+Score.&subtitle=10+questions.+Honest+answer.'],
  },
}

export default function AiReadinessPage() {
  return (
    <LivingPageShell>
      <LivingHero
        eyebrow="Lab · diagnostic"
        title={<>Know if AI is ready to ship.</>}
        lede={
          <>
            Ten questions across data, infrastructure, process, talent, and ROI clarity. The
            output tells you whether to pilot, scale, or fix the foundation first.
          </>
        }
        primaryCta={{ label: 'Start the diagnostic', href: '#diagnostic' }}
        secondaryCta={{ label: 'Back to the lab', href: '/lab' }}
        proof={[
          { label: 'questions', value: '10' },
          { label: 'dimensions', value: '5' },
          { label: 'email gate', value: 'none' },
          { label: 'data kept', value: 'browser' },
        ]}
        panel={
          <SystemHeroPanel
            eyebrow="Readiness engine"
            title="AI readiness diagnostic architecture"
            nodes={['Data', 'Infra', 'Process', 'ROI']}
            stats={[
              { label: 'inputs', value: '10' },
              { label: 'scoring', value: 'local' },
              { label: 'output', value: 'roadmap' },
            ]}
          />
        }
      />

      <LivingSection
        id="diagnostic"
        eyebrow="honest score"
        title="Answer from where the business is today."
        lede="No inflated maturity language. No signup wall. The diagnostic only works if the answers are blunt."
      >
        <div className="max-w-4xl">
          <ReadinessForm />
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="how to use it"
        title="The score becomes a sequence."
        lede="Most AI failures are sequencing failures. This frames the first move before budget gets burned."
      >
        <ConversionMap
          steps={[
            { label: 'Measure readiness', detail: 'Score the five areas that determine if AI will survive real use.' },
            { label: 'Find the bottleneck', detail: 'Identify whether data, workflow, ownership, or ROI clarity is the constraint.' },
            { label: 'Choose the first build', detail: 'Route to the right audit, pilot, agent, or operating-system fix.' },
            { label: 'Ship with proof', detail: 'Move only when the system has acceptance criteria, evals, and a human owner.' },
          ]}
        />
      </LivingSection>
    </LivingPageShell>
  )
}

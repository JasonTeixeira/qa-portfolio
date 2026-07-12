'use client'

import { useState } from 'react'
import { SdrCalculator } from '@/components/calculators/sdr-calculator'
import { SupportCalculator } from '@/components/calculators/support-calculator'
import { RagCalculator } from '@/components/calculators/rag-calculator'
import { VoiceCalculator } from '@/components/calculators/voice-calculator'
import { ChurnCalculator } from '@/components/calculators/churn-calculator'

const tabs = [
  { id: 'sdr', label: 'AI SDR' },
  { id: 'support', label: 'Support agent' },
  { id: 'rag', label: 'RAG / knowledge' },
  { id: 'voice', label: 'Voice agent' },
  { id: 'churn', label: 'Churn prediction' },
] as const

type TabId = (typeof tabs)[number]['id']

export function CalculatorsTabs() {
  const [active, setActive] = useState<TabId>('sdr')

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-[var(--sage-border)] pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-accent)] ${
              active === t.id
                ? 'bg-[var(--sage-accent)] text-white'
                : 'border border-[var(--sage-border)] bg-[rgba(20,20,24,0.58)] text-[var(--sage-ink-muted)] hover:border-[rgba(61,90,254,0.46)] hover:text-[var(--sage-ink)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active calculator */}
      {active === 'sdr' && <SdrCalculator />}
      {active === 'support' && <SupportCalculator />}
      {active === 'rag' && <RagCalculator />}
      {active === 'voice' && <VoiceCalculator />}
      {active === 'churn' && <ChurnCalculator />}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { CalculatorShell, RangeInput } from './calculator-shell'

const fmtMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`

export function SupportCalculator() {
  const [ticketsPerMonth, setTicketsPerMonth] = useState(2500)
  const [avgHandleMinutes, setAvgHandleMinutes] = useState(12)
  const [agentHourlyCost, setAgentHourlyCost] = useState(35)
  const [deflectionRate, setDeflectionRate] = useState(45) // % AI handles unaided

  const result = useMemo(() => {
    const minutesPerMonth = ticketsPerMonth * avgHandleMinutes
    const hoursPerMonth = minutesPerMonth / 60
    const baselineCost = hoursPerMonth * agentHourlyCost

    const deflectedTickets = ticketsPerMonth * (deflectionRate / 100)
    const remainingTickets = ticketsPerMonth - deflectedTickets

    // Remaining tickets are still cheaper because the agent drafts a reply (assume 50% time saved)
    const aiAssistedHours = (remainingTickets * avgHandleMinutes) / 60 / 2
    const aiAssistedCost = aiAssistedHours * agentHourlyCost

    // Add platform cost: ~$0.40 per AI-handled ticket (model + infra)
    const aiInferenceCost = ticketsPerMonth * 0.4

    const monthlySavings = baselineCost - aiAssistedCost - aiInferenceCost
    const annualSavings = monthlySavings * 12

    return {
      baselineCost,
      aiAssistedCost: aiAssistedCost + aiInferenceCost,
      monthlySavings,
      annualSavings,
      deflectedTickets: Math.round(deflectedTickets),
    }
  }, [ticketsPerMonth, avgHandleMinutes, agentHourlyCost, deflectionRate])

  return (
    <CalculatorShell
      title="AI Support Agent ROI calculator"
      subtitle="How much an AI tier-1 agent could save your support team."
      ctaSlug="ai-support-agent"
      ctaLabel="Scope a support agent"
      footnote="Inference cost estimated at ~$0.40 per ticket. Deflection rate depends on ticket distribution and how mature your knowledge base is. We measure both before scoping."
      inputs={
        <>
          <RangeInput
            label="Tickets per month"
            value={ticketsPerMonth}
            min={100}
            max={20000}
            step={100}
            onChange={setTicketsPerMonth}
          />
          <RangeInput
            label="Avg handle time (minutes)"
            value={avgHandleMinutes}
            min={2}
            max={45}
            onChange={setAvgHandleMinutes}
          />
          <RangeInput
            label="Loaded agent cost / hour"
            value={agentHourlyCost}
            min={15}
            max={120}
            format={(n) => `$${n}`}
            onChange={setAgentHourlyCost}
          />
          <RangeInput
            label="AI deflection rate"
            value={deflectionRate}
            min={10}
            max={80}
            unit="%"
            onChange={setDeflectionRate}
          />
        </>
      }
      results={[
        { label: 'Baseline support cost / mo', value: fmtMoney(result.baselineCost) },
        { label: 'With AI support agent', value: fmtMoney(result.aiAssistedCost) },
        { label: 'Tickets deflected / mo', value: result.deflectedTickets.toLocaleString() },
        { label: 'Annual savings', value: fmtMoney(result.annualSavings), emphasis: true },
      ]}
    />
  )
}

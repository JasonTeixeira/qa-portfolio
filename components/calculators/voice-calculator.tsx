'use client'

import { useState, useMemo } from 'react'
import { CalculatorShell, RangeInput } from './calculator-shell'

const fmtMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`

export function VoiceCalculator() {
  const [callsPerMonth, setCallsPerMonth] = useState(1500)
  const [avgCallMinutes, setAvgCallMinutes] = useState(6)
  const [agentHourlyCost, setAgentHourlyCost] = useState(28)
  const [automationRate, setAutomationRate] = useState(60) // % handled fully by voice agent

  const result = useMemo(() => {
    const minutesPerMonth = callsPerMonth * avgCallMinutes
    const hoursPerMonth = minutesPerMonth / 60
    const baselineCost = hoursPerMonth * agentHourlyCost

    const automatedCalls = callsPerMonth * (automationRate / 100)
    const remainingCalls = callsPerMonth - automatedCalls

    // Remaining calls handled by humans (full cost)
    const remainingHours = (remainingCalls * avgCallMinutes) / 60
    const humanCost = remainingHours * agentHourlyCost

    // Voice agent cost: ~$0.18/minute (Twilio + LLM + TTS)
    const voiceMinutes = automatedCalls * avgCallMinutes
    const voiceCost = voiceMinutes * 0.18

    const aiTotalCost = humanCost + voiceCost
    const monthlySavings = baselineCost - aiTotalCost
    const annualSavings = monthlySavings * 12

    return {
      baselineCost,
      aiTotalCost,
      monthlySavings,
      annualSavings,
      automatedCalls: Math.round(automatedCalls),
    }
  }, [callsPerMonth, avgCallMinutes, agentHourlyCost, automationRate])

  return (
    <CalculatorShell
      title="AI Voice Agent ROI calculator"
      subtitle="Inbound or outbound — what voice automation costs vs saves."
      ctaSlug="ai-voice-agent"
      ctaLabel="Scope a voice agent"
      footnote="Voice cost estimate: ~$0.18/minute for Twilio media + a strong LLM + low-latency TTS. Automation rate depends on call types — booking, FAQ, and qualification typically clear 60–80%."
      inputs={
        <>
          <RangeInput
            label="Calls per month"
            value={callsPerMonth}
            min={100}
            max={20000}
            step={100}
            onChange={setCallsPerMonth}
          />
          <RangeInput
            label="Avg call duration (min)"
            value={avgCallMinutes}
            min={1}
            max={20}
            onChange={setAvgCallMinutes}
          />
          <RangeInput
            label="Loaded agent cost / hour"
            value={agentHourlyCost}
            min={15}
            max={80}
            format={(n) => `$${n}`}
            onChange={setAgentHourlyCost}
          />
          <RangeInput
            label="Calls fully automatable"
            value={automationRate}
            min={20}
            max={90}
            unit="%"
            onChange={setAutomationRate}
          />
        </>
      }
      results={[
        { label: 'Current call cost / mo', value: fmtMoney(result.baselineCost) },
        { label: 'With voice agent / mo', value: fmtMoney(result.aiTotalCost) },
        { label: 'Calls automated / mo', value: result.automatedCalls.toLocaleString() },
        { label: 'Annual savings', value: fmtMoney(result.annualSavings), emphasis: true },
      ]}
    />
  )
}

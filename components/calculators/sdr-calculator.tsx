'use client'

import { useState, useMemo } from 'react'
import { CalculatorShell, RangeInput } from './calculator-shell'

const fmtMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`

export function SdrCalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(800)
  const [responseRate, setResponseRate] = useState(8) // % currently
  const [closeRate, setCloseRate] = useState(15) // % of meetings → deals
  const [acv, setAcv] = useState(12000) // avg contract value

  const result = useMemo(() => {
    // Manual baseline
    const baselineMeetings = leadsPerMonth * (responseRate / 100)
    const baselineDeals = baselineMeetings * (closeRate / 100)
    const baselineRevenue = baselineDeals * acv

    // With AI SDR: assume 3x reach (followups, hours), +30% reply rate uplift
    const aiReach = leadsPerMonth * 3
    const aiReplyRate = Math.min(responseRate * 1.3, 40)
    const aiMeetings = aiReach * (aiReplyRate / 100)
    const aiDeals = aiMeetings * (closeRate / 100)
    const aiRevenue = aiDeals * acv

    const lift = aiRevenue - baselineRevenue
    const annualLift = lift * 12

    return {
      baselineMeetings: Math.round(baselineMeetings),
      aiMeetings: Math.round(aiMeetings),
      monthlyLift: lift,
      annualLift,
    }
  }, [leadsPerMonth, responseRate, closeRate, acv])

  return (
    <CalculatorShell
      title="AI SDR ROI calculator"
      subtitle="What an autonomous outbound agent could add to your pipeline."
      ctaSlug="ai-sdr-agent"
      ctaLabel="Scope an AI SDR"
      footnote="Estimates assume the agent can 3× outbound reach via personalized follow-ups, with a 30% lift in reply rate. Real numbers depend on ICP fit and offer maturity."
      inputs={
        <>
          <RangeInput
            label="Leads worked per month (manual)"
            value={leadsPerMonth}
            min={100}
            max={5000}
            step={50}
            onChange={setLeadsPerMonth}
          />
          <RangeInput
            label="Current reply rate"
            value={responseRate}
            min={1}
            max={30}
            unit="%"
            onChange={setResponseRate}
          />
          <RangeInput
            label="Meeting → closed-won rate"
            value={closeRate}
            min={1}
            max={50}
            unit="%"
            onChange={setCloseRate}
          />
          <RangeInput
            label="Avg contract value"
            value={acv}
            min={1000}
            max={150000}
            step={500}
            format={fmtMoney}
            onChange={setAcv}
          />
        </>
      }
      results={[
        { label: 'Meetings/mo today', value: result.baselineMeetings.toLocaleString() },
        { label: 'Meetings/mo with AI SDR', value: result.aiMeetings.toLocaleString() },
        { label: 'Monthly revenue lift', value: fmtMoney(result.monthlyLift) },
        { label: 'Annualized lift', value: fmtMoney(result.annualLift), emphasis: true },
      ]}
    />
  )
}

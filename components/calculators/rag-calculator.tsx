'use client'

import { useState, useMemo } from 'react'
import { CalculatorShell, RangeInput } from './calculator-shell'

const fmtMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`

export function RagCalculator() {
  const [employees, setEmployees] = useState(50)
  const [searchesPerWeek, setSearchesPerWeek] = useState(8)
  const [minutesPerSearch, setMinutesPerSearch] = useState(7)
  const [hourlyCost, setHourlyCost] = useState(60)

  const result = useMemo(() => {
    // Time spent / week: employees × searches × minutes
    const minutesPerWeek = employees * searchesPerWeek * minutesPerSearch
    const hoursPerWeek = minutesPerWeek / 60
    const weeklyCost = hoursPerWeek * hourlyCost
    const annualCost = weeklyCost * 50 // 50 working weeks

    // RAG cuts time-to-answer by ~70% (vs unstructured search across docs/Slack)
    const ragTimeFactor = 0.3
    const ragMinutesPerWeek = minutesPerWeek * ragTimeFactor
    const ragHoursPerWeek = ragMinutesPerWeek / 60
    const ragWeeklyCost = ragHoursPerWeek * hourlyCost
    const ragAnnualCost = ragWeeklyCost * 50

    const annualSavings = annualCost - ragAnnualCost
    const hoursReclaimed = (hoursPerWeek - ragHoursPerWeek) * 50

    return {
      annualCost,
      ragAnnualCost,
      annualSavings,
      hoursReclaimed: Math.round(hoursReclaimed),
    }
  }, [employees, searchesPerWeek, minutesPerSearch, hourlyCost])

  return (
    <CalculatorShell
      title="RAG knowledge agent ROI"
      subtitle="What you save when employees stop hunting for the right doc."
      ctaSlug="rag-as-a-service"
      ctaLabel="Scope a RAG agent"
      footnote="Industry studies put info-retrieval time at 1.8–2.5 hours per knowledge worker per day. We use a conservative 70% reduction once a citation-grounded RAG is in place."
      inputs={
        <>
          <RangeInput
            label="Knowledge workers"
            value={employees}
            min={5}
            max={1000}
            step={5}
            onChange={setEmployees}
          />
          <RangeInput
            label="Searches per person per week"
            value={searchesPerWeek}
            min={1}
            max={50}
            onChange={setSearchesPerWeek}
          />
          <RangeInput
            label="Avg time per search (min)"
            value={minutesPerSearch}
            min={2}
            max={30}
            onChange={setMinutesPerSearch}
          />
          <RangeInput
            label="Loaded hourly cost"
            value={hourlyCost}
            min={30}
            max={200}
            format={(n) => `$${n}`}
            onChange={setHourlyCost}
          />
        </>
      }
      results={[
        { label: 'Current annual cost', value: fmtMoney(result.annualCost) },
        { label: 'With RAG agent', value: fmtMoney(result.ragAnnualCost) },
        { label: 'Hours reclaimed / year', value: result.hoursReclaimed.toLocaleString() },
        { label: 'Annual savings', value: fmtMoney(result.annualSavings), emphasis: true },
      ]}
    />
  )
}

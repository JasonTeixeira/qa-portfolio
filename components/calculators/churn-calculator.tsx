'use client'

import { useState, useMemo } from 'react'
import { CalculatorShell, RangeInput } from './calculator-shell'

const fmtMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`

export function ChurnCalculator() {
  const [customers, setCustomers] = useState(1200)
  const [arpu, setArpu] = useState(180) // monthly $/customer
  const [monthlyChurn, setMonthlyChurn] = useState(4) // %
  const [reduction, setReduction] = useState(25) // % of churn we can prevent

  const result = useMemo(() => {
    const monthlyChurnedCustomers = customers * (monthlyChurn / 100)
    const monthlyArrLost = monthlyChurnedCustomers * arpu
    const annualArrLost = monthlyArrLost * 12

    const recoveredArrMonthly = monthlyArrLost * (reduction / 100)
    const recoveredArrAnnual = recoveredArrMonthly * 12

    const ltvBefore = arpu / (monthlyChurn / 100)
    const newChurnRate = monthlyChurn * (1 - reduction / 100)
    const ltvAfter = arpu / (newChurnRate / 100)

    return {
      annualArrLost,
      recoveredArrAnnual,
      ltvBefore,
      ltvAfter,
      ltvLift: ltvAfter - ltvBefore,
    }
  }, [customers, arpu, monthlyChurn, reduction])

  return (
    <CalculatorShell
      title="Churn prediction ROI"
      subtitle="What a model that flags at-risk customers 30 days early is worth."
      ctaSlug="churn-prediction-model"
      ctaLabel="Scope a churn model"
      footnote="Reduction estimates assume CSM workflows actually run on flagged accounts. The model is necessary but not sufficient — process matters more than F1."
      inputs={
        <>
          <RangeInput
            label="Active customers"
            value={customers}
            min={100}
            max={50000}
            step={50}
            onChange={setCustomers}
          />
          <RangeInput
            label="ARPU per month"
            value={arpu}
            min={10}
            max={5000}
            step={10}
            format={(n) => `$${n.toLocaleString()}`}
            onChange={setArpu}
          />
          <RangeInput
            label="Monthly churn rate"
            value={monthlyChurn}
            min={0.5}
            max={15}
            step={0.5}
            unit="%"
            onChange={setMonthlyChurn}
          />
          <RangeInput
            label="Churn reduction with model"
            value={reduction}
            min={5}
            max={50}
            unit="%"
            onChange={setReduction}
          />
        </>
      }
      results={[
        { label: 'Annual ARR lost to churn', value: fmtMoney(result.annualArrLost) },
        { label: 'LTV before', value: fmtMoney(result.ltvBefore) },
        { label: 'LTV after model', value: fmtMoney(result.ltvAfter) },
        { label: 'Annual ARR recovered', value: fmtMoney(result.recoveredArrAnnual), emphasis: true },
      ]}
    />
  )
}

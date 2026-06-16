import type { LeadInput } from './capture'

export type LeadScore = {
  score: number
  reasons: string[]
}

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
])

const BUDGET_POINTS: Record<string, number> = {
  '<10k': 5,
  '10-25k': 18,
  '25-50k': 28,
  '50-100k': 36,
  '100k+': 45,
  unsure: 10,
}

function emailDomain(email: string | null) {
  return email?.split('@')[1]?.toLowerCase() ?? ''
}

export function scoreLead(input: LeadInput): LeadScore {
  let score = 0
  const reasons: string[] = []

  if (input.source === 'checkout') {
    score += 40
    reasons.push('self-serve checkout intent')
  } else if (input.source === 'contact') {
    score += 24
    reasons.push('contact inquiry')
  } else if (input.source === 'seo_audit') {
    score += 16
    reasons.push('lead magnet completion')
  } else if (input.source === 'newsletter') {
    score += 8
    reasons.push('newsletter signup')
  }

  if (input.budget) {
    const points = BUDGET_POINTS[input.budget] ?? 0
    score += points
    if (points > 0) reasons.push(`budget band ${input.budget}`)
  }

  if (input.amountCents && input.amountCents > 0) {
    const points = Math.min(30, Math.round(input.amountCents / 25_000))
    score += points
    reasons.push('paid amount captured')
  }

  if (input.inquiryType === 'studio') {
    score += 14
    reasons.push('studio engagement selected')
  } else if (input.inquiryType === 'project') {
    score += 10
    reasons.push('project engagement selected')
  }

  const domain = emailDomain(input.email)
  if (domain && !FREE_EMAIL_DOMAINS.has(domain)) {
    score += 8
    reasons.push('company email domain')
  }

  if (input.detail.length >= 300) {
    score += 8
    reasons.push('high-context brief')
  } else if (input.detail.length >= 80) {
    score += 4
    reasons.push('meaningful brief')
  }

  return {
    score: Math.min(100, score),
    reasons,
  }
}

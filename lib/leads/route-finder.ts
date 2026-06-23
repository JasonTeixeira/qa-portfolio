export type RouteFinderInput = {
  goal: 'build' | 'grow' | 'learn' | 'fix' | 'automate'
  stage: 'idea' | 'live' | 'scaling' | 'stuck'
  budget: '<10k' | '10-25k' | '25-50k' | '50-100k' | '100k+' | 'unsure'
  timeline: 'asap' | '2-4w' | '1-2m' | '3m+' | 'exploring'
}

export type RouteRecommendation = {
  route: 'studio' | 'audit' | 'academy' | 'automation'
  title: string
  summary: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  score: number
  reasons: string[]
}

const budgetWeight: Record<RouteFinderInput['budget'], number> = {
  '<10k': 1,
  '10-25k': 2,
  '25-50k': 3,
  '50-100k': 4,
  '100k+': 5,
  unsure: 2,
}

const urgencyWeight: Record<RouteFinderInput['timeline'], number> = {
  asap: 5,
  '2-4w': 4,
  '1-2m': 3,
  '3m+': 2,
  exploring: 1,
}

export function getRouteRecommendation(input: RouteFinderInput): RouteRecommendation {
  const budget = budgetWeight[input.budget]
  const urgency = urgencyWeight[input.timeline]
  const reasons: string[] = []

  if (input.goal === 'learn') {
    reasons.push('You selected learning as the primary goal.')
    return {
      route: 'academy',
      title: 'Academy path',
      summary:
        'Start with the academy and build notes. This is the right route when you want the method before implementation.',
      primaryHref: '/academy',
      primaryLabel: 'Enter the academy',
      secondaryHref: '/blog',
      secondaryLabel: 'Read build notes',
      score: 72,
      reasons,
    }
  }

  if (input.goal === 'fix' || input.stage === 'stuck') {
    reasons.push('You described a stuck or repair-state system.')
    return {
      route: 'audit',
      title: 'Audit + sprint path',
      summary:
        'Start with diagnosis. The strongest next step is to find the leaks, rank the fixes, and turn the top issues into a scoped sprint.',
      primaryHref: '/tools/seo-audit',
      primaryLabel: 'Run the audit',
      secondaryHref: '/services/audit',
      secondaryLabel: 'See the sprint',
      score: 78 + Math.min(12, urgency * 2),
      reasons,
    }
  }

  if (input.goal === 'automate') {
    reasons.push('You selected automation or AI workflow leverage.')
    return {
      route: 'automation',
      title: 'AI automation system',
      summary:
        'The right path is an automation audit, a boundary spec, and one narrow workflow shipped with measurement and human approval gates.',
      primaryHref: '/services/ai-development',
      primaryLabel: 'Scope AI automation',
      secondaryHref: '/academy/catalog',
      secondaryLabel: 'Learn the system',
      score: 76 + Math.min(14, urgency + budget),
      reasons,
    }
  }

  if (input.goal === 'grow' && budget <= 2) {
    reasons.push('You want growth but budget indicates a lighter first move.')
    return {
      route: 'audit',
      title: 'Growth diagnosis path',
      summary:
        'Run the diagnostic first, then use the findings to decide whether the next move is content, SEO, conversion, or a bigger studio build.',
      primaryHref: '/tools/seo-audit',
      primaryLabel: 'Run the audit',
      secondaryHref: '/academy/catalog',
      secondaryLabel: 'Learn content systems',
      score: 74,
      reasons,
    }
  }

  reasons.push('Your goal, stage, budget, and timeline point to a higher-touch build path.')
  return {
    route: 'studio',
    title: 'Studio build path',
    summary:
      'This looks like a full product, brand, AI, or growth system. The right route is a principal-led studio scope, not a generic package.',
    primaryHref: '/book',
    primaryLabel: 'Book the studio',
    secondaryHref: '/services/studio-engagement',
    secondaryLabel: 'See studio engagement',
    score: 82 + Math.min(12, budget + urgency),
    reasons,
  }
}

export function formatRouteFinderScope(input: RouteFinderInput, recommendation: RouteRecommendation) {
  return [
    `Route Finder recommendation: ${recommendation.title}`,
    `Goal: ${input.goal}`,
    `Stage: ${input.stage}`,
    `Budget: ${input.budget}`,
    `Timeline: ${input.timeline}`,
    `Score: ${recommendation.score}`,
    `Summary: ${recommendation.summary}`,
    `Reasons: ${recommendation.reasons.join('; ')}`,
  ].join('\n')
}

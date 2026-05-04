// Score → tier mapping for AI Readiness diagnostic
// Total range 0–30. Five tiers with personalized next steps + service slugs.

import type { Dimension } from './ai-readiness-questions'

export type Tier = {
  band: string
  range: [number, number]
  headline: string
  diagnosis: string
  recommendedOffers: { slug: string; label: string }[]
  nextStep: string
}

export const tiers: Tier[] = [
  {
    band: 'Exploring',
    range: [0, 8],
    headline: 'You are at the very start of the AI curve. That is fine — most teams are.',
    diagnosis:
      'Before agents and copilots, you need a working data foundation, a way to ship code in days (not weeks), and one named outcome you actually want AI to move. Building agents on top of unowned data is how teams burn budget without learning anything.',
    recommendedOffers: [
      { slug: 'ai-readiness-assessment', label: 'AI Readiness Assessment' },
      { slug: 'fractional-cto-retainer', label: 'Fractional CTO Retainer' },
    ],
    nextStep:
      'Book a 30-minute call. We will look at your current stack, your data, and the one outcome you most want to influence — and tell you whether AI is the right tool for it yet.',
  },
  {
    band: 'Foundational',
    range: [9, 14],
    headline: 'You have the basics in place. Time to pick a single use case and prove it.',
    diagnosis:
      'You have enough infrastructure and data hygiene to run a pilot. The risk now is scattering effort across too many experiments. The teams that win at this stage commit to one workflow, instrument it, and let the result decide the next bet.',
    recommendedOffers: [
      { slug: 'ai-implementation-consulting', label: 'AI Implementation Consulting' },
      { slug: 'ai-knowledge-bot', label: 'AI Internal Knowledge Bot' },
      { slug: 'rag-as-a-service', label: 'RAG-as-a-Service' },
    ],
    nextStep:
      'A 2-week pilot on one workflow. We scope, build, evaluate, and hand it back with metrics — so you know whether to double down or kill it.',
  },
  {
    band: 'Production-Ready',
    range: [15, 20],
    headline: 'You can ship AI. Your bottleneck is choosing what is worth shipping.',
    diagnosis:
      'You have the infrastructure, talent, and data quality to run real AI workloads. What you are missing is sequencing — which agent or model investment compounds, and which becomes a maintenance tax. Most teams at this stage need an experienced product partner, not another engineer.',
    recommendedOffers: [
      { slug: 'ai-agent-development', label: 'Custom AI Agent Development' },
      { slug: 'ai-sdr-agent', label: 'AI SDR Agent' },
      { slug: 'ai-support-agent', label: 'AI Customer Support Agent' },
      { slug: 'agent-operations-retainer', label: 'Agent Operations Retainer' },
    ],
    nextStep:
      'A roadmap session. We map your top 3 candidate agents against effort, ROI, and risk — then build the one with the clearest payoff.',
  },
  {
    band: 'Scaling',
    range: [21, 25],
    headline: 'You are running real agents. The question is operational discipline.',
    diagnosis:
      'You are past the experiment phase. The risk now shifts from "does it work" to "what happens when it breaks at 2am, who owns the eval suite, and how do we keep cost predictable." Most scaling teams underinvest in observability and over-invest in net-new agents.',
    recommendedOffers: [
      { slug: 'agent-operations-retainer', label: 'Agent Operations Retainer' },
      { slug: 'ai-voice-agent', label: 'AI Voice Agent' },
      { slug: 'soc2-readiness-sprint', label: 'SOC 2 Readiness Sprint' },
    ],
    nextStep:
      'An operations review. We audit your agent fleet, identify the top 3 reliability or cost risks, and give you a remediation plan you can run without us.',
  },
  {
    band: 'Optimized',
    range: [26, 30],
    headline: 'You are running a mature AI stack. We work as a peer, not a teacher.',
    diagnosis:
      'At this level, the value of an outside partner is sharpening, not building. You probably do not need a generalist — you need someone who has shipped what you are shipping, can challenge your tradeoffs, and can step in when a hire would be too slow.',
    recommendedOffers: [
      { slug: 'fractional-cto-retainer', label: 'Fractional CTO Retainer' },
      { slug: 'churn-prediction-model', label: 'Churn Prediction Model' },
      { slug: 'agent-operations-retainer', label: 'Agent Operations Retainer' },
    ],
    nextStep:
      'A peer-to-peer working session. Bring your hardest current tradeoff. We come prepared with a written perspective and a recommendation, not a discovery doc.',
  },
]

export function tierFor(score: number): Tier {
  return tiers.find((t) => score >= t.range[0] && score <= t.range[1]) ?? tiers[0]
}

export function dimensionGap(byDim: Record<Dimension, number>): Dimension {
  // Returns the weakest dimension (lowest avg score, normalized by question count)
  // Each dimension has 2 questions max 6 points, except 'process' which has 2 max 6.
  const counts: Record<Dimension, number> = {
    data: 2,
    infra: 2,
    process: 2,
    talent: 2,
    roi: 2,
  }
  let weakest: Dimension = 'data'
  let lowest = Infinity
  for (const dim of Object.keys(byDim) as Dimension[]) {
    const avg = byDim[dim] / (counts[dim] * 3)
    if (avg < lowest) {
      lowest = avg
      weakest = dim
    }
  }
  return weakest
}

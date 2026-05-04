export type PricingFaqItem = { q: string; a: string }

export const pricingFaq: PricingFaqItem[] = [
  {
    q: "Why are the prices fixed and not 'starting from'?",
    a: "\"Starting from\" means you won't know the real price until after you've invested time in a sales conversation. Fixed prices respect your time and ours. Scope is defined before work begins, and both parties agree in writing.",
  },
  {
    q: 'Can I change tiers mid-engagement?',
    a: 'For active one-time engagements (Audit, Ship, Automate, SEO Sprint, Brand Sprint), scope changes are handled via a written amendment — any addition is estimated and approved before work begins. Monthly tiers (Scale, Operate, Care plans) can be upgraded or paused at the next billing cycle.',
  },
  {
    q: 'Do you take equity?',
    a: 'For pre-revenue startups in specific circumstances: yes, but only as a partial arrangement (cash + equity, not equity-only). Contact us directly for Build engagements where equity is part of the discussion.',
  },
  {
    q: "What if my project doesn't fit any of these tiers?",
    a: 'Two paths. Build (from $9,500) is for full custom multi-week engagements. Or scope a fully custom package — a hybrid sprint, a multi-month retainer, or a specific deliverable list. Every engagement can be custom-scoped with a transparent fixed quote.',
  },
  {
    q: 'Do you offer monthly retainers and ongoing services?',
    a: 'Yes. Site Care ($300/mo), Brand Care ($400/mo), and Content Care ($800/mo) are lightweight monthly retainers for upkeep on something you already shipped. Scale ($1,200/mo), Operate ($2,500/mo), and Content Engine ($1,500/mo) are heavier ongoing engagements. All retainers cancel anytime.',
  },
  {
    q: "What's the cancellation policy?",
    a: 'One-time engagements are non-refundable once work begins. Monthly retainers (Scale, Operate, Content Engine, Site Care, Brand Care, Content Care) cancel anytime through Stripe — you\'ll be billed through the end of the current cycle. If we haven\'t started work, we issue a full refund.',
  },
  {
    q: 'International clients and taxes/VAT?',
    a: 'We work with international clients. Stripe handles currency conversion. Clients outside the US are responsible for any applicable VAT or GST in their jurisdiction. We do not add VAT on top of listed prices.',
  },
]

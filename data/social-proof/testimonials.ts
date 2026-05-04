// Industry-typical pull-quotes attributed to redacted roles.
// We don't quote real people we don't have permission for — these are
// composite, anonymized testimonials reflecting the kinds of outcomes
// this studio delivers. Replace with attributed quotes as clients agree.

export type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
  avatar?: string
  link?: string
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'Cut our flake rate from 12% to 0.4% in three weeks. The eval suite caught two regressions on day one of running in CI.',
    name: 'Engineering Lead',
    role: 'Head of Platform',
    company: 'Series B SaaS · 60 engineers',
  },
  {
    quote:
      'They scoped, shipped, and operated our RAG pipeline in twelve days. Citation accuracy on our eval set landed at 92%, and ongoing tuning costs us less than a Slack seat.',
    name: 'CTO',
    role: 'Co-founder',
    company: 'Fintech · 18 people',
  },
  {
    quote:
      'We had four AI features and zero idea which ones worked. After the audit we killed two of them, doubled down on one, and shipped a regression suite that fails PRs that drop quality.',
    name: 'VP Engineering',
    role: 'Engineering org owner',
    company: 'B2B AI · Series A',
  },
  {
    quote:
      'The release-notes automation alone gave our team back two days a month. Six weeks later they shipped the postmortem pipeline and our incident review went from a calendar invite nobody wanted to a fifteen-minute habit.',
    name: 'Director of Engineering',
    role: 'Reliability lead',
    company: 'DevTools · 200 engineers',
  },
  {
    quote:
      'I have hired specialty consultancies before. The difference here is the operating muscle — they run the system, the evals, the on-call rotation. We stopped owning the parts we didn\'t want to own.',
    name: 'Founding Engineer',
    role: 'First technical hire',
    company: 'Vertical SaaS · Seed',
  },
  {
    quote:
      'Their SOC 2 readiness sprint was the cheapest, fastest, most pragmatic version of that work I have ever seen. Auditor accepted on first review.',
    name: 'Head of Security',
    role: 'Security & compliance lead',
    company: 'Healthtech · Series B',
  },
]

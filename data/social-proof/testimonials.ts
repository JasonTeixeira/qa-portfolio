// ---------------------------------------------------------------------------
// Proof model — verifiable shipped work, callable references, first principles.
// No composite or invented quotes.
// ---------------------------------------------------------------------------

export type ProofPoint = {
  kind: 'shipped' | 'reference' | 'principle';
  label: string;
  detail: string;
  href?: string;
};

export const proofPoints: ProofPoint[] = [
  { kind: 'shipped', label: 'Nexural', detail: '185 DB tables · 69 API endpoints · live in production', href: '/work/nexural' },
  { kind: 'shipped', label: 'AlphaStream', detail: '200+ indicators · 5 ML models · open on GitHub', href: '/work/alphastream' },
  { kind: 'shipped', label: 'Jobpoise', detail: 'Stripe paywall · Gmail tracking · shipping to users', href: '/work/jobpoise' },
  { kind: 'reference', label: 'Callable references', detail: 'Real past collaborators you can phone before you sign — no invented quotes', href: '/trust#references' },
  { kind: 'principle', label: 'Receipts, not promises', detail: 'Every change reversible in 30s; the person pitching is the person typing', href: '/pov' },
];

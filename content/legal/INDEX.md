# Legal Pages — Sage Ideas LLC

**Directory:** `content/legal/`
**Last Updated:** 2026-05-03
**Legal Entity:** Sage Ideas LLC, Orlando, Florida

---

## Next.js MDX Rendering Pattern

> Wire this up later. The pattern below shows how a Next.js `app/` route should render any file in this directory.

```tsx
// app/legal/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getMDXContent } from '@/lib/mdx'   // your MDX loader utility

type Props = {
  params: { slug: string }
}

const LEGAL_SLUGS = [
  'privacy',
  'terms',
  'cookies',
  'msa',
  'nda',
  'sow-template',
]

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const doc = await getMDXContent(`legal/${params.slug}`)
  if (!doc) return {}
  return {
    title: `${doc.frontmatter.title} — Sage Ideas`,
    description: doc.frontmatter.summary,
  }
}

export default async function LegalPage({ params }: Props) {
  if (!LEGAL_SLUGS.includes(params.slug)) notFound()

  const doc = await getMDXContent(`legal/${params.slug}`)
  if (!doc) notFound()

  const { frontmatter, content: MDXContent } = doc

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">
          Last updated: {frontmatter.lastUpdated}
        </p>
        <h1 className="text-3xl font-semibold">{frontmatter.title}</h1>
        {frontmatter.summary && (
          <p className="mt-3 text-lg text-muted-foreground">
            {frontmatter.summary}
          </p>
        )}
      </header>
      <article className="prose prose-neutral max-w-none">
        <MDXContent />
      </article>
    </main>
  )
}
```

**Notes:**
- `getMDXContent` should resolve files from `content/legal/[slug].mdx` and return `{ frontmatter, content }`.
- Use `next-mdx-remote` or `@next/mdx` with your preferred remark/rehype plugins.
- For `prose` styling, use `@tailwindcss/typography` plugin with `prose-neutral` or a custom preset matching the site design system.
- The `sow-template` slug should be **gated** (not publicly linked) — render it behind auth or remove from `LEGAL_SLUGS` for the public site.

---

## Files in This Directory

### 1. `privacy.mdx`

**Purpose:** Public-facing Privacy Policy for sageideas.dev.

**Coverage:**
- Enumerates every data collection point: contact form, newsletter, Cal.com bookings, Stripe payments, Vercel Analytics, AWS CloudWatch logs
- Names all sub-processors: Resend (email), AWS (hosting/logs), Vercel (CDN), Cal.com (bookings), Stripe (payments), Supabase (database)
- GDPR legal bases (Art. 6 — contractual necessity, legitimate interests, consent, legal obligation)
- Full CCPA/CPRA rights section for California residents
- EEA/UK rights: access, correction, deletion, restriction, portability, objection, consent withdrawal
- International transfer mechanism note (Standard Contractual Clauses)
- Retention schedule for each data category
- Security posture disclosure

**Approximate word count:** ~2,100 words

**Render path:** `/legal/privacy`

---

### 2. `terms.mdx`

**Purpose:** Terms of Use governing visitors to sageideas.dev.

**Coverage:**
- Permitted use and prohibited conduct
- Intellectual property (Studio content, feedback, user submissions)
- Third-party links and integrations
- "As is" disclaimer and limitation of liability for site use
- User indemnification clause
- Governing law: Florida; venue: Orange County, FL
- Entire agreement, severability, no-waiver boilerplate

**Note:** These Terms govern *website use only*. Client service engagements are governed by the MSA + SOW.

**Approximate word count:** ~1,400 words

**Render path:** `/legal/terms`

---

### 3. `cookies.mdx`

**Purpose:** Cookie Policy disclosing all cookie usage and providing opt-out guidance.

**Coverage:**
- Three categories: Strictly Necessary, Analytics (Vercel — cookieless), Session Preferences
- Explicit "what we do NOT use" list (no ad pixels, no GA, no cross-site tracking)
- Third-party cookie table: Cal.com, Stripe
- Browser-level opt-out instructions for Chrome, Firefox, Safari, Edge
- Privacy extension recommendations (uBlock Origin, Privacy Badger)
- Do Not Track (DNT) and Global Privacy Control (GPC) honor statement
- EU/UK consent notice description; California CCPA note

**Note:** Because Vercel Analytics sets no cookies, EU consent is effectively moot for analytics — disclosed for transparency.

**Approximate word count:** ~1,300 words

**Render path:** `/legal/cookies`

---

### 4. `msa.mdx`

**Purpose:** Master Services Agreement — the standard legal framework for all client engagements.

**Coverage (18 sections):**
1. Definitions
2. Scope of Services (subcontractors, change orders, Client cooperation)
3. Fees & Payment (25% kickoff deposit, Net 30, 1.5%/month late interest, suspension rights)
4. Deliverables & Acceptance (10-day acceptance window, 90-day post-engagement support)
5. Intellectual Property (IP assignment on full payment, Pre-Existing IP license, portfolio rights)
6. Confidentiality (3-year survival, trade secret carve-out)
7. Warranties (mutual + Studio-specific + disclaimer)
8. Indemnification (mutual, with procedure requirements)
9. Limitation of Liability (consequential exclusion + fees-paid cap, with carve-outs)
10. Term & Termination (convenience + cause, effects, survival clause)
11. Independent Contractor
12. Force Majeure (60-day trigger for termination right)
13. Governing Law (Florida; Orange County venue)
14. Notices
15. Amendments
16. Entire Agreement
17. General Provisions (no assignment, waiver, severability, counterparts)
18. Signatures

**Approximate word count:** ~3,500 words

**Render path:** `/legal/msa` *(consider gating behind auth or linking only from onboarding flow)*

---

### 5. `nda.mdx`

**Purpose:** Mutual Non-Disclosure Agreement for pre-engagement discussions and active client relationships.

**Coverage (12 sections):**
1. Purpose
2. Definition of Confidential Information (with explicit carve-outs)
3. Obligations of Receiving Party
4. Permitted Disclosures (advisors, legal process)
5. Term (2-year agreement + 2-year post-term survival; indefinite for trade secrets)
6. Return or Destroy provision
7. No License
8. Mutual Nature statement
9. Equitable Relief (injunctive relief availability)
10. Governing Law (Florida; Orange County)
11. Miscellaneous (entire agreement, amendments, severability, waiver, no assignment, counterparts)
12. Signatures

**Approximate word count:** ~1,700 words

**Usage:** Send to prospects before discovery calls. Can be executed via DocuSign or PDF signature.

**Render path:** `/legal/nda` *(consider gating or rendering as a printable/signable page)*

---

### 6. `sow-template.mdx`

**Purpose:** Statement of Work template for individual client projects. All `[BRACKETED]` fields must be filled before execution.

**Coverage (14 sections):**
1. Document Information (SOW number, effective date, MSA reference)
2. Parties
3. Project Name and Description
4. Scope of Work (deliverables table, technical specifications)
5. Timeline and Milestones (milestone table)
6. Fees and Payment Schedule (fixed-price with 25% deposit, T&M, and retainer variants)
7. Acceptance Criteria (per-deliverable criteria table)
8. Out of Scope (explicit exclusions list)
9. Assumptions
10. Client Responsibilities
11. Change Orders
12. Intellectual Property (assignment + repo transfer on full payment)
13. Post-Engagement Support (90-day window)
14. Approvals / Signatures

**Approximate word count:** ~2,400 words

**Usage:** Not a public page. Use as an internal template — fill in, export to PDF, send to Client for signature. Do not expose at a public route.

**Render path:** Internal use only. If rendered: `/legal/sow-template` behind auth.

---

## Caveats

- **These are templates, not legal advice.** They are carefully drafted to be production-ready for SMB B2B engagements, but Sage Ideas LLC should have a licensed Florida attorney review all six documents — especially the MSA — before using them in high-value contracts (typically contracts over $25,000 or involving unusually sensitive data).
- **GDPR compliance is partial.** The Privacy Policy discloses data practices and provides the required Article 13/14 information, but formal GDPR compliance also requires a Records of Processing Activities (ROPA), a Data Processing Agreement (DPA) with processors where required, and potentially appointment of a representative in the EEA if you regularly target EEA residents.
- **IP assignment clause requires full payment.** This is intentional and protects the Studio. Make sure invoicing and payment tracking are tight — IP reverts if an invoice goes unpaid.
- **The SOW template has three fee structures.** Remove the two that don't apply before sending to a client.
- **Force majeure is capped at 60 days.** This is intentional to prevent indefinite suspension — review if operating in industries with longer regulatory disruptions.
- **Signature blocks are placeholder-only.** For execution, use DocuSign, HelloSign, or equivalent. Electronic signatures are valid under ESIGN Act (US) and eIDAS (EU).

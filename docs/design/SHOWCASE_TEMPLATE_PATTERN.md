# Showcase Template Pattern

Status: locked V1 master pattern based on `/showcase/revenue-os`.

Use this as the source of truth for every premium interactive showcase page. The Revenue OS page is the flagship implementation. Do not restart from an old Figma prompt, blocked iframe, generic SaaS landing layout, or text-heavy dashboard wrapper.

Use this pattern for each interactive prototype page after the Revenue OS flagship pass.

## Page Contract

1. **Hero**
   - Buyer pain in the headline.
   - One visual diagram that explains the transformation.
   - Primary CTA opens the live demo.
   - Secondary CTA books or requests the build.
   - Add a restrained halo only on the primary action.
   - Keep the first viewport mostly visual.

2. **Example Proof**
   - Three metrics maximum.
   - Each metric must explain what changed, not just show a number.
   - If a number is simulated or representative, label it in the source copy before publishing.

3. **Live Prototype**
   - Native site-rendered demo, not a blocked iframe.
   - Four-step click guide before the demo frame.
   - Focus mode for sales calls and prospect review.

4. **Build Scope**
   - Four concrete items the buyer gets.
   - Plain language, tied to their operation.
   - No internal terms like warehouse, outbound packet, or template.

5. **Final CTA**
   - Say what can be built for the buyer.
   - Say what happens on the walkthrough.
   - One primary booking CTA and one lower-commitment example CTA.

6. **Booking Handoff**
   - Pass a source query param into `/book`.
   - The booking page must continue the showcase story.
   - For Revenue OS traffic, the booking page says what can be built around the buyer's business instead of using generic discovery-call copy.

## Copy Rules

- Lead with the buyer's problem, not the product name.
- Name the business outcome: booked calls, recovered leads, faster follow-up, visible pipeline.
- Avoid internal phrases: prototype warehouse, private outbound, operating model, sprint, packet.
- Avoid unearned claims: simple, powerful, seamless, world-class.
- Use short body copy. The demo should carry the explanation.
- Add small personality only where it improves clarity, such as: "No slideshow. Click the actual thing."
- The page should sound like it is speaking to the buyer, not documenting the template.

## Visual Rules

- One major visual idea per section.
- Diagrams must align paths, labels, and endpoints in one coordinate system.
- Keep proof cards to three cards.
- On mobile, prioritize the headline, CTA, proof, and full-screen demo button before dense UI.
- Use one controlled accent color and one primary motion idea.
- No generic bento grids as the main story.
- No dashboard screenshot as the hero.
- No cheap AI-purple blob background.
- The diagram should communicate: leaking demand -> one queue -> booked calls.

## Verification

Each showcase page needs:

- Typecheck passing.
- Playwright route smoke test.
- Desktop screenshot.
- Mobile screenshot.
- Proof that the demo renders without iframe blocking.
- DOM smoke: one `h1`, primary CTAs present, structured data loaded when applicable.

## Locked Revenue OS Reference

Canonical files:

- `app/showcase/revenue-os/page.tsx`
- `app/showcase/revenue-os/revenue-os-showcase.tsx`
- `app/showcase/revenue-os/revenue-os.module.css`
- `app/showcase/revenue-os/figma-make-revenue-os-prototype.tsx`
- `app/book/page.tsx` for source-aware booking handoff
- `tests/e2e/showcase-revenue-os.spec.ts`

Current proof commands:

```bash
npm run typecheck
PW_BASE_URL=http://localhost:3040 npx playwright test tests/e2e/showcase-revenue-os.spec.ts --config=playwright.e2e.config.ts --project=chromium
```

Latest proof screenshots:

- `test-results/showcase-proof/revenue-os-conversion-polish-desktop.png`
- `test-results/showcase-proof/book-revenue-os-conversion-polish-desktop.png`
- `test-results/showcase-proof/revenue-os-conversion-polish-mobile.png`
- `test-results/showcase-proof/book-revenue-os-conversion-polish-mobile.png`

## Next Dashboards

Build the next showcase dashboards in this order:

1. **Contractor Quote Engine**
   - Buyer outcome: turn website visitors and ad clicks into qualified quote requests.
   - Visual story: job request -> qualification -> estimate range -> booked walkthrough.

2. **Med Spa Consultation Funnel**
   - Buyer outcome: convert treatment interest into compliant consultation bookings.
   - Visual story: visitor intent -> treatment routing -> eligibility guardrails -> booked consult.

3. **Law Firm Intake System**
   - Buyer outcome: turn high-intent inquiries into qualified matters without wasting attorney time.
   - Visual story: inquiry -> conflict/fit screen -> urgency score -> consultation slot.

4. **AI Support Agent Dashboard**
   - Buyer outcome: reduce repetitive support while escalating risky issues to humans.
   - Visual story: tickets -> answer confidence -> escalation rules -> resolution analytics.

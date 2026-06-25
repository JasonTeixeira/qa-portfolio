# Revenue OS Showcase

Locked V1 flagship showcase for the Sage Ideas prototype system.

## Purpose

This route is the master pattern for buyer-facing interactive showcases:

- Lead with a visual business problem.
- Show the transformation with a diagram.
- Make the live prototype obvious.
- Hand off to a source-aware booking page.

## Files

- `page.tsx` - metadata, FAQ structured data, route shell.
- `revenue-os-showcase.tsx` - buyer-facing page composition and interactions.
- `revenue-os.module.css` - visual system, CTA halo, responsive layout, reduced-motion handling.
- `figma-make-revenue-os-prototype.tsx` - native embedded prototype recovered from Figma Make.

## Verification

Run before changing the template:

```bash
npm run typecheck
PW_BASE_URL=http://localhost:3040 npx playwright test tests/e2e/showcase-revenue-os.spec.ts --config=playwright.e2e.config.ts --project=chromium
```

## Rules

- Do not replace the native prototype with a Figma iframe.
- Do not add long explanatory copy above the demo.
- Do not add additional accent colors.
- Do not remove the source-aware booking handoff.
- Keep the first viewport focused on the buyer outcome: leaking demand becomes booked calls.

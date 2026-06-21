# CWV / Lighthouse Budget Monitoring

Sage Ideas uses the UX-8 Lighthouse runner as the canonical budget gate for the public acquisition surface.

## Commands

```bash
npm run test:lh:ux8
npm run test:lh:ux8:mobile
npm run qa:cwv-budget
```

`npm run qa:cwv-budget` reads the latest local and production Lighthouse summaries, writes `docs/baselines/cwv-budget-latest.json`, and appends a compact run marker to `docs/baselines/cwv-budget-history.jsonl`.

## Budgets

- Desktop local: performance >= 0.88, accessibility >= 0.95, best practices >= 0.95, SEO >= 0.95, LCP <= 2500ms, CLS <= 0.1, TBT <= 200ms.
- Mobile/local production smoke uses the budgets encoded in each generated summary.
- A route fails the budget if either the Lighthouse runner reported failures or the budget report detects a threshold miss.
- `/academy/my-courses` is an authenticated account route and may exempt only the SEO category when it appears in commerce smoke summaries. It must still pass performance, accessibility, best-practices, LCP, CLS, and TBT budgets.

## Covered Templates

- `/`
- `/services`
- `/pricing`
- `/blog`
- `/academy`
- `/academy/ai-native-product-building/enroll`
- `/tools/route-finder`
- `/contact`
- `/work`
- top service detail routes

## Operating Rule

Run this before any visual/motion-heavy release. If a route fails LCP/CLS/TBT, fix the heaviest template first instead of lowering the budget.

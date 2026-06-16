# Sage After Dark Import Plan

Source repo: `/Users/Sage/code/active/sage-after-dark`

Wave 3 uses Sage After Dark as source material, not as a blind copy/paste source. The content has a strong late-night editorial voice; Sage Ideas needs the operator/engineering version of that voice.

## Import Rules

- Preserve authorship and source lineage in frontmatter notes.
- Do not publish duplicate articles that compete with `sageafterdark.com`.
- Use canonical links if a piece remains substantially the same.
- Rewrite pieces for Sage Ideas only when they support a commercial or academy cluster.
- Every imported piece must map to a cluster, a money page, and one CTA.

## Best-Fit Clusters

- `choosing-stack-for-one-person-saas` -> Product Systems / Academy
- `reading-postgres-explain-plans` -> Cloud & Infrastructure
- `resend-vs-postmark-vs-ses` -> Product Systems / SaaS operations
- `weekend-app-five-line-spec` -> Academy
- `stripe-webhooks-that-dont-lie` -> Product Systems / SaaS engineering
- `observability-on-a-zero-dollar-budget` -> Cloud & Infrastructure

## Review Queue

Run:

```bash
npm run content:sad-inventory
```

The script writes `docs/content/sage-after-dark-inventory.json` with candidate source files, titles, word counts, and import recommendations.

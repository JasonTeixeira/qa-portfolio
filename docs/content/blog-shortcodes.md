# Blog Content Shortcodes

The blog renderer supports lightweight Markdown directives for premium article visuals.

Use these in `content/blog/*.mdx`. They render through `lib/blogMarkdown.ts`, so no per-post React import is needed.

## Proof Note

```md
:::proof-note title="What this proves" label="proof note"
This claim is grounded in a real artifact, constraint, or shipped system.
:::
```

## System Diagram

```md
:::system-diagram title="Lead capture flow" label="surface -> system" nodes="Visitor,Diagnostic,Lead,Route"
The surface is the form. The system is the routing logic, lead capture, and follow-up path.
:::
```

## Scorecard

```md
:::scorecard title="Launch readiness" label="scorecard"
Area | Status | Evidence
Offer | Ready | Page and CTA map exist
Analytics | Partial | GA4 and PostHog need final dashboards
:::
```

## Checklist

```md
:::checklist title="Before publishing" label="checklist"
- One clear claim
- One proof point
- One internal link to a money page
- One reader next step
:::
```

## Offer CTA

```md
:::offer-cta title="Want this built?" label="next step" href="/tools/route-finder" cta="Find your route"
Use the diagnostic to decide whether this should become a studio project, audit sprint, academy path, or AI automation scope.
:::
```

Rules:

- Keep claims honest and sourced.
- Use diagrams for actual systems, not decoration.
- Use scorecards for comparison, readiness, or evidence.
- Use one offer CTA per article unless the article is long enough to justify a second.

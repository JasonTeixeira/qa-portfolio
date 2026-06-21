# Living Systems Design Rubric

Use this rubric before calling any public page visually locked.

## Composite Score

Score every route from 1 to 100 across five categories. A page is locked only at 92+ with no category below 85.

| Category | Weight | What Good Looks Like |
| --- | ---: | --- |
| Cohesion | 20 | Same palette, nav, footer, spacing rhythm, and typography as the Living Systems homepage. |
| Hierarchy | 20 | The first viewport makes the route purpose obvious in under 5 seconds. Headlines lead, supporting copy does not fight them. |
| Proof | 20 | The page shows real work, real constraints, real screenshots, real numbers, or a clear empty state when proof is not available. |
| Motion | 20 | Motion clarifies flow: scroll-drawn diagrams, data packets, page transitions, hover states. Reduced motion remains fully usable. |
| Conversion | 20 | One primary action, relevant secondary action, route-finder or lead capture entry, and proof placed near the ask. |

## Automatic Fails

- Old teal/cyan accent leaks outside admin.
- Decorative gradients used as backgrounds.
- Fake screenshots, fake testimonials, fake metrics, or vague "trusted by" proof.
- Missing global menu or footer.
- Horizontal overflow at 390px.
- Content hidden by default before JavaScript loads.
- Audio autoplay without explicit user action.

## Route Lock Checklist

- 1440px screenshot reviewed.
- 390px screenshot reviewed.
- Keyboard focus visible.
- Reduced-motion mode usable.
- Lighthouse/CWV budget run.
- Route has schema/metadata if it is indexable.
- Route has one Studio, Academy, or diagnostic conversion path.

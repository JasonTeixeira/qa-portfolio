# UTM Conventions — Program H

Last updated: 2026-06-17

## Format

Use lowercase, hyphen-separated values.

```text
utm_source={platform}
utm_medium={channel}
utm_campaign={campaign-name}
utm_content={asset-or-variant}
utm_term={keyword-or-audience}
```

## Sources

- `linkedin`
- `x`
- `github`
- `reddit`
- `newsletter`
- `partner`
- `product-hunt`
- `direct-outreach`
- `audit-badge`

## Mediums

- `social`
- `email`
- `community`
- `referral`
- `organic`
- `badge`
- `outreach`

## Campaigns

Use a durable campaign name tied to the asset:

- `ai-search-readiness-2026`
- `seo-audit-tool-launch`
- `academy-waitlist`
- `service-industry-pages`
- `weekly-build-notes`

## Examples

```text
https://www.sageideas.dev/reports/ai-search-readiness-2026?utm_source=linkedin&utm_medium=social&utm_campaign=ai-search-readiness-2026&utm_content=launch-post
```

```text
https://www.sageideas.dev/tools/seo-audit?utm_source=direct-outreach&utm_medium=outreach&utm_campaign=seo-audit-tool-launch&utm_content=founder-email
```

## Storage

`AttributionCapture` stores first-touch attribution in a cookie. Lead capture merges it into `leads.metadata` through `mergeAttributionMetadata`.

Do not overwrite first-touch attribution. Add later activity as separate metadata if needed.

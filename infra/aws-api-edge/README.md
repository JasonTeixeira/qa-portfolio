# AWS API Edge (CloudFront + WAF) — `api.sageideas.dev`

This module puts **CloudFront + WAF in front of the existing API Gateway HTTP API**, so that:

`api.sageideas.dev` → **CloudFront (TLS + edge caching disabled)** → **WAF (managed rules)** → **API Gateway execute-api** → **Lambda**

## Why this exists

For API Gateway **HTTP APIs (v2)**, directly associating WAF to the stage is not consistently supported (the association ARNs are rejected by WAF).

The most reliable, production-ready pattern is:

1. CloudFront distribution as the public edge endpoint
2. WAF attached to CloudFront (scope `CLOUDFRONT`)
3. CloudFront forwards to the API Gateway origin over HTTPS
4. Origin path is set to `/<stage>` so URLs stay clean

## What it provisions

- ACM certificate for `api.sageideas.dev` in **us-east-1** (required by CloudFront)
- WAFv2 WebACL (scope `CLOUDFRONT`) using `AWSManagedRulesCommonRuleSet`
- CloudFront distribution
  - Origin: `rxyixiywic.execute-api.us-east-1.amazonaws.com`
  - Origin path: `/prod`
  - Cache TTLs set to 0 (acts like a proxy, not a cache)
- Route53 A/AAAA alias records for `api.sageideas.dev` → CloudFront

## Deploy

```bash
cd infra/aws-api-edge
AWS_PROFILE=portfolio-terraform terraform init
AWS_PROFILE=portfolio-terraform terraform apply
```

## Verify

```bash
curl -sS https://api.sageideas.dev/health
curl -sS -D- "https://api.sageideas.dev/newsletter/confirm?email=test%40example.com&token=bad" -o /dev/null | head
```

## Notes

- DNS + CloudFront propagation can take a few minutes.
- This module intentionally forwards *all* methods and forwards query strings so the API behaves correctly.


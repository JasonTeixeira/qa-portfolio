# AWS API (IaC) — Portfolio Proof

This module provisions a **serverless public API** for the portfolio on AWS:

- **API Gateway (HTTP API)**
- **Lambda** handlers for:
  - `POST /contact`
  - Newsletter:
    - `POST /newsletter/subscribe`
    - `GET /newsletter/confirm`
    - `GET /newsletter/unsubscribe`
- **Custom domain**: `api.sageideas.dev` (ACM + Route53 alias)
- **DynamoDB** table for newsletter subscribers
- **SES** permissions for sending confirm emails
- CloudWatch logs

## Deploy

```bash
cd infra/aws-api
terraform init
terraform apply
```

Outputs:
- `api_base_url` (custom domain)
- `newsletter_table_name`

## App env vars

Set these for the Next.js frontend build/runtime:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.sageideas.dev
NEXT_PUBLIC_SITE_URL=https://sageideas.dev
```

## Notes

This keeps the **public site static** (S3/CloudFront) while moving all mutating actions (email + newsletter) to AWS-managed serverless.


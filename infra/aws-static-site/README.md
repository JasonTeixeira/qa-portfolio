# AWS Static Site (S3 + CloudFront + Route53 + ACM)

This module hosts the portfolio as a **low-cost, AWS-native static site**:

- **S3** (private) stores the built site assets
- **CloudFront** serves assets globally with HTTPS
- **ACM (us-east-1)** issues the TLS cert for CloudFront
- **Route53** hosts DNS for `sageideas.dev` and `www.sageideas.dev`

## Prereqs
- AWS account
- Terraform >= 1.5
- You own `sageideas.dev` at Namecheap

## Deploy

```bash
cd infra/aws-static-site
AWS_PROFILE=portfolio-terraform terraform init
AWS_PROFILE=portfolio-terraform terraform plan
AWS_PROFILE=portfolio-terraform terraform apply
```

After apply, Terraform prints:
- `nameservers` (4 values)

## Namecheap DNS cutover
In Namecheap:
1) Domain list → `sageideas.dev` → **Manage**
2) **Nameservers** → choose **Custom DNS**
3) Paste the 4 Route53 nameservers from Terraform output
4) Save

DNS propagation can take minutes to a few hours.

## Deploy site content
After infra is up:

1) Build the site
```bash
npm run build
```

2) Export static HTML
```bash
npx next export
```

3) Upload to S3 bucket from `site_bucket` output

4) Invalidate CloudFront cache (optional on first deploy)

## Notes
- Root canonical: `sageideas.dev` (www also points to same CloudFront distribution)
- PriceClass_100 keeps CloudFront costs low.


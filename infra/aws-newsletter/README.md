# AWS Newsletter (IaC) — Portfolio Proof

This module provisions the AWS resources needed to run the **Newsletter + Contact** workflows with a production-grade posture:

- DynamoDB storage
- Optional DynamoDB-based distributed rate limiting
- IAM policy (least privilege) for the app runtime

## What this demonstrates (architect signal)
- Serverless-friendly backend design
- Data modeling (partition/sort keys, status transitions)
- Least-privilege IAM
- Operational concerns (rate limiting, encryption, PITR)

## Prereqs
- AWS account
- Terraform >= 1.5
- AWS credentials available locally (AWS CLI profile or SSO)

## Deploy

Create a `terraform.tfvars`:

```hcl
project_name = "qa-portfolio"
environment  = "dev"
aws_region   = "us-east-1"

# Recommended for production (multi-instance safe)
enable_rate_limit_table = true
```

Then:

```bash
cd infra/aws-newsletter
terraform init
terraform plan
terraform apply
```

Save the outputs:
- `newsletter_table_name`
- `rate_limit_table_name` (if enabled)
- `runtime_policy_arn`

## SES setup (us-east-1)

To send email from `sage@sageideas.org`, SES requires identity verification.

1) Go to **SES (Simple Email Service)** in `us-east-1`
2) **Verified identities** → **Create identity**
3) Choose **Email address** and enter `sage@sageideas.org`
4) Confirm the verification email

### Production note
If your AWS account is still in SES sandbox, you can only send to verified recipients.
Request production access when ready.

## App configuration

Set these env vars in your runtime (Vercel/AWS) after deploying:

```bash
AWS_REGION=us-east-1
NEWSLETTER_TABLE_NAME=<newsletter_table_name>
RATE_LIMIT_TABLE_NAME=<rate_limit_table_name> # optional
SES_FROM_EMAIL=sage@sageideas.org
SITE_URL=https://<your-domain>
```

## How IAM is used

This Terraform creates an IAM **policy**, not a role.

Attach `runtime_policy_arn` to:
- an IAM role used by your hosting platform, or
- an IAM user/role you use to run the app on AWS.

If you deploy on Vercel, you typically use an access key pair (not ideal) — for the portfolio we can still do it, but the “architect-signal” path is:
- Host on AWS (Amplify / ECS / Lambda) OR
- Use a lightweight API Gateway + Lambda for the email/DDB operations.

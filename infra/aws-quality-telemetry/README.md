# AWS Quality Telemetry (IaC) — Portfolio Proof Project

This folder is a **cloud/infra proof point** that upgrades the portfolio’s Quality Telemetry story from “GitHub API demo” to a **real deployable cloud pipeline**.

## What this demonstrates (architect + infra signal)
- Infrastructure as Code (Terraform)
- Secure CI → Cloud auth using **GitHub OIDC** (no long‑lived AWS keys)
- Least privilege IAM
- Durable storage for QA metrics snapshots (S3 + DynamoDB)
- Clear operational docs + reproducible deployment steps

## Architecture (v1)

```text
QA repos (GitHub Actions)
  └─ generate qa-metrics.json (schema)
  └─ assume AWS role via GitHub OIDC
  └─ upload metrics to S3

AWS
  ├─ S3 bucket
  │    └─ metrics/<repo>/<branch>/<runId>.json
  └─ DynamoDB table
       └─ latest pointer + queryable history metadata

qa-portfolio (Next.js)
  └─ /api/quality (optional cloud read path)
```

## Quick start (plan)
1. Create AWS resources with Terraform.
2. Configure GitHub OIDC trust for your repo(s).
3. Add a GitHub Actions workflow in a QA repo to upload `qa-metrics.json` to S3.
4. (Optional) Extend the portfolio API to read from S3/Dynamo.

## Prereqs
- AWS account
- Terraform >= 1.5
- An AWS region (default: `us-east-1`)

## Security model
- GitHub Actions uses **OIDC federated auth** to assume an AWS IAM role.
- The role has permission only to:
  - write to the specific S3 bucket prefix
  - write to the DynamoDB table (if enabled)

## Next steps
If you want, I can:
- Add the full Terraform module (`main.tf`, `variables.tf`, `outputs.tf`)
- Add a reference GitHub workflow that uploads metrics (using `aws-actions/configure-aws-credentials`)
- Wire the portfolio dashboard to show “Cloud mode” metrics

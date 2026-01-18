# Interview Demo Script — Quality Dashboard + AWS Telemetry

## 30-second pitch (memorize this)

I built a quality telemetry system that looks and behaves like a production internal dashboard.

- **Snapshot** mode is CI-generated, versioned, and shipped as static data.
- **Live** mode pulls GitHub Actions metadata and degrades gracefully if rate-limited.
- **Cloud** mode proves real infrastructure: API Gateway → Lambda → S3, with a token-protected proxy so the public site keeps **zero AWS credentials**.

The goal is to show I can ship systems with quality gates, observability, and operational discipline — not just write tests.

---

## 5-minute walkthrough (click path)

1) Open the dashboard
- https://sageideas.dev/dashboard

2) Show the three data sources
- Click **Snapshot**: explain it’s CI-generated and reproducible.
- Click **Live**: explain it reads from GitHub API, includes debug visibility, and degrades gracefully.
- Click **Cloud**: explain it reads metrics through an AWS proxy (no AWS creds in Vercel).

3) Prove the AWS system is real
On the dashboard, click:
- **Proof: AWS proxy endpoint** (shows 403 without token = protected endpoint)
- **Proof: CloudWatch dashboard** (shows monitoring + logs)
- **Terraform (aws-quality-telemetry)** (infra as code)
- **Ops readiness** (runbook-style doc)

4) Show evidence artifacts
- https://sageideas.dev/artifacts
- Filter/search for “AWS” and open:
  - CloudWatch dashboard export
  - alarm configuration export
  - API Gateway routes export
  - S3 object metadata export
  - IAM GitHub OIDC trust policy export

---

## If they ask…

### “How do you know it’s working in production?”
- CI runs lint/build/e2e + Lighthouse.
- There is a production verifier: `npm run verify:prod` (and it’s part of CI).

### “How do you handle failures?”
- GitHub API rate limits → Live degrades to Snapshot.
- AWS proxy down/token mismatch → Cloud degrades to Snapshot.
- The UI shows debug context instead of silently failing.

### “Security?”
- No AWS creds in Vercel.
- GitHub Actions writes to AWS with OIDC (no long-lived keys).
- AWS proxy endpoint is token-protected (403 without token).


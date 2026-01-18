# Incident Drill Report (Interview Evidence)

This is a recruiter-friendly, postmortem-style drill report showing how I operate the **Quality Telemetry Dashboard** like a production system.

## Drill summary
- **Drill type:** Reliability / Cloud telemetry
- **Scenario:** AWS proxy token mismatch (simulates misconfigured secret / unauthorized caller)
- **Expected behavior:** Cloud mode degrades gracefully to snapshot; no secrets leak; operator has clear next actions

## Timeline (simulated)
- **T+0m:** Synthetic check notices spike in errors calling AWS proxy
- **T+2m:** Dashboard Cloud mode shows degraded signal; notes indicate AWS mode unavailable
- **T+5m:** Operator checks CloudWatch alarm + API Gateway access logs
- **T+10m:** Root cause identified: token mismatch between Vercel and Lambda
- **T+15m:** Fix applied (rotate token) + verify production + close incident

## What would alert (signals)
- **CloudWatch alarm:** Lambda error rate > 0
- **CloudWatch alarm:** API Gateway 5xx > threshold
- **Dashboard indicator:** Cloud mode notes include AWS fallback reason

## Mitigations / design decisions
- **No AWS creds in Vercel:** runtime stays credential-free
- **Token-based gate:** prevents casual scraping
- **Graceful fallback:** snapshot mode keeps dashboard usable
- **Evidence exports:** routes/alarms/dashboard configs are committed for auditability

## Follow-ups
- Add an explicit response header on `/api/quality?mode=aws`: `x-quality-source: aws-proxy | snapshot-fallback`
- Add a scheduled synthetic monitor workflow that runs `npm run verify:prod` and pages via email/Slack


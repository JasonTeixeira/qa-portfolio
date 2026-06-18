# Revenue OS Production Runbook

Operational runbooks for the Revenue OS acquisition system.

## Health Checks

- Public health: `/api/health/revenue-os`
- Admin proof: Acquisition OS -> Program 12
- Required status: `ok` or known `degraded` with manual-review controls active.

## Failed Workers

Trigger: `revenue_worker_dead_letters` count is above zero or queue age exceeds SLA.

Actions:

1. Inspect dead-letter rows and latest worker attempts.
2. Disable affected connector or automation lane.
3. Fix provider credentials, input validation, or rate-limit condition.
4. Requeue only after root cause is understood.
5. Record an audit log note with the remediation.

## Connector Credential Failure

Trigger: connector health reports `401`, `403`, quota exhaustion, or repeated provider failures.

Actions:

1. Pause live connector runs for the tenant.
2. Rotate or refresh the provider credential.
3. Run a small sample import.
4. Confirm provenance rows and dedupe keys are written.
5. Re-enable daily automation with conservative caps.

## High Bounce Or Complaint Rate

Trigger: bounce, complaint, or unsubscribe rate exceeds the tenant threshold.

Actions:

1. Stop active sequences for the affected tenant/domain.
2. Add suppression events for bounced or complained contacts.
3. Lower daily send caps.
4. Review lead source quality and email-domain health.
5. Resume only with manual review and fresh source evidence.

## Migration Failure

Trigger: `supabase db push` fails, remote migration history drifts, or RLS tests fail after migration.

Actions:

1. Stop deploy.
2. Capture migration status and error output.
3. Do not edit an already-applied migration.
4. Create a forward repair migration or repair migration history deliberately.
5. Run `npm run test:rls`, `npm run typecheck`, and focused E2E before retrying deploy.

## Tenant Incident

Trigger: privacy request, cross-tenant access concern, client data issue, or governance blocker.

Actions:

1. Freeze affected tenant automation.
2. Export tenant audit logs and governance report.
3. Verify workspace membership and API key scope.
4. Process privacy request: export, suppress, anonymize, or delete.
5. Record completion evidence in governance tables.

## Required Release Gates

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:rls`
- `npm run build`
- Focused Revenue OS Playwright E2E
- `npm audit --audit-level=high`
- Production smoke verification where environment allows it

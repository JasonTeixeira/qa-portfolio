# Revenue OS Public API

Program 8 exposes a tenant-bound product API for external datasets, client systems, and webhook providers.

## Authentication

Send every request with a bearer API key:

```bash
Authorization: Bearer rosk_live_...
```

API keys are stored hashed in `revenue_api_keys`, scoped per tenant, and never stored in plaintext.

## Scopes

- `leads:write`
- `jobs:write`
- `events:write`
- `audits:write`
- `outcomes:write`
- `exports:read`
- `webhooks:write`
- `*`

## Ingestion

```bash
curl -X POST https://sageideas.dev/api/revenue-os/v1/leads \
  -H "Authorization: Bearer $REVENUE_OS_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: lead-acme-001" \
  -d '{
    "externalId": "lead-acme-001",
    "name": "Acme Dental",
    "websiteUrl": "https://example.com",
    "industry": "Dental",
    "contact": { "email": "owner@example.com", "name": "Avery" }
  }'
```

Supported write endpoints:

- `POST /api/revenue-os/v1/leads`
- `POST /api/revenue-os/v1/jobs`
- `POST /api/revenue-os/v1/events`
- `POST /api/revenue-os/v1/audits`
- `POST /api/revenue-os/v1/outcomes`

All accepted requests create a `revenue_api_ingestion_events` row and a `revenue_api_requests` audit row.

## Exports

```bash
curl "https://sageideas.dev/api/revenue-os/v1/exports?resource=accounts&format=csv" \
  -H "Authorization: Bearer $REVENUE_OS_API_KEY"
```

Supported resources:

- `accounts`
- `jobs`
- `ingestions`

Formats:

- `json`
- `csv`

## Signed Webhooks

```bash
BODY='{"provider":"custom","type":"reply.received","id":"evt_123","data":{"email":"owner@example.com"}}'
TS="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
SIG="$(node -e "const crypto=require('crypto'); console.log(crypto.createHmac('sha256', process.env.REVENUE_OS_API_KEY).update(process.env.TS + '.' + process.env.BODY).digest('hex'))")"

curl -X POST https://sageideas.dev/api/revenue-os/v1/webhooks \
  -H "Authorization: Bearer $REVENUE_OS_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Revenue-OS-Timestamp: $TS" \
  -H "X-Revenue-OS-Signature: $SIG" \
  -d "$BODY"
```

Webhook signatures use:

```text
hmac_sha256(api_key_secret, timestamp + "." + raw_body)
```

The timestamp tolerance is 5 minutes.

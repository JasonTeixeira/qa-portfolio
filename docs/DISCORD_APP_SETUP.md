# Discord App Setup

This repo now exposes a Discord interactions endpoint:

```text
https://www.sageideas.dev/api/discord/interactions
```

## Required Environment Variables

Set these in Vercel for Production and Preview before saving the endpoint in Discord:

```text
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_PUBLIC_KEY=
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
DISCORD_BOT_PERMISSIONS=0
NEXT_PUBLIC_SITE_URL=https://www.sageideas.dev
CRON_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_DISCORD_PREMIUM=
```

`DISCORD_PUBLIC_KEY` is required first because Discord validates every interaction request with `X-Signature-Ed25519` and `X-Signature-Timestamp`.

## Developer Portal Steps

1. Open the app in the Discord Developer Portal.
2. Copy the app public key into `DISCORD_PUBLIC_KEY`.
3. In Vercel, redeploy after adding the environment variables.
4. In Discord Developer Portal, set Interactions Endpoint URL to:

```text
https://www.sageideas.dev/api/discord/interactions
```

5. Save. Discord will send a signed PING request; the endpoint responds with PONG.
6. Use the generated OAuth2 invite URL from `/admin/settings` once `DISCORD_CLIENT_ID` is configured.

## Current Scope

Implemented:

- Signed Discord interaction endpoint.
- PING/PONG verification support.
- Admin integration status for configured credentials and URLs.
- Unit tests for Ed25519 verification.
- SageBot command registry and Vercel-compatible interaction handlers.
- Guild command registration script:

```text
npm run discord:register
```

Registered commands:

- `/onboard`
- `/choose-path`
- `/submit-project`
- `/request-review`
- `/capture-content`
- `/daily-prompt`
- `/weekly-recap`
- `/resource`
- `/office-hours`
- `/report`
- `/premium`

Premium/community operations now implemented:

- Stripe Checkout link generation through `/premium`.
- Stripe webhook role sync for `Premium Member`.
- Supabase-backed Discord members, command events, and scheduled run logs.
- Admin analytics dashboard at `/admin/discord`.
- Vercel cron routes for daily signal and weekly recap:
  - `/api/cron/discord/daily`
  - `/api/cron/discord/weekly`

Still operationally required:

- Deploy after code changes.
- Apply `supabase/migrations/0049_discord_community_ops.sql`.
- Set Stripe env vars in Vercel, including the premium price id.
- Set `CRON_SECRET` in Vercel so scheduled routes can authenticate.

Operational note: Discord slash commands call the production interactions endpoint. After command registration, deploy the current app to Vercel before expecting newly added handlers to respond in the live server.

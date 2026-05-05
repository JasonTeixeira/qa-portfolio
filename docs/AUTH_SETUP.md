# Auth setup — Supabase + OAuth providers

Phase 25 migrated the studio from Clerk to Supabase Auth. This document is the
authoritative checklist for wiring providers in production. It is intentionally
manual — these are dashboards and consoles, not Terraform.

## 1. Database migration

Apply `supabase/migrations/phase25_profiles_and_auth.sql` once, in the Supabase
Dashboard → SQL Editor (project `hocrntqhgvmeaxwlhzwl`). It creates the
`public.profiles` table with the admin-approval gate, RLS policies, and the
trigger that auto-creates a profile row each time a user lands in `auth.users`.

The migration also auto-promotes `sage@sageideas.dev` and `sage@sageideas.org`
to `app_role = 'admin'` + `approval_status = 'approved'` on first sign-in.

Verify with:

```sql
select id, email, app_role, approval_status from public.profiles order by created_at desc;
```

## 2. Vercel environment variables

### Add (Production + Preview)

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hocrntqhgvmeaxwlhzwl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_B25xhSjOc977b-IDH76Hlg_kzn6ency` |
| `SUPABASE_SERVICE_ROLE_KEY` | (copy from Supabase → Project Settings → API) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.sageideas.dev` |

### Remove (no longer used)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

## 3. Supabase Auth → URL configuration

Supabase Dashboard → Authentication → URL Configuration.

- **Site URL:** `https://www.sageideas.dev`
- **Additional redirect URLs (allow-list):**
  - `https://www.sageideas.dev/auth/callback`
  - `https://www.sageideas.dev/auth/redirect`
  - `https://www.sageideas.dev/**`
  - For previews: `https://*.vercel.app/auth/callback`

## 4. Email magic link (no provider config needed)

Magic link sign-in is enabled by default. Customize the email template:

Supabase → Authentication → Email Templates → "Magic Link". Replace the body
with branded HTML matching the dark theme. Subject: `Your Sage Ideas sign-in
link`.

## 5. Google OAuth

1. <https://console.cloud.google.com> → create project **Sage Ideas Studio**.
2. APIs & Services → OAuth consent screen → External. App name: **Sage Ideas
   Studio**. Logo: `/public/brand/logo.svg`. Support email:
   `sage@sageideas.dev`. Scopes: `email`, `profile`, `openid`.
3. Credentials → Create OAuth client ID → Web application.
   - Authorized JavaScript origins:
     - `https://www.sageideas.dev`
     - `https://hocrntqhgvmeaxwlhzwl.supabase.co`
   - Authorized redirect URIs:
     - `https://hocrntqhgvmeaxwlhzwl.supabase.co/auth/v1/callback`
4. Copy Client ID + Client Secret.
5. Supabase → Authentication → Providers → Google → Enable, paste credentials,
   save.

## 6. GitHub OAuth

1. <https://github.com/settings/developers> → New OAuth App.
   - Application name: **Sage Ideas Studio**.
   - Homepage URL: `https://www.sageideas.dev`.
   - Authorization callback URL:
     `https://hocrntqhgvmeaxwlhzwl.supabase.co/auth/v1/callback`.
2. Generate a new client secret. Copy Client ID + Secret.
3. Supabase → Authentication → Providers → GitHub → Enable, paste credentials,
   save.

## 7. LinkedIn OIDC

1. <https://www.linkedin.com/developers/apps> → Create app.
   - App name: **Sage Ideas Studio**.
   - LinkedIn Page: required (create one if necessary).
   - Privacy policy URL: `https://www.sageideas.dev/legal/privacy`.
   - App logo: `/public/brand/logo.svg`.
2. Auth tab → add redirect URL:
   `https://hocrntqhgvmeaxwlhzwl.supabase.co/auth/v1/callback`.
3. Products → request **Sign In with LinkedIn using OpenID Connect**.
4. Auth tab → copy Client ID + Primary Client Secret.
5. Supabase → Authentication → Providers → LinkedIn (OIDC) → Enable, paste
   credentials, save.

## 8. Smoke test the flow

After deploy:

- `/login` renders, no "Secured by Clerk" branding.
- `/signup` step 1 → enter email → step 2 form → submit → step 3 confirmation.
- Magic link email arrives, clicking it lands on `/pending-approval` for new
  users, `/admin` for `sage@sageideas.dev`/`.org`.
- Each OAuth button kicks off the provider consent flow and round-trips back
  to `/auth/callback`.
- An admin (sage@) can approve a pending profile from `/admin` and the user
  can refresh `/portal/home` to enter the workspace.

## 9. Files this phase added or rewrote

- `supabase/migrations/phase25_profiles_and_auth.sql`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `lib/auth.ts`
- `lib/portal/auth.ts` (refactored to use Supabase auth)
- `middleware.ts`
- `app/auth/actions.ts`
- `app/auth/callback/route.ts`
- `app/auth/redirect/route.ts`
- `app/login/page.tsx` (rewritten)
- `app/login/layout.tsx`
- `app/signup/page.tsx`
- `app/signup/layout.tsx`
- `app/pending-approval/page.tsx`
- `app/admin/page.tsx`
- `components/auth/brand-panel.tsx`
- `components/auth/oauth-buttons.tsx`
- `components/marketing-chrome.tsx` (server-side auth read)
- `components/navigation.tsx` (Clerk → `isSignedIn` prop)
- `components/portal/sidebar.tsx` (Clerk `<UserButton>` → sign-out form)
- `app/api/portal/health/route.ts` (env probe updated)
- `app/layout.tsx` (`ClerkProvider` removed)
- `app/trust/trust-content.tsx` (sub-processor list updated)
- `package.json` (`@clerk/nextjs`, `@clerk/themes` removed)

-- Academy certificate REVOCATION — make the credential's trust claim real.
--
-- The academy's signature move is a public, verifiable certificate that can be REVOKED
-- if the proofs behind it fail. Before this, academy_certificates had no revoked column,
-- so getCertificate() hardcoded `revoked: false` and the /verify/[code] endpoint's REVOKED
-- status was unreachable — the credential could never actually be invalidated. This adds
-- the real state + an audit trail.

alter table public.academy_certificates
  add column if not exists revoked boolean not null default false,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_reason text;

-- Fast lookup of revoked certs (partial index — the common case is not-revoked).
create index if not exists academy_certificates_revoked_idx
  on public.academy_certificates (cert_code)
  where revoked = true;

comment on column public.academy_certificates.revoked is
  'Revocation is the credential trust guarantee: set true only when the proofs behind the cert fail. Read by getCertificate() → /verify/[code].';

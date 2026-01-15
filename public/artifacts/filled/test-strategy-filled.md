# Test Strategy (Filled Example) — Retail eCommerce Web App

**Product:** ShopSmart (web + API)

**Version:** v1.0

**Last updated:** 2026-01-03

---

## 1) Purpose
This strategy defines how we validate quality for ShopSmart’s customer shopping experience (browse → cart → checkout) and the supporting APIs.

**Quality goals**
- Prevent revenue-impacting defects (pricing, payment, tax/shipping)
- Maintain checkout reliability during high traffic
- Ensure secure handling of authentication and payments
- Provide fast feedback to engineers via CI

---

## 2) Scope
### In scope
- Web UI: login, product browse, cart, checkout
- APIs: catalog, cart, checkout, promotions
- Integrations: payment provider sandbox, email service sandbox
- Analytics events: checkout started / completed

### Out of scope
- Payment provider internal systems
- Fraud engine ML tuning (validated only at interface level)

---

## 3) Quality Risks
| Risk | Impact | Likelihood | Score | Mitigation / Test Approach |
|------|--------|------------|------:|----------------------------|
| Incorrect order total (promo/tax/shipping) | Very High | Medium | 15 | API contract tests + E2E checkout totals + price snapshots |
| Payment failure / double charge | Very High | Low | 12 | E2E payment sandbox + idempotency tests + retries |
| Auth bypass / broken RBAC | High | Medium | 12 | API authZ tests + negative tests + OWASP checks |
| Out-of-stock edge cases | Medium | Medium | 9 | API + E2E inventory boundaries |
| Regression in critical journeys | High | Medium | 12 | CI smoke suite on PR + nightly regression |

---

## 4) Test Levels & Coverage
### Unit (owned by dev)
- Business rules (promo calculations, tax rules) tested as pure functions

### API / Integration
- Contract: request/response schemas, required fields
- Auth: JWT validation, role checks
- Negative: invalid inputs, missing fields, boundary values
- Idempotency: checkout, applyPromo

### E2E (thin, high ROI)
- Guest checkout (happy path)
- Logged-in checkout (happy path)
- Promo applied updates total
- Out-of-stock prevents checkout

### Visual
- Homepage, product list, product detail, cart, checkout
- Responsive snapshots (desktop + mobile)

### Security (baseline)
- OWASP Top 10 coverage checklist
- Secrets scanning, dependency review

### Performance (baseline)
- Lighthouse thresholds for key pages
- API latency budget checks in CI (p95)

---

## 5) Environments + Test Data
**Environments:** Dev, QA, Staging

**Data strategy**
- Seeded catalog (stable IDs)
- Dedicated test accounts per role
- Payment sandbox cards

---

## 6) Automation Strategy
**What to automate**
- Stable critical journeys (smoke)
- High-risk calculations via API tests

**CI triggers**
- PR: smoke + API contract checks
- Nightly: expanded regression + visual snapshots

**Flaky test policy**
- Any flaky test tagged `@flaky` is quarantined within 24h
- Root cause tracked (timing/data/env) and fixed or removed

---

## 7) Reporting
Artifacts produced per run:
- Playwright HTML report (UI)
- Allure results (BDD)
- Percy diffs (visual)
- Security scan report (JSON/SARIF)

Triage workflow:
- Failures categorized (product vs. test vs. env)
- Owner assigned same day

---

## 8) Entry/Exit Criteria
**Entry**
- Acceptance criteria written and reviewed
- Test env stable + seeded

**Exit**
- PR smoke passes
- No open P0/P1 defects
- Known risks documented

---

## 9) Roles & Responsibilities
- QA: owns strategy, automation, reporting
- Dev: owns unit tests, fixes defects, supports triage
- PM: owns requirements + acceptance criteria
- DevOps: owns CI reliability + environment stability

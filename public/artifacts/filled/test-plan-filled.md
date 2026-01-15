# Test Plan (Filled Example) — Release 2026.01 (ShopSmart)

**Release goal:** Improve checkout speed + add promo stacking rules

**Target environment:** Staging

**Entry date:** 2026-01-03

---

## 1) Scope
### Features
- Promo stacking rules (PROMO10 + FREESHIP)
- Checkout performance improvements
- Cart persistence fixes

### Out of scope
- New payment provider integration (next release)

---

## 2) Test Approach
### Smoke (PR + staging deploy)
- Login
- Browse products
- Add to cart
- Checkout happy path

### Regression
- Promo application and totals
- Tax/shipping calculations
- Inventory boundaries

### API
- `/applyPromo` contract + negative tests
- `/checkout` idempotency

### Visual
- Cart + Checkout snapshots

---

## 3) Environments
- Staging web: https://staging.shopsmart.example
- Staging API: https://api-staging.shopsmart.example

---

## 4) Test Data
- Accounts: `qa_standard`, `qa_admin`
- Seed products: `SKU-1001`, `SKU-2002`
- Promo codes: `PROMO10`, `FREESHIP`

---

## 5) Entry Criteria
- Build deployed to staging
- Feature flags enabled
- Seed data loaded

## 6) Exit Criteria
- Smoke suite passes
- No open P0/P1
- Release sign-off completed

---

## 7) Risks
| Risk | Mitigation |
|------|------------|
| Promo total mismatch | API contract tests + E2E totals |
| Checkout slower than baseline | Lighthouse + API latency budget |

---

## 8) Reporting
- Daily summary in Slack/Email
- Final sign-off doc attached

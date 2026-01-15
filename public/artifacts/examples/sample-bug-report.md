# Example Bug Report (Filled)

## Title
[Checkout] Promo code applied but total does not update

## Severity / Priority
- Severity: High (incorrect price)
- Priority: P1

## Environment
- URL/build: staging / build 2026.01.03-rc1
- Browser/device: Chrome 121 (desktop)
- OS: macOS
- Account/role: standard user

## Preconditions
- User has 1 item in cart
- Promo code PROMO10 exists and is valid

## Steps to Reproduce
1. Add item to cart
2. Navigate to cart
3. Enter promo code PROMO10
4. Click Apply

## Expected
- Discount is reflected in the order total

## Actual
- Promo shows as “applied” but total remains unchanged

## Evidence
- Screenshot: (attach)
- Console: no errors
- Network: /applyPromo returns 200, payload includes discounted_total, UI ignores it

## Impact
- Users may be charged incorrectly
- High trust/revenue impact

## Notes
- Suspected root cause: client state not updated after applyPromo response
- Workaround: refresh page (total updates)

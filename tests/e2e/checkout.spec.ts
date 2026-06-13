import { test, expect } from '@playwright/test';

// Guard live-checkout tests behind Stripe key presence.
// When STRIPE_SECRET_KEY is absent (local dev without env), skip the
// happy-path test so CI doesn't fail on missing credentials.
const STRIPE = !!process.env.STRIPE_SECRET_KEY;

test.describe('Checkout flow', () => {
  test(
    'low-ticket service /services/audit checkout button POSTs and returns a Stripe URL',
    async ({ request }) => {
      test.skip(!STRIPE, 'Stripe not configured — set STRIPE_SECRET_KEY to run');

      const res = await request.post('/api/checkout', {
        data: { slug: 'audit' },
        headers: { 'content-type': 'application/json' },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
    },
  );

  test('high-ticket /services/build exposes no self-serve checkout — shows a book/apply CTA instead', async ({
    page,
  }) => {
    // This test always runs — it verifies the UI gate without any Stripe call.
    const res = await page.goto('/services/build');
    // Page must be reachable (2xx or 3xx, never 5xx)
    expect(res?.status() ?? 200).toBeLessThan(500);

    // No Stripe checkout button should be present for the build tier.
    // The page must instead show a consultation/book/apply/contact link.
    const checkoutButton = page.locator('button', { hasText: /buy|checkout|pay now/i });
    await expect(checkoutButton).toHaveCount(0);

    // A book/contact/apply link must be present.
    const consultLink = page.locator('a[href*="book"], a[href*="contact"], a[href*="apply"]');
    await expect(consultLink.first()).toBeVisible();
  });

  test('non-self-serve slug via API returns 400 with consultation message', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      data: { slug: 'build' },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe('string');
    expect(body.error).toMatch(/consultation/i);
  });

  test('unknown slug via API returns 400', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      data: { slug: 'does-not-exist' },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.status()).toBe(400);
  });
});

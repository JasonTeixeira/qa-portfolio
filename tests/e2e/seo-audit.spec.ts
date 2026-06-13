/**
 * E2E smoke test for the free SEO audit lead magnet.
 *
 * Uses https://example.com — a stable IANA domain with reliable uptime.
 * PSI degrades gracefully to null (no PAGESPEED_API_KEY in CI).
 * captureLead is best-effort and fails silently without DB env vars.
 *
 * Timeout: 20s for the audit result to appear (network fetch + analysis).
 */

import { test, expect } from '@playwright/test';

test.describe('SEO audit tool', () => {
  test('submits https://example.com and renders a score', async ({ page }) => {
    await page.goto('/tools/seo-audit');

    // Page must have a visible heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Fill URL field (label: "URL to audit")
    await page.getByLabel(/url/i).fill('https://example.com');

    // Fill email field
    await page.getByLabel(/email/i).fill('e2e-test@sageideas.dev');

    // Submit — match button text containing audit|analyze|run
    await page.getByRole('button', { name: /audit|analyze|run/i }).click();

    // Wait up to 20s for the score to render (score ring shows a number 0-100)
    await expect(
      page.locator('[aria-label="SEO audit report"]'),
    ).toBeVisible({ timeout: 20_000 });

    // The report section must contain a number between 0 and 100
    const reportText = await page
      .locator('[aria-label="SEO audit report"]')
      .textContent();

    expect(reportText).toBeTruthy();
    // Verify at least one digit is present in the report (the score)
    expect(reportText).toMatch(/\d/);
  });

  test('shows an error for an unreachable private URL', async ({ page }) => {
    await page.goto('/tools/seo-audit');

    await page.getByLabel(/url/i).fill('http://192.168.0.1/');
    await page.getByLabel(/email/i).fill('e2e-test@sageideas.dev');
    await page.getByRole('button', { name: /audit|analyze|run/i }).click();

    // Should show an error message (our custom alert div, not the Next.js route announcer)
    await expect(
      page.locator('[role="alert"]:not([aria-live])'),
    ).toBeVisible({ timeout: 10_000 });
  });
});

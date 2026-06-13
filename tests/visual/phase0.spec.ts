import { test, expect } from '@playwright/test';
const ROUTES = ['/', '/services', '/pricing', '/work', '/contact', '/blog'];
const WIDTHS = [320, 768, 1024, 1440];
for (const route of ROUTES) {
  for (const width of WIDTHS) {
    test(`visual ${route} @ ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://localhost:3040${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`${route.replace(/\//g, '_') || 'home'}-${width}.png`, {
        fullPage: true, maxDiffPixelRatio: 0.02, animations: 'disabled',
      });
    });
  }
}

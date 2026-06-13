import { test, expect } from '@playwright/test';
const ROUTES = ['/', '/services', '/pricing', '/work', '/contact', '/blog'];
const WIDTHS = [320, 768, 1024, 1440];
for (const route of ROUTES) {
  for (const width of WIDTHS) {
    test(`visual ${route} @ ${width}`, async ({ page }) => {
      const name = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_');
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://localhost:3040${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`${name}-${width}.png`, {
        fullPage: true, maxDiffPixelRatio: 0.02, animations: 'disabled',
      });
    });
  }
}

test('hero respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:3040/', { waitUntil: 'networkidle' });
  // Allow any remaining micro-tasks to settle before asserting transform state.
  await page.waitForTimeout(300);

  const h1Region = page.getByRole('region', { name: /introduction/i });
  await expect(h1Region).toBeVisible();

  // Assert that framer-motion's JS-driven transforms are not stuck mid-animation.
  // Under reducedMotion="user", MotionConfig collapses all durations to 0 so the
  // element should land at its resting position (transform: none / matrix identity).
  const transform = await page.evaluate(() => {
    // The visual headline is the first motion.div inside the hero region.
    const region = document.querySelector('[aria-label="Sage Ideas Studio — introduction"]');
    const motionEl = region?.querySelector('[style*="transform"]') as HTMLElement | null;
    if (!motionEl) return 'none';
    return window.getComputedStyle(motionEl).transform;
  });

  // Accept either 'none' or the identity matrix — both mean no residual offset.
  const isIdentity =
    transform === 'none' ||
    transform === 'matrix(1, 0, 0, 1, 0, 0)';
  expect(isIdentity, `Expected identity transform under reduced-motion, got: ${transform}`).toBe(true);

  // Screenshot baseline: confirm the page looks settled (no mid-animation blur).
  await expect(page).toHaveScreenshot('hero-reduced-motion.png', {
    fullPage: false,
    clip: { x: 0, y: 0, width: 1440, height: 700 },
    maxDiffPixelRatio: 0.02,
    animations: 'disabled',
  });
});

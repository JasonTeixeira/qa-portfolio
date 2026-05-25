import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Top public marketing routes — keep this list small and focused so the run
// stays under 60s. For full coverage we sweep all 105+ routes via a dedicated
// `npm run a11y:full` task (see docs/a11y-audit.md).
const routes = [
  '/',
  '/work',
  '/work/nexural',
  '/pricing',
  '/services',
  '/industries',
  '/founder',
  '/contact',
  '/stack',
  '/trust',
  '/process',
  '/capabilities',
] as const;

for (const route of routes) {
  test(`a11y: ${route} has no serious violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      // Color-contrast is audited separately via Lighthouse.
      .disableRules(['color-contrast'])
      .analyze();

    const seriousOrWorse = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact || ''),
    );

    expect(
      seriousOrWorse,
      `A11y violations on ${route}:\n${JSON.stringify(seriousOrWorse, null, 2)}`,
    ).toEqual([]);
  });
}

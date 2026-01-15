import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/projects', '/artifacts', '/contact', '/dashboard', '/platform'] as const;

for (const route of routes) {
  test(`a11y: ${route} has no serious violations`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      // Limit noise from code blocks / syntax highlighting.
      // We can refine selectors as we find real issues.
      .disableRules(['color-contrast'])
      .analyze();

    // Keep it strict on “serious/critical”.
    const seriousOrWorse = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact || '')
    );

    expect(
      seriousOrWorse,
      `A11y violations on ${route}:\n${JSON.stringify(seriousOrWorse, null, 2)}`
    ).toEqual([]);
  });
}

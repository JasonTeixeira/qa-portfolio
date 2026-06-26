import { test, expect } from '../fixtures/auth';
import AxeBuilder from '@axe-core/playwright';

/**
 * The A11Y GATE for the UX loop. Runs axe-core on each authenticated academy
 * surface and fails on any serious/critical violation. Part of the quality gate
 * a UX pass must clear before it can be marked done.
 *
 *   RUN_ACADEMY_A11Y=1 PW_BASE_URL=http://127.0.0.1:3040 \
 *     npm run test:e2e:local -- tests/e2e/academy-a11y.spec.ts
 */

const run = process.env.RUN_ACADEMY_A11Y === '1';

const SURFACES: [string, string][] = [
  ['dashboard', '/academy/dashboard'],
  ['catalog', '/academy/catalog'],
  ['course', '/academy/course/programming-fundamentals'],
  ['lesson', '/academy/learn/programming-fundamentals/input-validation'],
  ['leagues', '/academy/leagues'],
  ['community', '/academy/community'],
  ['profile', '/academy/profile'],
];

test.describe('Academy a11y gate', () => {
  test.skip(!run, 'Set RUN_ACADEMY_A11Y=1 to run the axe accessibility gate.');

  for (const [name, url] of SURFACES) {
    test(`a11y: ${name}`, async ({ clientPage }) => {
      await clientPage.goto(url, { waitUntil: 'domcontentloaded' });
      await clientPage.waitForLoadState('networkidle').catch(() => {});
      const results = await new AxeBuilder({ page: clientPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      if (blocking.length) {
        console.log(
          `\n[a11y] ${name} — ${blocking.length} serious/critical:\n` +
            blocking.map((v) => `  - ${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.help}`).join('\n'),
        );
      }
      expect(blocking, `${name} has serious/critical a11y violations`).toHaveLength(0);
    });
  }
});

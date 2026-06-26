import { test } from '../fixtures/auth';

/**
 * The VISUAL HARNESS for the UX loop (docs/academy/UX_LOOP.md).
 * Captures every academy surface at the four responsive breakpoints so each pass
 * can be reviewed by eye + a design-reviewer agent. Authenticated; saves PNGs to
 * /tmp/academy-shots/<surface>-<width>.png.
 *
 *   RUN_ACADEMY_SCREENS=1 PW_BASE_URL=http://127.0.0.1:3040 \
 *     npm run test:e2e:local -- tests/e2e/academy-screens.spec.ts
 */

const run = process.env.RUN_ACADEMY_SCREENS === '1';

// Breakpoints from the web testing standard: 320 · 768 · 1024 · 1440.
const BREAKPOINTS = [320, 768, 1024, 1440];

// Core surfaces get every breakpoint (mobile matters most here); the rest desktop-only.
const CORE: [string, string][] = [
  ['dashboard', '/academy/dashboard'],
  ['catalog', '/academy/catalog'],
  ['course', '/academy/course/programming-fundamentals'],
  ['lesson', '/academy/learn/programming-fundamentals/input-validation'],
  ['lab', '/academy/learn/programming-fundamentals/input-validation/lab'],
];
const SECONDARY: [string, string][] = [
  ['leagues', '/academy/leagues'],
  ['community', '/academy/community'],
  ['profile', '/academy/profile'],
  ['efficacy', '/academy/efficacy'],
  ['review', '/academy/review'],
  ['refer', '/academy/refer'],
];

const DIR = '/tmp/academy-shots';

test.describe('Academy visual harness', () => {
  test.skip(!run, 'Set RUN_ACADEMY_SCREENS=1 to capture the visual harness.');

  for (const width of BREAKPOINTS) {
    for (const [name, url] of CORE) {
      test(`${name} @ ${width}`, async ({ clientPage }) => {
        await clientPage.setViewportSize({ width, height: 900 });
        await clientPage.goto(url, { waitUntil: 'domcontentloaded' });
        await clientPage.waitForLoadState('networkidle').catch(() => {});
        await clientPage.waitForTimeout(1200);
        await clientPage.screenshot({ path: `${DIR}/${name}-${width}.png`, fullPage: true });
      });
    }
  }

  for (const [name, url] of SECONDARY) {
    test(`${name} @ 1440`, async ({ clientPage }) => {
      await clientPage.setViewportSize({ width: 1440, height: 900 });
      await clientPage.goto(url, { waitUntil: 'domcontentloaded' });
      await clientPage.waitForLoadState('networkidle').catch(() => {});
      await clientPage.waitForTimeout(1200);
      await clientPage.screenshot({ path: `${DIR}/${name}-1440.png`, fullPage: true });
    });
  }
});

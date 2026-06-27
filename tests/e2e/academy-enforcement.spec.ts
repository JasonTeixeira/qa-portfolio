import { test, expect } from '../fixtures/auth';

/**
 * The EVIDENCE-GATE enforcement harness. It formalizes the one invariant the
 * anti-fake spine exists to protect: "no Complete and no full score without
 * evidence." The lesson header renders the StateBadge (deriveUnitState) and the
 * ScoreCapMeter (caps-logic.resolveScore) straight off the evidence spine, so a
 * unit lacking the full required evidence MUST read as capped + not-Complete.
 * This proves the score/state are evidence-gated, not cosmetic.
 *
 *   RUN_ACADEMY_ENFORCEMENT=1 PW_BASE_URL=http://127.0.0.1:3060 \
 *     npm run test:e2e:local -- tests/e2e/academy-enforcement.spec.ts
 */

const run = process.env.RUN_ACADEMY_ENFORCEMENT === '1';

const LESSON = '/academy/learn/programming-fundamentals/input-validation';

// Every non-complete StateBadge label (StateBadge STATE_META, minus "Complete").
const NON_COMPLETE_STATES = [
  'Locked',
  'Ready',
  'In progress',
  'Proof pending',
  'Review pending',
  'Repair',
  'Transfer due',
];

test.describe('Academy evidence-gate enforcement', () => {
  test.skip(!run, 'Set RUN_ACADEMY_ENFORCEMENT=1 to run the enforcement harness.');

  test('the mastery score is capped without full evidence', async ({ clientPage }) => {
    const res = await clientPage.goto(LESSON, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(400);

    // The ScoreCapMeter is in the lesson header. Wait for it deterministically.
    const meterLabel = clientPage.getByText('Mastery score', { exact: true });
    await expect(meterLabel).toBeVisible();

    // A capped score renders the "Capped at <n> — <reason>" line; a perfect 100
    // earned through full evidence would omit it entirely. Its presence proves
    // the score is gated by evidence (the unit is NOT a free 100).
    const cappedLine = clientPage.getByText(/Capped at \d+/);
    await expect(cappedLine).toBeVisible();
  });

  test('the unit state does not read Complete without full evidence', async ({ clientPage }) => {
    const res = await clientPage.goto(LESSON, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(400);

    // The StateBadge carries data-state; assert it resolved to a real,
    // non-complete state derived from the evidence spine.
    const badge = clientPage.locator('[data-state]').first();
    await expect(badge).toBeVisible();

    const state = await badge.getAttribute('data-state');
    expect(state).not.toBe('complete');

    // And the visible label must be one of the non-complete states, never "Complete".
    const label = (await badge.textContent())?.trim() ?? '';
    expect(NON_COMPLETE_STATES).toContain(label);
    expect(label).not.toBe('Complete');
  });
});

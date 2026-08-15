import { test, expect, TEST_USERS } from '../fixtures/auth';
import { createClient } from '@supabase/supabase-js';

const COURSE = 'python-basics';

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function clientUserId(sb: ReturnType<typeof admin>) {
  const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  return data?.users.find((u) => u.email?.toLowerCase() === TEST_USERS.client.email.toLowerCase())?.id;
}

test.describe('Academy assessment loop (Hake g)', () => {
  test('assessment gate is gated behind login', async ({ page }) => {
    await page.goto(`/academy/course/${COURSE}/assessment/pretest`);
    expect(page.url()).toContain('/login');
  });

  test('pretest gate renders the course question bank (answer-stripped)', async ({ clientPage }) => {
    const sb = admin();
    const uid = await clientUserId(sb);
    // Ensure the pretest is not already locked, so the gate (not a redirect) renders.
    await sb.from('academy_assessments').delete().eq('user_id', uid!).eq('course_slug', COURSE);

    await clientPage.goto(`/academy/course/${COURSE}/assessment/pretest`);
    await expect(clientPage.getByRole('heading', { name: 'Where are you starting?' })).toBeVisible();
    await expect(clientPage.getByText('What does the elif keyword do in Python?')).toBeVisible();
    await expect(clientPage.getByText(/0 \/ 3 answered/)).toBeVisible();
  });

  test('course page prompts the baseline before starting', async ({ clientPage }) => {
    const sb = admin();
    const uid = await clientUserId(sb);
    await sb.from('academy_assessments').delete().eq('user_id', uid!).eq('course_slug', COURSE);

    await clientPage.goto(`/academy/course/${COURSE}`);
    await expect(clientPage.getByText('Start with a quick baseline.')).toBeVisible();
  });

  test('verified gain renders once pre + post are recorded (real pipeline)', async ({ clientPage }) => {
    const sb = admin();
    const uid = await clientUserId(sb);
    // Arrange real assessment rows; g = (80-40)/(100-40) = 0.67.
    await sb
      .from('academy_assessments')
      .upsert(
        [
          { user_id: uid!, course_slug: COURSE, kind: 'pretest', score: 40 },
          { user_id: uid!, course_slug: COURSE, kind: 'posttest', score: 80 },
        ],
        { onConflict: 'user_id,course_slug,kind' },
      );

    try {
      await clientPage.goto(`/academy/course/${COURSE}`);
      await expect(clientPage.getByText(/g = 0\.67/)).toBeVisible();
      await expect(clientPage.getByText(/Medium gain/)).toBeVisible();
    } finally {
      await sb.from('academy_assessments').delete().eq('user_id', uid!).eq('course_slug', COURSE);
    }
  });
});

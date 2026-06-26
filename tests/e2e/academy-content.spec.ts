import { test, expect } from '../fixtures/auth';

const runLiveAcademyContent = process.env.RUN_ACADEMY_CONTENT_E2E === '1';

/**
 * First real course — Programming Fundamentals · "Input Validation" — renders
 * end-to-end: course page, the full Learning-Engine sprint, the runnable lab,
 * and the pre/post assessment gate. Regression guard for the content pipeline.
 */

const COURSE = '/academy/course/programming-fundamentals';
const LESSON = '/academy/learn/programming-fundamentals/input-validation';

test.describe('First course — Programming Fundamentals', () => {
  test.skip(
    !runLiveAcademyContent,
    'Set RUN_ACADEMY_CONTENT_E2E=1 to run the live Academy content regression; it uses Supabase test data.',
  );

  test('course page renders with the baseline prompt', async ({ clientPage }) => {
    const res = await clientPage.goto(COURSE);
    expect(res?.status()).toBeLessThan(400);
    await expect(clientPage.getByRole('heading', { name: 'Programming Fundamentals' })).toBeVisible();
    await expect(clientPage.getByText('Input Validation: Trust Nothing at the Boundary')).toBeVisible();
  });

  test('the gold-standard sprint lesson renders its sections', async ({ clientPage }) => {
    const res = await clientPage.goto(LESSON);
    expect(res?.status()).toBeLessThan(400);
    // Mission + a couple of distinctive sprint sections prove the blocks render.
    await expect(clientPage.getByText(/stop trusting input/i)).toBeVisible();
    await expect(clientPage.getByText(/Trust boundary/i).first()).toBeVisible();
  });

  test('the runnable lab renders', async ({ clientPage }) => {
    const res = await clientPage.goto(`${LESSON}/lab`);
    expect(res?.status()).toBeLessThan(400);
    await expect(clientPage.getByText(/validate_age/i).first()).toBeVisible();
  });

  test('the course pretest gate serves the real question bank', async ({ clientPage }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    test.skip(!url || !key, 'Missing Supabase env for live Academy content regression.');

    const sb = (await import('@supabase/supabase-js')).createClient(
      url!,
      key!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
    const uid = list?.users.find((u) => u.email?.toLowerCase() === 'client1+test@sageideas.org')?.id;
    test.skip(!uid, 'client1+test@sageideas.org test user is not seeded.');

    await sb.from('academy_assessments').delete().eq('user_id', uid).eq('course_slug', 'programming-fundamentals');

    await clientPage.goto(`${COURSE}/assessment/pretest`);
    await expect(clientPage.getByRole('heading', { name: 'Where are you starting?' })).toBeVisible();
    await expect(clientPage.getByText('Where should untrusted input be validated?')).toBeVisible();
    await expect(clientPage.getByText(/0 \/ 3 answered/)).toBeVisible();
  });
});

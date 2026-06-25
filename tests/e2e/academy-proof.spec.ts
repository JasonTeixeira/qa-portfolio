import { test, expect, TEST_USERS } from '../fixtures/auth';
import { createClient } from '@supabase/supabase-js';

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Phase 2 — proof + credibility e2e.
 * Public efficacy page, OG social card, profile gating, and a real
 * publish-a-portfolio-then-render-it-publicly round trip.
 *
 *   PW_BASE_URL=http://127.0.0.1:3040 npm run test:e2e:local -- tests/e2e/academy-proof.spec.ts
 */

test.describe('Academy proof + profiles', () => {
  test('efficacy page is public and reports an honest state', async ({ page }) => {
    const res = await page.goto('/academy/efficacy');
    expect(res?.status()).toBeLessThan(400);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).toContain('learning gain');
    // Either a published average or the honest "still collecting" state.
    expect(body).toMatch(/average g|still collecting/);
  });

  test('academy OG social card renders an image', async ({ page }) => {
    const res = await page.goto('/og/academy?kind=gain&stat=g%200.74&title=Proven%20gain');
    expect(res?.status()).toBe(200);
    expect(res?.headers()['content-type']).toContain('image');
  });

  test('unknown public profile 404s', async ({ page }) => {
    const res = await page.goto('/academy/u/definitely-not-a-real-handle-xyz');
    expect(res?.status()).toBe(404);
  });

  test('profile editor is gated behind login', async ({ page }) => {
    await page.goto('/academy/profile');
    expect(page.url()).toContain('/login');
  });

  test('the profile editor renders for an authenticated learner', async ({ clientPage }) => {
    await clientPage.goto('/academy/profile');
    await expect(clientPage.getByRole('heading', { level: 1, name: 'Proof of work' })).toBeVisible();
    await expect(clientPage.getByRole('switch')).toBeVisible();
    await expect(clientPage.getByRole('heading', { name: 'Projects' })).toBeVisible();
  });

  test('a public profile renders its portfolio publicly', async ({ page }) => {
    // Arrange real state via the service role (standard e2e setup), then verify
    // the genuine public page + getPublicProfile assembly render it.
    const sb = admin();
    const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
    const u = list?.users.find((x) => x.email?.toLowerCase() === TEST_USERS.client.email.toLowerCase());
    expect(u, 'client test user must be seeded').toBeTruthy();

    const handle = 'e2e-proof-demo';
    await sb
      .from('academy_profiles')
      .upsert(
        { user_id: u!.id, handle, display_name: 'E2E Proof Demo', bio: 'Shipping with AI.', is_public: true },
        { onConflict: 'user_id' },
      );
    await sb.from('academy_artifacts').insert({ user_id: u!.id, title: 'E2E demo project', repo_url: null });

    try {
      const res = await page.goto(`/academy/u/${handle}`);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.getByRole('heading', { name: 'E2E Proof Demo' })).toBeVisible();
      await expect(page.getByText(`@${handle}`)).toBeVisible();
      await expect(page.getByText('E2E demo project')).toBeVisible();
      await expect(page.getByText('Start at Sage Academy →')).toBeVisible();
    } finally {
      // Clean up so the suite is idempotent.
      await sb.from('academy_artifacts').delete().eq('user_id', u!.id).eq('title', 'E2E demo project');
      await sb.from('academy_profiles').update({ is_public: false }).eq('user_id', u!.id);
    }
  });
});

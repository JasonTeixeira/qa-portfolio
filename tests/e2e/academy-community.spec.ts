import { test, expect, TEST_USERS } from '../fixtures/auth';
import { createClient } from '@supabase/supabase-js';

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
async function idFor(sb: ReturnType<typeof admin>, email: string) {
  const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  return data?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
}
const todayUtc = () => new Date().toISOString().slice(0, 10);

test.describe('Academy community', () => {
  test('community page is gated behind login', async ({ page }) => {
    await page.goto('/academy/community');
    expect(page.url()).toContain('/login');
  });

  test('community hub renders with add-friend + the seeded cohort', async ({ clientPage }) => {
    await clientPage.goto('/academy/community');
    await expect(clientPage.getByRole('heading', { name: 'Don’t build alone.' })).toBeVisible();
    await expect(clientPage.getByRole('heading', { name: 'Add a friend' })).toBeVisible();
    await expect(clientPage.getByText('All-Access Cohort')).toBeVisible();
  });

  test('an accepted friend shows with a live shared streak (real pipeline)', async ({ clientPage }) => {
    const sb = admin();
    const [me, friend] = await Promise.all([
      idFor(sb, TEST_USERS.client.email),
      idFor(sb, TEST_USERS.client2.email),
    ]);

    // Arrange the friend's profile + stats, then an accepted friendship w/ a live streak.
    await sb
      .from('academy_profiles')
      .upsert({ user_id: friend!, handle: 'client2-test', display_name: 'Client Two', is_public: false }, { onConflict: 'user_id' });
    await sb
      .from('academy_xp')
      .upsert({ user_id: friend!, total_xp: 300, weekly_xp: 0, week_start: todayUtc(), level: 3 }, { onConflict: 'user_id' });
    await sb
      .from('academy_streaks')
      .upsert({ user_id: friend!, current_length: 7, longest_length: 7, last_active_date: todayUtc(), timezone: 'UTC' }, { onConflict: 'user_id' });
    await sb.from('academy_friendships').delete().eq('requester_id', me!).eq('addressee_id', friend!);
    await sb.from('academy_friendships').insert({
      requester_id: me!,
      addressee_id: friend!,
      status: 'accepted',
      friend_streak: 5,
      last_both_active: todayUtc(),
      accepted_at: new Date().toISOString(),
    });

    try {
      await clientPage.goto('/academy/community');
      await expect(clientPage.getByText('Client Two')).toBeVisible();
      await expect(clientPage.getByText('@client2-test')).toBeVisible();
      await expect(clientPage.getByText(/Lv 3 · 7d streak/)).toBeVisible();
      await expect(clientPage.getByText(/🔥 5/)).toBeVisible(); // live shared streak
    } finally {
      await sb.from('academy_friendships').delete().eq('requester_id', me!).eq('addressee_id', friend!);
    }
  });
});

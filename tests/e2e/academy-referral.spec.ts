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

test.describe('Academy referrals', () => {
  test('refer page is gated behind login', async ({ page }) => {
    await page.goto('/academy/refer');
    expect(page.url()).toContain('/login');
  });

  test('refer hub renders a generated invite code + link', async ({ clientPage }) => {
    await clientPage.goto('/academy/refer');
    await expect(clientPage.getByRole('heading', { name: 'Bring a friend. Both of you win.' })).toBeVisible();
    await expect(clientPage.getByText('Your invite link')).toBeVisible();
    await expect(clientPage.getByText(/Referral code/)).toBeVisible();

    // The code was really created server-side.
    const sb = admin();
    const uid = await idFor(sb, TEST_USERS.client.email);
    const { data } = await sb.from('academy_referral_codes').select('code').eq('user_id', uid!).maybeSingle();
    expect(data?.code, 'a referral code row exists for the learner').toBeTruthy();
  });

  test('referral stats reflect real converted referrals', async ({ clientPage }) => {
    const sb = admin();
    const [referrer, inviteeA, inviteeB] = await Promise.all([
      idFor(sb, TEST_USERS.client.email),
      idFor(sb, TEST_USERS.client2.email),
      idFor(sb, TEST_USERS.pending.email),
    ]);
    // Arrange two converted referrals → converted=2, xpEarned=200.
    await sb.from('academy_referrals').delete().eq('referrer_id', referrer!);
    await sb.from('academy_referrals').upsert(
      [
        { referrer_id: referrer!, invitee_id: inviteeA!, code: 'E2ECODE', status: 'converted', reward_granted: true },
        { referrer_id: referrer!, invitee_id: inviteeB!, code: 'E2ECODE', status: 'converted', reward_granted: true },
      ],
      { onConflict: 'invitee_id' },
    );

    try {
      await clientPage.goto('/academy/refer');
      // xpEarned = 2 × 100 = 200 (distinct to the stat, not the copy).
      await expect(clientPage.getByText('200', { exact: true })).toBeVisible();
      await expect(clientPage.getByText('Converted')).toBeVisible();
    } finally {
      await sb.from('academy_referrals').delete().eq('referrer_id', referrer!);
    }
  });
});

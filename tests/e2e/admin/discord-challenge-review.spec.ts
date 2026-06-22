import { createClient } from '@supabase/supabase-js';
import { test, expect } from '../../fixtures/auth';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error('Missing SUPABASE env');
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

test.describe('Admin Discord challenge review', () => {
  const cleanupUsers = new Set<string>();

  test.afterAll(async () => {
    const sb = adminClient();
    for (const userId of cleanupUsers) {
      const { data: submissions } = await sb
        .from('discord_challenge_submissions')
        .select('id')
        .eq('discord_user_id', userId);
      const ids = submissions?.map((row) => row.id).filter(Boolean) ?? [];
      if (ids.length) {
        await sb.from('discord_challenge_submissions').delete().in('id', ids);
      }
      await sb.from('discord_points_ledger').delete().eq('discord_user_id', userId);
      await sb.from('discord_member_streaks').delete().eq('discord_user_id', userId);
      await sb.from('discord_events').delete().eq('discord_user_id', userId);
    }
  });

  test('admin approves a pending challenge submission through the dashboard', async ({ adminPage }) => {
    const sb = adminClient();
    const runId = `e2e-challenge-review-${Date.now()}`;
    const userId = runId;
    const username = 'e2e-challenge-review';
    cleanupUsers.add(userId);

    const { data: challenge, error: challengeError } = await sb
      .from('discord_challenges')
      .select('challenge_key, points')
      .eq('challenge_key', 'content-repurpose')
      .maybeSingle();
    expect(challengeError).toBeNull();
    expect(challenge).toBeTruthy();

    const { data: inserted, error: insertError } = await sb
      .from('discord_challenge_submissions')
      .insert({
        challenge_key: challenge!.challenge_key,
        discord_user_id: userId,
        discord_username: username,
        summary: 'E2E dashboard proof submission with a concrete artifact, validation notes, and follow-up content angle.',
        link: 'https://example.com/e2e-dashboard-proof',
        status: 'pending',
        points_awarded: 0,
      })
      .select('id')
      .single();
    expect(insertError).toBeNull();
    expect(inserted?.id).toBeTruthy();

    await adminPage.goto('/admin/discord', { waitUntil: 'networkidle' });
    const row = adminPage.getByTestId(`discord-challenge-submission-${inserted!.id}`);
    await expect(row).toBeVisible();
    await expect(row).toContainText(username);
    await expect(row).toContainText('pending');

    await adminPage.getByTestId(`discord-challenge-approved-${inserted!.id}`).click();

    await expect.poll(async () => {
      const { data } = await sb
        .from('discord_challenge_submissions')
        .select('status, points_awarded')
        .eq('id', inserted!.id)
        .single();
      return `${data?.status}:${data?.points_awarded}`;
    }, { timeout: 30_000 }).toBe(`approved:${challenge!.points}`);

    const { data: ledger, error: ledgerError } = await sb
      .from('discord_points_ledger')
      .select('points, source, action_key')
      .eq('discord_user_id', userId)
      .eq('source', 'challenge');
    expect(ledgerError).toBeNull();
    expect(ledger).toHaveLength(1);
    expect(Number(ledger?.[0]?.points ?? 0)).toBe(Number(challenge!.points));
    expect(ledger?.[0]?.action_key).toBe(`challenge:${challenge!.challenge_key}:${userId}`);

    const { count: eventCount, error: eventError } = await sb
      .from('discord_events')
      .select('id', { count: 'exact', head: true })
      .eq('discord_user_id', userId)
      .eq('event_type', 'challenge_submission_reviewed');
    expect(eventError).toBeNull();
    expect(eventCount ?? 0).toBeGreaterThanOrEqual(1);
  });
});

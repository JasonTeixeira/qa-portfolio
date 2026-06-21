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

test.describe('Admin Traffic OS', () => {
  const runKeys: string[] = [];

  test.afterAll(async () => {
    const sb = adminClient();
    for (const runKey of runKeys) {
      await sb.from('traffic_sources').delete().eq('run_key', runKey);
      await sb.from('traffic_campaigns').delete().eq('run_key', runKey);
      await sb.from('traffic_landing_pages').delete().eq('run_key', runKey);
      await sb.from('traffic_content_assets').delete().eq('run_key', runKey);
      await sb.from('traffic_distribution_posts').delete().eq('run_key', runKey);
      await sb.from('traffic_seo_keywords').delete().eq('run_key', runKey);
      await sb.from('traffic_events').delete().eq('run_key', runKey);
      await sb.from('traffic_conversions').delete().eq('run_key', runKey);
      await sb.from('traffic_discord_invites').delete().eq('run_key', runKey);
      await sb.from('traffic_growth_experiments').delete().eq('run_key', runKey);
      await sb.from('traffic_next_best_actions').delete().eq('run_key', runKey);
      await sb.from('traffic_weekly_reports').delete().eq('run_key', runKey);
      await sb.from('traffic_load_proofs').delete().eq('run_key', runKey);
      await sb.from('traffic_readiness_audits').delete().eq('run_key', runKey);
      await sb.from('traffic_live_analytics_proofs').delete().eq('run_key', runKey);
      await sb.from('traffic_campaign_launches').delete().eq('run_key', runKey);
      await sb.from('traffic_revenue_feed_events').delete().eq('run_key', runKey);
      const { data: accounts } = await sb
        .from('acquisition_accounts')
        .select('id')
        .contains('metadata', { runKey });
      const accountIds = accounts?.map((account) => account.id).filter(Boolean) ?? [];
      if (accountIds.length) await sb.from('acquisition_accounts').delete().in('id', accountIds);
    }
  });

  test('renders traffic cockpit and materializes all 32 growth programs', async ({ adminPage }) => {
    const runKey = `e2e-traffic-os-${Date.now()}`;
    runKeys.push(runKey);
    const sb = adminClient();

    await adminPage.goto('/admin/traffic', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByTestId('traffic-os-dashboard')).toBeVisible();
    await expect(adminPage.getByRole('heading', { name: 'Traffic Operating System' })).toBeVisible();
    await expect(adminPage.getByTestId('traffic-os-actions')).toContainText('Next-best traffic actions');
    await expect(adminPage.getByTestId('traffic-os-campaigns')).toContainText('Campaign engine');
    await expect(adminPage.getByTestId('traffic-os-content-engine')).toContainText('SEO + content engine');
    await expect(adminPage.getByTestId('traffic-os-discord')).toContainText('Discord growth');
    await expect(adminPage.getByTestId('traffic-os-live-activation')).toContainText('Live activation loop');
    await expect(adminPage.getByTestId('traffic-os-programs')).toContainText('Program 32');

    const form = adminPage.getByTestId('traffic-os-proof-form');
    await form.getByLabel('Traffic OS proof run key').fill(runKey);
    await form.getByTestId('traffic-os-run-proof').click();

    await expect.poll(async () => {
      const { count } = await sb
        .from('traffic_readiness_audits')
        .select('id', { count: 'exact', head: true })
        .eq('run_key', runKey);
      return count ?? 0;
    }, { timeout: 30_000 }).toBe(1);

    const tables = [
      'traffic_sources',
      'traffic_campaigns',
      'traffic_landing_pages',
      'traffic_content_assets',
      'traffic_distribution_posts',
      'traffic_seo_keywords',
      'traffic_events',
      'traffic_conversions',
      'traffic_discord_invites',
      'traffic_growth_experiments',
      'traffic_next_best_actions',
      'traffic_weekly_reports',
      'traffic_load_proofs',
      'traffic_readiness_audits',
    ];
    for (const table of tables) {
      const { count, error } = await sb
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('run_key', runKey);
      expect(error, `${table} should query cleanly`).toBeNull();
      expect(count ?? 0, `${table} should have proof rows`).toBeGreaterThan(0);
    }

    const { data: audit } = await sb
      .from('traffic_readiness_audits')
      .select('score, grade, program_count, gaps')
      .eq('run_key', runKey)
      .single();
    expect(audit?.program_count).toBe(32);
    expect(Number(audit?.score ?? 0)).toBeGreaterThanOrEqual(80);
    expect(audit?.grade).toBe('institutional_beta');
    expect(audit?.gaps).toContain('live_google_search_console_ga4_discord_analytics_missing');

    const { data: report } = await sb
      .from('traffic_weekly_reports')
      .select('visits, conversions, weighted_pipeline_usd, discord_joins, best_channel')
      .eq('run_key', runKey)
      .single();
    expect(Number(report?.visits ?? 0)).toBeGreaterThan(0);
    expect(Number(report?.conversions ?? 0)).toBeGreaterThan(0);
    expect(Number(report?.weighted_pipeline_usd ?? 0)).toBeGreaterThan(0);
    expect(Number(report?.discord_joins ?? 0)).toBeGreaterThan(0);

    await adminPage.reload({ waitUntil: 'networkidle' });
    await expect(adminPage.getByTestId('traffic-os-proof')).toContainText('Sources');

    const activationRunKey = `${runKey}-activation`;
    runKeys.push(activationRunKey);
    const activationForm = adminPage.getByTestId('traffic-os-activation-form');
    await activationForm.getByLabel('Traffic OS activation run key').fill(activationRunKey);
    await activationForm.getByTestId('traffic-os-activate-pipeline').click();

    await expect.poll(async () => {
      const { count } = await sb
        .from('traffic_revenue_feed_events')
        .select('id', { count: 'exact', head: true })
        .eq('run_key', activationRunKey);
      return count ?? 0;
    }, { timeout: 30_000 }).toBeGreaterThan(0);

    const activationTables = [
      ['traffic_live_analytics_proofs', 4],
      ['traffic_campaign_launches', 3],
      ['traffic_revenue_feed_events', 1],
    ] as const;
    for (const [table, minimum] of activationTables) {
      const { count, error } = await sb
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('run_key', activationRunKey);
      expect(error, `${table} should query cleanly`).toBeNull();
      expect(count ?? 0, `${table} should have activation rows`).toBeGreaterThanOrEqual(minimum);
    }

    const { data: launches } = await sb
      .from('traffic_campaign_launches')
      .select('launch_status, launch_notes')
      .eq('run_key', activationRunKey);
    expect(launches?.every((launch) => launch.launch_status === 'manual_review')).toBe(true);
    expect(launches?.[0]?.launch_notes).toContain('no paid spend');

    const { count: accountCount } = await sb
      .from('acquisition_accounts')
      .select('id', { count: 'exact', head: true })
      .contains('metadata', { runKey: activationRunKey });
    expect(accountCount ?? 0).toBeGreaterThan(0);
  });
});

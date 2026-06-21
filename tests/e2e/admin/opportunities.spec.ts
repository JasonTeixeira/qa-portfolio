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

test.describe('Admin Opportunity OS', () => {
  const runKeys: string[] = [];

  test.afterAll(async () => {
    const sb = adminClient();
    for (const runKey of runKeys) {
      await sb.from('opportunity_follow_up_queue').delete().eq('run_key', runKey);
      await sb.from('opportunity_communication_events').delete().eq('run_key', runKey);
      await sb.from('opportunity_outcome_events').delete().eq('run_key', runKey);
      await sb.from('opportunity_strategy_recommendations').delete().eq('run_key', runKey);
      await sb.from('opportunity_proof_assets').delete().eq('run_key', runKey);
      await sb.from('opportunity_load_proofs').delete().eq('run_key', runKey);
      await sb.from('opportunity_readiness_audits').delete().eq('run_key', runKey);
      await sb.from('opportunity_unified_items').delete().eq('run_key', runKey);
    }
  });

  test('renders unified cockpit and materializes all 24 opportunity programs', async ({ adminPage }) => {
    const runKey = `e2e-opportunity-os-${Date.now()}`;
    runKeys.push(runKey);
    const sb = adminClient();

    await adminPage.goto('/admin/opportunities', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByTestId('opportunity-os-dashboard')).toBeVisible();
    await expect(adminPage.getByRole('heading', { name: 'Opportunity Command Center' })).toBeVisible();
    await expect(adminPage.getByTestId('opportunity-os-daily-queue')).toContainText('Unified daily queue');
    await expect(adminPage.getByTestId('opportunity-os-proof-engine')).toContainText('Cross-system proof engine');
    await expect(adminPage.getByTestId('opportunity-os-communication-loop')).toContainText('Gmail/reply normalization');
    await expect(adminPage.getByTestId('opportunity-os-analytics')).toContainText('Unified analytics');
    await expect(adminPage.getByTestId('opportunity-os-programs')).toContainText('Program 24');

    const form = adminPage.getByTestId('opportunity-os-proof-form');
    await form.getByLabel('Opportunity OS proof run key').fill(runKey);
    await form.getByTestId('opportunity-os-run-proof').click();

    await expect.poll(async () => {
      const { count } = await sb
        .from('opportunity_readiness_audits')
        .select('id', { count: 'exact', head: true })
        .eq('run_key', runKey);
      return count ?? 0;
    }, { timeout: 30_000 }).toBe(1);

    const tables = [
      'opportunity_unified_items',
      'opportunity_proof_assets',
      'opportunity_communication_events',
      'opportunity_follow_up_queue',
      'opportunity_outcome_events',
      'opportunity_strategy_recommendations',
      'opportunity_load_proofs',
      'opportunity_readiness_audits',
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
      .from('opportunity_readiness_audits')
      .select('score, grade, program_count, gaps')
      .eq('run_key', runKey)
      .single();
    expect(audit?.program_count).toBe(24);
    expect(Number(audit?.score ?? 0)).toBeGreaterThanOrEqual(80);
    expect(audit?.grade).toBe('institutional_beta');

    const { data: communication } = await sb
      .from('opportunity_communication_events')
      .select('intent')
      .eq('run_key', runKey);
    expect((communication ?? []).some((row) => ['recruiter_positive', 'client_interest'].includes(row.intent))).toBe(true);

    await adminPage.reload({ waitUntil: 'networkidle' });
    await expect(adminPage.getByTestId('opportunity-os-readiness')).toContainText('24');
  });
});

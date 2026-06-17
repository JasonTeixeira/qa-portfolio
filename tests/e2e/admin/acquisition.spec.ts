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

test.describe('Admin Acquisition OS', () => {
  const createdNames: string[] = [];

  test.afterAll(async () => {
    if (createdNames.length === 0) return;
    const sb = adminClient();
    const { data: accounts } = await sb
      .from('acquisition_accounts')
      .select('id')
      .in('name', createdNames);
    const ids = (accounts ?? []).map((account) => account.id);
    if (ids.length === 0) return;

    await sb.from('acquisition_outreach_messages').delete().in('account_id', ids);
    await sb.from('acquisition_website_audits').delete().in('account_id', ids);
    await sb.from('acquisition_contacts').delete().in('account_id', ids);
    await sb.from('acquisition_accounts').delete().in('id', ids);
  });

  test('imports, audits, drafts, and records a prospect workflow', async ({
    adminPage,
    baseURL,
  }) => {
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const name = `E2E Acquisition ${Date.now()}`;
    createdNames.push(name);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByRole('heading', { name: 'Acquisition OS' })).toBeVisible({
      timeout: 30_000,
    });

    const form = adminPage.locator('[data-testid="acquisition-import-form"]');
    await form.getByPlaceholder('Company name').fill(name);
    await form.getByPlaceholder('https://example.com').fill('https://example.com');
    await form.getByPlaceholder('Industry').fill('Dental');
    await form.getByPlaceholder('Location').fill('Boston MA');
    await form.getByPlaceholder('Contact name').fill('Jordan Smith');
    await form.getByPlaceholder('Contact title').fill('Owner');
    await form.getByPlaceholder('contact@company.com').fill(`jordan+${Date.now()}@example.com`);
    await form.getByText('weak SEO').click();
    await form.getByText('weak conversion').click();
    await form.getByText('booking gap').click();
    await form.getByText('owner-operated').click();
    await form.locator('[data-testid="acquisition-import-submit"]').click();
    await adminPage.waitForLoadState('networkidle');

    const row = adminPage.locator('[data-testid="acquisition-account-row"]', { hasText: name });
    await expect(row).toBeVisible({ timeout: 30_000 });
    await expect(row).toContainText('SEO visibility gap');

    await row.locator('[data-testid="acquisition-audit-button"]').click();
    await adminPage.waitForLoadState('networkidle');
    await expect(row).toContainText('Live SEO audit evidence stored', { timeout: 30_000 });

    await row.locator('[data-testid="acquisition-enrich-button"]').click();
    await adminPage.waitForLoadState('networkidle');
    await expect(row).toContainText('Run website audit, verify the decision-maker', {
      timeout: 30_000,
    });

    await row.locator('[data-testid="acquisition-followup-button"]').click();
    await adminPage.waitForLoadState('networkidle');
    await expect(row).toContainText('Follow up in 3 days.', { timeout: 30_000 });
    await expect(adminPage.locator('[data-testid="acquisition-daily-queue"]')).toContainText(name);

    await row.locator('[data-testid="acquisition-draft-button"]').click();
    await adminPage.waitForLoadState('networkidle');
    const draft = adminPage.locator('[data-testid="acquisition-draft-row"]', { hasText: name });
    await expect(draft).toBeVisible({ timeout: 30_000 });
    await expect(draft).toContainText(`${name} website opportunity`);
    await expect(draft).toContainText('Hi Jordan,');

    await draft.getByRole('button', { name: 'Ready' }).click();
    await adminPage.waitForLoadState('networkidle');
    await expect(draft).toContainText('ready', { timeout: 30_000 });

    await row.locator('[data-testid="acquisition-suppress-button"]').click();
    await adminPage.waitForLoadState('networkidle');
    await expect(row).toContainText('Suppressed. Do not contact.', { timeout: 30_000 });
  });

  test('bulk-imports comma-separated lead rows', async ({ adminPage, baseURL }) => {
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const name = `E2E Bulk ${Date.now()}`;
    createdNames.push(name);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const bulk = adminPage.locator('[data-testid="acquisition-bulk-form"]');
    await bulk
      .locator('textarea[name="leads"]')
      .fill(`${name}, bulk-example.com, Home Services, Austin TX, Alex Rivera, Founder, alex@example.com`);
    await bulk.locator('[data-testid="acquisition-bulk-submit"]').click();
    await adminPage.waitForLoadState('networkidle');

    const row = adminPage.locator('[data-testid="acquisition-account-row"]', { hasText: name });
    await expect(row).toBeVisible({ timeout: 30_000 });
    await expect(row).toContainText('Home Services');
  });
});

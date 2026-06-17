import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { test, expect } from '../../fixtures/auth';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error('Missing SUPABASE env');
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readTodayMetrics() {
  const sb = adminClient();
  const metricDate = new Date().toISOString().slice(0, 10);
  const { data } = await sb
    .from('acquisition_daily_metrics')
    .select('accounts_added, accounts_qualified, messages_drafted, messages_sent, replies, meetings_booked')
    .eq('metric_date', metricDate)
    .maybeSingle();
  return {
    accountsAdded: Number(data?.accounts_added ?? 0),
    qualified: Number(data?.accounts_qualified ?? 0),
    drafted: Number(data?.messages_drafted ?? 0),
    sent: Number(data?.messages_sent ?? 0),
    replies: Number(data?.replies ?? 0),
    meetings: Number(data?.meetings_booked ?? 0),
  };
}

function signResendWebhook(secret: string, id: string, timestamp: string, body: string) {
  const secretBytes = secret.startsWith('whsec_')
    ? Buffer.from(secret.slice(6), 'base64')
    : Buffer.from(secret);
  const signature = crypto.createHmac('sha256', secretBytes).update(`${id}.${timestamp}.${body}`).digest('base64');
  return `v1,${signature}`;
}

test.describe('Admin Acquisition OS', () => {
  const createdNames: string[] = [];
  const createdEmails: string[] = [];
  const createdRunKeys: string[] = [];

  test.afterAll(async () => {
    if (createdNames.length === 0 && createdEmails.length === 0 && createdRunKeys.length === 0) return;
    const sb = adminClient();
    for (const runKey of createdRunKeys) {
      await sb.from('revenue_email_events').delete().contains('metadata', { runKey });
      await sb.from('revenue_email_queue').delete().contains('metadata', { runKey });
      await sb.from('revenue_job_applications').delete().contains('metadata', { runKey });
      await sb.from('revenue_job_opportunities').delete().contains('metadata', { runKey });
      await sb.from('revenue_lead_source_runs').delete().contains('metadata', { runKey });
      await sb.from('revenue_lead_sources').delete().contains('metadata', { runKey });
      await sb.from('revenue_daily_runs').delete().contains('metadata', { runKey });
      await sb.from('revenue_experiments').delete().contains('metadata', { runKey });
      await sb.from('revenue_learning_reports').delete().contains('metadata', { runKey });
      await sb.from('acquisition_suppression_list').delete().eq('email', `owner+${runKey}@program18.example`);
    }
    const accountQuery = sb
      .from('acquisition_accounts')
      .select('id')
      .in('name', createdNames.length ? createdNames : ['__none__']);
    const { data: accountsByName } = await accountQuery;
    const { data: contactsByEmail } = createdEmails.length
      ? await sb.from('acquisition_contacts').select('account_id').in('email', createdEmails)
      : { data: [] };
    const contactAccountIds = (contactsByEmail ?? []).map((contact) => contact.account_id).filter(Boolean);
    const ids = [
      ...(accountsByName ?? []).map((account) => account.id),
      ...contactAccountIds,
    ].filter((id, index, all) => all.indexOf(id) === index);

    if (ids.length > 0) {
      await sb.from('acquisition_outreach_messages').delete().in('account_id', ids);
      await sb.from('acquisition_website_audits').delete().in('account_id', ids);
      await sb.from('acquisition_contacts').delete().in('account_id', ids);
      await sb.from('acquisition_accounts').delete().in('id', ids);
    }
    if (createdEmails.length > 0) {
      await sb.from('leads').delete().in('email', createdEmails);
      await sb.from('engagement_inquiries').delete().in('email', createdEmails);
    }
  });

  test('imports, audits, drafts, and records a prospect workflow', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const name = `E2E Acquisition ${Date.now()}`;
    createdNames.push(name);
    const metricStart = await readTodayMetrics();

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByRole('heading', { name: 'Acquisition OS' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(adminPage.getByTestId('revenue-os-operator-dashboard')).toBeVisible();
    await expect(adminPage.getByTestId('revenue-os-operator-dashboard')).toContainText('Operator Command');
    await expect(adminPage.getByTestId('revenue-os-operator-dashboard')).toContainText('Next best action');
    await expect(adminPage.getByTestId('revenue-os-operator-dashboard')).toContainText('Quick jump');
    await expect(adminPage.getByTestId('revenue-os-operator-filters')).toBeVisible();
    await expect(adminPage.getByLabel('Search acquisition accounts')).toBeVisible();
    await expect(adminPage.getByLabel('Saved operator view')).toBeVisible();
    await expect(adminPage.getByTestId('revenue-os-command-center')).toBeVisible();
    await expect(adminPage.getByTestId('revenue-os-job-pipeline')).toContainText('Job Search Pipeline');
    await expect(adminPage.getByTestId('revenue-os-lead-connectors')).toContainText('Lead Source Connectors');
    await expect(adminPage.getByTestId('revenue-os-email-prep')).toContainText('Email Sending Prep');
    await expect(adminPage.getByTestId('revenue-os-daily-actions')).toBeVisible();
    await expect(adminPage.getByTestId('revenue-os-learning-report')).toContainText('Reporting + Learning Loop');
    await expect(adminPage.getByTestId('revenue-os-production-hardening')).toContainText('Production Hardening');

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
    await expect.poll(async () => (await readTodayMetrics()).accountsAdded).toBeGreaterThanOrEqual(
      metricStart.accountsAdded + 1,
    );

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
    await expect(draft).toContainText(`${name} owner-level SEO and conversion audit opportunity`);
    await expect(draft).toContainText('Hi Jordan,');
    await expect(draft).toContainText('Proof points');
    await expect(draft).toContainText('Q');
    await expect.poll(async () => (await readTodayMetrics()).drafted).toBeGreaterThanOrEqual(
      metricStart.drafted + 1,
    );
    const sb = adminClient();
    let messageId = '';
    await expect
      .poll(
        async () => {
          const { data, error } = await sb
            .from('acquisition_outreach_messages')
            .select('id, status, acquisition_accounts!inner(name)')
            .eq('acquisition_accounts.name', name)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          messageId = data?.id ?? '';
          return messageId;
        },
        { timeout: 30_000 },
      )
      .not.toBe('');

    const expectMessageStatus = async (status: string) => {
      await expect
        .poll(
          async () => {
            const { data, error } = await sb
              .from('acquisition_outreach_messages')
              .select('status')
              .eq('id', messageId)
              .maybeSingle();
            if (error) throw error;
            return data?.status ?? null;
          },
          { timeout: 30_000 },
        )
        .toBe(status);
    };

    await draft.getByRole('button', { name: 'Ready' }).click();
    await adminPage.waitForLoadState('networkidle');
    await expectMessageStatus('ready');

    await draft.getByRole('button', { name: 'Sent' }).click();
    await adminPage.waitForLoadState('networkidle');
    await expectMessageStatus('sent');
    await expect.poll(async () => (await readTodayMetrics()).sent).toBeGreaterThanOrEqual(
      metricStart.sent + 1,
    );

    await draft.getByRole('button', { name: 'Replied' }).click();
    await adminPage.waitForLoadState('networkidle');
    await expectMessageStatus('replied');
    await expect.poll(async () => (await readTodayMetrics()).replies).toBeGreaterThanOrEqual(
      metricStart.replies + 1,
    );

    await draft.getByRole('button', { name: 'Booked' }).click();
    await adminPage.waitForLoadState('networkidle');
    await expectMessageStatus('booked');
    await expect.poll(async () => (await readTodayMetrics()).meetings).toBeGreaterThanOrEqual(
      metricStart.meetings + 1,
    );

    await row.locator('[data-testid="acquisition-suppress-button"]').click();
    await adminPage.waitForLoadState('networkidle');
    await expect
      .poll(
        async () => {
          const { data, error } = await sb
            .from('acquisition_accounts')
            .select('stage, next_action')
            .eq('name', name)
            .maybeSingle();
          if (error) throw error;
          return `${data?.stage ?? ''}:${data?.next_action ?? ''}`;
        },
        { timeout: 30_000 },
      )
      .toContain('do_not_contact:Suppressed. Do not contact.');
    await adminPage.reload({ waitUntil: 'networkidle' });
    await expect(row).toContainText('Suppressed. Do not contact.', { timeout: 30_000 });
  });

  test('persists revenue os lead, job, email, run, experiment, and learning records', async ({
    adminPage,
    baseURL,
  }) => {
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-revenue-os-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-persistence-panel');
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel).toContainText('Persistent Revenue OS');

    const form = adminPage.getByTestId('revenue-os-persistence-proof-form');
    await form.getByLabel('Revenue OS proof run key').fill(runKey);
    await form.getByTestId('revenue-os-persist-proof').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    const tables = [
      'revenue_lead_sources',
      'revenue_lead_source_runs',
      'revenue_job_opportunities',
      'revenue_job_applications',
      'revenue_email_queue',
      'revenue_email_events',
      'revenue_daily_runs',
      'revenue_experiments',
      'revenue_learning_reports',
    ];

    for (const table of tables) {
      await expect
        .poll(
          async () => {
            const { count, error } = await sb
              .from(table)
              .select('id', { count: 'exact', head: true })
              .contains('metadata', { runKey });
            if (error) throw error;
            return count ?? 0;
          },
          { timeout: 30_000 },
        )
        .toBeGreaterThanOrEqual(1);
    }
  });

  test('runs connector lead intake and outreach v2 draft workflow', async ({ adminPage, baseURL }) => {
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-program-18-19-${Date.now()}`;
    const leadName = `Program 18 Lead ${runKey}`;
    createdRunKeys.push(runKey);
    createdNames.push(leadName);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-18-19');
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel).toContainText('Lead Connectors + Outreach V2');

    const form = adminPage.getByTestId('revenue-os-connector-outreach-form');
    await form.getByLabel('Connector outreach proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-connector-outreach').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { data, error } = await sb
            .from('acquisition_accounts')
            .select('id, name, stage, metadata')
            .eq('name', leadName)
            .maybeSingle();
          if (error) throw error;
          return data?.id ?? null;
        },
        { timeout: 30_000 },
      )
      .not.toBeNull();

    const { data: account } = await sb
      .from('acquisition_accounts')
      .select('id, stage, metadata')
      .eq('name', leadName)
      .maybeSingle();
    expect(account?.stage).toBe('drafted');
    expect(account?.metadata?.runKey).toBe(runKey);
    expect(account?.metadata?.outreachV2?.composerVersion).toBe('outreach_v2');

    const tableChecks = [
      ['revenue_lead_source_runs', 'id'],
      ['acquisition_outreach_messages', 'id, subject, metadata'],
      ['revenue_email_queue', 'id, status, metadata'],
    ];
    for (const [table, columns] of tableChecks) {
      await expect
        .poll(
          async () => {
            const { count, error } = await sb
              .from(table)
              .select(columns, { count: 'exact', head: true })
              .contains('metadata', { runKey });
            if (error) throw error;
            return count ?? 0;
          },
          { timeout: 30_000 },
        )
        .toBeGreaterThanOrEqual(1);
    }

    const { data: message } = await sb
      .from('acquisition_outreach_messages')
      .select('subject, body, personalization_notes, metadata')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(message?.metadata?.outreachV2?.qualityScore).toBeGreaterThanOrEqual(90);
    expect(message?.metadata?.outreachV2?.spamRiskScore).toBeLessThanOrEqual(20);
    expect(message?.body).toContain('Booking CTA is buried below the fold');
    expect(message?.personalization_notes).toContain('Composer: outreach_v2');

    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    const providerPanel = adminPage.getByTestId('revenue-os-program-20');
    await expect(providerPanel).toBeVisible({ timeout: 30_000 });
    const emailRow = providerPanel.getByTestId('revenue-os-email-provider-row').filter({ hasText: leadName }).first();
    await expect(emailRow).toBeVisible({ timeout: 30_000 });
    await emailRow.getByTestId('revenue-os-email-send-button').click();
    await adminPage.waitForLoadState('networkidle');

    await expect
      .poll(
        async () => {
          const { data, error } = await sb
            .from('revenue_email_queue')
            .select('id, status, provider_message_id, metadata')
            .contains('metadata', { runKey })
            .maybeSingle();
          if (error) throw error;
          return data?.status === 'sent' && data.provider_message_id?.startsWith('test_revenue-email-')
            ? data.id
            : null;
        },
        { timeout: 30_000 },
      )
      .not.toBeNull();

    const { data: sentQueue } = await sb
      .from('revenue_email_queue')
      .select('id, metadata')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(sentQueue?.metadata?.delivery?.mode).toBe('test');

    const { count: sentEvents } = await sb
      .from('revenue_email_events')
      .select('id', { count: 'exact', head: true })
      .eq('email_queue_id', sentQueue?.id)
      .eq('event_type', 'sent');
    expect(sentEvents ?? 0).toBeGreaterThanOrEqual(1);

    if (process.env.RESEND_WEBHOOK_SECRET) {
      const providerMessageId = `test_revenue-email-${sentQueue?.id}`;
      const webhookBody = JSON.stringify({
        type: 'email.bounced',
        created_at: '2026-06-17T12:00:00.000Z',
        data: {
          email_id: providerMessageId,
          to: [`owner+${runKey}@program18.example`],
          subject: message?.subject,
        },
      });
      const webhookId = `msg_${runKey}`;
      const webhookTimestamp = String(Math.floor(Date.now() / 1000));
      const webhookRes = await adminPage.request.post('/api/email/webhook', {
        data: webhookBody,
        headers: {
          'content-type': 'application/json',
          'svix-id': webhookId,
          'svix-timestamp': webhookTimestamp,
          'svix-signature': signResendWebhook(
            process.env.RESEND_WEBHOOK_SECRET,
            webhookId,
            webhookTimestamp,
            webhookBody,
          ),
        },
      });
      expect(webhookRes.status()).toBe(200);

      await expect
        .poll(
          async () => {
            const { data, error } = await sb
              .from('revenue_email_queue')
              .select('status, metadata')
              .eq('id', sentQueue?.id)
              .maybeSingle();
            if (error) throw error;
            return data?.status ?? null;
          },
          { timeout: 30_000 },
        )
        .toBe('blocked');

      const { count: bouncedEvents } = await sb
        .from('revenue_email_events')
        .select('id', { count: 'exact', head: true })
        .eq('email_queue_id', sentQueue?.id)
        .eq('event_type', 'bounced');
      expect(bouncedEvents ?? 0).toBeGreaterThanOrEqual(1);

      const { count: suppressed } = await sb
        .from('acquisition_suppression_list')
        .select('id', { count: 'exact', head: true })
        .eq('email', `owner+${runKey}@program18.example`);
      expect(suppressed ?? 0).toBeGreaterThanOrEqual(1);
    }
  });

  test('records live lead source credential health and quota proof', async ({ adminPage, baseURL }) => {
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-lead-health-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-21');
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel).toContainText('Live Lead API Credentials + Quotas');
    await expect(panel.getByTestId('revenue-os-lead-quota-decisions')).toBeVisible();

    const form = panel.getByTestId('revenue-os-lead-health-form');
    await form.getByLabel('Lead source health proof run key').fill(runKey);
    await form.getByTestId('revenue-os-record-lead-health').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_lead_source_runs')
            .select('id', { count: 'exact', head: true })
            .contains('metadata', { runKey });
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThanOrEqual(1);

    const { data: source } = await sb
      .from('revenue_lead_sources')
      .select('metadata, qualification_signals')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(source?.metadata?.program).toBe('21');
    expect(source?.metadata?.credentialHealth?.readyProviders).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(source?.metadata?.decisions)).toBe(true);
    expect(JSON.stringify(source?.metadata)).not.toContain(process.env.GOOGLE_PLACES_API_KEY || '__missing_secret__');
    expect(source?.qualification_signals?.some((signal: string) => signal.includes('providers configured'))).toBe(true);
  });

  test('runs job connectors, application packets, and daily runner v2 proof', async ({ adminPage, baseURL }) => {
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-job-auto-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-22-24');
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel).toContainText('Jobs, Packets, Daily Runner V2');
    await expect(panel).toContainText('Greenhouse');
    await expect(panel).toContainText('Remotive');

    const form = panel.getByTestId('revenue-os-job-automation-form');
    await form.getByLabel('Job automation proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-job-automation').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_job_opportunities')
            .select('id', { count: 'exact', head: true })
            .contains('metadata', { runKey });
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThanOrEqual(4);

    const { data: packetApplication } = await sb
      .from('revenue_job_applications')
      .select('id, resume_variant, metadata')
      .contains('metadata', { runKey })
      .limit(1)
      .maybeSingle();
    expect(packetApplication?.resume_variant).toBeTruthy();
    expect(packetApplication?.metadata?.applicationPacket?.coverLetter).toContain('applying for');
    expect(packetApplication?.metadata?.applicationPacket?.checklist).toContain('Tailored resume variant selected');
    await adminPage.reload({ waitUntil: 'networkidle' });
    const refreshedPanel = adminPage.getByTestId('revenue-os-program-22-24');
    await expect(refreshedPanel.getByText('Download packet').first()).toBeVisible({ timeout: 30_000 });

    const { data: dailyRun } = await sb
      .from('revenue_daily_runs')
      .select('scorecard, actions, metadata')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(dailyRun?.metadata?.program).toBe('22_23_24');
    expect(Number(dailyRun?.scorecard?.jobsToApply ?? 0)).toBeGreaterThanOrEqual(1);
    expect(Number(dailyRun?.scorecard?.applicationPacketsReady ?? 0)).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(dailyRun?.actions)).toBe(true);
    expect(dailyRun?.metadata?.dailyRun?.metadata?.packetVariants?.length).toBeGreaterThanOrEqual(1);
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

  test('public inquiry creates a scored acquisition account', async ({ request, baseURL }) => {
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const stamp = Date.now();
    const company = `E2E Inbound ${stamp}`;
    const email = `founder+${stamp}@inbound.example`;
    createdNames.push(company);
    createdEmails.push(email);
    const metricStart = await readTodayMetrics();

    const res = await request.post('/api/inquiry', {
      data: {
        engagement_type: 'project',
        name: 'Avery Stone',
        email,
        company,
        role: 'Founder',
        website_url: `https://inbound-${stamp}.example`,
        timeline: 'asap',
        budget_band: '10-25k',
        scope:
          'We need a better business website, stronger SEO visibility, clearer booking flow, and a premium brand presence for a local service company.',
        source: 'program-7-e2e',
        referrer: '/services/site-starter',
      },
      headers: { 'content-type': 'application/json' },
    });

    expect(res.status()).toBe(200);
    const sb = adminClient();
    await expect
      .poll(async () => {
        const { data } = await sb
          .from('acquisition_accounts')
          .select('id, name, website_url, source, stage, priority, recommended_offer, total_score, metadata')
          .eq('name', company)
          .maybeSingle();
        return data?.id ?? null;
      }, { timeout: 30_000 })
      .not.toBeNull();

    const { data: account } = await sb
      .from('acquisition_accounts')
      .select('id, name, website_url, source, stage, priority, recommended_offer, total_score, metadata')
      .eq('name', company)
      .maybeSingle();

    expect(account?.source).toBe('inbound');
    expect(account?.website_url).toBe(`https://inbound-${stamp}.example/`);
    expect(account?.recommended_offer).toBe('seo_conversion_audit');
    expect(Number(account?.total_score ?? 0)).toBeGreaterThanOrEqual(45);
    expect(account?.metadata?.inbound?.source).toBe('contact');

    const { data: contact } = await sb
      .from('acquisition_contacts')
      .select('email, role_fit, source')
      .eq('account_id', account?.id)
      .maybeSingle();
    expect(contact?.email).toBe(email);
    expect(contact?.role_fit).toBe('founder');
    expect(contact?.source).toBe('inbound');

    await expect.poll(async () => (await readTodayMetrics()).accountsAdded).toBeGreaterThanOrEqual(
      metricStart.accountsAdded + 1,
    );
    await expect.poll(async () => (await readTodayMetrics()).qualified).toBeGreaterThanOrEqual(
      metricStart.qualified + 1,
    );
  });
});

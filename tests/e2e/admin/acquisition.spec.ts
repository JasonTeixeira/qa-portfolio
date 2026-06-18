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

  test.afterAll(async ({}, testInfo) => {
    testInfo.setTimeout(90_000);
    if (createdNames.length === 0 && createdEmails.length === 0 && createdRunKeys.length === 0) return;
    const sb = adminClient();
    for (const runKey of createdRunKeys) {
      await sb.from('revenue_workspace_audit_logs').delete().contains('metadata', { runKey });
      await sb.from('revenue_workspace_billing_boundaries').delete().contains('metadata', { runKey });
      await sb.from('revenue_workspace_usage').delete().contains('metadata', { runKey });
      await sb.from('revenue_workspace_configs').delete().contains('metadata', { runKey });
      await sb.from('revenue_workspace_members').delete().contains('metadata', { runKey });
      await sb.from('revenue_workspaces').delete().eq('run_key', runKey);
      await sb.from('revenue_inbox_action_suggestions').delete().eq('run_key', runKey);
      await sb.from('revenue_inbox_classifications').delete().eq('run_key', runKey);
      await sb.from('revenue_inbox_messages').delete().eq('run_key', runKey);
      await sb.from('revenue_inbox_threads').delete().eq('run_key', runKey);
      await sb.from('revenue_inbox_runs').delete().eq('run_key', runKey);
      await sb.from('revenue_sequence_stop_events').delete().eq('run_key', runKey);
      await sb.from('revenue_suppression_events').delete().eq('run_key', runKey);
      await sb.from('revenue_email_domain_health').delete().eq('run_key', runKey);
      await sb.from('revenue_email_safety_reports').delete().eq('run_key', runKey);
      await sb.from('revenue_ai_quality_gates').delete().eq('run_key', runKey);
      await sb.from('revenue_ai_evidence_citations').delete().eq('run_key', runKey);
      await sb.from('revenue_ai_draft_versions').delete().eq('run_key', runKey);
      await sb.from('revenue_eval_runs').delete().contains('metadata', { runKey });
      await sb.from('revenue_tenants').delete().contains('metadata', { runKey });
      await sb.from('revenue_adaptive_sequences').delete().contains('metadata', { runKey });
      await sb.from('revenue_ml_scores').delete().eq('tenant_id', `tenant-${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`);
      await sb.from('revenue_inbox_events').delete().contains('metadata', { runKey });
      await sb.from('revenue_ai_draft_reviews').delete().contains('metadata', { runKey });
      await sb.from('revenue_worker_dead_letters').delete().contains('metadata', { runKey });
      await sb.from('revenue_worker_attempts').delete().contains('metadata', { runKey });
      await sb.from('revenue_worker_jobs').delete().contains('metadata', { runKey });
      await sb.from('revenue_agent_traces').delete().contains('metadata', { runKey });
      const { data: agentRuns } = await sb.from('revenue_agent_runs').select('id').contains('metadata', { runKey });
      const agentRunIds = (agentRuns ?? []).map((run) => run.id);
      if (agentRunIds.length > 0) {
        await sb.from('revenue_agent_tasks').delete().in('run_id', agentRunIds);
        await sb.from('revenue_agent_runs').delete().in('id', agentRunIds);
      }
      await sb.from('revenue_email_events').delete().contains('metadata', { runKey });
      await sb.from('revenue_email_queue').delete().contains('metadata', { runKey });
      await sb.from('revenue_job_applications').delete().contains('metadata', { runKey });
      await sb.from('revenue_job_opportunities').delete().contains('metadata', { runKey });
      await sb.from('revenue_connector_provenance').delete().contains('metadata', { runKey });
      await sb.from('revenue_connector_import_batches').delete().contains('metadata', { runKey });
      await sb.from('revenue_lead_source_runs').delete().contains('metadata', { runKey });
      await sb.from('revenue_lead_sources').delete().contains('metadata', { runKey });
      await sb.from('revenue_daily_runs').delete().contains('metadata', { runKey });
      await sb.from('revenue_experiments').delete().contains('metadata', { runKey });
      await sb.from('revenue_learning_reports').delete().contains('metadata', { runKey });
      await sb.from('acquisition_suppression_list').delete().eq('email', `owner+${runKey}@program18.example`);
      await sb.from('acquisition_suppression_list').delete().like('email', `suppressed-%@${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.example`);
      const { data: proofAccounts } = await sb
        .from('acquisition_accounts')
        .select('id')
        .contains('metadata', { runKey });
      const proofAccountIds = (proofAccounts ?? []).map((account) => account.id);
      if (proofAccountIds.length > 0) {
        await sb.from('acquisition_outreach_messages').delete().in('account_id', proofAccountIds);
        await sb.from('revenue_website_audit_evidence').delete().in('account_id', proofAccountIds);
        await sb.from('acquisition_accounts').delete().in('id', proofAccountIds);
      }
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
      for (const id of ids) {
        await sb.from('revenue_worker_jobs').delete().contains('metadata', { accountId: id });
      }
      await sb.from('acquisition_suppression_list').delete().in('account_id', ids);
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

    const stamp = Date.now();
    const name = `E2E Acquisition ${stamp}`;
    const website = `https://example.com/?sage_e2e=${stamp}`;
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
    await form.getByPlaceholder('https://example.com').fill(website);
    await form.getByPlaceholder('Industry').fill('Dental');
    await form.getByPlaceholder('Location').fill('Boston MA');
    await form.locator('select[name="businessModel"]').selectOption('local_service');
    await form.locator('select[name="estimatedBudget"]').selectOption('25k_plus');
    await form.getByPlaceholder('Contact name').fill('Jordan Smith');
    await form.getByPlaceholder('Contact title').fill('Owner');
    await form.getByPlaceholder('contact@company.com').fill(`jordan+${Date.now()}@example.com`);
    await form.getByText('site issue').click();
    await form.getByText('dated brand').click();
    await form.getByText('weak SEO').click();
    await form.getByText('weak conversion').click();
    await form.getByText('booking gap').click();
    await form.getByText('owner-operated').click();
    await form.getByText('hiring').click();
    await form.getByText('launch/growth').click();
    await form.locator('[data-testid="acquisition-import-submit"]').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { data, error } = await sb
            .from('acquisition_accounts')
            .select('id')
            .eq('name', name)
            .maybeSingle();
          if (error) throw error;
          return data?.id ?? null;
        },
        { timeout: 30_000 },
      )
      .not.toBeNull();

    const { data: importedAccount } = await sb
      .from('acquisition_accounts')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    await sb
      .from('acquisition_accounts')
      .update({ total_score: 100, priority: 'urgent', next_action_at: new Date().toISOString() })
      .eq('id', importedAccount?.id);
    await adminPage.reload({ waitUntil: 'networkidle' });

    const row = adminPage.locator('[data-testid="acquisition-account-row"]', { hasText: name });
    await expect(row).toBeVisible({ timeout: 30_000 });
    await expect(row).toContainText('SEO visibility gap');
    await expect.poll(async () => (await readTodayMetrics()).accountsAdded).toBeGreaterThanOrEqual(
      metricStart.accountsAdded + 1,
    );

    await row.locator('[data-testid="acquisition-audit-button"]').click();
    await adminPage.waitForLoadState('networkidle');
    await expect(row).toContainText('Live SEO audit evidence stored', { timeout: 30_000 });
    const { data: auditedAccount } = await sb
      .from('acquisition_accounts')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    expect(auditedAccount?.id).toBeTruthy();
    const accountId = auditedAccount?.id;
    if (!accountId) throw new Error('Missing audited account id');

    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_website_audit_evidence')
            .select('id', { count: 'exact', head: true })
            .eq('account_id', accountId);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThanOrEqual(1);

    const { data: offerMapping } = await sb
      .from('revenue_website_audit_offer_mappings')
      .select('recommended_offer, reasons, next_action')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(offerMapping?.recommended_offer).toBe('seo_conversion_audit');
    expect(offerMapping?.next_action).toContain('evidence-grounded outreach');

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
      ['revenue_connector_import_batches', 'id'],
      ['revenue_connector_provenance', 'id'],
      ['revenue_worker_jobs', 'id'],
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

    const { data: connectorBatch } = await sb
      .from('revenue_connector_import_batches')
      .select('status, imported, deduped, quota_remaining, metadata')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(connectorBatch?.status).toBe('completed');
    expect(Number(connectorBatch?.imported ?? 0)).toBeGreaterThanOrEqual(1);
    expect(connectorBatch?.metadata?.liveConnectorBatch?.provenance?.[0]?.legalBasis).toBe('business_context_outreach');

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
            .order('created_at', { ascending: false })
            .limit(1)
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
      .order('created_at', { ascending: false })
      .limit(1)
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
      .order('created_at', { ascending: false })
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
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(dailyRun?.metadata?.program ?? dailyRun?.metadata?.dailyRun?.metadata?.program).toBe('22_23_24');
    expect(Number(dailyRun?.scorecard?.jobsToApply ?? 0)).toBeGreaterThanOrEqual(1);
    expect(Number(dailyRun?.scorecard?.applicationPacketsReady ?? 0)).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(dailyRun?.actions)).toBe(true);
    expect(dailyRun?.metadata?.dailyRun?.metadata?.packetVariants?.length).toBeGreaterThanOrEqual(1);
  });

  test('runs programs 1-8 intelligence proof across agents, workers, AI, inbox, ML, sequences, tenants, and evals', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-intel-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-1-8');
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel).toContainText('Programs 1-8: Intelligence OS');

    const form = panel.getByTestId('revenue-os-intelligence-proof-form');
    await form.getByLabel('Revenue OS intelligence proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-intelligence-proof').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    const tables = [
      'revenue_agent_runs',
      'revenue_agent_tasks',
      'revenue_agent_traces',
      'revenue_worker_jobs',
      'revenue_worker_attempts',
      'revenue_worker_dead_letters',
      'revenue_ai_draft_reviews',
      'revenue_inbox_events',
      'revenue_adaptive_sequences',
      'revenue_tenants',
      'revenue_eval_runs',
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

    const tenantId = `tenant-${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_ml_scores')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThanOrEqual(1);

    const { data: evalRun } = await sb
      .from('revenue_eval_runs')
      .select('overall_status, pass_rate, metadata')
      .contains('metadata', { runKey })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(evalRun?.overall_status).toBe('pass');
    expect(Number(evalRun?.pass_rate ?? 0)).toBe(100);
    expect(evalRun?.metadata?.program).toBe('1_8_intelligence_os');
  });

  test('runs program 4 AI personalization with evidence locks and stored citations', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-ai-lock-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-4');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Program 4: AI Personalization Evidence Locks');

    const form = panel.getByTestId('revenue-os-ai-personalization-form');
    await form.getByLabel('Revenue OS AI personalization proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-ai-personalization').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_ai_draft_versions')
            .select('id', { count: 'exact', head: true })
            .eq('run_key', runKey);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThanOrEqual(1);

    const { data: draftVersion } = await sb
      .from('revenue_ai_draft_versions')
      .select('id, account_id, send_mode, cited_evidence_ids, structured_output, metadata')
      .eq('run_key', runKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(draftVersion?.send_mode).toBe('manual_review');
    expect(draftVersion?.metadata?.evidenceLocked).toBe(true);
    expect(draftVersion?.structured_output?.claims?.length).toBeGreaterThanOrEqual(2);

    const { data: citations } = await sb
      .from('revenue_ai_evidence_citations')
      .select('evidence_id, evidence_row_id, claim')
      .eq('run_key', runKey);
    expect(citations?.length).toBeGreaterThanOrEqual(2);
    expect(citations?.every((citation) => Boolean(citation.evidence_row_id))).toBe(true);

    const citationIds = (citations ?? []).map((citation) => citation.evidence_id);
    const { data: evidenceRows } = await sb
      .from('revenue_website_audit_evidence')
      .select('evidence_key')
      .eq('run_key', runKey)
      .in('evidence_key', citationIds);
    expect(evidenceRows?.length).toBe(citationIds.length);

    const { data: gates } = await sb
      .from('revenue_ai_quality_gates')
      .select('gate_key, status')
      .eq('run_key', runKey);
    expect(gates?.length).toBeGreaterThanOrEqual(6);
    expect(gates?.every((gate) => gate.status === 'pass')).toBe(true);

    const { data: review } = await sb
      .from('revenue_ai_draft_reviews')
      .select('approved, hallucination_risk, spam_risk, cited_evidence_ids, metadata')
      .contains('metadata', { runKey })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(review?.approved).toBe(true);
    expect(review?.hallucination_risk).toBe(0);
    expect(review?.spam_risk).toBeLessThanOrEqual(25);
    expect(review?.cited_evidence_ids).toEqual(draftVersion?.cited_evidence_ids);
  });

  test('runs program 5 email safety, deliverability, and sequence controls', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-email-safe-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-5');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Program 5: Email Safety + Sequences');

    const form = panel.getByTestId('revenue-os-email-safety-form');
    await form.getByLabel('Revenue OS email safety proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-email-safety').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_email_safety_reports')
            .select('id', { count: 'exact', head: true })
            .eq('run_key', runKey);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThanOrEqual(1);

    const { data: report } = await sb
      .from('revenue_email_safety_reports')
      .select('status, scorecard')
      .eq('run_key', runKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(report?.status).toBe('healthy');
    expect(Number(report?.scorecard?.totalMessages ?? 0)).toBe(50);
    expect(Number(report?.scorecard?.safeToSend ?? 0)).toBe(8);
    expect(Number(report?.scorecard?.blocked ?? 0)).toBe(42);
    expect(Number(report?.scorecard?.suppressionEvents ?? 0)).toBe(8);
    expect(Number(report?.scorecard?.sequenceStops ?? 0)).toBe(5);

    const { data: domainHealth } = await sb
      .from('revenue_email_domain_health')
      .select('status, daily_cap, sent_today, remaining_today, reasons')
      .eq('run_key', runKey)
      .maybeSingle();
    expect(domainHealth?.status).toBe('healthy');
    expect(Number(domainHealth?.daily_cap ?? 0)).toBe(50);
    expect(Number(domainHealth?.sent_today ?? 0)).toBe(40);

    const { count: suppressionEvents } = await sb
      .from('revenue_suppression_events')
      .select('id', { count: 'exact', head: true })
      .eq('run_key', runKey);
    expect(suppressionEvents ?? 0).toBe(8);

    const { count: sequenceStops } = await sb
      .from('revenue_sequence_stop_events')
      .select('id', { count: 'exact', head: true })
      .eq('run_key', runKey);
    expect(sequenceStops ?? 0).toBe(5);

    const { count: scheduled } = await sb
      .from('revenue_email_queue')
      .select('id', { count: 'exact', head: true })
      .contains('metadata', { runKey })
      .eq('status', 'scheduled');
    const { count: blocked } = await sb
      .from('revenue_email_queue')
      .select('id', { count: 'exact', head: true })
      .contains('metadata', { runKey })
      .eq('status', 'blocked');
    expect(scheduled ?? 0).toBe(8);
    expect(blocked ?? 0).toBe(42);
  });

  test('runs program 6 inbox reply intelligence and updates CRM actions', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-inbox-reply-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-6');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Program 6: Inbox + Reply Intelligence');

    const form = panel.getByTestId('revenue-os-inbox-reply-form');
    await form.getByLabel('Revenue OS inbox reply proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-inbox-reply').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_inbox_runs')
            .select('id', { count: 'exact', head: true })
            .eq('run_key', runKey);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThanOrEqual(1);

    const { data: run } = await sb
      .from('revenue_inbox_runs')
      .select('status, scorecard')
      .eq('run_key', runKey)
      .maybeSingle();
    expect(run?.status).toBe('completed');
    expect(Number(run?.scorecard?.totalReplies ?? 0)).toBe(3);
    expect(Number(run?.scorecard?.matchedReplies ?? 0)).toBe(2);
    expect(Number(run?.scorecard?.meetingIntent ?? 0)).toBe(1);
    expect(Number(run?.scorecard?.sequenceStops ?? 0)).toBe(1);

    const { count: threads } = await sb
      .from('revenue_inbox_threads')
      .select('id', { count: 'exact', head: true })
      .eq('run_key', runKey);
    const { count: messages } = await sb
      .from('revenue_inbox_messages')
      .select('id', { count: 'exact', head: true })
      .eq('run_key', runKey);
    const { data: classifications } = await sb
      .from('revenue_inbox_classifications')
      .select('intent, account_id, email_queue_id')
      .eq('run_key', runKey);
    const { count: actions } = await sb
      .from('revenue_inbox_action_suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('run_key', runKey);
    expect(threads ?? 0).toBe(3);
    expect(messages ?? 0).toBe(3);
    expect(classifications?.map((item) => item.intent).sort()).toEqual(['meeting_intent', 'objection', 'wrong_person']);
    expect(actions ?? 0).toBe(3);
    expect(classifications?.some((item) => item.intent === 'meeting_intent' && item.account_id && item.email_queue_id)).toBe(true);

    const { count: sequenceStops } = await sb
      .from('revenue_sequence_stop_events')
      .select('id', { count: 'exact', head: true })
      .eq('run_key', runKey)
      .eq('reason', 'reply_received');
    expect(sequenceStops ?? 0).toBe(1);

    const { data: account } = await sb
      .from('acquisition_accounts')
      .select('stage, next_action, metadata')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(account?.stage).toBe('meeting');
    expect(account?.next_action).toBe('Send meeting times and booking link.');
  });

  test('runs program 7 multi-tenant SaaS foundation with isolated client workspaces', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-tenant-saas-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-7');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Program 7: Multi-Tenant SaaS Foundation');

    const form = panel.getByTestId('revenue-os-tenant-saas-form');
    await form.getByLabel('Revenue OS tenant SaaS proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-tenant-saas').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_workspaces')
            .select('id', { count: 'exact', head: true })
            .eq('run_key', runKey);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBe(2);

    const { data: workspaces } = await sb
      .from('revenue_workspaces')
      .select('id, tenant_key, business_name, metadata')
      .eq('run_key', runKey)
      .order('tenant_key', { ascending: true });
    expect(workspaces?.length ?? 0).toBe(2);
    expect(new Set(workspaces?.map((workspace) => workspace.tenant_key)).size).toBe(2);
    expect(new Set(workspaces?.map((workspace) => workspace.business_name)).size).toBe(1);
    expect(workspaces?.every((workspace) => workspace.metadata?.isolationProof?.crossTenantAccessBlocked === true)).toBe(true);

    const tenantKeys = workspaces?.map((workspace) => workspace.tenant_key) ?? [];
    const { count: members } = await sb
      .from('revenue_workspace_members')
      .select('id', { count: 'exact', head: true })
      .in('tenant_key', tenantKeys);
    const { data: configs } = await sb
      .from('revenue_workspace_configs')
      .select('tenant_key, icp, offers, limits')
      .in('tenant_key', tenantKeys)
      .order('tenant_key', { ascending: true });
    const { count: usage } = await sb
      .from('revenue_workspace_usage')
      .select('id', { count: 'exact', head: true })
      .in('tenant_key', tenantKeys);
    const { count: billing } = await sb
      .from('revenue_workspace_billing_boundaries')
      .select('id', { count: 'exact', head: true })
      .in('tenant_key', tenantKeys);
    const { count: auditLogs } = await sb
      .from('revenue_workspace_audit_logs')
      .select('id', { count: 'exact', head: true })
      .in('tenant_key', tenantKeys);

    expect(members ?? 0).toBe(5);
    expect(configs?.length ?? 0).toBe(2);
    expect(configs?.some((config) => config.icp?.targetSegment === 'owner-led dental offices')).toBe(true);
    expect(configs?.some((config) => config.icp?.targetSegment === 'boutique med spas')).toBe(true);
    expect(configs?.every((config) => Array.isArray(config.offers) && config.offers.length > 0)).toBe(true);
    expect(usage ?? 0).toBe(2);
    expect(billing ?? 0).toBe(2);
    expect(auditLogs ?? 0).toBeGreaterThanOrEqual(8);
  });

  test('bulk-imports comma-separated lead rows', async ({ adminPage, baseURL }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const stamp = Date.now();
    const name = `E2E Bulk ${stamp}`;
    const website = `bulk-${stamp}.example`;
    createdNames.push(name);
    const email = `alex+${stamp}@example.com`;
    createdEmails.push(email);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const bulk = adminPage.locator('[data-testid="acquisition-bulk-form"]');
    await expect(bulk).toBeVisible({ timeout: 60_000 });
    await bulk
      .locator('textarea[name="leads"]')
      .fill([
        'company,website,industry,location,contact,title,email,budget,model,source,notes,tags',
        `${name},${website},Home Services,Austin TX,Alex Rivera,Founder,${email},25k_plus,local_service,directory,"weak seo; weak conversion; booking gap; hiring; launch","owner operated|outdated brand|broken website"`,
      ].join('\n'));
    await bulk.locator('[data-testid="acquisition-bulk-submit"]').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { data, error } = await sb
            .from('acquisition_accounts')
            .select('id, industry')
            .eq('name', name)
            .maybeSingle();
          if (error) throw error;
          return data?.industry ?? null;
        },
        { timeout: 30_000 },
      )
      .toBe('Home Services');
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

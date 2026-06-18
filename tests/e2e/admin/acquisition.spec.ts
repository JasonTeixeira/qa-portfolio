import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { test, expect } from '../../fixtures/auth';
import {
  buildRevenueApiKey,
  signRevenueWebhookPayload,
} from '../../../lib/revenue-os/public-api';

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
    testInfo.setTimeout(180_000);
    if (createdNames.length === 0 && createdEmails.length === 0 && createdRunKeys.length === 0) return;
    const sb = adminClient();
    for (const runKey of createdRunKeys) {
      await sb.from('revenue_api_webhook_events').delete().eq('tenant_key', `tenant-${runKey}`);
      await sb.from('revenue_api_ingestion_events').delete().eq('tenant_key', `tenant-${runKey}`);
      await sb.from('revenue_api_requests').delete().eq('tenant_key', `tenant-${runKey}`);
      await sb.from('revenue_api_keys').delete().eq('tenant_key', `tenant-${runKey}`);
      await sb.from('revenue_ops_load_smokes').delete().eq('run_key', runKey);
      await sb.from('revenue_ops_ci_proofs').delete().eq('run_key', runKey);
      await sb.from('revenue_ops_health_snapshots').delete().eq('run_key', runKey);
      await sb.from('revenue_ai_ml_eval_harness_runs').delete().eq('run_key', runKey);
      await sb.from('revenue_load_scale_proofs').delete().eq('run_key', runKey);
      await sb.from('revenue_deliverability_audits').delete().eq('run_key', runKey);
      await sb.from('revenue_client_surface_proofs').delete().eq('run_key', runKey);
      await sb.from('revenue_privacy_workflow_jobs').delete().eq('run_key', runKey);
      await sb.from('revenue_observability_slo_snapshots').delete().eq('run_key', runKey);
      await sb.from('revenue_worker_runtime_executions').delete().eq('run_key', runKey);
      await sb.from('revenue_live_integration_checks').delete().eq('run_key', runKey);
      await sb.from('revenue_institutional_program_runs').delete().eq('run_key', runKey);
      await sb.from('revenue_governance_reports').delete().contains('metadata', { runKey });
      await sb.from('revenue_privacy_requests').delete().contains('metadata', { runKey });
      await sb.from('revenue_compliance_records').delete().contains('metadata', { runKey });
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
      await sb.from('revenue_ml_calibration_reports').delete().contains('metadata', { runKey });
      await sb.from('revenue_ml_scoring_decisions').delete().contains('metadata', { runKey });
      await sb.from('revenue_ml_model_versions').delete().contains('metadata', { runKey });
      await sb.from('revenue_ml_outcome_labels').delete().contains('metadata', { runKey });
      await sb.from('revenue_ml_feature_snapshots').delete().contains('metadata', { runKey });
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
      await sb.from('acquisition_daily_metrics').delete().contains('metadata', { runKey });
      await sb.from('revenue_connector_provenance').delete().contains('metadata', { runKey });
      await sb.from('revenue_connector_import_batches').delete().contains('metadata', { runKey });
      await sb.from('revenue_lead_source_runs').delete().contains('metadata', { runKey });
      await sb.from('revenue_lead_sources').delete().contains('metadata', { runKey });
      await sb.from('revenue_daily_runs').delete().contains('metadata', { runKey });
      await sb.from('revenue_experiments').delete().contains('metadata', { runKey });
      await sb.from('revenue_learning_reports').delete().contains('metadata', { runKey });
      await sb.from('acquisition_suppression_list').delete().eq('email', `owner+${runKey}@program18.example`);
      await sb.from('acquisition_suppression_list').delete().eq('email', `blocked@${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.example`);
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
    const domain = `acquisition-${stamp}.e2e.test`;
    const website = `https://www.iana.org/?sage_e2e=${stamp}`;
    const contactEmail = `jordan+${stamp}@${domain}`;
    createdNames.push(name);
    createdEmails.push(contactEmail);
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
    await form.getByPlaceholder('contact@company.com').fill(contactEmail);
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
    await expect
      .poll(async () => (await readTodayMetrics()).accountsAdded, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(metricStart.accountsAdded + 1);

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
    await expect(row).toContainText('Verify website/contact data before outreach', {
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
    await expect
      .poll(async () => (await readTodayMetrics()).drafted, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(metricStart.drafted + 1);
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
    await expect
      .poll(async () => (await readTodayMetrics()).sent, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(metricStart.sent + 1);

    await draft.getByRole('button', { name: 'Replied' }).click();
    await adminPage.waitForLoadState('networkidle');
    await expectMessageStatus('replied');
    await expect
      .poll(async () => (await readTodayMetrics()).replies, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(metricStart.replies + 1);

    await draft.getByRole('button', { name: 'Booked' }).click();
    await adminPage.waitForLoadState('networkidle');
    await expectMessageStatus('booked');
    await expect
      .poll(async () => (await readTodayMetrics()).meetings, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(metricStart.meetings + 1);

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
    test.setTimeout(90_000);
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

  test('runs program 9 ML scoring and learning loop with calibration persistence', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-ml-learning-${Date.now()}`;
    createdRunKeys.push(runKey);
    const tenantId = `tenant-${runKey.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-9');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Program 9: ML Scoring + Learning Loop');

    const form = panel.getByTestId('revenue-os-ml-learning-form');
    await form.getByLabel('Revenue OS ML learning proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-ml-learning').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_ml_feature_snapshots')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBe(5);

    const { count: labels } = await sb
      .from('revenue_ml_outcome_labels')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);
    expect(labels ?? 0).toBe(4);

    const { data: model } = await sb
      .from('revenue_ml_model_versions')
      .select('model_version, sample_size, metrics, feature_importance')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(model?.model_version).toBe(`${tenantId}-local-v1`);
    expect(Number(model?.sample_size ?? 0)).toBe(4);
    expect(Number(model?.metrics?.trainingAccuracy ?? 0)).toBeGreaterThanOrEqual(0.75);
    expect(Number(model?.feature_importance?.fit ?? 0)).toBeGreaterThan(0);

    const { data: decisions } = await sb
      .from('revenue_ml_scoring_decisions')
      .select('decision, blended_score, calibrated_probability, feature_snapshot')
      .eq('tenant_id', tenantId);
    expect(decisions?.length ?? 0).toBe(3);
    expect(decisions?.some((decision) => decision.decision === 'prioritize')).toBe(true);
    expect(decisions?.every((decision) => Number(decision.calibrated_probability) >= 0)).toBe(true);
    expect(decisions?.every((decision) => decision.feature_snapshot?.features)).toBe(true);

    const { data: report } = await sb
      .from('revenue_ml_calibration_reports')
      .select('brier_score, bands, drift_warnings')
      .eq('tenant_id', tenantId)
      .maybeSingle();
    expect(Number(report?.brier_score ?? -1)).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(report?.bands)).toBe(true);
    expect(report?.drift_warnings).toContain('low_sample_size');

    const { count: legacyScores } = await sb
      .from('revenue_ml_scores')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);
    expect(legacyScores ?? 0).toBe(3);
  });

  test('runs program 10 revenue intelligence dashboard with seeded metrics and queue proof', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-revenue-intel-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-10');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Program 10: Revenue Intelligence Dashboard');

    const form = panel.getByTestId('revenue-os-revenue-intelligence-form');
    await form.getByLabel('Revenue OS intelligence dashboard proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-revenue-intelligence').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('acquisition_daily_metrics')
            .select('metric_date', { count: 'exact', head: true })
            .contains('metadata', { runKey });
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBe(3);

    const { count: accounts } = await sb
      .from('acquisition_accounts')
      .select('id', { count: 'exact', head: true })
      .contains('metadata', { runKey });
    expect(accounts ?? 0).toBe(3);

    const { count: emailQueueRows } = await sb
      .from('revenue_email_queue')
      .select('id', { count: 'exact', head: true })
      .contains('metadata', { runKey });
    expect(emailQueueRows ?? 0).toBe(3);

    const { data: application } = await sb
      .from('revenue_job_applications')
      .select('stage, resume_variant, metadata')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(application?.stage).toBe('interview');
    expect(application?.resume_variant).toBe('ai_application_engineer');

    await adminPage.reload({ waitUntil: 'networkidle' });
    const refreshed = adminPage.getByTestId('revenue-os-program-10');
    await expect(refreshed.getByTestId('revenue-intelligence-kpis')).toContainText('Replies');
    await expect(refreshed.getByTestId('revenue-intelligence-priority-queue')).toContainText(`Program 10 Directory Follow Up ${runKey}`);
    await expect(refreshed.getByTestId('revenue-intelligence-client-report')).toContainText('Recommended focus');
  });

  test('runs program 11 compliance privacy and governance proof', async ({
    adminPage,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-governance-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-11');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Program 11: Compliance, Privacy + Governance');

    const form = panel.getByTestId('revenue-os-governance-form');
    await form.getByLabel('Revenue OS governance proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-governance').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_compliance_records')
            .select('id', { count: 'exact', head: true })
            .contains('metadata', { runKey });
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBe(2);

    const { data: report } = await sb
      .from('revenue_governance_reports')
      .select('status, score, allowed_contacts, blocked_contacts, source_coverage, controls')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(report?.status).toBe('blocked');
    expect(Number(report?.allowed_contacts ?? 0)).toBe(1);
    expect(Number(report?.blocked_contacts ?? 0)).toBe(1);
    expect(Number(report?.source_coverage ?? 0)).toBeGreaterThanOrEqual(50);
    expect(report?.controls).toContain('privacy request workflow tracked');

    const { data: privacy } = await sb
      .from('revenue_privacy_requests')
      .select('request_type, status, required_steps')
      .contains('metadata', { runKey })
      .maybeSingle();
    expect(privacy?.request_type).toBe('suppress');
    expect(privacy?.status).toBe('received');
    expect(privacy?.required_steps).toContain('write suppression event');

    await adminPage.reload({ waitUntil: 'networkidle' });
    await expect(adminPage.getByTestId('revenue-os-program-11')).toContainText('Governance reports');
  });

  test('runs program 12 production operations CI proof and health endpoint', async ({
    adminPage,
    request,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-ops-proof-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-12');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Program 12: Production Operations + CI Proof');

    const form = panel.getByTestId('revenue-os-production-ops-form');
    await form.getByLabel('Revenue OS production ops proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-production-ops').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_ops_ci_proofs')
            .select('id', { count: 'exact', head: true })
            .eq('run_key', runKey);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBe(1);

    const { data: ciProof } = await sb
      .from('revenue_ops_ci_proofs')
      .select('ready, score, gates')
      .eq('run_key', runKey)
      .maybeSingle();
    expect(ciProof?.ready).toBe(true);
    expect(Number(ciProof?.score ?? 0)).toBe(100);
    expect(Array.isArray(ciProof?.gates)).toBe(true);

    const { data: loadSmoke } = await sb
      .from('revenue_ops_load_smokes')
      .select('passed, score, checks')
      .eq('run_key', runKey)
      .maybeSingle();
    expect(loadSmoke?.passed).toBe(true);
    expect(Number(loadSmoke?.score ?? 0)).toBe(100);
    expect(loadSmoke?.checks?.some((check: { label?: string }) => check.label === 'worker queue volume')).toBe(true);

    const health = await request.get('/api/health/revenue-os');
    expect([200, 503]).toContain(health.status());
    const healthBody = await health.json();
    expect(healthBody.checks?.some((check: { key?: string }) => check.key === 'db')).toBe(true);
    expect(healthBody.checks?.some((check: { key?: string }) => check.key === 'queues')).toBe(true);

    await adminPage.reload({ waitUntil: 'networkidle' });
    await expect(adminPage.getByTestId('revenue-os-program-12')).toContainText('CI proofs');
  });

  test('runs programs 13-21 institutional production hardening proof', async ({
    adminPage,
  }) => {
    test.setTimeout(90_000);

    const runKey = `e2e-institutional-${Date.now()}`;
    createdRunKeys.push(runKey);

    await adminPage.goto('/admin/acquisition', { waitUntil: 'domcontentloaded' });
    const panel = adminPage.getByTestId('revenue-os-program-13-21');
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel).toContainText('Programs 13-21: Institutional Production Hardening');

    const form = panel.getByTestId('revenue-os-institutional-hardening-form');
    await form.getByLabel('Revenue OS institutional hardening proof run key').fill(runKey);
    await form.getByTestId('revenue-os-run-institutional-hardening').click();
    await adminPage.waitForLoadState('networkidle');

    const sb = adminClient();
    await expect
      .poll(
        async () => {
          const { count, error } = await sb
            .from('revenue_institutional_program_runs')
            .select('id', { count: 'exact', head: true })
            .eq('run_key', runKey);
          if (error) throw error;
          return count ?? 0;
        },
        { timeout: 30_000 },
      )
      .toBe(9);

    const { data: liveChecks } = await sb
      .from('revenue_live_integration_checks')
      .select('provider, configured, live_verified, mode')
      .eq('run_key', runKey);
    expect(liveChecks?.length).toBe(5);
    expect(liveChecks?.some((check: { provider?: string }) => check.provider === 'resend')).toBe(true);

    const { data: worker } = await sb
      .from('revenue_worker_runtime_executions')
      .select('claimed_jobs, completed_jobs, failed_jobs, status')
      .eq('run_key', runKey)
      .maybeSingle();
    expect(Number(worker?.claimed_jobs ?? 0)).toBeGreaterThanOrEqual(4);
    expect(Number(worker?.completed_jobs ?? 0)).toBeGreaterThanOrEqual(3);

    const { count: privacyJobs } = await sb
      .from('revenue_privacy_workflow_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('run_key', runKey);
    expect(privacyJobs).toBe(4);

    const { count: clientSurfaces } = await sb
      .from('revenue_client_surface_proofs')
      .select('id', { count: 'exact', head: true })
      .eq('run_key', runKey);
    expect(clientSurfaces).toBe(2);

    const { data: loadProof } = await sb
      .from('revenue_load_scale_proofs')
      .select('tenants, leads, jobs, worker_jobs, status')
      .eq('run_key', runKey)
      .maybeSingle();
    expect(Number(loadProof?.tenants ?? 0)).toBe(5);
    expect(Number(loadProof?.leads ?? 0)).toBe(1000);
    expect(Number(loadProof?.worker_jobs ?? 0)).toBe(10_000);

    const { data: evalRun } = await sb
      .from('revenue_ai_ml_eval_harness_runs')
      .select('score, hallucination_failures, spam_failures')
      .eq('run_key', runKey)
      .maybeSingle();
    expect(Number(evalRun?.score ?? 0)).toBeGreaterThanOrEqual(85);
    expect(Number(evalRun?.hallucination_failures ?? 0)).toBe(0);
    expect(Number(evalRun?.spam_failures ?? 0)).toBe(0);

    await adminPage.reload({ waitUntil: 'networkidle' });
    await expect(adminPage.getByTestId('revenue-os-program-13-21')).toContainText('Program runs');
    await expect(adminPage.getByTestId('revenue-os-dead-letter-replay')).toBeVisible();
    await expect(adminPage.getByTestId('revenue-os-deliverability-dns')).toBeVisible();
    await expect(adminPage.getByTestId('revenue-os-privacy-workflows')).toBeVisible();
    await expect(adminPage.getByTestId('revenue-os-api-key-management')).toBeVisible();
  });

  test('runs program 8 public API ingestion exports and signed webhooks', async ({
    request,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    test.skip(
      !!baseURL && /www\.sageideas\.dev$/i.test(new URL(baseURL).host),
      'Skipping against prod.',
    );

    const runKey = `e2e-api-${Date.now()}`;
    createdRunKeys.push(runKey);
    const tenantKey = `tenant-${runKey}`;
    const sb = adminClient();
    const { data: workspace, error: workspaceError } = await sb.from('revenue_workspaces').insert({
      run_key: runKey,
      tenant_key: tenantKey,
      business_name: `Program 8 API ${runKey}`,
      owner_email: `owner+${runKey}@program8.example`,
      status: 'active',
      metadata: { runKey, program: '8_public_api' },
    }).select('id').maybeSingle();
    expect(workspaceError).toBeNull();
    expect(workspace?.id).toBeTruthy();

    const key = buildRevenueApiKey({
      tenantKey,
      scopes: ['leads:write', 'jobs:write', 'events:write', 'audits:write', 'outcomes:write', 'exports:read', 'webhooks:write'],
      entropy: runKey,
    });
    await sb.from('revenue_api_keys').insert({
      workspace_id: workspace?.id,
      tenant_key: tenantKey,
      name: `Program 8 E2E ${runKey}`,
      key_hash: key.keyHash,
      key_prefix: key.prefix,
      last_four: key.lastFour,
      scopes: key.scopes,
      status: 'active',
      metadata: { runKey, program: '8_public_api' },
    });

    const authHeaders = {
      Authorization: `Bearer ${key.secret}`,
      'Content-Type': 'application/json',
    };
    const lead = await request.post('/api/revenue-os/v1/leads', {
      headers: { ...authHeaders, 'Idempotency-Key': `${runKey}-lead` },
      data: {
        externalId: `${runKey}-lead`,
        name: `Program 8 Lead ${runKey}`,
        websiteUrl: `https://${runKey}.example`,
        industry: 'Dental',
        location: 'Remote',
        contact: { name: 'Avery API', email: `avery+${runKey}@program8.example` },
        tags: ['program-8', 'api'],
      },
    });
    expect(lead.status()).toBe(202);
    const leadBody = await lead.json();
    expect(leadBody.accountId).toBeTruthy();

    const duplicateLead = await request.post('/api/revenue-os/v1/leads', {
      headers: { ...authHeaders, 'Idempotency-Key': `${runKey}-lead` },
      data: {
        externalId: `${runKey}-lead`,
        name: `Program 8 Lead ${runKey}`,
      },
    });
    expect(duplicateLead.status()).toBe(200);
    expect((await duplicateLead.json()).duplicate).toBe(true);

    const job = await request.post('/api/revenue-os/v1/jobs', {
      headers: { ...authHeaders, 'Idempotency-Key': `${runKey}-job` },
      data: {
        externalId: `${runKey}-job`,
        title: 'Junior AI Application Builder',
        company: `Program 8 Company ${runKey}`,
        jobUrl: `https://jobs.example/${runKey}`,
        score: 82,
        atsKeywords: ['TypeScript', 'LLM', 'Next.js'],
      },
    });
    expect(job.status()).toBe(202);
    expect((await job.json()).jobId).toBeTruthy();

    const event = await request.post('/api/revenue-os/v1/events', {
      headers: { ...authHeaders, 'Idempotency-Key': `${runKey}-event` },
      data: {
        externalId: `${runKey}-event`,
        type: 'reply.received',
        payload: { source: 'api-e2e' },
      },
    });
    expect(event.status()).toBe(202);

    const outcome = await request.post('/api/revenue-os/v1/outcomes', {
      headers: { ...authHeaders, 'Idempotency-Key': `${runKey}-outcome` },
      data: {
        externalId: `${runKey}-outcome`,
        accountId: leadBody.accountId,
        stage: 'meeting',
        revenueValue: 5000,
      },
    });
    expect(outcome.status()).toBe(202);

    const exportJson = await request.get('/api/revenue-os/v1/exports?resource=accounts&format=json', {
      headers: { Authorization: `Bearer ${key.secret}` },
    });
    expect(exportJson.status()).toBe(200);
    const exportBody = await exportJson.json();
    expect(exportBody.rows.some((row: { id: string }) => row.id === leadBody.accountId)).toBe(true);

    const webhookBody = JSON.stringify({
      provider: 'program8',
      type: 'meeting.booked',
      id: `${runKey}-webhook`,
      data: { accountId: leadBody.accountId },
    });
    const timestamp = new Date().toISOString();
    const webhook = await request.post('/api/revenue-os/v1/webhooks', {
      headers: {
        Authorization: `Bearer ${key.secret}`,
        'Content-Type': 'application/json',
        'X-Revenue-OS-Timestamp': timestamp,
        'X-Revenue-OS-Signature': signRevenueWebhookPayload({
          secret: key.secret,
          timestamp,
          body: webhookBody,
        }),
      },
      data: webhookBody,
    });
    expect(webhook.status()).toBe(202);
    expect((await webhook.json()).webhookEventId).toBeTruthy();

    const { count: ingestions } = await sb
      .from('revenue_api_ingestion_events')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_key', tenantKey);
    const { count: requests } = await sb
      .from('revenue_api_requests')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_key', tenantKey);
    const { count: webhooks } = await sb
      .from('revenue_api_webhook_events')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_key', tenantKey);
    const { data: updatedAccount } = await sb
      .from('acquisition_accounts')
      .select('stage, metadata')
      .eq('id', leadBody.accountId)
      .maybeSingle();

    expect(ingestions ?? 0).toBeGreaterThanOrEqual(5);
    expect(requests ?? 0).toBeGreaterThanOrEqual(5);
    expect(webhooks ?? 0).toBe(1);
    expect(updatedAccount?.stage).toBe('meeting');
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

    await expect
      .poll(async () => (await readTodayMetrics()).accountsAdded, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(metricStart.accountsAdded + 1);
    await expect
      .poll(async () => (await readTodayMetrics()).qualified, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(metricStart.qualified + 1);
  });
});

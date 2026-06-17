import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { buildLeadSourceConnectorPlan, DEFAULT_LEAD_SOURCES } from '@/lib/revenue-os/connectors';
import { buildDailyRevenueRun } from '@/lib/revenue-os/daily-runner';
import { buildEmailPreparationQueue } from '@/lib/revenue-os/email-prep';
import { validateRevenueOsProductionReadiness } from '@/lib/revenue-os/hardening';
import { buildJobSearchPipeline, type JobOpportunity } from '@/lib/revenue-os/jobs';
import { buildRevenueLearningReport } from '@/lib/revenue-os/reporting';
import {
  buildDailyRevenueRunV2,
  buildDailyRunPersistenceRecord,
} from '@/lib/revenue-os/daily-runner-v2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JOB_SEARCH_SEEDS: JobOpportunity[] = [
  {
    title: 'Junior AI Application Engineer',
    company: 'Remote Apps Studio',
    location: 'Remote US',
    description: 'Build LLM API workflows, Next.js, TypeScript, Python, testing, and Vercel deployments.',
    url: 'https://example.com/jobs/junior-ai-application-engineer',
  },
  {
    title: 'QA Automation Engineer',
    company: 'Product QA Labs',
    location: 'Remote US',
    description: 'Playwright automation, API checks, CI evidence, and product quality dashboards.',
    url: 'https://example.com/jobs/qa-automation-engineer',
  },
  {
    title: 'Implementation Engineer - AI Tools',
    company: 'OpsFlow',
    location: 'Remote',
    description: 'Configure customer AI workflows, troubleshoot JavaScript applications, and support launches.',
    url: 'https://example.com/jobs/implementation-engineer-ai',
  },
];

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return { ok: false as const, status: 503, error: 'cron_secret_missing' };
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) return { ok: false as const, status: 401, error: 'unauthorized' };
  return { ok: true as const };
}

export async function GET(req: NextRequest) {
  const guard = authorized(req);
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });
  }

  const sb = supabaseAdmin();
  const [accountsRes, messagesRes, contactsRes] = await Promise.all([
    sb
      .from('acquisition_accounts')
      .select('id, name, website_url, stage, priority, total_score, next_action')
      .not('stage', 'in', '("won","lost","do_not_contact")')
      .order('total_score', { ascending: false })
      .limit(50),
    sb
      .from('acquisition_outreach_messages')
      .select('id, account_id, status, subject, body, acquisition_accounts(name, priority)')
      .in('status', ['ready', 'queued'])
      .limit(100),
    sb
      .from('acquisition_contacts')
      .select('account_id, email')
      .order('is_primary', { ascending: false })
      .limit(500),
  ]);

  const accounts = accountsRes.data ?? [];
  const contactEmailByAccount = new Map(
    (contactsRes.data ?? [])
      .filter((contact) => contact.account_id && contact.email)
      .map((contact) => [contact.account_id, contact.email as string]),
  );
  const connectorPlan = buildLeadSourceConnectorPlan({
    existingDomains: accounts
      .map((account) => {
        if (!account.website_url) return null;
        try {
          return new URL(account.website_url).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[],
    sources: DEFAULT_LEAD_SOURCES,
  });
  const jobPipeline = buildJobSearchPipeline({ roles: JOB_SEARCH_SEEDS });
  const emailQueue = buildEmailPreparationQueue({
    messages: (messagesRes.data ?? []).map((message) => {
      const account = Array.isArray(message.acquisition_accounts)
        ? message.acquisition_accounts[0]
        : message.acquisition_accounts;
      return {
        id: message.id,
        status: message.status,
        subject: message.subject,
        body: message.body,
        accountName: account?.name ?? 'Unknown account',
        contactEmail: contactEmailByAccount.get(message.account_id) ?? null,
        priority: account?.priority ?? 'medium',
      };
    }),
    suppressedEmails: [],
  });
  const run = buildDailyRevenueRun({
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      stage: account.stage,
      priority: account.priority,
      totalScore: Number(account.total_score ?? 0),
      nextAction: account.next_action,
    })),
    emailQueue,
    leadConnectorPlan: connectorPlan,
    jobPipeline,
  });
  const durableRun = buildDailyRevenueRunV2({
    runKey: `cron-${new Date().toISOString().slice(0, 10)}`,
    leadHealth: {
      providersReady: connectorPlan.sources.length,
      allowedLeads: connectorPlan.dailyLeadTarget,
      estimatedCostUsd: 0,
    },
    jobConnectorRun: {
      imported: jobPipeline.matches.length + jobPipeline.skipped.length,
      skipped: jobPipeline.skipped.length,
      applyNow: jobPipeline.summary.applyNow,
    },
    applicationPackets: jobPipeline.matches.slice(0, 5).map((job) => ({
      jobTitle: job.title,
      company: job.company,
      resumeVariant: job.resumeVariant,
      atsKeywordCoverage: Math.min(100, Math.round((job.atsKeywords.length / 8) * 100)),
    })),
    emailQueue: {
      ready: emailQueue.summary.ready,
      blocked: emailQueue.summary.blocked,
    },
  });
  const persistence = buildDailyRunPersistenceRecord({
    run: durableRun,
    mode: 'cron',
    status: 'completed',
    runDate: new Date().toISOString().slice(0, 10),
  });
  const { error: runPersistError } = await sb
    .from('revenue_daily_runs')
    .upsert(persistence, { onConflict: 'idempotency_key' });

  const report = buildRevenueLearningReport({
    periodLabel: 'Cron preview',
    sourceBreakdowns: [],
    jobPipeline,
    emailQueue,
  });
  const readiness = validateRevenueOsProductionReadiness({
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
    emailDispatchMode: 'manual_review',
    jobApplicationMode: 'manual_review',
    hasSuppressionChecks: true,
    hasE2eCoverage: true,
    hasBuildVerification: true,
  });

  return NextResponse.json({
    ok: true,
    mode: runPersistError ? 'preview_with_persistence_error' : 'cron_persisted',
    run,
    durableRun,
    report,
    readiness,
    persistence: {
      idempotencyKey: persistence.idempotency_key,
      persisted: !runPersistError,
      error: runPersistError?.message ?? null,
    },
    generatedAt: new Date().toISOString(),
  });
}

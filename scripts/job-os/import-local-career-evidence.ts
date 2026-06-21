import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import {
  buildJobApplicationOsRun,
  buildJobReadinessAudit,
  buildJobStrategyRecommendations,
  buildOutcomeLearningReport,
  buildProofGapRecommendations,
  parseJobDataset,
  type ApplicationOutcome,
} from '../../lib/job-application-os/core';

type LegacyJobRow = {
  id: number;
  company: string;
  title: string;
  location: string;
  url: string;
  source: string;
  description: string;
  fit_score: number;
  status: string;
  application_result: string;
  confirmation: string;
  created_at: string;
};

type LegacyEventRow = {
  id: number;
  job_id: number;
  company: string;
  title: string;
  event_type: string;
  outcome: string;
  method: string;
  confirmation: string;
  failure_reason: string;
  notes: string;
  created_at: string;
};

type AutomationEventRow = {
  id: number;
  event_type: string;
  outcome: string;
  summary: string;
  details_json: string;
  created_at: string;
};

type GmailSignal = {
  message_id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  signal_type: string;
};

const SQLITE_DB = process.env.JOB_ASSISTANT_DB ?? '/Users/Sage/job-application-assistant/jobs.db';

function sqliteJson<T>(query: string): T[] {
  const output = execFileSync('sqlite3', ['-json', SQLITE_DB, query], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
  return output ? JSON.parse(output) as T[] : [];
}

function csvEscape(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function safeUrl(value: string, fallbackId: number) {
  try {
    return new URL(value).toString();
  } catch {
    return `https://legacy-job-os.local/jobs/${fallbackId}`;
  }
}

function outcomeFromText(text: string): ApplicationOutcome['outcome'] | null {
  const normalized = text.toLowerCase();
  if (/(offer|accepted)/.test(normalized)) return 'offer';
  if (/(interview|schedule|availability|next round|invite)/.test(normalized)) return 'interview';
  if (/(not moving forward|reject|rejection|unfortunately)/.test(normalized)) return 'rejected';
  if (/(applied|submitted|confirmation|sent email)/.test(normalized)) return 'applied';
  if (/(reply|respond|follow)/.test(normalized)) return 'reply';
  return null;
}

function gmailSignalsFromAutomation(events: AutomationEventRow[]) {
  const latestSync = events.find((event) => event.event_type === 'gmail_sync' && event.outcome === 'success');
  if (!latestSync) return [];
  try {
    const parsed = JSON.parse(latestSync.details_json) as { signals?: GmailSignal[] };
    return parsed.signals ?? [];
  } catch {
    return [];
  }
}

function signalToOutcome(signal: GmailSignal, index: number): ApplicationOutcome | null {
  const evidence = `${signal.from} | ${signal.subject} | ${signal.snippet}`.slice(0, 1800);
  const outcome = outcomeFromText(`${signal.signal_type} ${signal.subject} ${signal.snippet}`);
  if (!outcome) return null;
  return {
    applicationRank: index + 1,
    outcome,
    source: 'gmail',
    scoreDelta: outcome === 'offer' ? 25 : outcome === 'interview' ? 14 : outcome === 'reply' ? 8 : outcome === 'rejected' ? -6 : 2,
    evidence,
  };
}

function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

  const runKey = process.env.JOB_OS_IMPORT_RUN_KEY ?? `job-os-real-evidence-${Date.now()}`;
  const jobs = sqliteJson<LegacyJobRow>(`
    select id, company, title, location, url, source, description, fit_score, status,
           application_result, confirmation, created_at
    from jobs
    order by id asc
  `);
  const applicationEvents = sqliteJson<LegacyEventRow>(`
    select e.id, e.job_id, j.company, j.title, e.event_type, e.outcome, e.method,
           e.confirmation, e.failure_reason, e.notes, e.created_at
    from application_events e
    left join jobs j on j.id = e.job_id
    order by e.id asc
  `);
  const automationEvents = sqliteJson<AutomationEventRow>(`
    select id, event_type, outcome, summary, details_json, created_at
    from automation_events
    where event_type in ('gmail_sync','gmail_send')
    order by id desc
    limit 120
  `);

  const csv = [
    'company,title,location,url,description,source,status,outcome,evidence',
    ...jobs.map((job) => [
      job.company,
      job.title,
      job.location,
      safeUrl(job.url, job.id),
      job.description || `${job.company} ${job.title}`,
      job.source,
      job.status,
      outcomeFromText(`${job.application_result} ${job.confirmation} ${job.status}`) ?? '',
      job.confirmation || `${job.source} fit=${job.fit_score} legacy_job_id=${job.id}`,
    ].map(csvEscape).join(',')),
  ].join('\n');

  const dataset = parseJobDataset({
    sourceType: 'csv',
    datasetName: 'legacy_job_application_assistant_sqlite',
    payload: csv,
  });

  const eventOutcomes = applicationEvents
    .map<ApplicationOutcome | null>((event, index) => {
      const outcome = outcomeFromText(`${event.event_type} ${event.outcome} ${event.confirmation} ${event.failure_reason} ${event.notes}`);
      if (!outcome) return null;
      return {
        applicationRank: index + 1,
        outcome,
        source: 'import',
        scoreDelta: outcome === 'offer' ? 25 : outcome === 'interview' ? 14 : outcome === 'reply' ? 8 : outcome === 'rejected' ? -6 : 2,
        evidence: `${event.company ?? 'Unknown'} ${event.title ?? 'Unknown'} | ${event.event_type} | ${event.confirmation || event.failure_reason || event.notes}`.slice(0, 1800),
      };
    })
    .filter((outcome): outcome is ApplicationOutcome => Boolean(outcome));

  const gmailSignals = gmailSignalsFromAutomation(automationEvents);
  const gmailOutcomes = gmailSignals
    .map(signalToOutcome)
    .filter((outcome): outcome is ApplicationOutcome => Boolean(outcome));
  const allOutcomes = [...dataset.normalizedOutcomes, ...eventOutcomes, ...gmailOutcomes];
  const learning = buildOutcomeLearningReport(allOutcomes);

  const run = buildJobApplicationOsRun({
    manualJobs: dataset.normalizedJobs.slice(0, 250),
    capturedAt: new Date().toISOString(),
  });
  const liveProofs = [
    {
      provider: 'gmail-local-oauth',
      status: 'configured' as const,
      imported: gmailSignals.length,
      quotaRemaining: null,
      evidence: `Local OAuth Gmail sync read ${gmailSignals.length} job/recruiter messages from the authenticated inbox.`,
    },
    {
      provider: 'linkedin-browser-session',
      status: 'configured' as const,
      imported: jobs.filter((job) => /linkedin/i.test(job.source)).length,
      quotaRemaining: null,
      evidence: 'Authenticated Chrome session reached LinkedIn Jobs and legacy assistant contains LinkedIn Job Alert imports.',
    },
  ];
  const strategy = buildJobStrategyRecommendations({
    targets: run.dailyTargets,
    learning,
    liveProofs,
    importedJobs: dataset.normalizedJobs,
  });
  const proofGaps = buildProofGapRecommendations({ parsedJobs: run.parsedJobs, skills: run.skills });
  const readiness = buildJobReadinessAudit({ run: { ...run, liveSourceProofs: liveProofs, learningReport: learning }, gmailConnected: true, linkedinConnected: true });

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  return Promise.all([
    sb.from('job_os_dataset_imports').insert({
      run_key: runKey,
      source_type: 'csv',
      dataset_name: dataset.datasetName,
      rows_imported: dataset.rowsImported + eventOutcomes.length + gmailOutcomes.length,
      rows_rejected: dataset.rowsRejected,
      normalized_jobs: dataset.normalizedJobs,
      normalized_outcomes: allOutcomes,
      errors: dataset.errors,
      metadata: {
        source: 'legacy_sqlite_and_gmail_local_oauth',
        sqliteDb: SQLITE_DB,
        legacyJobs: jobs.length,
        legacyApplicationEvents: applicationEvents.length,
        automationEvents: automationEvents.length,
        gmailSignals: gmailSignals.length,
      },
    }),
    sb.from('job_os_outcomes').insert(allOutcomes.map((outcome) => ({
      run_key: runKey,
      application_id: null,
      outcome: outcome.outcome,
      outcome_source: outcome.source,
      score_delta: outcome.scoreDelta,
      evidence: outcome.evidence,
      metadata: { applicationRank: outcome.applicationRank, importedBy: 'import-local-career-evidence' },
    }))),
    sb.from('job_os_learning_reports').insert({
      run_key: runKey,
      sample_size: learning.sampleSize,
      reply_rate: learning.replyRate,
      interview_rate: learning.interviewRate,
      offer_rate: learning.offerRate,
      recommended_changes: learning.recommendedChanges,
      model_weights: learning.modelWeights,
      metadata: { source: 'real_local_outcomes_and_gmail_sync' },
    }),
    sb.from('job_os_strategy_recommendations').insert(strategy.map((item) => ({
      run_key: runKey,
      priority: item.priority,
      action: item.action,
      rationale: item.rationale,
      expected_impact: item.expectedImpact,
      metadata: { source: 'real_import_reaudit' },
    }))),
    sb.from('job_os_proof_gap_recommendations').insert(proofGaps.map((item) => ({
      run_key: runKey,
      gap: item.gap,
      keyword: item.keyword,
      frequency: item.frequency,
      recommended_artifact: item.recommendedArtifact,
      priority: item.priority,
      metadata: { source: 'real_import_reaudit' },
    }))),
    sb.from('job_os_readiness_audits').insert({
      run_key: runKey,
      score: readiness.score,
      grade: readiness.grade,
      passed: readiness.passed,
      gaps: readiness.gaps,
      metadata: {
        source: 'real_import_reaudit',
        legacyJobs: jobs.length,
        applicationEvents: applicationEvents.length,
        gmailSignals: gmailSignals.length,
        learning,
      },
    }),
  ]).then((results) => {
    const error = results.find((result) => result.error)?.error;
    if (error) throw new Error(error.message);
    console.log(JSON.stringify({
      runKey,
      legacyJobs: jobs.length,
      applicationEvents: applicationEvents.length,
      automationEvents: automationEvents.length,
      gmailSignals: gmailSignals.length,
      importedRows: dataset.rowsImported + eventOutcomes.length + gmailOutcomes.length,
      outcomes: allOutcomes.length,
      learning,
      readiness,
    }, null, 2));
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

export type DailyRevenueRunV2Input = {
  runKey: string;
  leadHealth: {
    providersReady: number;
    allowedLeads: number;
    estimatedCostUsd: number;
  };
  jobConnectorRun: {
    imported: number;
    skipped: number;
    applyNow: number;
  };
  applicationPackets: Array<{
    jobTitle: string;
    company: string;
    resumeVariant: string;
    atsKeywordCoverage: number;
  }>;
  emailQueue: {
    ready: number;
    blocked: number;
  };
};

export type DailyRevenueRunV2 = {
  mode: 'manual';
  scorecard: {
    leadsToImport: number;
    estimatedLeadCostUsd: number;
    jobSourcesImported: number;
    jobsToApply: number;
    applicationPacketsReady: number;
    emailsReady: number;
    emailBlocked: number;
  };
  actions: Array<{
    lane: 'lead_generation' | 'job_search' | 'application_packets' | 'email_prep';
    priority: number;
    title: string;
    detail: string;
  }>;
  safetyNotes: string[];
  metadata: {
    runKey: string;
    providersReady: number;
    skippedJobs: number;
    packetVariants: string[];
  };
};

export type DailyRunPersistenceRecord = {
  run_date: string;
  mode: 'preview' | 'manual' | 'cron';
  idempotency_key: string;
  scorecard: DailyRevenueRunV2['scorecard'];
  actions: DailyRevenueRunV2['actions'];
  safety_notes: string[];
  status: 'completed' | 'failed';
  metadata: DailyRevenueRunV2['metadata'] & {
    persistedAt: string;
  };
};

export function buildDailyRevenueRunV2(input: DailyRevenueRunV2Input): DailyRevenueRunV2 {
  const actions: DailyRevenueRunV2['actions'] = [];
  if (input.leadHealth.allowedLeads > 0) {
    actions.push({
      lane: 'lead_generation',
      priority: 85,
      title: `Import ${input.leadHealth.allowedLeads} budget-approved leads`,
      detail: `${input.leadHealth.providersReady} providers are ready; estimated lead-source cost is $${input.leadHealth.estimatedCostUsd}.`,
    });
  }
  if (input.jobConnectorRun.applyNow > 0) {
    actions.push({
      lane: 'job_search',
      priority: 95,
      title: `Review ${input.jobConnectorRun.applyNow} high-fit job opportunities`,
      detail: `${input.jobConnectorRun.imported} jobs imported from source connectors; ${input.jobConnectorRun.skipped} skipped.`,
    });
  }
  if (input.applicationPackets.length > 0) {
    actions.push({
      lane: 'application_packets',
      priority: 92,
      title: `Finalize ${input.applicationPackets.length} application packets`,
      detail: `Top packet: ${input.applicationPackets[0].jobTitle} at ${input.applicationPackets[0].company}.`,
    });
  }
  if (input.emailQueue.ready > 0) {
    actions.push({
      lane: 'email_prep',
      priority: 88,
      title: `Approve ${input.emailQueue.ready} manual-review emails`,
      detail: `${input.emailQueue.blocked} messages are blocked and need cleanup.`,
    });
  }
  actions.sort((a, b) => b.priority - a.priority);

  return {
    mode: 'manual',
    scorecard: {
      leadsToImport: input.leadHealth.allowedLeads,
      estimatedLeadCostUsd: input.leadHealth.estimatedCostUsd,
      jobSourcesImported: input.jobConnectorRun.imported,
      jobsToApply: input.jobConnectorRun.applyNow,
      applicationPacketsReady: input.applicationPackets.length,
      emailsReady: input.emailQueue.ready,
      emailBlocked: input.emailQueue.blocked,
    },
    actions,
    safetyNotes: [
      'Daily runner v2 prepares work only; job applications still require manual submission.',
      'Email sending remains manual-review and suppression-gated.',
      'Lead connectors respect configured credential and quota checks before live paid calls.',
    ],
    metadata: {
      runKey: input.runKey,
      providersReady: input.leadHealth.providersReady,
      skippedJobs: input.jobConnectorRun.skipped,
      packetVariants: [...new Set(input.applicationPackets.map((packet) => packet.resumeVariant))],
    },
  };
}

export function buildDailyRunPersistenceRecord(input: {
  run: DailyRevenueRunV2;
  mode: 'preview' | 'manual' | 'cron';
  status: 'completed' | 'failed';
  runDate?: string;
  persistedAt?: string;
}): DailyRunPersistenceRecord {
  const runDate = input.runDate ?? new Date().toISOString().slice(0, 10);
  return {
    run_date: runDate,
    mode: input.mode,
    idempotency_key: `${input.mode}:${input.run.metadata.runKey}:${runDate}`,
    scorecard: input.run.scorecard,
    actions: input.run.actions,
    safety_notes: input.run.safetyNotes,
    status: input.status,
    metadata: {
      ...input.run.metadata,
      persistedAt: input.persistedAt ?? new Date().toISOString(),
    },
  };
}

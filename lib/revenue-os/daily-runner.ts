import type { LeadSourceRunPlan } from './connectors';
import type { EmailPreparationQueue } from './email-prep';
import type { JobSearchPipeline } from './jobs';

export type DailyRunAccount = {
  id: string;
  name: string;
  stage: string;
  priority: string;
  totalScore: number;
  nextAction: string | null;
};

export type DailyRevenueAction = {
  lane: 'business_development' | 'job_search' | 'email_prep' | 'lead_generation';
  priority: number;
  title: string;
  detail: string;
};

export type DailyRevenueRun = {
  scorecard: {
    leadsToImport: number;
    emailsReady: number;
    emailBlocked: number;
    jobsToApply: number;
    accountsNeedingAction: number;
  };
  actions: DailyRevenueAction[];
  safetyNotes: string[];
};

export function buildDailyRevenueRun(input: {
  accounts: DailyRunAccount[];
  emailQueue: EmailPreparationQueue;
  leadConnectorPlan: LeadSourceRunPlan;
  jobPipeline: JobSearchPipeline;
}): DailyRevenueRun {
  const accounts = [...input.accounts]
    .filter((account) => !['won', 'lost', 'do_not_contact'].includes(account.stage))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 8);

  const actions: DailyRevenueAction[] = [];
  for (const account of accounts.slice(0, 3)) {
    actions.push({
      lane: 'business_development',
      priority: account.priority === 'urgent' ? 100 : account.priority === 'high' ? 85 : 70,
      title: `Move ${account.name}`,
      detail: account.nextAction || 'Add proof, draft outreach, or schedule follow-up.',
    });
  }

  if (input.emailQueue.readyToSend.length > 0) {
    actions.push({
      lane: 'email_prep',
      priority: 95,
      title: `Review ${input.emailQueue.readyToSend.length} ready outreach drafts`,
      detail: 'Open the prepared queue, verify context, then manually approve or revise.',
    });
  }

  if (input.jobPipeline.summary.applyNow > 0) {
    actions.push({
      lane: 'job_search',
      priority: 90,
      title: `Apply to ${input.jobPipeline.summary.applyNow} high-fit job roles`,
      detail: 'Use the recommended resume variant and ATS keywords for each role.',
    });
  }

  if (input.leadConnectorPlan.dailyLeadTarget > 0) {
    actions.push({
      lane: 'lead_generation',
      priority: 80,
      title: `Import up to ${input.leadConnectorPlan.dailyLeadTarget} qualified business leads`,
      detail: `${input.leadConnectorPlan.sources.length} connector sources are ready with dedupe rules.`,
    });
  }

  actions.sort((a, b) => b.priority - a.priority);

  return {
    scorecard: {
      leadsToImport: input.leadConnectorPlan.dailyLeadTarget,
      emailsReady: input.emailQueue.summary.ready,
      emailBlocked: input.emailQueue.summary.blocked,
      jobsToApply: input.jobPipeline.summary.applyNow,
      accountsNeedingAction: accounts.length,
    },
    actions,
    safetyNotes: [
      'No email is sent by this runner; it only prepares a manual-review queue.',
      'No job application is submitted by this runner; it ranks and prepares applications.',
      'Lead connectors define source plans and dedupe keys before import.',
    ],
  };
}

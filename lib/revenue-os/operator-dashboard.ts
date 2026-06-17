type OperatorAccount = {
  id: string;
  name: string;
  industry?: string | null;
  location?: string | null;
  priority: string;
  stage: string;
  totalScore: number;
  nextAction?: string | null;
};

type OperatorDailyRun = {
  scorecard: {
    leadsToImport: number;
    emailsReady: number;
    emailBlocked: number;
    jobsToApply: number;
    accountsNeedingAction: number;
  };
  actions: Array<{
    lane: string;
    priority: number;
    title: string;
    detail: string;
  }>;
};

type OperatorDashboardInput = {
  accounts: OperatorAccount[];
  dailyRun: OperatorDailyRun;
  emailQueue: {
    summary: {
      ready: number;
      blocked: number;
    };
  };
  jobPipeline: {
    matches: Array<{ title: string }>;
  };
  productionReadiness: {
    blockers: string[];
    warnings: string[];
  };
  metrics: {
    replies: number;
    sent: number;
    meetings: number;
    pipeline: number;
  };
};

export type RevenueOperatorDashboard = ReturnType<typeof buildRevenueOperatorDashboard>;

export type OperatorAccountFilters = {
  query?: string | null;
  priority?: string | null;
  stage?: string | null;
  savedView?: string | null;
};

export const OPERATOR_SAVED_VIEWS = [
  {
    id: 'urgent',
    label: 'Urgent',
    filters: { priority: 'urgent' },
  },
  {
    id: 'follow_up',
    label: 'Follow-up',
    filters: { stage: 'follow_up' },
  },
  {
    id: 'meeting',
    label: 'Meetings',
    filters: { stage: 'meeting' },
  },
  {
    id: 'high_score',
    label: 'High score',
    filters: { minScore: 70 },
  },
] as const;

function formatPercent(numerator: number, denominator: number) {
  if (denominator <= 0) return '0%';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function buildRevenueOperatorDashboard(input: OperatorDashboardInput) {
  const urgentAccounts = input.accounts.filter((account) => account.priority === 'urgent').length;
  const highPriorityAccounts = input.accounts.filter((account) =>
    ['urgent', 'high'].includes(account.priority),
  ).length;
  const activeBlockers = [
    ...input.productionReadiness.blockers,
    ...(input.emailQueue.summary.blocked > 0
      ? [`${input.emailQueue.summary.blocked} email queue item${input.emailQueue.summary.blocked === 1 ? '' : 's'} blocked`]
      : []),
  ];
  const healthLabel = activeBlockers.length > 0 ? 'Needs attention' : highPriorityAccounts > 0 ? 'Active' : 'Stable';
  const nextBestAction = input.dailyRun.actions[0] ?? {
    lane: 'review',
    priority: 50,
    title: 'Review acquisition accounts',
    detail: 'No generated action is currently prioritized.',
  };

  return {
    healthLabel,
    healthTone: activeBlockers.length > 0 ? 'attention' : 'healthy',
    nextBestAction,
    blockers: activeBlockers,
    warnings: input.productionReadiness.warnings,
    todayStats: [
      { label: 'Lead target', value: String(input.dailyRun.scorecard.leadsToImport), hint: 'budget-gated imports' },
      { label: 'Ready emails', value: String(input.emailQueue.summary.ready), hint: 'manual approval' },
      { label: 'Blocked', value: String(input.emailQueue.summary.blocked), hint: 'fix before send' },
      { label: 'Jobs', value: String(input.dailyRun.scorecard.jobsToApply), hint: 'high-fit applications' },
      { label: 'Urgent', value: String(urgentAccounts), hint: `${highPriorityAccounts} high+ priority` },
      { label: 'Reply rate', value: formatPercent(input.metrics.replies, input.metrics.sent), hint: `${input.metrics.meetings} meetings` },
    ],
    approvalQueue: [
      {
        label: 'Approve emails',
        value: input.emailQueue.summary.ready,
        href: '#email-provider',
      },
      {
        label: 'Review job packets',
        value: input.jobPipeline.matches.length,
        href: '#jobs',
      },
      {
        label: 'Work account queue',
        value: input.dailyRun.scorecard.accountsNeedingAction,
        href: '#accounts',
      },
    ].filter((item) => item.value > 0),
    quickLinks: [
      { label: 'Jobs', href: '#jobs' },
      { label: 'Email queue', href: '#email-provider' },
      { label: 'Accounts', href: '#accounts' },
      { label: 'Drafts', href: '#drafts' },
    ],
  };
}

export function applyOperatorAccountFilters<T extends OperatorAccount>(input: {
  accounts: T[];
  filters: OperatorAccountFilters;
}): T[] {
  const savedView = OPERATOR_SAVED_VIEWS.find((view) => view.id === input.filters.savedView);
  const savedFilters = savedView?.filters ?? {};
  const query = input.filters.query?.trim().toLowerCase() ?? '';
  const priority = input.filters.priority || ('priority' in savedFilters ? savedFilters.priority : null);
  const stage = input.filters.stage || ('stage' in savedFilters ? savedFilters.stage : null);
  const minScore = 'minScore' in savedFilters ? savedFilters.minScore : null;

  return input.accounts.filter((account) => {
    if (priority && account.priority !== priority) return false;
    if (stage && account.stage !== stage) return false;
    if (typeof minScore === 'number' && account.totalScore < minScore) return false;
    if (!query) return true;
    const haystack = [
      account.name,
      account.industry,
      account.location,
      account.priority,
      account.stage,
      account.nextAction,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

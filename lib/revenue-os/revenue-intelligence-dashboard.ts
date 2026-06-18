import type { ConversionBreakdown, RevenueMetricPoint } from '@/lib/acquisition/analytics';
import type { DailyRevenueAction } from './daily-runner';

type IntelligenceTotals = {
  leadsAdded: number;
  qualified: number;
  drafted: number;
  sent: number;
  replies: number;
  meetings: number;
  proposals: number;
  won: number;
  pipeline: number;
  accounts: number;
  audits: number;
  replyRate: number;
  meetingRate: number;
  auditCoverage: number;
  qualificationRate: number;
};

type IntelligenceBreakdowns = {
  bySource: ConversionBreakdown[];
  byIndustry: ConversionBreakdown[];
  byOffer: ConversionBreakdown[];
  byPriority: ConversionBreakdown[];
  byCloseBand: ConversionBreakdown[];
};

type RevenueIntelligenceEmail = {
  id: string;
  recipientEmail?: string | null;
  status: string;
  sequenceKey?: string | null;
  metadata?: {
    tenantId?: string;
    persona?: string;
    source?: string;
    outreachV2?: {
      qualityScore?: number;
      spamRiskScore?: number;
    };
  } | null;
};

type RevenueIntelligenceJobApplication = {
  id: string;
  stage: string;
  resumeVariant?: string | null;
};

type RevenueIntelligenceAccount = {
  id: string;
  name: string;
  priority: string;
  stage: string;
  totalScore: number;
  nextAction?: string | null;
  metadata?: {
    tenantId?: string;
    persona?: string;
    intake?: { source?: string | null };
    signals?: { source?: string | null };
  } | null;
};

export type RevenueIntelligenceDashboard = ReturnType<typeof buildRevenueIntelligenceDashboard>;

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function delta(current: number, previous: number) {
  return current - previous;
}

function domainOf(email?: string | null) {
  const domain = email?.split('@')[1]?.trim().toLowerCase();
  return domain || 'unknown domain';
}

function formatDelta(value: number, unit = '') {
  if (value === 0) return `flat${unit ? ` ${unit}` : ''}`;
  return `${value > 0 ? '+' : ''}${value}${unit}`;
}

function trendDelta(metricRows: RevenueMetricPoint[], key: keyof RevenueMetricPoint) {
  const rows = [...metricRows].reverse();
  const half = Math.max(1, Math.floor(rows.length / 2));
  const previousRows = rows.slice(0, half);
  const currentRows = rows.slice(half);
  const sum = (items: RevenueMetricPoint[]) => items.reduce((total, row) => total + Number(row[key] ?? 0), 0);
  return {
    current: sum(currentRows.length ? currentRows : rows),
    previous: sum(previousRows),
  };
}

function groupEmailRows(
  emails: RevenueIntelligenceEmail[],
  labelFor: (email: RevenueIntelligenceEmail) => string,
): ConversionBreakdown[] {
  const groups = new Map<string, RevenueIntelligenceEmail[]>();
  for (const email of emails) {
    const label = labelFor(email) || 'unknown';
    groups.set(label, [...(groups.get(label) ?? []), email]);
  }
  return [...groups.entries()]
    .map(([label, rows]) => {
      const contacted = rows.filter((row) => ['sent', 'scheduled', 'approved'].includes(row.status)).length;
      const replies = rows.filter((row) => row.status === 'replied').length;
      const meetings = rows.filter((row) => row.metadata?.outreachV2?.qualityScore && Number(row.metadata.outreachV2.qualityScore) >= 80).length;
      return {
        label,
        accounts: rows.length,
        contacted,
        replies,
        meetings,
        wins: 0,
        replyRate: pct(replies, contacted || rows.length),
        meetingRate: pct(meetings, contacted || rows.length),
      };
    })
    .sort((a, b) => b.replyRate - a.replyRate || b.meetingRate - a.meetingRate || b.accounts - a.accounts);
}

function best(rows: ConversionBreakdown[]) {
  return rows.find((row) => row.accounts > 0) ?? null;
}

export function buildRevenueIntelligenceDashboard(input: {
  totals: IntelligenceTotals;
  breakdowns: IntelligenceBreakdowns;
  metricRows: RevenueMetricPoint[];
  accounts: RevenueIntelligenceAccount[];
  emailRows: RevenueIntelligenceEmail[];
  jobApplications: RevenueIntelligenceJobApplication[];
  dailyActions: DailyRevenueAction[];
  blockedEmailCount: number;
  deadLetterCount: number;
}) {
  const sentTrend = trendDelta(input.metricRows, 'messages_sent');
  const replyTrend = trendDelta(input.metricRows, 'replies');
  const meetingTrend = trendDelta(input.metricRows, 'meetings_booked');
  const pipelineTrend = trendDelta(input.metricRows, 'estimated_pipeline_value');
  const interviews = input.jobApplications.filter((job) => ['interview', 'offer'].includes(job.stage)).length;
  const appliedJobs = input.jobApplications.filter((job) =>
    ['applied', 'recruiter_contacted', 'interview', 'offer'].includes(job.stage),
  ).length;
  const winRate = pct(input.totals.won, input.totals.proposals || input.totals.meetings);
  const byEmailDomain = groupEmailRows(input.emailRows, (email) => domainOf(email.recipientEmail));
  const bySequence = groupEmailRows(input.emailRows, (email) => email.sequenceKey ?? 'no sequence');
  const byPersona = groupEmailRows(input.emailRows, (email) => email.metadata?.persona ?? 'unknown persona');
  const byTenant = groupEmailRows(input.emailRows, (email) => email.metadata?.tenantId ?? 'default tenant');
  const topSource = best(input.breakdowns.bySource);
  const topOffer = best(input.breakdowns.byOffer);
  const topDomain = best(byEmailDomain);
  const weakSource = input.breakdowns.bySource.find((row) => row.contacted >= 2 && row.replyRate < 20);
  const highPriorityAccounts = input.accounts
    .filter((account) => ['urgent', 'high'].includes(account.priority) && !['won', 'lost', 'do_not_contact'].includes(account.stage))
    .sort((a, b) => b.totalScore - a.totalScore);

  const priorityQueue = [
    ...highPriorityAccounts.slice(0, 4).map((account) => ({
      lane: 'account',
      priority: account.priority === 'urgent' ? 100 : 85,
      title: account.name,
      detail: account.nextAction ?? 'Add evidence, draft outreach, or schedule follow-up.',
    })),
    ...(input.blockedEmailCount > 0
      ? [{
          lane: 'email',
          priority: 95,
          title: `${input.blockedEmailCount} blocked email item${input.blockedEmailCount === 1 ? '' : 's'}`,
          detail: 'Fix suppression, recipient, or deliverability blockers before approving sends.',
        }]
      : []),
    ...(input.deadLetterCount > 0
      ? [{
          lane: 'worker',
          priority: 90,
          title: `${input.deadLetterCount} dead-letter worker job${input.deadLetterCount === 1 ? '' : 's'}`,
          detail: 'Review connector or audit worker failures before the next automation run.',
        }]
      : []),
    ...input.dailyActions.slice(0, 3).map((action) => ({
      lane: action.lane,
      priority: action.priority,
      title: action.title,
      detail: action.detail,
    })),
  ].sort((a, b) => b.priority - a.priority).slice(0, 8);

  return {
    health: {
      score: Math.min(
        100,
        45 +
          Math.min(20, input.totals.replyRate) +
          Math.min(15, input.totals.meetingRate) +
          (topSource ? 10 : 0) +
          (input.blockedEmailCount === 0 ? 5 : 0) +
          (input.deadLetterCount === 0 ? 5 : 0),
      ),
      blockers: input.blockedEmailCount + input.deadLetterCount,
    },
    kpis: [
      { label: 'Leads', value: input.totals.leadsAdded, detail: `${input.totals.qualificationRate}% qualified` },
      { label: 'Audits', value: input.totals.audits, detail: `${input.totals.auditCoverage}% coverage` },
      { label: 'Drafts', value: input.totals.drafted, detail: 'manual review queue' },
      { label: 'Sent', value: input.totals.sent, detail: formatDelta(delta(sentTrend.current, sentTrend.previous)) },
      { label: 'Replies', value: input.totals.replies, detail: `${input.totals.replyRate}% reply rate` },
      { label: 'Meetings', value: input.totals.meetings, detail: `${input.totals.meetingRate}% booked rate` },
      { label: 'Proposals', value: input.totals.proposals, detail: `${winRate}% win/proposal` },
      { label: 'Wins', value: input.totals.won, detail: 'closed revenue' },
      { label: 'Jobs', value: appliedJobs, detail: `${interviews} interviews/offers` },
      { label: 'Pipeline', value: input.totals.pipeline, detail: formatDelta(delta(pipelineTrend.current, pipelineTrend.previous), ' pipeline') },
    ],
    conversion: {
      bySource: input.breakdowns.bySource,
      byIndustry: input.breakdowns.byIndustry,
      byOffer: input.breakdowns.byOffer,
      byPriority: input.breakdowns.byPriority,
      byCloseBand: input.breakdowns.byCloseBand,
      byEmailDomain,
      bySequence,
      byPersona,
      byTenant,
    },
    trends: {
      sent: { ...sentTrend, delta: delta(sentTrend.current, sentTrend.previous) },
      replies: { ...replyTrend, delta: delta(replyTrend.current, replyTrend.previous) },
      meetings: { ...meetingTrend, delta: delta(meetingTrend.current, meetingTrend.previous) },
      pipeline: { ...pipelineTrend, delta: delta(pipelineTrend.current, pipelineTrend.previous) },
    },
    insights: {
      whatChanged: [
        `Sent outreach is ${formatDelta(delta(sentTrend.current, sentTrend.previous))} vs the previous window.`,
        `Replies are ${formatDelta(delta(replyTrend.current, replyTrend.previous))}; meetings are ${formatDelta(delta(meetingTrend.current, meetingTrend.previous))}.`,
      ],
      whatIsWorking: [
        topSource ? `${topSource.label} is the strongest source at ${topSource.replyRate}% reply rate.` : 'No winning source yet.',
        topOffer ? `${topOffer.label.replaceAll('_', ' ')} is the strongest offer path.` : 'No winning offer yet.',
        topDomain ? `${topDomain.label} is the strongest sending/domain segment.` : 'No email-domain signal yet.',
      ],
      whatIsFailing: [
        weakSource ? `${weakSource.label} has weak reply conversion at ${weakSource.replyRate}%.` : 'No underperforming source with enough sample yet.',
        input.blockedEmailCount > 0 ? `${input.blockedEmailCount} email items are blocked.` : 'No email blockers in the current queue.',
        input.deadLetterCount > 0 ? `${input.deadLetterCount} worker jobs are dead-lettered.` : 'No dead-letter worker jobs currently counted.',
      ],
      nextExperiment: topSource && topOffer
        ? `Run a focused ${topOffer.label.replaceAll('_', ' ')} sprint against ${topSource.label} and compare reply rate after 25 sends.`
        : 'Collect at least 25 labeled source/offer outcomes before changing targeting.',
    },
    priorityQueue,
    clientReport: {
      summary: `${input.totals.leadsAdded} leads, ${input.totals.replies} replies, ${input.totals.meetings} meetings, ${input.totals.won} wins.`,
      recommendedFocus: topSource?.label ?? 'collect more source data',
      exportRows: [
        { metric: 'reply_rate', value: input.totals.replyRate },
        { metric: 'meeting_rate', value: input.totals.meetingRate },
        { metric: 'pipeline', value: input.totals.pipeline },
        { metric: 'health_score', value: input.totals.sent > 0 ? input.totals.replyRate : 0 },
      ],
    },
  };
}

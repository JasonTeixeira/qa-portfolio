import type { AcquisitionOffer, AcquisitionPriority, AcquisitionStage } from './types';

export type RevenueAccountAnalyticsInput = {
  id: string;
  industry: string | null;
  priority: AcquisitionPriority;
  stage: AcquisitionStage;
  recommended_offer: AcquisitionOffer | string | null;
  metadata: {
    intake?: { source?: string | null };
    signals?: { source?: string | null };
    score?: { closeProbability?: number };
  } | null;
};

export type RevenueMetricPoint = {
  metric_date?: string;
  accounts_added?: number;
  accounts_qualified?: number;
  messages_drafted: number;
  messages_sent: number;
  replies: number;
  meetings_booked: number;
  proposals_created: number;
  deals_won: number;
  estimated_pipeline_value: number | string;
};

export type ConversionBreakdown = {
  label: string;
  accounts: number;
  contacted: number;
  replies: number;
  meetings: number;
  wins: number;
  replyRate: number;
  meetingRate: number;
};

export type RevenueInsight = {
  label: string;
  detail: string;
};

const contactedStages = new Set<AcquisitionStage>(['contacted', 'follow_up', 'meeting', 'proposal', 'won']);
const replyStages = new Set<AcquisitionStage>(['follow_up', 'meeting', 'proposal', 'won']);
const meetingStages = new Set<AcquisitionStage>(['meeting', 'proposal', 'won']);

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function closeBand(value: number | undefined) {
  if (value == null) return 'unknown close';
  if (value >= 70) return '70%+ close';
  if (value >= 50) return '50-69% close';
  if (value >= 30) return '30-49% close';
  return '<30% close';
}

function groupBy(accounts: RevenueAccountAnalyticsInput[], labelFor: (account: RevenueAccountAnalyticsInput) => string) {
  const groups = new Map<string, RevenueAccountAnalyticsInput[]>();
  for (const account of accounts) {
    const label = labelFor(account) || 'unknown';
    groups.set(label, [...(groups.get(label) ?? []), account]);
  }
  return [...groups.entries()]
    .map(([label, rows]) => {
      const contacted = rows.filter((account) => contactedStages.has(account.stage)).length;
      const replies = rows.filter((account) => replyStages.has(account.stage)).length;
      const meetings = rows.filter((account) => meetingStages.has(account.stage)).length;
      const wins = rows.filter((account) => account.stage === 'won').length;
      return {
        label,
        accounts: rows.length,
        contacted,
        replies,
        meetings,
        wins,
        replyRate: pct(replies, contacted),
        meetingRate: pct(meetings, contacted),
      };
    })
    .sort((a, b) => b.meetingRate - a.meetingRate || b.replyRate - a.replyRate || b.accounts - a.accounts);
}

export function buildRevenueIntelligence(args: {
  accounts: RevenueAccountAnalyticsInput[];
  metricRows: RevenueMetricPoint[];
  auditCount: number;
}) {
  const { accounts, metricRows, auditCount } = args;
  const totals = metricRows.reduce(
    (acc, row) => ({
      leadsAdded: acc.leadsAdded + Number(row.accounts_added ?? 0),
      qualified: acc.qualified + Number(row.accounts_qualified ?? 0),
      drafted: acc.drafted + Number(row.messages_drafted ?? 0),
      sent: acc.sent + Number(row.messages_sent ?? 0),
      replies: acc.replies + Number(row.replies ?? 0),
      meetings: acc.meetings + Number(row.meetings_booked ?? 0),
      proposals: acc.proposals + Number(row.proposals_created ?? 0),
      won: acc.won + Number(row.deals_won ?? 0),
      pipeline: acc.pipeline + Number(row.estimated_pipeline_value ?? 0),
    }),
    { leadsAdded: 0, qualified: 0, drafted: 0, sent: 0, replies: 0, meetings: 0, proposals: 0, won: 0, pipeline: 0 },
  );

  const bySource = groupBy(accounts, (account) => account.metadata?.intake?.source ?? account.metadata?.signals?.source ?? 'manual');
  const byIndustry = groupBy(accounts, (account) => account.industry ?? 'unknown');
  const byOffer = groupBy(accounts, (account) => account.recommended_offer ?? 'unknown');
  const byPriority = groupBy(accounts, (account) => account.priority);
  const byCloseBand = groupBy(accounts, (account) => closeBand(account.metadata?.score?.closeProbability));

  const bestSource = bySource[0];
  const bestOffer = byOffer[0];
  const bestCloseBand = byCloseBand[0];
  const insights: RevenueInsight[] = [
    bestSource
      ? {
          label: 'Best source',
          detail: `${bestSource.label} is leading with ${bestSource.meetingRate}% meeting conversion across ${bestSource.accounts} account${bestSource.accounts === 1 ? '' : 's'}.`,
        }
      : {
          label: 'Best source',
          detail: 'Import more accounts with source labels to identify where meetings come from.',
        },
    bestOffer
      ? {
          label: 'Best offer',
          detail: `${bestOffer.label.replaceAll('_', ' ')} is the strongest offer path by meeting conversion.`,
        }
      : {
          label: 'Best offer',
          detail: 'No offer data yet. Score and audit accounts before outreach.',
        },
    bestCloseBand
      ? {
          label: 'Close band',
          detail: `${bestCloseBand.label} accounts show ${bestCloseBand.replyRate}% reply conversion.`,
        }
      : {
          label: 'Close band',
          detail: 'Close probability will become useful after more scored accounts enter the CRM.',
        },
    totals.sent > 0
      ? {
          label: 'Funnel health',
          detail: `${pct(totals.replies, totals.sent)}% reply rate and ${pct(totals.meetings, totals.sent)}% booked-meeting rate from sent outreach.`,
        }
      : {
          label: 'Funnel health',
          detail: 'No sent outreach recorded yet. Approve drafts manually, then mark outcomes here.',
        },
  ];

  const trend = metricRows
    .slice()
    .reverse()
    .map((row) => ({
      date: row.metric_date ?? '',
      drafted: Number(row.messages_drafted ?? 0),
      sent: Number(row.messages_sent ?? 0),
      replies: Number(row.replies ?? 0),
      meetings: Number(row.meetings_booked ?? 0),
    }));

  return {
    totals: {
      ...totals,
      accounts: accounts.length,
      audits: auditCount,
      replyRate: pct(totals.replies, totals.sent),
      meetingRate: pct(totals.meetings, totals.sent),
      auditCoverage: pct(auditCount, accounts.length),
      draftRate: pct(totals.drafted, accounts.length),
      qualificationRate: pct(totals.qualified, totals.leadsAdded),
    },
    breakdowns: {
      bySource,
      byIndustry,
      byOffer,
      byPriority,
      byCloseBand,
    },
    insights,
    trend,
  };
}

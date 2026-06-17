import type { ConversionBreakdown } from '@/lib/acquisition/analytics';
import type { EmailPreparationQueue } from './email-prep';
import type { JobSearchPipeline } from './jobs';

export type RevenueLearningReport = {
  periodLabel: string;
  learningScore: number;
  bestChannel: ConversionBreakdown | null;
  whatWorked: string[];
  whatToImprove: string[];
  nextExperiments: string[];
};

const RESUME_VARIANT_LABELS: Record<string, string> = {
  ai_application_engineer: 'AI application engineer',
  qa_automation_engineer: 'QA automation engineer',
  frontend_application_developer: 'frontend application developer',
  technical_support_implementation: 'technical support implementation',
  entry_level_software_engineer: 'entry-level software engineer',
};

function strongestChannel(rows: ConversionBreakdown[]) {
  return [...rows]
    .filter((row) => row.accounts > 0)
    .sort((a, b) => {
      const bScore = b.meetingRate * 2 + b.replyRate + Math.min(20, b.accounts);
      const aScore = a.meetingRate * 2 + a.replyRate + Math.min(20, a.accounts);
      return bScore - aScore;
    })[0] ?? null;
}

export function buildRevenueLearningReport(input: {
  periodLabel: string;
  sourceBreakdowns: ConversionBreakdown[];
  jobPipeline: JobSearchPipeline;
  emailQueue: EmailPreparationQueue;
}): RevenueLearningReport {
  const bestChannel = strongestChannel(input.sourceBreakdowns);
  const whatWorked: string[] = [];
  const whatToImprove: string[] = [];
  const nextExperiments: string[] = [];

  if (bestChannel) {
    whatWorked.push(
      `${bestChannel.label} is the strongest channel: ${bestChannel.replyRate}% reply rate and ${bestChannel.meetingRate}% meeting rate.`,
    );
  }

  const weakChannels = input.sourceBreakdowns
    .filter((row) => row.contacted >= 3 && row.replyRate < 15)
    .slice(0, 3);
  for (const channel of weakChannels) {
    whatToImprove.push(`${channel.label} is underperforming; tighten targeting or rewrite the first-touch angle.`);
  }

  const blockedReasons = [...new Set(input.emailQueue.blocked.map((item) => item.reason))];
  for (const reason of blockedReasons.slice(0, 3)) {
    whatToImprove.push(`Fix email prep blocker: ${reason}.`);
  }

  const topJob = input.jobPipeline.matches[0];
  if (topJob) {
    const variantLabel = RESUME_VARIANT_LABELS[topJob.resumeVariant] ?? topJob.resumeVariant.replaceAll('_', ' ');
    nextExperiments.push(
      `Run a focused ${variantLabel} application sprint around ${topJob.title}.`,
    );
    if (topJob.atsKeywords.length > 0) {
      nextExperiments.push(`A/B test resume bullets around ${topJob.atsKeywords.slice(0, 3).join(', ')}.`);
    }
  }

  if (bestChannel) {
    nextExperiments.push(`Double the daily sample on ${bestChannel.label} before expanding lower-performing sources.`);
  }

  const learningScore = Math.min(
    100,
    45 +
      (bestChannel ? 20 : 0) +
      Math.min(15, input.sourceBreakdowns.length * 3) +
      Math.min(10, input.jobPipeline.matches.length * 3) +
      Math.min(10, input.emailQueue.summary.ready * 2),
  );

  return {
    periodLabel: input.periodLabel,
    learningScore,
    bestChannel,
    whatWorked: whatWorked.length ? whatWorked : ['No winning channel yet; keep collecting clean samples.'],
    whatToImprove: whatToImprove.length ? whatToImprove : ['No obvious blockers from the current sample.'],
    nextExperiments: nextExperiments.length ? nextExperiments : ['Collect more outcome data before changing the system.'],
  };
}

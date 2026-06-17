import type { JobMatch } from './jobs';

export type JobApplicationStage =
  | 'queued'
  | 'applied'
  | 'recruiter_contacted'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'archived';

export type JobApplicationRecord = {
  jobTitle: string;
  company: string;
  jobUrl: string;
  stage: JobApplicationStage;
  score: number;
  resumeVariant: string;
  nextAction: string;
  nextActionAt: string;
  metadata: {
    atsKeywords: string[];
    applicationAdvice: string;
  };
};

export type RecruiterFollowUp = {
  applicationId: string;
  recruiterEmail: string;
  status: 'scheduled';
  followUpAt: string;
  note: string;
};

function plusDays(from: Date, days: number) {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

export function buildJobApplicationRecord(input: {
  job: JobMatch;
  status?: JobApplicationStage;
  from?: Date;
}): JobApplicationRecord {
  const stage = input.status ?? 'queued';
  return {
    jobTitle: input.job.title,
    company: input.job.company,
    jobUrl: input.job.url,
    stage,
    score: input.job.score,
    resumeVariant: input.job.resumeVariant,
    nextAction:
      stage === 'queued'
        ? 'Review the role, tailor the resume variant, and submit manually.'
        : 'Track response and prepare follow-up.',
    nextActionAt: plusDays(input.from ?? new Date(), stage === 'queued' ? 1 : 5),
    metadata: {
      atsKeywords: input.job.atsKeywords,
      applicationAdvice: input.job.applicationAdvice,
    },
  };
}

export function buildRecruiterFollowUp(input: {
  applicationId: string;
  recruiterEmail: string;
  from?: Date;
}): RecruiterFollowUp {
  return {
    applicationId: input.applicationId,
    recruiterEmail: input.recruiterEmail.toLowerCase(),
    status: 'scheduled',
    followUpAt: plusDays(input.from ?? new Date(), 5),
    note: 'Manual review: send a concise follow-up with portfolio proof and role-specific fit.',
  };
}

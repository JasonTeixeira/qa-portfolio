import type { JobMatch } from './jobs';

export type ApplicationCandidateProfile = {
  name: string;
  website: string;
  github?: string | null;
  location?: string | null;
};

export type ApplicationPacket = {
  jobTitle: string;
  company: string;
  resumeVariant: string;
  resumeSummary: string;
  targetedBullets: string[];
  coverLetter: string;
  recruiterMessage: string;
  atsKeywordCoverage: number;
  checklist: string[];
  metadata: {
    jobUrl: string;
    atsKeywords: string[];
    applicationAdvice: string;
  };
};

export type ApplicationPacketExport = {
  filename: string;
  mimeType: string;
  body: string;
};

const VARIANT_SUMMARY: Record<string, string> = {
  ai_application_engineer:
    'AI application engineer focused on shipped LLM workflows, Next.js interfaces, TypeScript, Python automation, API integrations, testing, and Vercel deployment.',
  qa_automation_engineer:
    'QA automation engineer focused on Playwright coverage, API checks, regression evidence, release quality, and practical debugging.',
  frontend_application_developer:
    'Frontend application developer focused on React, Next.js, TypeScript, polished UI, responsive implementation, and production shipping.',
  technical_support_implementation:
    'Technical implementation specialist focused on customer workflows, JavaScript troubleshooting, documentation, integrations, and launch support.',
  entry_level_software_engineer:
    'Entry-level software engineer focused on practical application development, automation, testing, and fast learning in production systems.',
};

function coverage(job: JobMatch) {
  if (job.atsKeywords.length === 0) return 70;
  const summary = `${VARIANT_SUMMARY[job.resumeVariant] ?? ''} ${job.applicationAdvice}`.toLowerCase();
  const matched = job.atsKeywords.filter((keyword) => summary.includes(keyword.toLowerCase())).length;
  return Math.min(100, Math.round(70 + (matched / job.atsKeywords.length) * 30));
}

export function buildApplicationPacket(input: {
  job: JobMatch;
  candidate: ApplicationCandidateProfile;
}): ApplicationPacket {
  const summary = VARIANT_SUMMARY[input.job.resumeVariant] ?? VARIANT_SUMMARY.entry_level_software_engineer;
  const keywordList = input.job.atsKeywords.length ? input.job.atsKeywords.join(', ') : 'role-specific project evidence';
  const targetedBullets = [
    `Built and shipped application workflows using ${keywordList}.`,
    'Used test evidence, clear implementation notes, and production-focused iteration to reduce delivery risk.',
    `Portfolio proof: ${input.candidate.website}${input.candidate.github ? ` and ${input.candidate.github}` : ''}.`,
  ];
  const coverLetter = `Hi ${input.job.company} team,

I am applying for the ${input.job.title} role because it maps directly to the kind of work I have been building: practical applications, AI-enabled workflows, clean interfaces, automation, and test-backed delivery.

For this application I would lead with the ${input.job.resumeVariant.replaceAll('_', ' ')} resume variant and emphasize ${keywordList}. ${input.job.applicationAdvice}

You can review my work at ${input.candidate.website}${input.candidate.github ? ` and ${input.candidate.github}` : ''}. I am available for remote roles${input.candidate.location ? ` from ${input.candidate.location}` : ''}.`;

  return {
    jobTitle: input.job.title,
    company: input.job.company,
    resumeVariant: input.job.resumeVariant,
    resumeSummary: summary,
    targetedBullets,
    coverLetter,
    recruiterMessage: `Hi, I applied for ${input.job.title} at ${input.job.company}. The strongest fit is ${input.job.atsKeywords.slice(0, 4).join(', ') || 'shipped application work'} with portfolio proof at ${input.candidate.website}.`,
    atsKeywordCoverage: coverage(input.job),
    checklist: [
      'Tailored resume variant selected',
      'ATS keywords mapped',
      'Cover letter drafted',
      'Recruiter follow-up blurb prepared',
      'Manual submission required',
    ],
    metadata: {
      jobUrl: input.job.url,
      atsKeywords: input.job.atsKeywords,
      applicationAdvice: input.job.applicationAdvice,
    },
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildApplicationPacketExport(input: {
  packet: ApplicationPacket;
  format?: 'markdown' | 'text';
}): ApplicationPacketExport {
  const format = input.format ?? 'markdown';
  const packet = input.packet;
  const checklist = packet.checklist.map((item) => `- [ ] ${item}`).join('\n');
  const bullets = packet.targetedBullets.map((item) => `- ${item}`).join('\n');
  const keywords = packet.metadata.atsKeywords.map((item) => `\`${item}\``).join(', ') || 'No keywords mapped';
  const body = [
    `# ${packet.company} - ${packet.jobTitle}`,
    '',
    `Resume variant: ${packet.resumeVariant}`,
    `ATS keyword coverage: ${packet.atsKeywordCoverage}/100`,
    `Job URL: ${packet.metadata.jobUrl}`,
    '',
    '## Resume Summary',
    packet.resumeSummary,
    '',
    '## Targeted Bullets',
    bullets,
    '',
    '## ATS Keywords',
    keywords,
    '',
    '## Cover Letter',
    packet.coverLetter,
    '',
    '## Recruiter Message',
    packet.recruiterMessage,
    '',
    '## Checklist',
    checklist,
  ].join('\n');

  return {
    filename: `${slugify(packet.company)}-${slugify(packet.jobTitle)}-application-packet.${format === 'markdown' ? 'md' : 'txt'}`,
    mimeType: format === 'markdown' ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8',
    body,
  };
}

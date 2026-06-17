export type JobOpportunity = {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
};

export type JobMatch = {
  title: string;
  company: string;
  score: number;
  resumeVariant: string;
  atsKeywords: string[];
  applicationAdvice: string;
  url: string;
};

export type JobSearchPipeline = {
  matches: JobMatch[];
  skipped: Array<JobOpportunity & { reason: string }>;
  summary: {
    applyNow: number;
    queueForReview: number;
    skipped: number;
  };
};

const AI_KEYWORDS = [
  'LLM APIs',
  'AI application',
  'Next.js',
  'TypeScript',
  'Python',
  'Vercel',
  'React',
  'automation',
  'testing',
  'Supabase',
  'OpenAI',
  'RAG',
];

function textFor(job: JobOpportunity) {
  return `${job.title} ${job.company} ${job.location} ${job.description}`.toLowerCase();
}

function skipReason(job: JobOpportunity) {
  const text = textFor(job);
  if (/\b(senior|sr\.?|staff|principal|lead|manager|director)\b/.test(text)) return 'senior_or_lead_role';
  if (/\b(spanish required|fluent spanish|bilingual spanish|español)\b/.test(text)) return 'spanish_required';
  if (!/\b(remote|hybrid|united states|us|usa)\b/.test(text)) return 'not_remote_or_us_accessible';
  if (/\b(7\+|8\+|10\+)\s*years?\b/.test(text)) return 'experience_requirement_too_high';
  return null;
}

function resumeVariant(job: JobOpportunity) {
  const text = textFor(job);
  if (/\b(ai|llm|openai|rag|agent)\b/.test(text)) return 'ai_application_engineer';
  if (/\b(qa|test|automation|playwright|selenium)\b/.test(text)) return 'qa_automation_engineer';
  if (/\b(frontend|react|next\.js|typescript)\b/.test(text)) return 'frontend_application_developer';
  if (/\b(support|implementation|solutions|customer engineer)\b/.test(text)) return 'technical_support_implementation';
  return 'entry_level_software_engineer';
}

function scoreJob(job: JobOpportunity) {
  const text = textFor(job);
  let score = 35;
  if (/\b(junior|jr|entry|associate|apprentice|new grad)\b/.test(text)) score += 20;
  if (/\b(ai|llm|openai|rag|agent|automation)\b/.test(text)) score += 18;
  if (/\b(next\.js|react|typescript|javascript)\b/.test(text)) score += 12;
  if (/\b(python|fastapi|api)\b/.test(text)) score += 8;
  if (/\b(vercel|supabase|postgres)\b/.test(text)) score += 7;
  if (/\b(testing|qa|playwright|selenium)\b/.test(text)) score += 7;
  if (/\b(remote)\b/.test(text)) score += 5;
  return Math.min(100, score);
}

function atsKeywords(job: JobOpportunity) {
  const raw = `${job.title} ${job.description}`;
  return AI_KEYWORDS.filter((keyword) => new RegExp(keyword.replace('.', '\\.'), 'i').test(raw)).slice(0, 10);
}

export function buildJobSearchPipeline(input: { roles: JobOpportunity[] }): JobSearchPipeline {
  const skipped: JobSearchPipeline['skipped'] = [];
  const matches: JobMatch[] = [];

  for (const role of input.roles) {
    const reason = skipReason(role);
    if (reason) {
      skipped.push({ ...role, reason });
      continue;
    }

    const variant = resumeVariant(role);
    const score = scoreJob(role);
    matches.push({
      title: role.title,
      company: role.company,
      score,
      resumeVariant: variant,
      atsKeywords: atsKeywords(role),
      applicationAdvice:
        variant === 'ai_application_engineer'
          ? 'Lead with shipped AI application work, LLM API integrations, TypeScript/Next.js, and testing proof.'
          : 'Lead with shipped application work, automation, testing, and concrete project evidence.',
      url: role.url,
    });
  }

  matches.sort((a, b) => b.score - a.score);
  return {
    matches,
    skipped,
    summary: {
      applyNow: matches.filter((match) => match.score >= 75).length,
      queueForReview: matches.filter((match) => match.score < 75).length,
      skipped: skipped.length,
    },
  };
}

import { buildJobSearchPipeline, type JobOpportunity, type JobSearchPipeline } from './jobs';

export type JobSourceProvider = 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'remotive';

export type JobSourcePayload = {
  provider: JobSourceProvider;
  payload: Record<string, unknown>;
};

export type NormalizedJobOpportunity = JobOpportunity & {
  source: JobSourceProvider;
  externalId: string | null;
};

export type JobConnectorRun = {
  jobs: NormalizedJobOpportunity[];
  pipeline: JobSearchPipeline;
  sourceCounts: Record<JobSourceProvider, number>;
  imported: number;
  skipped: number;
};

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function recordValue(value: unknown) {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function companyFromUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    const parts = host.split('.');
    return parts.length > 2 ? parts[parts.length - 3] : parts[0];
  } catch {
    return 'Unknown company';
  }
}

function normalizeGreenhouse(payload: Record<string, unknown>): NormalizedJobOpportunity {
  const url = stringValue(payload.absolute_url) || stringValue(payload.url);
  const location = recordValue(payload.location);
  return {
    source: 'greenhouse',
    externalId: String(payload.id ?? url ?? '') || null,
    title: stringValue(payload.title) || 'Untitled Greenhouse role',
    company: stringValue(payload.company) || companyFromUrl(url),
    location: stringValue(location.name) || stringValue(payload.location) || 'Remote',
    description: stringValue(payload.content) || stringValue(payload.description) || '',
    url,
  };
}

function normalizeLever(payload: Record<string, unknown>): NormalizedJobOpportunity {
  const categories = recordValue(payload.categories);
  const url = stringValue(payload.hostedUrl) || stringValue(payload.applyUrl);
  return {
    source: 'lever',
    externalId: stringValue(payload.id) || url || null,
    title: stringValue(payload.text) || stringValue(payload.title) || 'Untitled Lever role',
    company: stringValue(payload.company) || companyFromUrl(url),
    location: stringValue(categories.location) || stringValue(payload.location) || 'Remote',
    description: stringValue(payload.descriptionPlain) || stringValue(payload.description) || '',
    url,
  };
}

function normalizeAshby(payload: Record<string, unknown>): NormalizedJobOpportunity {
  const url = stringValue(payload.jobUrl) || stringValue(payload.url);
  return {
    source: 'ashby',
    externalId: stringValue(payload.id) || url || null,
    title: stringValue(payload.title) || 'Untitled Ashby role',
    company: stringValue(payload.company) || companyFromUrl(url),
    location: stringValue(payload.location) || 'Remote',
    description: stringValue(payload.descriptionPlain) || stringValue(payload.descriptionHtml) || stringValue(payload.description) || '',
    url,
  };
}

function normalizeWorkable(payload: Record<string, unknown>): NormalizedJobOpportunity {
  const url = stringValue(payload.url) || stringValue(payload.application_url);
  const location = recordValue(payload.location);
  const locationText = [location.city, location.region, location.country]
    .map(stringValue)
    .filter(Boolean)
    .join(', ');
  return {
    source: 'workable',
    externalId: stringValue(payload.shortcode) || stringValue(payload.id) || url || null,
    title: stringValue(payload.title) || 'Untitled Workable role',
    company: stringValue(payload.company) || companyFromUrl(url),
    location: locationText || stringValue(payload.location) || 'Remote',
    description: stringValue(payload.description) || stringValue(payload.full_description) || '',
    url,
  };
}

function normalizeRemotive(payload: Record<string, unknown>): NormalizedJobOpportunity {
  const url = stringValue(payload.url);
  return {
    source: 'remotive',
    externalId: String(payload.id ?? url ?? '') || null,
    title: stringValue(payload.title) || 'Untitled Remotive role',
    company: stringValue(payload.company_name) || stringValue(payload.company) || companyFromUrl(url),
    location: stringValue(payload.candidate_required_location) || stringValue(payload.location) || 'Remote',
    description: stringValue(payload.description) || '',
    url,
  };
}

export function normalizeJobSourceResults(results: JobSourcePayload[]): NormalizedJobOpportunity[] {
  return results.map((result) => {
    if (result.provider === 'greenhouse') return normalizeGreenhouse(result.payload);
    if (result.provider === 'lever') return normalizeLever(result.payload);
    if (result.provider === 'ashby') return normalizeAshby(result.payload);
    if (result.provider === 'workable') return normalizeWorkable(result.payload);
    return normalizeRemotive(result.payload);
  });
}

export function buildJobConnectorRun(input: {
  jobs: NormalizedJobOpportunity[];
}): JobConnectorRun {
  const sourceCounts: Record<JobSourceProvider, number> = {
    greenhouse: 0,
    lever: 0,
    ashby: 0,
    workable: 0,
    remotive: 0,
  };
  for (const job of input.jobs) sourceCounts[job.source] += 1;
  const pipeline = buildJobSearchPipeline({ roles: input.jobs });
  return {
    jobs: input.jobs,
    pipeline,
    sourceCounts,
    imported: input.jobs.length,
    skipped: pipeline.skipped.length,
  };
}

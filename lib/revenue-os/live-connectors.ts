import {
  buildJobConnectorRun,
  normalizeJobSourceResults,
  type JobSourcePayload,
  type JobSourceProvider,
  type NormalizedJobOpportunity,
} from './job-connectors';

export type JobSourceConnector = {
  provider: JobSourceProvider;
  key: string;
  label: string;
  execute: (context: { fetchImpl?: typeof fetch }) => Promise<JobSourcePayload[]>;
};

type ConnectorRunResult = ReturnType<typeof buildJobConnectorRun> & {
  errors: Array<{ key: string; message: string }>;
  runHealth: {
    attemptedConnectors: number;
    successfulConnectors: number;
    failedConnectors: number;
    retries: number;
  };
};

type ConnectorExecutionContext = {
  fetchImpl?: typeof fetch;
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
};

function limitItems<T>(items: T[], limit: number | undefined) {
  return items.slice(0, Math.max(1, Math.min(50, Math.round(limit ?? 25))));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

async function fetchWithPolicy(
  context: ConnectorExecutionContext,
  url: string,
  label: string,
): Promise<Response> {
  const fetchImpl = context.fetchImpl ?? fetch;
  const retries = Math.max(0, Math.min(3, Math.round(context.retries ?? 2)));
  const retryDelayMs = Math.max(0, Math.min(5_000, Math.round(context.retryDelayMs ?? 250)));
  const timeoutMs = Math.max(250, Math.min(30_000, Math.round(context.timeoutMs ?? 10_000)));
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return res;
      if (!isRetryableStatus(res.status) || attempt === retries) {
        throw new Error(`${label} failed: ${res.status}`);
      }
      lastError = new Error(`${label} failed: ${res.status}`);
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt === retries) break;
    }
    if (retryDelayMs > 0) await sleep(retryDelayMs * (attempt + 1));
  }

  throw lastError instanceof Error ? lastError : new Error(`${label} failed`);
}

export function buildGreenhouseJobBoardConnector(input: {
  boardToken: string;
  company: string;
  limit?: number;
}): JobSourceConnector {
  const label = `${input.company} Greenhouse jobs`;
  return {
    provider: 'greenhouse',
    key: `greenhouse:${input.boardToken}`,
    label,
    async execute(context) {
      const res = await fetchWithPolicy(context, `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(input.boardToken)}/jobs?content=true`, label);
      const payload = (await res.json()) as { jobs?: Array<Record<string, unknown>> };
      return limitItems(payload.jobs ?? [], input.limit).map((job) => ({
        provider: 'greenhouse',
        payload: { ...job, company: input.company },
      }));
    },
  };
}

export function buildLeverJobConnector(input: {
  companySlug: string;
  company: string;
  limit?: number;
}): JobSourceConnector {
  const label = `${input.company} Lever jobs`;
  return {
    provider: 'lever',
    key: `lever:${input.companySlug}`,
    label,
    async execute(context) {
      const res = await fetchWithPolicy(context, `https://api.lever.co/v0/postings/${encodeURIComponent(input.companySlug)}?mode=json`, label);
      const payload = (await res.json()) as Array<Record<string, unknown>>;
      return limitItems(payload, input.limit).map((job) => ({
        provider: 'lever',
        payload: { ...job, company: input.company },
      }));
    },
  };
}

export function buildRemotiveJobConnector(input: {
  search: string;
  limit?: number;
}): JobSourceConnector {
  const label = 'Remotive jobs';
  return {
    provider: 'remotive',
    key: `remotive:${input.search.trim().toLowerCase()}`,
    label,
    async execute(context) {
      const params = new URLSearchParams({ search: input.search });
      const res = await fetchWithPolicy(context, `https://remotive.com/api/remote-jobs?${params.toString()}`, label);
      const payload = (await res.json()) as { jobs?: Array<Record<string, unknown>> };
      return limitItems(payload.jobs ?? [], input.limit).map((job) => ({
        provider: 'remotive',
        payload: job,
      }));
    },
  };
}

export async function runJobSourceConnectors(
  connectors: JobSourceConnector[],
  context: ConnectorExecutionContext = {},
): Promise<ConnectorRunResult> {
  const payloads: JobSourcePayload[] = [];
  const errors: Array<{ key: string; message: string }> = [];
  let successfulConnectors = 0;

  for (const connector of connectors) {
    try {
      payloads.push(...await connector.execute(context));
      successfulConnectors += 1;
    } catch (error) {
      errors.push({
        key: connector.key,
        message: error instanceof Error ? error.message : 'Unknown job connector error',
      });
    }
  }

  const jobs = normalizeJobSourceResults(payloads) as NormalizedJobOpportunity[];
  return {
    ...buildJobConnectorRun({ jobs }),
    errors,
    runHealth: {
      attemptedConnectors: connectors.length,
      successfulConnectors,
      failedConnectors: errors.length,
      retries: Math.max(0, Math.min(3, Math.round(context.retries ?? 2))),
    },
  };
}

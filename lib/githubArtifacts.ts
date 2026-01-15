import type { QualityProjectMetric } from '@/lib/qualityMetrics';
import yauzl from 'yauzl';

type QaMetrics = {
  generatedAt?: string;
  repo?: string;
  branch?: string;
  commit?: string;
  runId?: number;
  tests?: {
    total?: number;
    pass?: number;
    fail?: number;
    passRate?: number;
    flakeRate?: number;
  };
  lighthouse?: {
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
  };
  security?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  artifacts?: {
    playwrightReport?: string;
    lighthouseReport?: string;
  };
};

export type RepoRunArtifactContext = {
  runsUrl: string;
  runUrl?: string;
  runId?: number;
  scannedRuns?: number;
  matchedRunId?: number;
  matchedRunUrl?: string;
  matchedArtifactName?: string;
};

type WorkflowRunsResponse = {
  workflow_runs?: Array<{
    id?: number;
    html_url?: string;
  }>;
};

type ArtifactsResponse = {
  artifacts?: Array<{
    name?: string;
    archive_download_url?: string;
  }>;
};

export async function ghApiFetch<T>(url: string, token?: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API error ${res.status} for ${url}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function tryFetchQaMetrics(params: {
  owner: string;
  repo: string;
  token?: string;
}): Promise<
  | { metrics: QaMetrics; ctx: RepoRunArtifactContext }
  | { metrics: null; ctx: RepoRunArtifactContext; notes: string }
> {
  const runsUrl = `https://github.com/${params.owner}/${params.repo}/actions`;

  // Robust approach: scan the most recent N runs and pick the newest run that
  // actually contains the `qa-metrics` artifact. This avoids the dashboard going
  // blank whenever the most recent run is from a different workflow or is failing.
  const SCAN_RUNS = 20;

  const runs = await ghApiFetch<WorkflowRunsResponse>(
    `https://api.github.com/repos/${params.owner}/${params.repo}/actions/runs?per_page=${SCAN_RUNS}`,
    params.token
  );

  const latest = runs?.workflow_runs?.[0];
  const ctx: RepoRunArtifactContext = {
    runsUrl,
    runUrl: latest?.html_url as string | undefined,
    runId: latest?.id as number | undefined,
    scannedRuns: (runs?.workflow_runs ?? []).length,
  };

  const candidates = runs?.workflow_runs ?? [];
  if (!candidates.length) {
    return { metrics: null, ctx, notes: 'No workflow runs found.' };
  }

  let matched: { runId: number; runUrl?: string; qa: NonNullable<ArtifactsResponse['artifacts']>[number] } | null =
    null;
  for (const r of candidates) {
    const runId = r?.id as number | undefined;
    if (!runId) continue;

    const artifacts = await ghApiFetch<ArtifactsResponse>(
      `https://api.github.com/repos/${params.owner}/${params.repo}/actions/runs/${runId}/artifacts`,
      params.token
    );
    const qa = (artifacts?.artifacts ?? []).find((a) => a?.name === 'qa-metrics');
    if (qa) {
      matched = { runId, runUrl: r?.html_url as string | undefined, qa };
      break;
    }
  }

  if (!matched) {
    return {
      metrics: null,
      ctx,
      notes: `qa-metrics artifact not found in the last ${SCAN_RUNS} runs.`,
    };
  }

  ctx.matchedRunId = matched.runId;
  ctx.matchedRunUrl = matched.runUrl;
  ctx.matchedArtifactName = matched.qa?.name as string | undefined;

  // We cannot directly download artifacts without following the archive endpoint.
  // The archive endpoint returns a ZIP. We fetch the redirect and return the URL for UI linking.
  const archiveUrl = matched.qa.archive_download_url as string | undefined;
  if (!archiveUrl) {
    return { metrics: null, ctx, notes: 'qa-metrics artifact missing archive_download_url.' };
  }

  try {
    const zipRes = await fetch(archiveUrl, {
      headers: {
        ...(params.token ? { Authorization: `Bearer ${params.token}` } : {}),
        Accept: 'application/vnd.github+json',
      },
      redirect: 'follow',
    });

    if (!zipRes.ok) {
      const body = await zipRes.text().catch(() => '');
      return { metrics: null, ctx, notes: `Failed to download qa-metrics artifact: ${zipRes.status} ${body}` };
    }

    const buf = Buffer.from(await zipRes.arrayBuffer());
    const jsonText = await extractFileFromZip(buf, 'qa-metrics.json');
    if (!jsonText) {
      return { metrics: null, ctx, notes: 'qa-metrics.json not found inside artifact zip.' };
    }

    const parsed = JSON.parse(jsonText) as QaMetrics;
    return { metrics: parsed, ctx };
  } catch (e) {
    return { metrics: null, ctx, notes: e instanceof Error ? e.message : String(e) };
  }
}

async function extractFileFromZip(zipBuffer: Buffer, filename: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zip) => {
      if (err || !zip) return reject(err);
      zip.readEntry();
      zip.on('entry', (entry) => {
        if (entry.fileName === filename) {
          zip.openReadStream(entry, (e2, stream) => {
            if (e2 || !stream) {
              zip.close();
              return reject(e2);
            }
            const chunks: Buffer[] = [];
            stream.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
            stream.on('end', () => {
              zip.close();
              resolve(Buffer.concat(chunks).toString('utf8'));
            });
            stream.on('error', (e3) => {
              zip.close();
              reject(e3);
            });
          });
          return;
        }
        zip.readEntry();
      });
      zip.on('end', () => resolve(null));
      zip.on('error', reject);
    });
  });
}

export function mergeQaMetricsIntoProject(project: QualityProjectMetric, qa: QaMetrics | null): QualityProjectMetric {
  if (!qa) return project;
  return {
    ...project,
    tests: {
      ...(project.tests ?? {}),
      ...(qa.tests ?? {}),
    },
    performance: {
      ...(project.performance ?? {}),
      lighthouse: {
        ...(project.performance?.lighthouse ?? {}),
        ...(qa.lighthouse ?? {}),
      },
    },
    security: {
      ...(project.security ?? {}),
      ...(qa.security ?? {}),
    },
  };
}

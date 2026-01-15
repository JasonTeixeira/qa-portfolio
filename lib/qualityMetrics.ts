export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface QualityProjectMetric {
  name: string;
  repo: string;
  type?: 'portfolio' | 'project' | 'service';
  status: HealthStatus;
  lastRun?: string;
  ci?: {
    badgeUrl?: string;
    runsUrl?: string;
    reportUrl?: string;
  };
  tests?: {
    total?: number;
    passRate?: number; // 0..1
    flakeRate?: number; // 0..1
  };
  performance?: {
    lighthouse?: Partial<LighthouseScores>;
  };
  security?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };

  // Optional debug note for snapshot generation.
  notes?: string;

  // Optional debug metadata for live fetches (safe to expose; contains no secrets).
  debug?: {
    source?: 'snapshot' | 'live';
    scannedRuns?: number;
    latestRunId?: number;
    latestRunUrl?: string;
    matchedRunId?: number;
    matchedRunUrl?: string;
    matchedArtifactName?: string;
  };
}

export interface QualityMetricsSnapshot {
  generatedAt: string;
  summary?: {
    overallStatus?: HealthStatus;
    notes?: string;
    targets?: {
      lighthouse?: LighthouseScores;
      flakeRate?: number;
      criticalVulns?: number;
    };
  };
  projects: QualityProjectMetric[];
}

export interface QualityHistoryEntry {
  generatedAt: string;
  projects: QualityProjectMetric[];
}

export type QualityHistory = QualityHistoryEntry[];

export async function getQualityMetricsSnapshot(): Promise<QualityMetricsSnapshot> {
  // Public files are always safe to fetch client-side.
  const res = await fetch('/quality/metrics.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load quality metrics snapshot: ${res.status}`);
  }
  return res.json();
}

export async function getQualityMetricsLive(): Promise<QualityMetricsSnapshot> {
  const res = await fetch('/api/quality', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load live quality metrics: ${res.status}`);
  }
  return res.json();
}

export async function getQualityMetricsAws(): Promise<QualityMetricsSnapshot> {
  const res = await fetch('/api/quality?mode=aws', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load AWS quality metrics: ${res.status}`);
  }
  return res.json();
}

export async function getQualityHistorySnapshot(): Promise<QualityHistory> {
  const res = await fetch('/quality/history.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load quality history snapshot: ${res.status}`);
  }
  return res.json();
}

export async function getQualityHistoryLive(): Promise<QualityHistory> {
  const res = await fetch('/api/quality?mode=history', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load live quality history: ${res.status}`);
  }
  return res.json();
}

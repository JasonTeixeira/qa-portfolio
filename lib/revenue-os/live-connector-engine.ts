import type { RevenueWorkerJob } from './worker-engine';

export type LiveConnectorType = 'lead' | 'job';

export type LiveConnectorRecordType = 'lead' | 'job';

export type LiveConnectorEnrichmentStep = {
  provider: string;
  fieldsAdded: string[];
  confidence: number;
};

export type LiveConnectorInputRecord = {
  recordType: LiveConnectorRecordType;
  name: string;
  websiteUrl?: string | null;
  sourceUrl: string;
  dedupeKey: string;
  fields: Record<string, unknown>;
  enrichment?: LiveConnectorEnrichmentStep[];
};

export type LiveConnectorImportRecord = LiveConnectorInputRecord & {
  importStatus: 'importable';
  discoveredAt: string;
  enrichmentChain: LiveConnectorEnrichmentStep[];
};

export type LiveConnectorSkippedRecord = LiveConnectorInputRecord & {
  importStatus: 'deduped' | 'quota_exceeded';
  reason: string;
};

export type LiveConnectorProvenance = {
  connectorKey: string;
  recordType: LiveConnectorRecordType;
  dedupeKey: string;
  sourceUrl: string;
  discoveredAt: string;
  fieldsCollected: string[];
  legalBasis: 'business_context_outreach';
  enrichmentChain: LiveConnectorEnrichmentStep[];
};

export type LiveConnectorImportBatch = {
  runKey: string;
  batchKey: string;
  connectorKey: string;
  connectorLabel: string;
  connectorType: LiveConnectorType;
  sourceType: string;
  status: 'completed' | 'empty';
  found: number;
  imported: number;
  deduped: number;
  quotaSkipped: number;
  dailyLimit: number;
  quotaRemaining: number;
  importable: LiveConnectorImportRecord[];
  skipped: LiveConnectorSkippedRecord[];
  provenance: LiveConnectorProvenance[];
  workerJobs: RevenueWorkerJob[];
  discoveredAt: string;
};

function clampLimit(value: number) {
  return Math.max(0, Math.min(10_000, Math.round(value)));
}

function fieldsCollected(fields: Record<string, unknown>) {
  return Object.entries(fields)
    .filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && String(value).trim() !== '';
    })
    .map(([key]) => key)
    .sort();
}

function workerKindFor(record: LiveConnectorImportRecord): RevenueWorkerJob['kind'] {
  if (record.recordType === 'job') return 'job_source';
  return record.websiteUrl ? 'website_audit' : 'enrichment';
}

function workerTargetFor(record: LiveConnectorImportRecord) {
  if (record.recordType === 'job') return record.sourceUrl;
  return record.websiteUrl ?? record.name;
}

function buildWorkerJobs(input: {
  runKey: string;
  records: LiveConnectorImportRecord[];
  discoveredAt: string;
}): RevenueWorkerJob[] {
  return input.records.map((record, index) => ({
    id: `${input.runKey}-connector-${record.recordType}-${index + 1}`,
    kind: workerKindFor(record),
    target: workerTargetFor(record),
    priority: record.recordType === 'lead' ? 85 : 75,
    requestedUnits: 1,
    rateLimitPerMinute: 30,
    attemptsRemaining: 3,
    status: 'queued',
    nextRunAt: input.discoveredAt,
    result: {},
    lastError: null,
  }));
}

export function buildLiveConnectorImportBatch(input: {
  runKey: string;
  connectorKey: string;
  connectorLabel: string;
  connectorType: LiveConnectorType;
  sourceType: string;
  dailyLimit: number;
  discoveredAt?: string;
  existingDedupeKeys?: string[];
  records: LiveConnectorInputRecord[];
}): LiveConnectorImportBatch {
  const discoveredAt = input.discoveredAt ?? new Date().toISOString();
  const dailyLimit = clampLimit(input.dailyLimit);
  const existing = new Set((input.existingDedupeKeys ?? []).map((item) => item.toLowerCase()));
  const seen = new Set<string>();
  const importable: LiveConnectorImportRecord[] = [];
  const skipped: LiveConnectorSkippedRecord[] = [];

  for (const record of input.records) {
    const dedupeKey = record.dedupeKey.toLowerCase();
    if (existing.has(dedupeKey) || seen.has(dedupeKey)) {
      skipped.push({
        ...record,
        importStatus: 'deduped',
        reason: 'dedupe key already exists in this tenant or batch',
      });
      continue;
    }
    seen.add(dedupeKey);

    if (importable.length >= dailyLimit) {
      skipped.push({
        ...record,
        importStatus: 'quota_exceeded',
        reason: 'daily connector import limit reached',
      });
      continue;
    }

    importable.push({
      ...record,
      importStatus: 'importable',
      discoveredAt,
      enrichmentChain: record.enrichment ?? [],
    });
  }

  const provenance = importable.map((record): LiveConnectorProvenance => ({
    connectorKey: input.connectorKey,
    recordType: record.recordType,
    dedupeKey: record.dedupeKey,
    sourceUrl: record.sourceUrl,
    discoveredAt,
    fieldsCollected: fieldsCollected(record.fields),
    legalBasis: 'business_context_outreach',
    enrichmentChain: record.enrichmentChain,
  }));

  const deduped = skipped.filter((record) => record.importStatus === 'deduped').length;
  const quotaSkipped = skipped.filter((record) => record.importStatus === 'quota_exceeded').length;

  return {
    runKey: input.runKey,
    batchKey: `${input.connectorKey}:${input.runKey}`,
    connectorKey: input.connectorKey,
    connectorLabel: input.connectorLabel,
    connectorType: input.connectorType,
    sourceType: input.sourceType,
    status: importable.length > 0 ? 'completed' : 'empty',
    found: input.records.length,
    imported: importable.length,
    deduped,
    quotaSkipped,
    dailyLimit,
    quotaRemaining: Math.max(0, dailyLimit - importable.length),
    importable,
    skipped,
    provenance,
    workerJobs: buildWorkerJobs({ runKey: input.runKey, records: importable, discoveredAt }),
    discoveredAt,
  };
}

export function summarizeLiveConnectorImportBatch(batch: LiveConnectorImportBatch) {
  return {
    found: batch.found,
    imported: batch.imported,
    deduped: batch.deduped,
    quotaSkipped: batch.quotaSkipped,
    quotaRemaining: batch.quotaRemaining,
    provenanceComplete: batch.provenance.length === batch.importable.length
      && batch.provenance.every((item) => item.sourceUrl && item.fieldsCollected.length > 0),
    workerJobsQueued: batch.workerJobs.length,
  };
}

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { badRequest, forbidden, fromZodError, unauthorized } from '@/lib/api-errors';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  buildIdempotencyKey,
  hashRequestBody,
  hasRevenueApiScope,
  parseBearerApiKey,
  verifyRevenueApiKey,
  verifyRevenueWebhookSignature,
  csvEscape,
  type RevenueApiScope,
} from '@/lib/revenue-os/public-api';

export const LeadPayloadSchema = z.object({
  externalId: z.string().trim().max(200).optional(),
  name: z.string().trim().min(1).max(200),
  websiteUrl: z.string().trim().url().optional(),
  industry: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  sourceUrl: z.string().trim().url().optional(),
  contact: z.object({
    name: z.string().trim().max(160).optional(),
    title: z.string().trim().max(160).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().max(80).optional(),
  }).optional(),
  tags: z.array(z.string().trim().max(50)).max(20).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const JobPayloadSchema = z.object({
  externalId: z.string().trim().max(200).optional(),
  title: z.string().trim().min(1).max(220),
  company: z.string().trim().min(1).max(220),
  location: z.string().trim().max(160).optional(),
  jobUrl: z.string().trim().url().optional(),
  source: z.string().trim().max(80).default('public_api'),
  score: z.number().int().min(0).max(100).default(50),
  resumeVariant: z.string().trim().max(120).optional(),
  atsKeywords: z.array(z.string().trim().max(80)).max(50).default([]),
  applicationAdvice: z.string().trim().max(2000).optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const EventPayloadSchema = z.object({
  externalId: z.string().trim().max(200).optional(),
  type: z.string().trim().min(1).max(120),
  occurredAt: z.string().datetime().optional(),
  accountId: z.string().uuid().optional(),
  payload: z.record(z.unknown()).default({}),
});

export const AuditPayloadSchema = z.object({
  externalId: z.string().trim().max(200).optional(),
  accountId: z.string().uuid().optional(),
  url: z.string().trim().url(),
  score: z.number().int().min(0).max(100).default(50),
  recommendedOffer: z.string().trim().max(120).optional(),
  issues: z.array(z.record(z.unknown())).max(100).default([]),
  opportunities: z.array(z.record(z.unknown())).max(100).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const OutcomePayloadSchema = z.object({
  externalId: z.string().trim().max(200).optional(),
  accountId: z.string().uuid().optional(),
  stage: z.enum(['qualified', 'contacted', 'meeting', 'proposal', 'won', 'lost']),
  revenueValue: z.number().min(0).optional(),
  occurredAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).default({}),
});

type AuthContext = {
  apiKeyId: string;
  tenantKey: string;
  scopes: string[];
  secret: string;
};

export async function authenticateRevenueApiRequest(req: NextRequest, requiredScope: RevenueApiScope) {
  const presentedKey = parseBearerApiKey(req.headers.get('authorization'));
  if (!presentedKey) return { ok: false as const, response: unauthorized('Missing bearer API key') };
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('revenue_api_keys')
    .select('id, tenant_key, key_hash, scopes, status, expires_at')
    .eq('key_prefix', presentedKey.slice(0, 16))
    .eq('status', 'active');
  if (error) return { ok: false as const, response: unauthorized('Invalid API key') };
  const verified = verifyRevenueApiKey({
    presentedKey,
    records: (data ?? []).map((record) => ({
      id: record.id,
      tenantKey: record.tenant_key,
      keyHash: record.key_hash,
      scopes: record.scopes ?? [],
      status: record.status,
      expiresAt: record.expires_at,
    })),
  });
  if (!verified) return { ok: false as const, response: unauthorized('Invalid API key') };
  if (!hasRevenueApiScope(verified.scopes, requiredScope)) {
    return { ok: false as const, response: forbidden('API key does not include the required scope') };
  }
  await sb.from('revenue_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', verified.id);
  return {
    ok: true as const,
    sb,
    auth: {
      apiKeyId: verified.id,
      tenantKey: verified.tenantKey,
      scopes: verified.scopes,
      secret: presentedKey,
    } satisfies AuthContext,
  };
}

async function logRequest(input: {
  auth: AuthContext;
  endpoint: string;
  method: string;
  statusCode: number;
  idempotencyKey?: string | null;
  requestHash?: string | null;
  responseSummary: Record<string, unknown>;
}) {
  const sb = supabaseAdmin();
  await sb.from('revenue_api_requests').insert({
    tenant_key: input.auth.tenantKey,
    api_key_id: input.auth.apiKeyId,
    endpoint: input.endpoint,
    method: input.method,
    status_code: input.statusCode,
    idempotency_key: input.idempotencyKey ?? null,
    request_hash: input.requestHash ?? null,
    response_summary: input.responseSummary,
  }).throwOnError();
}

async function recordIngestion(input: {
  auth: AuthContext;
  resourceType: 'lead' | 'job' | 'event' | 'audit' | 'outcome' | 'webhook';
  externalId?: string | null;
  idempotencyKey?: string | null;
  payload: unknown;
  persistedRefs?: Record<string, unknown>;
  status?: 'accepted' | 'duplicate' | 'failed';
  error?: string | null;
}) {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('revenue_api_ingestion_events')
    .insert({
      tenant_key: input.auth.tenantKey,
      api_key_id: input.auth.apiKeyId,
      resource_type: input.resourceType,
      external_id: input.externalId ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      payload: input.payload,
      persisted_refs: input.persistedRefs ?? {},
      status: input.status ?? 'accepted',
      error: input.error ?? null,
      metadata: { program: '8_public_api' },
    })
    .select('id')
    .maybeSingle();
  return data?.id ?? null;
}

export async function ingestRevenueResource(req: NextRequest, resource: string) {
  const scopeByResource: Record<string, RevenueApiScope> = {
    leads: 'leads:write',
    jobs: 'jobs:write',
    events: 'events:write',
    audits: 'audits:write',
    outcomes: 'outcomes:write',
  };
  const requiredScope = scopeByResource[resource];
  if (!requiredScope) return NextResponse.json({ error: 'unknown_resource' }, { status: 404 });
  const authResult = await authenticateRevenueApiRequest(req, requiredScope);
  if (!authResult.ok) return authResult.response;

  const rawBody = await req.text();
  const requestHash = hashRequestBody(rawBody);
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return badRequest('Invalid JSON body');
  }

  const idempotencyHeader = req.headers.get('idempotency-key');
  const sb = authResult.sb;
  const tenantMeta = { tenantKey: authResult.auth.tenantKey, apiKeyId: authResult.auth.apiKeyId, program: '8_public_api' };

  try {
    if (resource === 'leads') {
      const parsed = LeadPayloadSchema.safeParse(body);
      if (!parsed.success) return fromZodError(parsed.error);
      const idempotencyKey = buildIdempotencyKey({ tenantKey: authResult.auth.tenantKey, resource, externalId: parsed.data.externalId, idempotencyKey: idempotencyHeader });
      const duplicate = await findDuplicate(idempotencyKey, authResult.auth.tenantKey, 'lead');
      if (duplicate) return NextResponse.json({ ok: true, duplicate: true, ingestionId: duplicate.id });
      const { data: account, error } = await sb.from('acquisition_accounts').insert({
        name: parsed.data.name,
        website_url: parsed.data.websiteUrl ?? null,
        industry: parsed.data.industry ?? null,
        location: parsed.data.location ?? null,
        source: 'import',
        stage: 'prospect',
        priority: 'medium',
        tags: parsed.data.tags,
        metadata: { ...tenantMeta, externalId: parsed.data.externalId, sourceUrl: parsed.data.sourceUrl, ...parsed.data.metadata },
      }).select('id').maybeSingle();
      if (error || !account) throw error ?? new Error('account_insert_failed');
      let contactId: string | null = null;
      if (parsed.data.contact) {
        const { data: contact } = await sb.from('acquisition_contacts').insert({
          account_id: account.id,
          full_name: parsed.data.contact.name ?? null,
          title: parsed.data.contact.title ?? null,
          email: parsed.data.contact.email ?? null,
          phone: parsed.data.contact.phone ?? null,
          source: 'public_api',
          confidence: parsed.data.contact.email ? 80 : 35,
          is_primary: true,
          metadata: tenantMeta,
        }).select('id').maybeSingle();
        contactId = contact?.id ?? null;
      }
      const ingestionId = await recordIngestion({ auth: authResult.auth, resourceType: 'lead', externalId: parsed.data.externalId, idempotencyKey, payload: parsed.data, persistedRefs: { accountId: account.id, contactId } });
      await logRequest({ auth: authResult.auth, endpoint: `/api/revenue-os/v1/${resource}`, method: 'POST', statusCode: 202, idempotencyKey, requestHash, responseSummary: { ingestionId, accountId: account.id } });
      return NextResponse.json({ ok: true, accepted: true, ingestionId, accountId: account.id, contactId }, { status: 202 });
    }

    if (resource === 'jobs') {
      const parsed = JobPayloadSchema.safeParse(body);
      if (!parsed.success) return fromZodError(parsed.error);
      const idempotencyKey = buildIdempotencyKey({ tenantKey: authResult.auth.tenantKey, resource, externalId: parsed.data.externalId, idempotencyKey: idempotencyHeader });
      const duplicate = await findDuplicate(idempotencyKey, authResult.auth.tenantKey, 'job');
      if (duplicate) return NextResponse.json({ ok: true, duplicate: true, ingestionId: duplicate.id });
      const { data: job, error } = await sb.from('revenue_job_opportunities').insert({
        title: parsed.data.title,
        company: parsed.data.company,
        location: parsed.data.location ?? null,
        job_url: parsed.data.jobUrl ?? null,
        source: parsed.data.source,
        score: parsed.data.score,
        resume_variant: parsed.data.resumeVariant ?? null,
        ats_keywords: parsed.data.atsKeywords,
        application_advice: parsed.data.applicationAdvice ?? null,
        metadata: { ...tenantMeta, externalId: parsed.data.externalId, ...parsed.data.metadata },
      }).select('id').maybeSingle();
      if (error || !job) throw error ?? new Error('job_insert_failed');
      const ingestionId = await recordIngestion({ auth: authResult.auth, resourceType: 'job', externalId: parsed.data.externalId, idempotencyKey, payload: parsed.data, persistedRefs: { jobId: job.id } });
      await logRequest({ auth: authResult.auth, endpoint: `/api/revenue-os/v1/${resource}`, method: 'POST', statusCode: 202, idempotencyKey, requestHash, responseSummary: { ingestionId, jobId: job.id } });
      return NextResponse.json({ ok: true, accepted: true, ingestionId, jobId: job.id }, { status: 202 });
    }

    const schema = resource === 'events' ? EventPayloadSchema : resource === 'audits' ? AuditPayloadSchema : OutcomePayloadSchema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);
    const data = parsed.data as z.infer<typeof EventPayloadSchema> | z.infer<typeof AuditPayloadSchema> | z.infer<typeof OutcomePayloadSchema>;
    const singular = resource.slice(0, -1) as 'event' | 'audit' | 'outcome';
    const idempotencyKey = buildIdempotencyKey({ tenantKey: authResult.auth.tenantKey, resource, externalId: data.externalId, idempotencyKey: idempotencyHeader });
    const duplicate = await findDuplicate(idempotencyKey, authResult.auth.tenantKey, singular);
    if (duplicate) return NextResponse.json({ ok: true, duplicate: true, ingestionId: duplicate.id });
    const refs: Record<string, unknown> = {};
    if (resource === 'audits') {
      const audit = data as z.infer<typeof AuditPayloadSchema>;
      if (audit.accountId) {
        const { data: auditRow } = await sb.from('acquisition_website_audits').insert({
          account_id: audit.accountId,
          url: audit.url,
          overall_score: audit.score,
          issues: audit.issues,
          opportunities: audit.opportunities,
          recommended_offer: audit.recommendedOffer ?? null,
          audit_source: 'import',
        }).select('id').maybeSingle();
        refs.auditId = auditRow?.id ?? null;
      }
    }
    if (resource === 'outcomes') {
      const outcome = data as z.infer<typeof OutcomePayloadSchema>;
      if (outcome.accountId) {
        await sb.from('acquisition_accounts').update({
          stage: outcome.stage,
          metadata: { ...tenantMeta, lastApiOutcome: outcome },
        }).eq('id', outcome.accountId);
        refs.accountId = outcome.accountId;
      }
    }
    const ingestionId = await recordIngestion({ auth: authResult.auth, resourceType: singular, externalId: data.externalId, idempotencyKey, payload: data, persistedRefs: refs });
    await logRequest({ auth: authResult.auth, endpoint: `/api/revenue-os/v1/${resource}`, method: 'POST', statusCode: 202, idempotencyKey, requestHash, responseSummary: { ingestionId, refs } });
    return NextResponse.json({ ok: true, accepted: true, ingestionId, refs }, { status: 202 });
  } catch (error) {
    console.error('[revenue-api] ingestion failed', error);
    await logRequest({ auth: authResult.auth, endpoint: `/api/revenue-os/v1/${resource}`, method: 'POST', statusCode: 500, requestHash, responseSummary: { error: 'ingestion_failed' } });
    return NextResponse.json({ ok: false, error: 'ingestion_failed' }, { status: 500 });
  }
}

async function findDuplicate(idempotencyKey: string, tenantKey: string, resourceType: string) {
  const { data } = await supabaseAdmin()
    .from('revenue_api_ingestion_events')
    .select('id')
    .eq('tenant_key', tenantKey)
    .eq('resource_type', resourceType)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  return data;
}

export async function exportRevenueResource(req: NextRequest) {
  const authResult = await authenticateRevenueApiRequest(req, 'exports:read');
  if (!authResult.ok) return authResult.response;
  const resource = req.nextUrl.searchParams.get('resource') ?? 'accounts';
  const format = req.nextUrl.searchParams.get('format') ?? 'json';
  const limit = Math.min(250, Math.max(1, Number(req.nextUrl.searchParams.get('limit') ?? 100)));
  const tenantFilter = { tenantKey: authResult.auth.tenantKey };
  const sb = authResult.sb;
  let rows: Record<string, unknown>[] = [];
  if (resource === 'accounts') {
    const { data } = await sb.from('acquisition_accounts').select('id, name, website_url, industry, stage, priority, total_score, metadata, created_at').contains('metadata', tenantFilter).limit(limit);
    rows = (data ?? []) as Record<string, unknown>[];
  } else if (resource === 'jobs') {
    const { data } = await sb.from('revenue_job_opportunities').select('id, title, company, location, job_url, score, status, metadata, created_at').contains('metadata', tenantFilter).limit(limit);
    rows = (data ?? []) as Record<string, unknown>[];
  } else if (resource === 'ingestions') {
    const { data } = await sb.from('revenue_api_ingestion_events').select('id, resource_type, external_id, status, persisted_refs, created_at').eq('tenant_key', authResult.auth.tenantKey).limit(limit);
    rows = (data ?? []) as Record<string, unknown>[];
  } else {
    return badRequest('Unsupported export resource');
  }
  await logRequest({ auth: authResult.auth, endpoint: '/api/revenue-os/v1/exports', method: 'GET', statusCode: 200, responseSummary: { resource, format, rows: rows.length } });
  if (format === 'csv') {
    const headers = Object.keys(rows[0] ?? { id: '' });
    const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n');
    return new NextResponse(`${csv}\n`, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="revenue-os-${resource}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }
  return NextResponse.json({ ok: true, resource, rows });
}

export async function ingestRevenueWebhook(req: NextRequest) {
  const authResult = await authenticateRevenueApiRequest(req, 'webhooks:write');
  if (!authResult.ok) return authResult.response;
  const rawBody = await req.text();
  const timestamp = req.headers.get('x-revenue-os-timestamp');
  const signature = req.headers.get('x-revenue-os-signature');
  const verified = verifyRevenueWebhookSignature({
    secret: authResult.auth.secret,
    timestamp,
    signature,
    body: rawBody,
  });
  if (!verified.ok) {
    await supabaseAdmin().from('revenue_api_webhook_events').insert({
      tenant_key: authResult.auth.tenantKey,
      api_key_id: authResult.auth.apiKeyId,
      provider: req.headers.get('x-revenue-os-provider') ?? 'unknown',
      event_type: 'signature_failed',
      signature_status: signature ? 'invalid' : 'missing',
      status: 'failed',
      payload: {},
      metadata: { reason: verified.reason },
    });
    return unauthorized(verified.reason);
  }
  let body: { provider?: string; type?: string; id?: string; data?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return badRequest('Invalid JSON body');
  }
  const provider = body.provider ?? req.headers.get('x-revenue-os-provider') ?? 'custom';
  const eventType = body.type ?? 'event.received';
  const providerEventId = body.id ?? null;
  const { data: duplicate } = providerEventId
    ? await supabaseAdmin()
        .from('revenue_api_webhook_events')
        .select('id')
        .eq('tenant_key', authResult.auth.tenantKey)
        .eq('provider', provider)
        .eq('provider_event_id', providerEventId)
        .maybeSingle()
    : { data: null };
  if (duplicate?.id) return NextResponse.json({ ok: true, duplicate: true, webhookEventId: duplicate.id });
  const { data: webhookRow } = await supabaseAdmin().from('revenue_api_webhook_events').insert({
    tenant_key: authResult.auth.tenantKey,
    api_key_id: authResult.auth.apiKeyId,
    provider,
    event_type: eventType,
    provider_event_id: providerEventId,
    signature_status: 'valid',
    status: 'accepted',
    payload: body,
    metadata: { program: '8_public_api' },
  }).select('id').maybeSingle();
  const ingestionId = await recordIngestion({ auth: authResult.auth, resourceType: 'webhook', externalId: providerEventId, idempotencyKey: providerEventId ? buildIdempotencyKey({ tenantKey: authResult.auth.tenantKey, resource: 'webhooks', externalId: providerEventId }) : null, payload: body, persistedRefs: { webhookEventId: webhookRow?.id ?? null } });
  await logRequest({ auth: authResult.auth, endpoint: '/api/revenue-os/v1/webhooks', method: 'POST', statusCode: 202, requestHash: hashRequestBody(rawBody), responseSummary: { webhookEventId: webhookRow?.id, ingestionId } });
  return NextResponse.json({ ok: true, accepted: true, webhookEventId: webhookRow?.id ?? null, ingestionId }, { status: 202 });
}

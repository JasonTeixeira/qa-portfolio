import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildRevenueOpsHealth } from '@/lib/revenue-os/production-ops';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function checkDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await sb.from('revenue_workspaces').select('id', { head: true, count: 'exact' });
  return !error;
}

async function readQueueHealth() {
  try {
    const sb = supabaseAdmin();
    const [queued, deadLetters] = await Promise.all([
      sb.from('revenue_worker_jobs').select('id', { count: 'exact', head: true }).eq('status', 'queued'),
      sb.from('revenue_worker_dead_letters').select('id', { count: 'exact', head: true }),
    ]);
    return {
      queueDepth: queued.count ?? 0,
      deadLetters: deadLetters.count ?? 0,
    };
  } catch {
    return { queueDepth: 0, deadLetters: 0 };
  }
}

async function checkStorage() {
  try {
    const { error } = await supabaseAdmin().storage.listBuckets();
    return !error;
  } catch {
    return false;
  }
}

async function readLiveProof() {
  try {
    const sb = supabaseAdmin();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: checks } = await sb
      .from('revenue_live_integration_checks')
      .select('provider, configured, live_verified, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false });
    const latest = new Map<string, { configured: boolean; liveVerified: boolean }>();
    for (const check of checks ?? []) {
      if (!latest.has(check.provider)) {
        latest.set(check.provider, {
          configured: Boolean(check.configured),
          liveVerified: Boolean(check.live_verified),
        });
      }
    }
    return latest;
  } catch {
    return new Map<string, { configured: boolean; liveVerified: boolean }>();
  }
}

async function readWorkerSchedulerLive() {
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin()
      .from('revenue_worker_runtime_executions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)
      .gt('completed_jobs', 0);
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function GET() {
  const queue = await readQueueHealth();
  const liveProof = await readLiveProof();
  const configured = {
    email: Boolean(process.env.RESEND_API_KEY),
    llm: Boolean(process.env.OPENAI_API_KEY),
    leadConnectors: Boolean(process.env.GOOGLE_PLACES_API_KEY || process.env.EXA_API_KEY),
    gmail: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  };
  const health = buildRevenueOpsHealth({
    dbOk: await checkDb(),
    queueDepth: queue.queueDepth,
    deadLetters: queue.deadLetters,
    emailProviderConfigured: {
      configured: configured.email,
      liveVerified: liveProof.get('resend')?.liveVerified === true,
    },
    llmProviderConfigured: {
      configured: configured.llm,
      liveVerified: liveProof.get('openai')?.liveVerified === true,
    },
    leadConnectorsConfigured: {
      configured: configured.leadConnectors,
      liveVerified: liveProof.get('google_places')?.liveVerified === true || liveProof.get('exa')?.liveVerified === true,
    },
    gmailConfigured: {
      configured: configured.gmail,
      liveVerified: liveProof.get('gmail')?.liveVerified === true,
    },
    workerSchedulerLive: await readWorkerSchedulerLive(),
    storageOk: await checkStorage(),
  });

  return NextResponse.json(
    {
      status: health.status,
      ok: health.ok,
      score: health.score,
      timestamp: new Date().toISOString(),
      checks: health.checks.map((check) => ({
        key: check.key,
        label: check.label,
        status: check.status,
        detail: check.detail,
      })),
      alerts: health.alerts,
    },
    {
      status: health.status === 'fail' ? 503 : 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    },
  );
}

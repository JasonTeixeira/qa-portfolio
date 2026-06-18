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

export async function GET() {
  const queue = await readQueueHealth();
  const health = buildRevenueOpsHealth({
    dbOk: await checkDb(),
    queueDepth: queue.queueDepth,
    deadLetters: queue.deadLetters,
    emailProviderConfigured: Boolean(process.env.RESEND_API_KEY),
    llmProviderConfigured: Boolean(process.env.OPENAI_API_KEY),
    leadConnectorsConfigured: Boolean(process.env.GOOGLE_PLACES_API_KEY || process.env.EXA_API_KEY),
    gmailConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    storageOk: true,
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

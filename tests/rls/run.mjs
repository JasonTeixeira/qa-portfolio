// RLS isolation tests for Sage Ideas Studio.
// Uses Supabase REST (PostgREST) directly with the anon key — verifies that an
// unauthenticated client cannot read or write protected tables.
//
// Run: node tests/rls/run.mjs

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hocrntqhgvmeaxwlhzwl.supabase.co';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_B25xhSjOc977b-IDH76Hlg_kzn6ency';

const BASE = `${SUPABASE_URL}/rest/v1`;
const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const READ_TABLES = [
  'profiles',
  'engagements',
  'invoices',
  'messages',
  'audit_log',
  'time_entries',
  'revenue_worker_jobs',
  'revenue_worker_attempts',
  'revenue_worker_dead_letters',
  'revenue_connector_import_batches',
  'revenue_connector_provenance',
  'revenue_website_audit_evidence',
  'revenue_website_audit_offer_mappings',
  'revenue_ai_draft_versions',
  'revenue_ai_evidence_citations',
  'revenue_ai_quality_gates',
  'revenue_email_safety_reports',
  'revenue_email_domain_health',
  'revenue_suppression_events',
  'revenue_sequence_stop_events',
  'revenue_inbox_runs',
  'revenue_inbox_threads',
  'revenue_inbox_messages',
  'revenue_inbox_classifications',
  'revenue_inbox_action_suggestions',
  'revenue_workspaces',
  'revenue_workspace_members',
  'revenue_workspace_configs',
  'revenue_workspace_usage',
  'revenue_workspace_billing_boundaries',
  'revenue_workspace_audit_logs',
];

const WRITE_TABLES = [
  { table: 'profiles', payload: { email: 'fake@example.com', full_name: 'Fake' } },
  { table: 'engagements', payload: { name: 'Fake Engagement', client_id: '00000000-0000-0000-0000-000000000000' } },
  { table: 'invoices', payload: { engagement_id: '00000000-0000-0000-0000-000000000000', amount_cents: 1 } },
  { table: 'contracts', payload: { engagement_id: '00000000-0000-0000-0000-000000000000', body: 'fake' } },
  {
    table: 'revenue_worker_jobs',
    payload: {
      run_key: 'anon-rls-test',
      job_kind: 'lead_source',
      target: 'blocked',
      status: 'queued',
    },
  },
  {
    table: 'revenue_worker_attempts',
    payload: {
      run_key: 'anon-rls-test',
      attempt_number: 1,
      status: 'failed',
      error_code: 'blocked',
      error_message: 'anon write should be blocked',
    },
  },
  {
    table: 'revenue_worker_dead_letters',
    payload: {
      run_key: 'anon-rls-test',
      job_kind: 'lead_source',
      target: 'blocked',
      error_code: 'blocked',
      error_message: 'anon write should be blocked',
    },
  },
  {
    table: 'revenue_connector_import_batches',
    payload: {
      run_key: 'anon-rls-test',
      batch_key: 'anon-rls-test:batch',
      connector_key: 'blocked',
      connector_label: 'Blocked connector',
      connector_type: 'lead',
      source_type: 'csv',
      status: 'completed',
    },
  },
  {
    table: 'revenue_connector_provenance',
    payload: {
      run_key: 'anon-rls-test',
      connector_key: 'blocked',
      record_type: 'lead',
      dedupe_key: 'blocked',
      source_url: 'https://blocked.example',
      discovered_at: new Date().toISOString(),
    },
  },
  {
    table: 'revenue_website_audit_evidence',
    payload: {
      run_key: 'anon-rls-test',
      source_url: 'https://blocked.example',
      evidence_key: 'blocked',
      evidence_type: 'seo_check',
      status: 'failed',
      severity: 'high',
      label: 'Blocked',
      detail: 'anon write should be blocked',
      observed_at: new Date().toISOString(),
    },
  },
  {
    table: 'revenue_website_audit_offer_mappings',
    payload: {
      run_key: 'anon-rls-test',
      source_url: 'https://blocked.example',
      audit_score: 50,
      recommended_offer: 'seo_conversion_audit',
      close_probability_lift: 10,
      next_action: 'anon write should be blocked',
    },
  },
  {
    table: 'revenue_ai_draft_versions',
    payload: {
      run_key: 'anon-rls-test',
      provider: 'local_structured',
      model: 'blocked',
      prompt_version: 'blocked',
      subject: 'Blocked',
      body: 'anon write should be blocked',
      brand_voice: 'blocked',
    },
  },
  {
    table: 'revenue_ai_evidence_citations',
    payload: {
      run_key: 'anon-rls-test',
      evidence_id: 'blocked',
      claim: 'anon write should be blocked',
    },
  },
  {
    table: 'revenue_ai_quality_gates',
    payload: {
      run_key: 'anon-rls-test',
      gate_key: 'blocked',
      status: 'fail',
      severity: 'high',
      detail: 'anon write should be blocked',
    },
  },
  {
    table: 'revenue_email_safety_reports',
    payload: {
      run_key: 'anon-rls-test',
      domain: 'blocked.example',
      status: 'healthy',
    },
  },
  {
    table: 'revenue_email_domain_health',
    payload: {
      run_key: 'anon-rls-test',
      domain: 'blocked.example',
      status: 'healthy',
    },
  },
  {
    table: 'revenue_suppression_events',
    payload: {
      run_key: 'anon-rls-test',
      email: 'blocked@example.com',
      reason: 'manual_suppression',
      source: 'operator',
      occurred_at: new Date().toISOString(),
    },
  },
  {
    table: 'revenue_sequence_stop_events',
    payload: {
      run_key: 'anon-rls-test',
      sequence_key: 'blocked-sequence',
      reason: 'reply_received',
      occurred_at: new Date().toISOString(),
    },
  },
  {
    table: 'revenue_inbox_runs',
    payload: {
      run_key: 'anon-rls-test',
      provider: 'gmail',
      status: 'completed',
    },
  },
  {
    table: 'revenue_inbox_threads',
    payload: {
      run_key: 'anon-rls-test',
      thread_key: 'blocked-thread',
      provider: 'gmail',
      status: 'open',
    },
  },
  {
    table: 'revenue_inbox_messages',
    payload: {
      run_key: 'anon-rls-test',
      thread_key: 'blocked-thread',
      external_message_id: 'blocked-message',
      direction: 'inbound',
    },
  },
  {
    table: 'revenue_inbox_classifications',
    payload: {
      run_key: 'anon-rls-test',
      thread_key: 'blocked-thread',
      external_message_id: 'blocked-message',
      intent: 'neutral',
      sentiment: 'neutral',
    },
  },
  {
    table: 'revenue_inbox_action_suggestions',
    payload: {
      run_key: 'anon-rls-test',
      action_type: 'reply_follow_up',
      suggestion: 'anon write should be blocked',
    },
  },
  {
    table: 'revenue_workspaces',
    payload: {
      run_key: 'anon-rls-test',
      tenant_key: 'anon-blocked',
      business_name: 'Blocked Tenant',
      owner_email: 'owner@blocked.example',
    },
  },
  {
    table: 'revenue_workspace_members',
    payload: {
      tenant_key: 'anon-blocked',
      email: 'member@blocked.example',
      role: 'owner',
    },
  },
  {
    table: 'revenue_workspace_configs',
    payload: {
      tenant_key: 'anon-blocked',
      icp: { blocked: true },
    },
  },
  {
    table: 'revenue_workspace_usage',
    payload: {
      tenant_key: 'anon-blocked',
      period_start: '2026-06-01',
      period_end: '2026-06-30',
    },
  },
  {
    table: 'revenue_workspace_billing_boundaries',
    payload: {
      tenant_key: 'anon-blocked',
      plan_key: 'client_starter',
      billing_status: 'trial',
    },
  },
  {
    table: 'revenue_workspace_audit_logs',
    payload: {
      tenant_key: 'anon-blocked',
      action: 'blocked',
      entity_type: 'workspace',
    },
  },
];

let pass = 0;
let fail = 0;
const failures = [];

function ok(msg) {
  pass += 1;
  console.log(`  PASS  ${msg}`);
}

function bad(msg) {
  fail += 1;
  failures.push(msg);
  console.log(`  FAIL  ${msg}`);
}

async function readBlocked(table) {
  // Anon read: RLS should either return empty, 401, or 403.
  // A non-empty array means data leaked.
  const url = `${BASE}/${table}?select=*&limit=1`;
  let res;
  try {
    res = await fetch(url, { headers: HEADERS });
  } catch (err) {
    return bad(`${table}: fetch threw ${String(err)}`);
  }
  if (res.status === 401 || res.status === 403) return ok(`${table}: anon SELECT blocked (${res.status})`);
  if (!res.ok) {
    // Could be 404 if table missing, 400 for bad request — treat as non-leak
    return ok(`${table}: anon SELECT non-200 (${res.status})`);
  }
  let body;
  try {
    body = await res.json();
  } catch {
    return ok(`${table}: anon SELECT returned non-JSON (likely empty)`);
  }
  if (Array.isArray(body) && body.length === 0) {
    return ok(`${table}: anon SELECT returned empty []`);
  }
  return bad(`${table}: anon SELECT leaked ${Array.isArray(body) ? body.length : 'non-array'} rows`);
}

async function writeBlocked({ table, payload }) {
  const url = `${BASE}/${table}`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { ...HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return bad(`${table}: INSERT fetch threw ${String(err)}`);
  }
  if (res.status >= 400) return ok(`${table}: anon INSERT blocked (${res.status})`);
  return bad(`${table}: anon INSERT succeeded (${res.status}) — RLS leak`);
}

async function main() {
  console.log(`RLS tests against ${SUPABASE_URL}`);
  console.log('Reads:');
  for (const t of READ_TABLES) await readBlocked(t);
  console.log('Writes:');
  for (const w of WRITE_TABLES) await writeBlocked(w);

  console.log('');
  console.log(`Result: ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log('Failures:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(2);
});

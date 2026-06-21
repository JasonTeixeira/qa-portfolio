import { createClient } from '@supabase/supabase-js';
import { publishApprovedDailySignalDraft } from '../../lib/discord/daily-planner';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const date = new Date('2099-01-03T12:00:00.000Z');
  const dateKey = date.toISOString().slice(0, 10);
  await sb.from('discord_content_drafts').delete().eq('draft_type', 'daily_signal').contains('metadata', { planner_date: dateKey });

  const result = await publishApprovedDailySignalDraft({
    date,
    source: 'smoke-daily-signal-scheduler',
    createIfMissing: false,
  });

  const { data: run } = await sb
    .from('discord_scheduled_runs')
    .select('run_key, kind, status, metadata')
    .eq('run_key', `daily-signal-${dateKey}`)
    .maybeSingle();

  const ok = !result.ok
    && result.skipped
    && result.reason === 'no_approved_daily_signal_draft'
    && run?.status === 'skipped'
    && run?.metadata?.reason === 'no_approved_daily_signal_draft';
  await sb.from('discord_scheduled_runs').delete().eq('run_key', `daily-signal-${dateKey}`);

  console.log(JSON.stringify({ ok, cleanedUp: true, result, run }, null, 2));
  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient<any>>;

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'engineering-loop');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function safeRead<T>(label: string, run: () => PromiseLike<{ data: T | null; error: unknown }>): Promise<{ label: string; data: T | null; error: string | null }> {
  try {
    const { data, error } = await run();
    if (error) return { label, data: null, error: error instanceof Error ? error.message : String(error) };
    return { label, data, error: null };
  } catch (error) {
    return { label, data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

async function safeCount(label: string, run: () => PromiseLike<{ count: number | null; error: unknown }>): Promise<{ label: string; count: number; error: string | null }> {
  try {
    const { count, error } = await run();
    if (error) return { label, count: 0, error: error instanceof Error ? error.message : String(error) };
    return { label, count: count ?? 0, error: null };
  } catch (error) {
    return { label, count: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

function isoAgeMinutes(value: string | null): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return Math.round((Date.now() - time) / 60_000);
}

function messageContentDiagnosis(input: {
  totalMessages: number;
  nonBotMessages: number;
  nonBotNonEmptyMessages: number;
  botMessages: number;
  emptyContentMessages: number;
  latestHeartbeatStatus: string | null;
  latestHeartbeatAgeMinutes: number | null;
  messageContentEnabled: boolean | null;
  messageContentSignalSource: 'heartbeat' | 'identify_event' | 'missing';
  lastCloseCode: number | null;
  recentDeadLetters: number;
}): { status: 'healthy' | 'blocked' | 'warning'; rootCauses: string[]; nextActions: string[] } {
  const rootCauses: string[] = [];
  const nextActions: string[] = [];

  if (input.latestHeartbeatAgeMinutes === null) {
    rootCauses.push('No gateway heartbeat row is visible.');
    nextActions.push('Start or deploy the long-lived Discord gateway worker and verify heartbeat rows update.');
  } else if (input.latestHeartbeatAgeMinutes > 10) {
    rootCauses.push(`Gateway heartbeat is stale (${input.latestHeartbeatAgeMinutes} minutes old).`);
    nextActions.push('Restart or redeploy the gateway worker before expecting live member capture.');
  }

  if (input.lastCloseCode === 4014) {
    rootCauses.push('Discord closed the gateway with 4014 disallowed intents.');
    nextActions.push('Enable the required privileged intent in the Discord Developer Portal and restart the worker.');
  }

  if (input.messageContentEnabled === false) {
    rootCauses.push(`Worker ${input.messageContentSignalSource === 'identify_event' ? 'identify event' : 'metadata'} does not show Message Content Intent enabled.`);
    nextActions.push('Set DISCORD_GATEWAY_MESSAGE_CONTENT=true and confirm the Developer Portal Message Content Intent is enabled.');
  } else if (input.messageContentEnabled === null) {
    rootCauses.push('Neither latest gateway heartbeat nor recent identify events expose Message Content Intent metadata.');
    nextActions.push('Confirm the deployed worker is running the current gateway metadata build and has DISCORD_GATEWAY_MESSAGE_CONTENT=true.');
  } else if (input.messageContentSignalSource === 'identify_event') {
    nextActions.push('Deploy the current heartbeat metadata build so future heartbeat rows preserve Message Content Intent and intents.');
  }

  if (input.totalMessages <= 0) {
    rootCauses.push('No Discord messages have been captured.');
    nextActions.push('Post a real non-admin member message in an approved free channel and rerun the capture diagnosis.');
  } else if (input.nonBotMessages <= 0 && input.botMessages > 0) {
    rootCauses.push('Only bot messages are visible in discord_messages.');
    nextActions.push('Verify the gateway worker is subscribed to guild message events and test with a non-bot member account.');
  } else if (input.nonBotMessages > 0 && input.nonBotNonEmptyMessages <= 0) {
    rootCauses.push('Non-bot messages exist, but message content is empty.');
    nextActions.push('Confirm Message Content Intent is enabled both in Discord Developer Portal and worker env, then capture a fresh message.');
  } else if (input.nonBotNonEmptyMessages > 0) {
    nextActions.push('Run npm run discord:classify-messages, then npm run discord:queue-content to create reviewable candidates.');
  }

  if (input.recentDeadLetters > 0) {
    rootCauses.push(`${input.recentDeadLetters} recent gateway dead letters are visible.`);
    nextActions.push('Review gateway dead letters before trusting capture health.');
  }

  const uniqueNextActions = [...new Set(nextActions)];
  if (!rootCauses.length) {
    return { status: 'healthy', rootCauses: [], nextActions: uniqueNextActions };
  }
  return {
    status: input.nonBotNonEmptyMessages > 0 ? 'warning' : 'blocked',
    rootCauses: [...new Set(rootCauses)],
    nextActions: uniqueNextActions,
  };
}

async function latestHeartbeat(sb: SupabaseClient) {
  return safeRead<any[]>('discord_gateway_heartbeats.latest', () => sb
    .from('discord_gateway_heartbeats')
    .select('worker_id, status, session_id, sequence, last_close_code, last_close_reason, metadata, last_seen_at, updated_at')
    .order('last_seen_at', { ascending: false })
    .limit(3));
}

async function latestMessages(sb: SupabaseClient) {
  return safeRead<any[]>('discord_messages.latest', () => sb
    .from('discord_messages')
    .select('discord_message_id, channel_base_name, author_bot, author_username, content, detected_kind, captured_at, deleted_at')
    .order('captured_at', { ascending: false })
    .limit(12));
}

async function latestGatewayEvents(sb: SupabaseClient) {
  return safeRead<any[]>('discord_gateway_events.latest', () => sb
    .from('discord_gateway_events')
    .select('event_type, discord_message_id, channel_id, author_user_id, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(20));
}

async function countRows(sb: SupabaseClient, label: string, table: string, configure?: (query: any) => any) {
  return safeCount(label, () => {
    const query = sb.from(table).select('*', { count: 'exact', head: true });
    return configure ? configure(query) : query;
  });
}

function latestIdentifyIntentSignal(events: any[]): {
  messageContentEnabled: boolean | null;
  intents: number | null;
  createdAt: string | null;
} {
  const identify = events.find((row) => String(row.event_type) === 'gateway_identify_sent');
  const payload = identify?.payload && typeof identify.payload === 'object' ? identify.payload as Record<string, unknown> : {};
  return {
    messageContentEnabled: typeof payload.message_content_enabled === 'boolean' ? Boolean(payload.message_content_enabled) : null,
    intents: typeof payload.intents === 'number' ? Number(payload.intents) : null,
    createdAt: identify?.created_at ? String(identify.created_at) : null,
  };
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const since30m = new Date(Date.now() - 30 * 60_000).toISOString();
  const [
    heartbeatRead,
    messagesRead,
    eventsRead,
    totalMessages,
    botMessages,
    nonBotMessages,
    nonBotNonEmptyMessages,
    emptyContentMessages,
    recentMessageCreates,
    recentCandidateQueued,
    recentCandidateSkipped,
    recentDeadLetters,
  ] = await Promise.all([
    latestHeartbeat(sb),
    latestMessages(sb),
    latestGatewayEvents(sb),
    countRows(sb, 'discord_messages.total', 'discord_messages'),
    countRows(sb, 'discord_messages.bot', 'discord_messages', (query) => query.eq('author_bot', true)),
    countRows(sb, 'discord_messages.non_bot', 'discord_messages', (query) => query.eq('author_bot', false)),
    countRows(sb, 'discord_messages.non_bot_non_empty', 'discord_messages', (query) => query.eq('author_bot', false).neq('content', '').is('deleted_at', null)),
    countRows(sb, 'discord_messages.empty_content', 'discord_messages', (query) => query.eq('content', '')),
    countRows(sb, 'discord_gateway_events.message_create_30m', 'discord_gateway_events', (query) => query.eq('event_type', 'message_create').gte('created_at', since30m)),
    countRows(sb, 'discord_gateway_events.message_candidate_queued_30m', 'discord_gateway_events', (query) => query.eq('event_type', 'message_candidate_queued').gte('created_at', since30m)),
    countRows(sb, 'discord_gateway_events.message_candidate_skipped_30m', 'discord_gateway_events', (query) => query.eq('event_type', 'message_candidate_skipped').gte('created_at', since30m)),
    countRows(sb, 'discord_gateway_dead_letters.recent', 'discord_gateway_dead_letters', (query) => query.gte('created_at', since30m)),
  ]);

  const latestHeartbeatRows = heartbeatRead.data ?? [];
  const primaryHeartbeat = latestHeartbeatRows[0] ?? null;
  const latestMessagesRows = messagesRead.data ?? [];
  const latestEventsRows = eventsRead.data ?? [];
  const heartbeatMessageContentEnabled = typeof primaryHeartbeat?.metadata?.message_content_enabled === 'boolean'
    ? Boolean(primaryHeartbeat.metadata.message_content_enabled)
    : null;
  const identifyIntent = latestIdentifyIntentSignal(latestEventsRows);
  const messageContentEnabled = heartbeatMessageContentEnabled ?? identifyIntent.messageContentEnabled;
  const messageContentSignalSource = heartbeatMessageContentEnabled != null
    ? 'heartbeat'
    : identifyIntent.messageContentEnabled != null
      ? 'identify_event'
      : 'missing';
  const diagnosis = messageContentDiagnosis({
    totalMessages: totalMessages.count,
    nonBotMessages: nonBotMessages.count,
    nonBotNonEmptyMessages: nonBotNonEmptyMessages.count,
    botMessages: botMessages.count,
    emptyContentMessages: emptyContentMessages.count,
    latestHeartbeatStatus: primaryHeartbeat?.status ? String(primaryHeartbeat.status) : null,
    latestHeartbeatAgeMinutes: isoAgeMinutes(primaryHeartbeat?.last_seen_at ? String(primaryHeartbeat.last_seen_at) : null),
    messageContentEnabled,
    messageContentSignalSource,
    lastCloseCode: primaryHeartbeat?.last_close_code == null ? null : Number(primaryHeartbeat.last_close_code),
    recentDeadLetters: recentDeadLetters.count,
  });

  const evidence = {
    ok: [
      heartbeatRead,
      messagesRead,
      eventsRead,
      totalMessages,
      botMessages,
      nonBotMessages,
      nonBotNonEmptyMessages,
      emptyContentMessages,
      recentMessageCreates,
      recentCandidateQueued,
      recentCandidateSkipped,
      recentDeadLetters,
    ].every((item) => !item.error),
    version: 'discord-gateway-capture-diagnosis-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'read_only_supabase_selects_and_local_file_evidence_only',
    releaseMeaning: 'Gateway capture diagnosis reads live Supabase gateway/message rows and writes local evidence only. It does not post messages, change Discord, mutate Supabase, approve candidates, or satisfy operating proof.',
    diagnosis,
    heartbeat: {
      latest: primaryHeartbeat ? {
        workerId: String(primaryHeartbeat.worker_id),
        status: String(primaryHeartbeat.status),
        lastSeenAt: primaryHeartbeat.last_seen_at ? String(primaryHeartbeat.last_seen_at) : null,
        ageMinutes: isoAgeMinutes(primaryHeartbeat.last_seen_at ? String(primaryHeartbeat.last_seen_at) : null),
        messageContentEnabled: heartbeatMessageContentEnabled,
        guildMembersEnabled: typeof primaryHeartbeat.metadata?.guild_members_enabled === 'boolean'
          ? Boolean(primaryHeartbeat.metadata.guild_members_enabled)
          : null,
        intents: primaryHeartbeat.metadata?.intents ?? null,
        lastCloseCode: primaryHeartbeat.last_close_code == null ? null : Number(primaryHeartbeat.last_close_code),
        lastCloseReason: primaryHeartbeat.last_close_reason ? String(primaryHeartbeat.last_close_reason) : null,
      } : null,
      recent: latestHeartbeatRows.map((row: any) => ({
        workerId: String(row.worker_id),
        status: String(row.status),
        lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : null,
        ageMinutes: isoAgeMinutes(row.last_seen_at ? String(row.last_seen_at) : null),
        lastCloseCode: row.last_close_code == null ? null : Number(row.last_close_code),
      })),
    },
    identify: {
      latest: {
        messageContentEnabled: identifyIntent.messageContentEnabled,
        intents: identifyIntent.intents,
        createdAt: identifyIntent.createdAt,
      },
      messageContentSignalSource,
      effectiveMessageContentEnabled: messageContentEnabled,
    },
    counts: {
      [totalMessages.label]: totalMessages.count,
      [botMessages.label]: botMessages.count,
      [nonBotMessages.label]: nonBotMessages.count,
      [nonBotNonEmptyMessages.label]: nonBotNonEmptyMessages.count,
      [emptyContentMessages.label]: emptyContentMessages.count,
      [recentMessageCreates.label]: recentMessageCreates.count,
      [recentCandidateQueued.label]: recentCandidateQueued.count,
      [recentCandidateSkipped.label]: recentCandidateSkipped.count,
      [recentDeadLetters.label]: recentDeadLetters.count,
    },
    recentMessages: latestMessagesRows.map((row: any) => ({
      id: String(row.discord_message_id),
      channelBaseName: row.channel_base_name ? String(row.channel_base_name) : null,
      authorBot: Boolean(row.author_bot),
      authorPresent: Boolean(row.author_username),
      contentLength: String(row.content ?? '').length,
      detectedKind: row.detected_kind ? String(row.detected_kind) : null,
      capturedAt: row.captured_at ? String(row.captured_at) : null,
      deleted: Boolean(row.deleted_at),
    })),
    recentEvents: latestEventsRows.map((row: any) => ({
      eventType: String(row.event_type),
      hasMessageId: Boolean(row.discord_message_id),
      channelId: row.channel_id ? String(row.channel_id) : null,
      createdAt: row.created_at ? String(row.created_at) : null,
    })),
    errors: [
      heartbeatRead,
      messagesRead,
      eventsRead,
      totalMessages,
      botMessages,
      nonBotMessages,
      nonBotNonEmptyMessages,
      emptyContentMessages,
      recentMessageCreates,
      recentCandidateQueued,
      recentCandidateSkipped,
      recentDeadLetters,
    ].filter((item) => item.error).map((item) => ({ label: item.label, error: item.error })),
  };

  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'discord-gateway-capture-diagnosis-latest.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import {
  getLatestDiscordGatewaySession,
  recordDiscordGatewayDeadLetter,
  recordDiscordGatewayEvent,
  recordDiscordGatewayHeartbeat,
  recordDiscordGatewaySession,
  recordDiscordGuildMemberUpdate,
  recordDiscordMessageCreate,
  recordDiscordMessageDelete,
  recordDiscordMessageUpdate,
  recordDiscordReaction,
  recordDiscordThread,
  type DiscordGatewayGuildMemberPayload,
  type DiscordGatewayMessagePayload,
  type DiscordGatewayReactionPayload,
  type DiscordGatewayThreadPayload,
} from '../../lib/discord/gateway-ingestion';
import { getGuildChannels } from '../../lib/discord/sage-rest';

const DEFAULT_GATEWAY = 'wss://gateway.discord.gg/?v=10&encoding=json';
const OPCODE_DISPATCH = 0;
const OPCODE_HEARTBEAT = 1;
const OPCODE_IDENTIFY = 2;
const OPCODE_RESUME = 6;
const OPCODE_RECONNECT = 7;
const OPCODE_INVALID_SESSION = 9;
const OPCODE_HELLO = 10;
const OPCODE_HEARTBEAT_ACK = 11;
const BASE_INTENTS =
  (1 << 0) | // guilds
  (1 << 9) | // guild messages
  (1 << 10); // guild message reactions
const GUILD_MEMBERS_INTENT = 1 << 1;
const MESSAGE_CONTENT_INTENT = 1 << 15;

type GatewayPacket = {
  op: number;
  t?: string;
  s?: number;
  d?: Record<string, unknown> | boolean;
};

type ResumeState = {
  sessionId: string | null;
  sequence: number | null;
  resumeGatewayUrl: string | null;
};

type ConnectionResult = {
  code: number;
  reason: string;
  shouldReconnect: boolean;
  canResume: boolean;
};

function cleanEnv(value: string | undefined): string {
  return value?.replace(/\\n/g, '').trim() ?? '';
}

function requireEnv(name: string): string {
  const value = cleanEnv(process.env[name]);
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function enabled(value: string | undefined): boolean {
  return ['1', 'true', 'yes', 'on'].includes(cleanEnv(value).toLowerCase());
}

function workerId(): string {
  return cleanEnv(process.env.DISCORD_GATEWAY_WORKER_ID) || cleanEnv(process.env.RAILWAY_SERVICE_NAME) || `sagebot-${process.env.HOSTNAME ?? 'local'}`;
}

function discordDeveloperBotUrl(): string | null {
  const applicationId = cleanEnv(process.env.DISCORD_APPLICATION_ID) || cleanEnv(process.env.DISCORD_CLIENT_ID);
  return applicationId ? `https://discord.com/developers/applications/${applicationId}/bot` : null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  const base = Math.min(30_000, 1_000 * 2 ** Math.min(attempt, 5));
  return base + Math.floor(Math.random() * 750);
}

async function buildChannelNameCache(): Promise<Map<string, string>> {
  const channels = await getGuildChannels();
  return new Map(channels.map((channel) => [channel.id, channel.name]));
}

function send(socket: WebSocket, packet: Record<string, unknown>) {
  socket.send(JSON.stringify(packet));
}

function gatewayUrl(resumeGatewayUrl: string | null): string {
  if (!resumeGatewayUrl) return DEFAULT_GATEWAY;
  const separator = resumeGatewayUrl.includes('?') ? '&' : '?';
  return `${resumeGatewayUrl}${separator}v=10&encoding=json`;
}

function closeIsFatal(code: number): boolean {
  // 4014 is disallowed intents. Reconnecting will not fix it without Developer Portal changes.
  return [4004, 4010, 4011, 4013, 4014].includes(code);
}

async function connectOnce(input: {
  token: string;
  workerId: string;
  once: boolean;
  intents: number;
  messageContentEnabled: boolean;
  guildMembersEnabled: boolean;
  resume: ResumeState;
}): Promise<{ result: ConnectionResult; resume: ResumeState }> {
  let sequence = input.resume.sequence;
  let sessionId = input.resume.sessionId;
  let resumeGatewayUrl = input.resume.resumeGatewayUrl;
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let channelNames = await buildChannelNameCache();
  let closeResolved = false;

  await recordDiscordGatewayHeartbeat({
    workerId: input.workerId,
    status: 'starting',
    sessionId,
    sequence,
    resumeGatewayUrl,
    metadata: { message_content_enabled: input.messageContentEnabled, guild_members_enabled: input.guildMembersEnabled, intents: input.intents },
  });

  return new Promise((resolve) => {
    const socket = new WebSocket(gatewayUrl(resumeGatewayUrl));
    const closeForSigint = () => socket.close(1000, 'SIGINT');
    const closeForSigterm = () => socket.close(1000, 'SIGTERM');

    function finish(result: ConnectionResult) {
      if (closeResolved) return;
      closeResolved = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      process.off('SIGINT', closeForSigint);
      process.off('SIGTERM', closeForSigterm);
      resolve({ result, resume: { sessionId, sequence, resumeGatewayUrl } });
    }

    socket.addEventListener('open', async () => {
      await recordDiscordGatewayEvent({ eventType: 'gateway_socket_open', payload: { worker_id: input.workerId } });
      await recordDiscordGatewayHeartbeat({ workerId: input.workerId, status: 'connected', sessionId, sequence, resumeGatewayUrl });
      console.log('[discord/gateway] socket open');
    });

    socket.addEventListener('message', async (event) => {
      let packet: GatewayPacket;
      try {
        packet = JSON.parse(String(event.data)) as GatewayPacket;
      } catch (err) {
        await recordDiscordGatewayDeadLetter({
          workerId: input.workerId,
          eventType: 'gateway_packet_parse',
          error: err instanceof Error ? err.message : String(err),
          payload: { raw: String(event.data).slice(0, 2000) },
          retryable: false,
          sequence,
        });
        return;
      }

      if (typeof packet.s === 'number') sequence = packet.s;

      if (packet.op === OPCODE_HELLO) {
        const hello = typeof packet.d === 'object' && packet.d ? packet.d : {};
        const interval = Number(hello.heartbeat_interval ?? 45_000);
        heartbeatTimer = setInterval(() => {
          send(socket, { op: OPCODE_HEARTBEAT, d: sequence });
        }, interval);

        if (sessionId && sequence != null && resumeGatewayUrl) {
          send(socket, {
            op: OPCODE_RESUME,
            d: {
              token: input.token,
              session_id: sessionId,
              seq: sequence,
            },
          });
          await recordDiscordGatewayEvent({ eventType: 'gateway_resume_sent', payload: { worker_id: input.workerId, sequence } });
        } else {
          send(socket, {
            op: OPCODE_IDENTIFY,
            d: {
              token: input.token,
              intents: input.intents,
              properties: {
                os: process.platform,
                browser: 'sagebot-gateway-worker',
                device: 'sagebot-gateway-worker',
              },
            },
          });
          await recordDiscordGatewayEvent({
            eventType: 'gateway_identify_sent',
            payload: { worker_id: input.workerId, intents: input.intents, message_content_enabled: input.messageContentEnabled },
          });
        }
        return;
      }

      if (packet.op === OPCODE_HEARTBEAT_ACK) {
        await recordDiscordGatewayHeartbeat({
          workerId: input.workerId,
          status: 'heartbeat_ack',
          sessionId,
          sequence,
          resumeGatewayUrl,
        });
        return;
      }

      if (packet.op === OPCODE_RECONNECT) {
        await recordDiscordGatewayEvent({ eventType: 'gateway_reconnect_requested', payload: { worker_id: input.workerId, sequence } });
        socket.close(4000, 'discord-reconnect-requested');
        return;
      }

      if (packet.op === OPCODE_INVALID_SESSION) {
        const resumable = packet.d === true;
        await recordDiscordGatewayEvent({ eventType: 'gateway_invalid_session', payload: { worker_id: input.workerId, resumable } });
        if (!resumable) {
          sessionId = null;
          sequence = null;
          resumeGatewayUrl = null;
          await recordDiscordGatewaySession({
            workerId: input.workerId,
            sessionId: 'invalidated',
            sequence: null,
            resumeGatewayUrl: null,
            status: 'invalidated',
          });
        }
        socket.close(4000, 'invalid-session');
        return;
      }

      if (packet.op !== OPCODE_DISPATCH || !packet.t || !packet.d || typeof packet.d !== 'object') return;

      try {
        switch (packet.t) {
          case 'READY':
            sessionId = String(packet.d.session_id ?? '');
            resumeGatewayUrl = packet.d.resume_gateway_url ? String(packet.d.resume_gateway_url) : resumeGatewayUrl;
            await recordDiscordGatewaySession({
              workerId: input.workerId,
              sessionId,
              sequence,
              resumeGatewayUrl,
              status: 'ready',
              metadata: { message_content_enabled: input.messageContentEnabled, guild_members_enabled: input.guildMembersEnabled },
            });
            await recordDiscordGatewayHeartbeat({
              workerId: input.workerId,
              status: 'ready',
              sessionId,
              sequence,
              resumeGatewayUrl,
            });
            await recordDiscordGatewayEvent({ eventType: 'gateway_ready', payload: { worker_id: input.workerId, session_id: sessionId } });
            if (input.once) {
              finish({
                code: 1000,
                reason: 'one-shot-ready',
                shouldReconnect: false,
                canResume: Boolean(sessionId && sequence != null && resumeGatewayUrl),
              });
              socket.close(1000, 'one-shot-ready');
            }
            break;
          case 'RESUMED':
            await recordDiscordGatewaySession({
              workerId: input.workerId,
              sessionId: sessionId ?? 'resumed',
              sequence,
              resumeGatewayUrl,
              status: 'resumed',
            });
            await recordDiscordGatewayHeartbeat({ workerId: input.workerId, status: 'resumed', sessionId, sequence, resumeGatewayUrl });
            await recordDiscordGatewayEvent({ eventType: 'gateway_resumed', payload: { worker_id: input.workerId, sequence } });
            if (input.once) {
              finish({
                code: 1000,
                reason: 'one-shot-resumed',
                shouldReconnect: false,
                canResume: Boolean(sessionId && sequence != null && resumeGatewayUrl),
              });
              socket.close(1000, 'one-shot-resumed');
            }
            break;
          case 'CHANNEL_CREATE':
          case 'CHANNEL_UPDATE':
          case 'THREAD_CREATE':
          case 'THREAD_UPDATE':
            if (packet.d.id && packet.d.name) channelNames.set(String(packet.d.id), String(packet.d.name));
            if (packet.t.startsWith('THREAD')) await recordDiscordThread(packet.d as DiscordGatewayThreadPayload);
            break;
          case 'MESSAGE_CREATE':
            await recordDiscordMessageCreate(packet.d as DiscordGatewayMessagePayload, channelNames.get(String(packet.d.channel_id)));
            break;
          case 'MESSAGE_UPDATE':
            await recordDiscordMessageUpdate(packet.d as Partial<DiscordGatewayMessagePayload> & { id: string; channel_id?: string }, channelNames.get(String(packet.d.channel_id)));
            break;
          case 'MESSAGE_DELETE':
            await recordDiscordMessageDelete({ id: String(packet.d.id), channel_id: packet.d.channel_id ? String(packet.d.channel_id) : undefined });
            break;
          case 'MESSAGE_REACTION_ADD':
            await recordDiscordReaction('add', packet.d as DiscordGatewayReactionPayload);
            break;
          case 'MESSAGE_REACTION_REMOVE':
            await recordDiscordReaction('remove', packet.d as DiscordGatewayReactionPayload);
            break;
          case 'GUILD_MEMBER_UPDATE':
            await recordDiscordGuildMemberUpdate(packet.d as DiscordGatewayGuildMemberPayload);
            break;
          case 'GUILD_CREATE':
            channelNames = await buildChannelNameCache();
            await recordDiscordGatewayEvent({ eventType: 'gateway_guild_create', payload: { worker_id: input.workerId, guild_id: packet.d.id ?? null } });
            break;
          default:
            break;
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        await recordDiscordGatewayDeadLetter({
          workerId: input.workerId,
          eventType: packet.t,
          error,
          payload: packet.d as Record<string, unknown>,
          retryable: true,
          sequence,
        });
        await recordDiscordGatewayEvent({
          eventType: 'gateway_dispatch_failed',
          payload: { worker_id: input.workerId, dispatch_type: packet.t, error },
        });
        console.error('[discord/gateway] dispatch failed', packet.t, err);
      }
    });

    socket.addEventListener('close', async (event) => {
      await recordDiscordGatewayHeartbeat({
        workerId: input.workerId,
        status: event.code === 1000 ? 'closed' : closeIsFatal(event.code) ? 'failed' : 'reconnecting',
        sessionId,
        sequence,
        resumeGatewayUrl,
        lastCloseCode: event.code,
        lastCloseReason: event.reason,
      });
      await recordDiscordGatewayEvent({ eventType: 'gateway_socket_closed', payload: { worker_id: input.workerId, code: event.code, reason: event.reason } });
      if (sessionId) {
        await recordDiscordGatewaySession({
          workerId: input.workerId,
          sessionId,
          sequence,
          resumeGatewayUrl,
          status: closeIsFatal(event.code) ? 'invalidated' : 'closed',
        });
      }
      console.log('[discord/gateway] socket closed', event.code, event.reason);
      if (event.code === 4014 && input.messageContentEnabled) {
        const portalUrl = discordDeveloperBotUrl();
        console.error('[discord/gateway] Message Content Intent is still disabled for this application.');
        if (portalUrl) console.error(`[discord/gateway] Enable it here: ${portalUrl}`);
      }
      finish({
        code: event.code,
        reason: event.reason,
        shouldReconnect: event.code !== 1000 && !input.once && !closeIsFatal(event.code),
        canResume: Boolean(sessionId && sequence != null && resumeGatewayUrl && !closeIsFatal(event.code)),
      });
    });

    socket.addEventListener('error', async () => {
      await recordDiscordGatewayEvent({ eventType: 'gateway_socket_error', payload: { worker_id: input.workerId } });
      console.error('[discord/gateway] socket error');
    });

    process.once('SIGINT', closeForSigint);
    process.once('SIGTERM', closeForSigterm);
  });
}

async function main() {
  const token = requireEnv('DISCORD_BOT_TOKEN');
  const id = workerId();
  const once = process.argv.includes('--once');
  const messageContentEnabled = process.argv.includes('--message-content') || enabled(process.env.DISCORD_GATEWAY_MESSAGE_CONTENT);
  const guildMembersEnabled = process.argv.includes('--guild-members') || enabled(process.env.DISCORD_GATEWAY_GUILD_MEMBERS);
  const intents = BASE_INTENTS
    | (messageContentEnabled ? MESSAGE_CONTENT_INTENT : 0)
    | (guildMembersEnabled ? GUILD_MEMBERS_INTENT : 0);
  const stored = await getLatestDiscordGatewaySession(id);
  const storedMessageContentEnabled = stored?.metadata?.message_content_enabled === true;
  const storedGuildMembersEnabled = stored?.metadata?.guild_members_enabled === true;
  const canResumeStoredSession = Boolean(stored)
    && (!messageContentEnabled || storedMessageContentEnabled)
    && (!guildMembersEnabled || storedGuildMembersEnabled);
  let resume: ResumeState = {
    sessionId: canResumeStoredSession ? stored?.sessionId ?? null : null,
    sequence: canResumeStoredSession ? stored?.sequence ?? null : null,
    resumeGatewayUrl: canResumeStoredSession ? stored?.resumeGatewayUrl ?? null : null,
  };
  let attempt = 0;

  while (true) {
    const { result, resume: nextResume } = await connectOnce({
      token,
      workerId: id,
      once,
      intents,
      messageContentEnabled,
      guildMembersEnabled,
      resume,
    });
    resume = result.canResume ? nextResume : { sessionId: null, sequence: null, resumeGatewayUrl: null };

    if (once || !result.shouldReconnect) {
      process.exit(result.code === 1000 ? 0 : 1);
    }

    const delay = backoffMs(attempt++);
    await recordDiscordGatewayEvent({
      eventType: 'gateway_reconnect_scheduled',
      payload: { worker_id: id, delay_ms: delay, close_code: result.code, reason: result.reason, can_resume: result.canResume },
    });
    await wait(delay);
  }
}

main().catch(async (err) => {
  const id = workerId();
  const error = err instanceof Error ? err.message : String(err);
  await recordDiscordGatewayDeadLetter({ workerId: id, eventType: 'gateway_fatal', error, retryable: false });
  await recordDiscordGatewayHeartbeat({ workerId: id, status: 'failed', metadata: { error } });
  console.error('[discord/gateway] fatal', err);
  process.exit(1);
});

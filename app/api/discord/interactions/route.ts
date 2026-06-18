import { NextResponse } from 'next/server';
import { handleSageCommand, handleSageComponent } from '@/lib/discord/sage-commands';
import { verifyDiscordRequestSignature } from '@/lib/discord/signature';

export const runtime = 'nodejs';

const INTERACTION_TYPE_PING = 1;
const INTERACTION_TYPE_APPLICATION_COMMAND = 2;
const INTERACTION_TYPE_COMPONENT = 3;
const RESPONSE_TYPE_PONG = 1;
const RESPONSE_TYPE_CHANNEL_MESSAGE = 4;
const EPHEMERAL_FLAG = 64;

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: !!process.env.DISCORD_PUBLIC_KEY,
    endpoint: '/api/discord/interactions',
  });
}

export async function POST(request: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: 'discord_not_configured' }, { status: 503 });
  }

  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();

  const verified = verifyDiscordRequestSignature({
    publicKey,
    signature,
    timestamp,
    body,
  });
  if (!verified) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let payload: { type?: number };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (payload.type === INTERACTION_TYPE_PING) {
    return NextResponse.json({ type: RESPONSE_TYPE_PONG });
  }

  if (payload.type === INTERACTION_TYPE_APPLICATION_COMMAND) {
    return NextResponse.json(await handleSageCommand(payload));
  }

  if (payload.type === INTERACTION_TYPE_COMPONENT) {
    return NextResponse.json(await handleSageComponent(payload));
  }

  return NextResponse.json({
    type: RESPONSE_TYPE_CHANNEL_MESSAGE,
    data: {
      content: 'Sage Ideas Discord endpoint is online. Commands are being configured.',
      flags: EPHEMERAL_FLAG,
    },
  });
}

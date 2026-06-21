const DISCORD_API = 'https://discord.com/api/v10';
const EPHEMERAL_FLAG = 64;

export type DiscordFollowupInput = {
  applicationId: string;
  token: string;
  content: string;
  ephemeral?: boolean;
};

export function buildDiscordFollowupRequest(input: DiscordFollowupInput): { url: string; init: RequestInit } {
  const applicationId = input.applicationId.trim();
  const token = input.token.trim();
  if (!applicationId || !token) throw new Error('Discord interaction application id and token are required.');
  return {
    url: `${DISCORD_API}/webhooks/${applicationId}/${token}`,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: input.content,
        flags: input.ephemeral === false ? undefined : EPHEMERAL_FLAG,
      }),
    },
  };
}

export async function postDiscordInteractionFollowup(input: DiscordFollowupInput): Promise<void> {
  const request = buildDiscordFollowupRequest(input);
  const response = await fetch(request.url, request.init);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Discord followup failed: ${response.status}${body ? ` ${body.slice(0, 200)}` : ''}`);
  }
}

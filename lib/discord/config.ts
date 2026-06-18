const DISCORD_API_BASE = 'https://discord.com/api/v10';
const SITE_FALLBACK = 'https://www.sageideas.dev';

export type DiscordConfigStatus = {
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  botTokenConfigured: boolean;
  publicKeyConfigured: boolean;
  guildIdConfigured: boolean;
  interactionEndpointUrl: string;
  inviteUrl: string | null;
  developerPortalUrl: string;
};

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_FALLBACK).replace(/\/$/, '');
}

export function discordInteractionEndpointUrl(): string {
  return `${siteOrigin()}/api/discord/interactions`;
}

export function discordDeveloperPortalUrl(): string {
  const clientId = process.env.DISCORD_CLIENT_ID;
  return clientId
    ? `https://discord.com/developers/applications/${clientId}/information`
    : 'https://discord.com/developers/applications';
}

export function discordInviteUrl(): string | null {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) return null;

  const url = new URL(`${DISCORD_API_BASE}/oauth2/authorize`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', 'bot applications.commands');
  url.searchParams.set('permissions', process.env.DISCORD_BOT_PERMISSIONS ?? '0');

  const guildId = process.env.DISCORD_GUILD_ID;
  if (guildId) url.searchParams.set('guild_id', guildId);

  return url.toString();
}

export function discordConfigStatus(): DiscordConfigStatus {
  return {
    clientIdConfigured: !!process.env.DISCORD_CLIENT_ID,
    clientSecretConfigured: !!process.env.DISCORD_CLIENT_SECRET,
    botTokenConfigured: !!process.env.DISCORD_BOT_TOKEN,
    publicKeyConfigured: !!process.env.DISCORD_PUBLIC_KEY,
    guildIdConfigured: !!process.env.DISCORD_GUILD_ID,
    interactionEndpointUrl: discordInteractionEndpointUrl(),
    inviteUrl: discordInviteUrl(),
    developerPortalUrl: discordDeveloperPortalUrl(),
  };
}

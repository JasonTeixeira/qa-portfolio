export const DISCORD_SECURITY_PRIVACY_VERSION = 'discord-security-privacy-v1';

export type DiscordSecurityAssessment = {
  passed: boolean;
  score: number;
  reasons: string[];
};

export type DiscordAbuseClassification = {
  abuseScore: number;
  category: 'clean' | 'spam' | 'harassment' | 'credential_leak' | 'prompt_injection' | 'needs_review';
  reasons: string[];
};

const PROMPT_INJECTION_PATTERNS = [
  /\bignore (all )?(previous|prior|above) (instructions|rules|context)\b/i,
  /\b(system|developer) prompt\b/i,
  /\breveal (your )?(hidden|system|developer) (prompt|instructions)\b/i,
  /\bexfiltrate\b|\bprint secrets\b|\bshow secrets\b/i,
  /\bdisregard (the )?(policy|rules|instructions)\b/i,
  /\byou are now\b.*\b(admin|developer|system)\b/i,
  /\bcall (the )?tool\b|\bexecute (this|the) command\b/i,
];

const PRIVATE_DATA_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b(?:api[_-]?key|secret|token|password|authorization|cookie)\s*[:=]\s*['"]?[A-Za-z0-9_\-.]{8,}/i,
  /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{12,}\b/i,
  /\bdiscord_user_id\b/i,
];

const SPAM_PATTERNS = [
  /\bfree money\b|\bairdrop\b|\bcrypto pump\b|\bguaranteed profit\b/i,
  /\bdm me\b.*\bprofit\b|\bclick here\b.*\bnow\b/i,
  /\bnitro giveaway\b|\bforex signals\b/i,
];

const HARASSMENT_PATTERNS = [
  /\b(kill yourself|kys)\b/i,
  /\b(?:idiot|moron|stupid)\b.*\b(?:you|u)\b/i,
  /\b(?:hate|attack|harass)\b.*\b(?:member|user|them)\b/i,
];

export function sanitizeDiscordOutboundText(value: string, maxLength = 1800): string {
  return value
    .replace(/@everyone/gi, '@\u200beveryone')
    .replace(/@here/gi, '@\u200bhere')
    .replace(/<@!?(\d+)>/g, '<@\u200b$1>')
    .replace(/<@&(\d+)>/g, '<@&\u200b$1>')
    .replace(/<#(\d+)>/g, '<#\u200b$1>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function detectPromptInjection(input: string): DiscordSecurityAssessment {
  const reasons = unique(PROMPT_INJECTION_PATTERNS.filter((pattern) => pattern.test(input)).map(() => 'prompt_injection_instruction'));
  const score = Math.max(0, 100 - reasons.length * 60);
  return {
    passed: reasons.length === 0,
    score,
    reasons,
  };
}

export function scoreDiscordPrivacyRisk(input: string): DiscordSecurityAssessment {
  const reasons = [
    ...PRIVATE_DATA_PATTERNS.filter((pattern) => pattern.test(input)).map(() => 'private_identifier_or_secret'),
    /\bmy client\b|\bprivate repo\b|\btheir revenue\b/i.test(input) ? 'member_specific_private_context' : null,
  ].filter(Boolean) as string[];
  const uniqueReasons = unique(reasons);
  const score = Math.max(0, 100 - uniqueReasons.length * 45);
  return {
    passed: uniqueReasons.length === 0,
    score,
    reasons: uniqueReasons,
  };
}

export function classifyDiscordAbuse(input: string): DiscordAbuseClassification {
  const prompt = detectPromptInjection(input);
  const privacy = scoreDiscordPrivacyRisk(input);
  const reasons = [
    ...SPAM_PATTERNS.filter((pattern) => pattern.test(input)).map(() => 'spam_pattern'),
    ...HARASSMENT_PATTERNS.filter((pattern) => pattern.test(input)).map(() => 'harassment_pattern'),
    ...prompt.reasons,
    ...privacy.reasons,
  ];
  const uniqueReasons = unique(reasons);
  const abuseScore = Math.min(100, uniqueReasons.length * 35);
  let category: DiscordAbuseClassification['category'] = 'clean';
  if (prompt.reasons.length) category = 'prompt_injection';
  else if (privacy.reasons.length) category = 'credential_leak';
  else if (uniqueReasons.includes('harassment_pattern')) category = 'harassment';
  else if (uniqueReasons.includes('spam_pattern')) category = 'spam';
  else if (abuseScore > 0) category = 'needs_review';
  return { abuseScore, category, reasons: uniqueReasons };
}

export function validateRagUserInputSecurity(input: { question: string; context?: string | null }): void {
  const combined = [input.question, input.context].filter(Boolean).join('\n');
  const prompt = detectPromptInjection(combined);
  if (!prompt.passed) {
    throw new Error('SageBot cannot process prompt-injection style instructions. Ask the actual product, build, or Discord operating question instead.');
  }
  const privacy = scoreDiscordPrivacyRisk(combined);
  if (!privacy.passed) {
    throw new Error('SageBot cannot process secrets, credentials, emails, phone numbers, or private member/client data. Remove private data and ask again.');
  }
}

export type PermissionMatrixRow = {
  channelBaseName: string;
  visibleTo: Array<'unapproved' | 'approved' | 'premium' | 'moderator' | 'admin' | 'bot'>;
};

export function auditDiscordPermissionMatrix(rows: PermissionMatrixRow[]): {
  ok: boolean;
  failures: string[];
  checks: Record<string, boolean>;
} {
  const byChannel = new Map(rows.map((row) => [row.channelBaseName, row.visibleTo]));
  const startHere = byChannel.get('start-here') ?? [];
  const premium = byChannel.get('premium') ?? [];
  const teamOps = byChannel.get('team-ops') ?? [];
  const memberChannels = rows.filter((row) => !['start-here', 'team-ops'].includes(row.channelBaseName));
  const checks = {
    unapproved_only_start_here: startHere.includes('unapproved') && memberChannels.every((row) => !row.visibleTo.includes('unapproved')),
    approved_cannot_see_team_ops: !teamOps.includes('approved') && !teamOps.includes('unapproved'),
    premium_channel_gated: premium.includes('premium') && !premium.includes('approved') && !premium.includes('unapproved'),
    moderators_can_see_team_ops: teamOps.includes('moderator') || teamOps.includes('admin'),
    bot_has_ops_visibility: teamOps.includes('bot'),
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([key]) => key);
  return { ok: failures.length === 0, failures, checks };
}

export function auditAdminActionSource(source: string): { ok: boolean; exportedActions: number; requireAdminCalls: number; failures: string[] } {
  const exportedActions = source.match(/^export async function \w+/gm)?.length ?? 0;
  const requireAdminCalls = source.match(/requireAdmin\(/g)?.length ?? 0;
  const failures = [
    exportedActions === 0 ? 'no_admin_actions_found' : null,
    requireAdminCalls < exportedActions ? 'not_every_admin_action_calls_require_admin' : null,
  ].filter(Boolean) as string[];
  return { ok: failures.length === 0, exportedActions, requireAdminCalls, failures };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

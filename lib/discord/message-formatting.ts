export type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type DiscordEmbedPayload = {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: { text: string };
};

export type DiscordMessagePayload = {
  content?: string;
  embeds?: DiscordEmbedPayload[];
  allowed_mentions?: Record<string, unknown>;
  message_reference?: Record<string, unknown>;
};

export const SAGE_DISCORD_COLORS = {
  sage: 0x35d07f,
  signal: 0xf2c94c,
  answer: 0x50a7ff,
  win: 0xb36bff,
  warning: 0xff6b6b,
} as const;

const FIELD_LIMIT = 1024;
const DESCRIPTION_LIMIT = 3800;

function cleanMarkdownTitle(value: string): string {
  return value
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function clamp(value: string, limit: number): string {
  const clean = value.trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(0, limit - 18)).trim()}...`;
}

function stripTopHeading(body: string): { title: string | null; rest: string } {
  const lines = body.trim().split('\n');
  const first = lines[0]?.trim() ?? '';
  if (/^#\s+/.test(first)) {
    return { title: cleanMarkdownTitle(first), rest: lines.slice(1).join('\n').trim() };
  }
  return { title: null, rest: body.trim() };
}

function splitMarkdownSections(body: string): { intro: string; fields: DiscordEmbedField[] } {
  const lines = body.split('\n');
  const introLines: string[] = [];
  const fields: DiscordEmbedField[] = [];
  let current: { name: string; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const value = current.lines.join('\n').trim();
    if (value) fields.push({ name: current.name, value: clamp(value, FIELD_LIMIT), inline: false });
    current = null;
  };

  for (const line of lines) {
	  const section = line.match(/^\*\*([^:*]{2,48}):\*\*\s*(.*)$/);
    if (section) {
      flush();
      current = { name: cleanMarkdownTitle(section[1]), lines: [section[2] ?? ''].filter(Boolean) };
      continue;
    }
    if (current) {
      current.lines.push(line);
    } else {
      introLines.push(line);
    }
  }
  flush();

  return {
    intro: introLines.join('\n').trim(),
    fields: fields.slice(0, 8),
  };
}

function formatSourceList(sources: string[]): string {
  return sources
    .slice(0, 5)
    .map((source, index) => `${index + 1}. ${source}`)
    .join('\n');
}

export function buildSageContentEmbed(input: {
  title?: string | null;
  body: string;
  variant?: keyof typeof SAGE_DISCORD_COLORS;
  footer?: string | null;
  fallbackIntro?: string;
}): DiscordMessagePayload {
  const { title, rest } = stripTopHeading(input.body);
  const sections = splitMarkdownSections(rest);
  const embedTitle = cleanMarkdownTitle(input.title || title || 'Sage Ideas');
  const description = sections.intro
    ? clamp(sections.intro, DESCRIPTION_LIMIT)
    : clamp(input.fallbackIntro || 'A useful build note from Sage Ideas. Pick one concrete next move and ship it.', DESCRIPTION_LIMIT);

  return {
    embeds: [{
      title: embedTitle,
      description,
      color: SAGE_DISCORD_COLORS[input.variant ?? 'sage'],
      fields: sections.fields.length ? sections.fields : undefined,
      footer: input.footer ? { text: input.footer } : { text: 'Sage Ideas Academy' },
    }],
    allowed_mentions: { parse: [] },
  };
}

export function buildSageAnswerEmbed(input: {
  question: string;
  answer: string;
  sources: string[];
  answerId?: string | null;
}): DiscordMessagePayload {
  const answer = input.answer
    .replace(/^#\s*SageBot answer\s*/i, '')
    .replace(/^\*\*Question:\*\*.*$/im, '')
    .trim();
	  const sourceText = input.sources.length
	    ? formatSourceList(input.sources)
	    : 'I did not find a strong source match, so treat this as a starting point and ask me for a narrower follow-up.';

	  return {
	    embeds: [{
	      title: 'Sage Ideas Answer',
	      description: 'Good question. Here is the clean path I would take.',
      color: SAGE_DISCORD_COLORS.answer,
      fields: [
        { name: 'Your question', value: clamp(input.question.trim(), 500), inline: false },
        { name: 'Sage take', value: clamp(answer, FIELD_LIMIT), inline: false },
        { name: 'Sources', value: clamp(sourceText, FIELD_LIMIT), inline: false },
      ],
      footer: { text: input.answerId ? `SageBot answer ${input.answerId}` : 'SageBot answer' },
    }],
    allowed_mentions: { parse: [] },
  };
}

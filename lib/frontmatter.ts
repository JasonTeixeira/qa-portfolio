import { load } from 'js-yaml';

export type FrontmatterParseResult = {
  data: Record<string, any>;
  content: string;
};

export function parseFrontmatter(raw: string): FrontmatterParseResult {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, content: raw };
  const parsed = load(match[1]) ?? {};
  return {
    data: typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, any> : {},
    content: raw.slice(match[0].length),
  };
}

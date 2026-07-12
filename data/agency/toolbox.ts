/**
 * THE TOOLBOX — every tool here is in active use across the linked repos.
 * No résumé padding. Rendered on /services (compact block) and mirrored on
 * /capabilities. Moved off the homepage when the scan section became the
 * capability tile wall.
 */

export interface ToolGroup {
  label: string
  tools: readonly string[]
}

export const TOOL_GROUPS: readonly ToolGroup[] = [
  {
    label: 'TESTING & QA',
    tools: ['Playwright', 'Maestro (mobile E2E)', 'Vitest / Jest', 'axe-core', 'Lighthouse CI', 'visual regression'],
  },
  {
    label: 'AI SYSTEMS',
    tools: ['Claude / OpenAI / DeepSeek APIs', 'RAG + embeddings', 'eval harnesses', 'LLM-as-judge', 'MCP servers'],
  },
  {
    label: 'LANGUAGES',
    tools: ['TypeScript', 'Node.js', 'Python', 'SQL', 'Bash'],
  },
  {
    label: 'PIPELINES & DELIVERY',
    tools: ['GitHub Actions', 'CI release gates', 'Docker', 'Vercel', 'EAS / TestFlight', 'webhooks · queues · cron'],
  },
  {
    label: 'DATA & OBSERVABILITY',
    tools: ['Postgres / Supabase', 'DuckDB', 'Redis', 'Stripe API', 'Sentry', 'PostHog'],
  },
] as const

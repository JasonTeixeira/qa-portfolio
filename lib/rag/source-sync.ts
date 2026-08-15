import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseFrontmatter } from '@/lib/frontmatter';
import type { RagSourceInput } from '@/lib/rag/source-normalizer';
import { collectApprovedDiscordRagInputs } from '@/lib/rag/discord-authoritative-sources';
import { runRagSourceSyncFromInputs, type RagSourceSyncResult } from '@/lib/rag/discord-source-sync';

const evidenceDir = rootPath('docs', 'evidence', 'rag');

export async function runAuthoritativeRagSourceSync(
  sb: SupabaseClient<any>,
  options: { writeEvidence?: boolean; trigger?: string } = {},
): Promise<RagSourceSyncResult> {
  const writeEvidence = options.writeEvidence ?? true;
  const approvedDiscord = await collectApprovedDiscordRagInputs(sb);
  const inputs = [
    ...approvedDiscord.inputs,
    ...(await blogPostInputs()),
    ...(await resourceInputs()),
  ];
  const result = await runRagSourceSyncFromInputs(sb, inputs, {
    trigger: options.trigger ?? 'script',
    sourceTypes: ['discord_question', 'discord_answer', 'discord_content_queue', 'blog_post', 'resource', 'lesson', 'admin_note'],
    approvedDiscordStats: approvedDiscord.stats,
  });

  if (writeEvidence) {
    await mkdir(evidenceDir, { recursive: true });
    const evidencePath = path.join(evidenceDir, 'source-sync-sample.json');
    result.evidencePath = evidencePath;
    await writeFile(evidencePath, `${JSON.stringify(result, null, 2)}\n`);
  }

  return result;
}

async function blogPostInputs(): Promise<RagSourceInput[]> {
  const dir = rootPath('content', 'blog');
  const files = (await readdir(dir)).filter((file) => file.endsWith('.mdx'));
  const inputs: RagSourceInput[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), 'utf8');
    const { data, content } = parseFrontmatter(raw);
    const slug = String(data.slug ?? file.replace(/\.mdx$/, ''));
    const title = String(data.title ?? slug);
    inputs.push({
      sourceType: 'blog_post',
      externalId: slug,
      title,
      body: `# ${title}\n\n${String(data.description ?? data.excerpt ?? '')}\n\n${content}`,
      sourceUrl: `/blog/${slug}`,
      sourceTable: 'content/blog',
      sourceRecordId: file,
      sourceCreatedAt: typeof data.datePublished === 'string' ? data.datePublished : typeof data.date === 'string' ? data.date : null,
      metadata: { file, category: data.category ?? null, cluster: data.cluster ?? null, tags: data.tags ?? [] },
    });
  }
  return inputs;
}

async function resourceInputs(): Promise<RagSourceInput[]> {
  const files = [
    'docs/DISCORD_EDUCATION_SERVER_RUNBOOK.md',
    'docs/DISCORD_COMMUNITY_OPERATING_SYSTEM.md',
    'docs/discord/SAGEBOT_DISCORD_OPERATING_FAQ.md',
    'docs/discord/WORLD_CLASS_PROOF_OPERATING_CONTROLS.md',
    'docs/specs/rag-system-build-plan.txt',
  ];
  const inputs: RagSourceInput[] = [];
  for (const file of files) {
    const body = await readFile(rootPath(...file.split('/')), 'utf8');
    inputs.push({
      sourceType: 'resource',
      externalId: file,
      title: path.basename(file),
      body,
      sourceUrl: `/${file}`,
      sourceTable: 'docs',
      sourceRecordId: file,
      metadata: { file },
    });
  }
  return inputs;
}

function rootPath(...segments: string[]): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), ...segments);
}

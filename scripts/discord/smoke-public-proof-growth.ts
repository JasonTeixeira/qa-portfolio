import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  createPublicGrowthDraft,
  createPublicProofSource,
  scorePublicProofPrivacy,
} from '@/lib/discord/public-proof';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  let sourceId: string | null = null;
  let draftId: string | null = null;
  const startedAt = new Date().toISOString();

  try {
    const unsafe = scorePublicProofPrivacy('Member <@123456789> shared api_key = abcdefghijklmnop and email sage@example.com');
    const source = await createPublicProofSource({
      sourceType: 'recap',
      sourceTable: 'discord_content_drafts',
      sourceRecordId: `public-proof-smoke-${Date.now()}`,
      title: 'Question became a review checklist',
      summary: 'An approved community question became a concrete review checklist for builders.',
      body: 'A builder asked how to scope an AI onboarding flow. The approved lesson was to define one user, one input, one output, and one acceptance test before adding automation.',
      permissionStatus: 'anonymized',
      metadata: { smoke: true },
    });
    sourceId = source.id;
    const draft = await createPublicGrowthDraft({
      sourceId,
      draftType: 'newsletter',
      title: 'Question became a review checklist',
      summary: 'An approved community question became a concrete review checklist for builders.',
      body: 'A builder asked how to scope an AI onboarding flow. The approved lesson was to define one user, one input, one output, and one acceptance test before adding automation.',
      metadata: { smoke: true },
    });
    draftId = draft.id;

    const [sourceRow, draftRow] = await Promise.all([
      sb.from('discord_public_proof_sources').select('id, permission_status, privacy_score').eq('id', sourceId).maybeSingle(),
      sb.from('discord_public_growth_drafts').select('id, draft_type, status, privacy_score, quality_score, utm_campaign, body').eq('id', draftId).maybeSingle(),
    ]);
    if (sourceRow.error) throw sourceRow.error;
    if (draftRow.error) throw draftRow.error;

    const page = await readFile(path.join(process.cwd(), 'app', 'discord', 'page.tsx'), 'utf8');
    const migration = await readFile(path.join(process.cwd(), 'supabase', 'migrations', '0090_discord_public_proof_growth.sql'), 'utf8');
    const checks = {
      privacy_blocks_private_data: unsafe.passed === false && unsafe.score < 90,
      source_created: sourceRow.data?.permission_status === 'anonymized' && Number(sourceRow.data?.privacy_score ?? 0) >= 90,
      draft_created: draftRow.data?.status === 'pending_approval'
        && Number(draftRow.data?.privacy_score ?? 0) >= 90
        && Number(draftRow.data?.quality_score ?? 0) >= 80,
      provenance_visible: String(draftRow.data?.body ?? '').includes('approved community source'),
      funnel_page_present: page.includes('Sage Ideas Discord') && page.includes('Apply to join') && page.includes('discord_public_proof'),
      growth_tables_present: migration.includes('discord_public_proof_sources')
        && migration.includes('discord_public_growth_drafts')
        && migration.includes('discord_growth_events'),
    };
    const evidence = {
      ok: Object.values(checks).every(Boolean),
      checks,
      unsafe,
      source,
      draft,
      sourceRow: sourceRow.data,
      draftRow: draftRow.data ? {
        id: draftRow.data.id,
        draft_type: draftRow.data.draft_type,
        status: draftRow.data.status,
        privacy_score: draftRow.data.privacy_score,
        quality_score: draftRow.data.quality_score,
        utm_campaign: draftRow.data.utm_campaign,
        bodyPreview: String(draftRow.data.body).slice(0, 400),
      } : null,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await mkdir(evidenceDir, { recursive: true });
    const evidencePath = path.join(evidenceDir, 'phase-16-public-proof-growth-proof.json');
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } finally {
    if (draftId) await sb.from('discord_public_growth_drafts').delete().eq('id', draftId);
    if (sourceId) await sb.from('discord_public_proof_sources').delete().eq('id', sourceId);
  }
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-16-public-proof-growth-proof.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});

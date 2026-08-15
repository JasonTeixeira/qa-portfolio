import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deepSeekChat } from '@/lib/rag/deepseek';
import {
  aiObservabilityMode,
  flushAiObservability,
  langfuseConfigured,
  startAiObservation,
} from '@/lib/ai/observability';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'engineering-loop');
const evidencePath = path.join(evidenceDir, 'langfuse-smoke-latest.json');

function cleanEnv(value: string | undefined): string {
  return value?.replace(/\\n/g, '').trim() ?? '';
}

async function main() {
  const startedAt = new Date().toISOString();
  const baseUrl = cleanEnv(process.env.LANGFUSE_BASE_URL) || cleanEnv(process.env.LANGFUSE_BASEURL);
  const root = startAiObservation('sagebot.langfuse_smoke', {
    input: { check: 'langfuse_connection_and_generation_trace' },
    metadata: {
      feature: 'sagebot_observability',
      smoke: true,
      sdk_path: '@langfuse/otel + @langfuse/tracing',
    },
  }, { asType: 'chain' });

  let evidence: Record<string, unknown>;
  try {
    const generation = await deepSeekChat({
      messages: [
        {
          role: 'system',
          content: 'You are a connection smoke test. Reply with exactly: LANGFUSE_SMOKE_OK',
        },
        {
          role: 'user',
          content: 'Return the exact smoke-test token.',
        },
      ],
      temperature: 0,
      maxTokens: 16,
      observability: {
        parent: root,
        name: 'sagebot.langfuse_smoke_generation',
        metadata: { feature: 'sagebot_observability', smoke: true },
      },
    });

    evidence = {
      ok: generation.observability.provider === 'langfuse'
        && generation.content.trim() === 'LANGFUSE_SMOKE_OK'
        && Boolean(root.traceId)
        && Boolean(generation.observability.observationId),
      version: 'sagebot-langfuse-smoke-v1',
      generatedAt: new Date().toISOString(),
      mutationMode: 'langfuse_trace_and_deepseek_generation_only',
      releaseMeaning: 'Creates one minimal Langfuse trace and one minimal DeepSeek generation to prove credentials, trace export, model name, token usage, nested observation, redaction, and flush behavior. It does not mutate Discord, Supabase, Stripe, Vercel, Railway, or Git.',
      configured: langfuseConfigured(),
      mode: aiObservabilityMode(),
      baseUrlConfigured: Boolean(baseUrl),
      rootTraceId: root.traceId,
      rootObservationId: root.observationId,
      generationTraceId: generation.observability.traceId,
      generationObservationId: generation.observability.observationId,
      provider: generation.observability.provider,
      model: generation.model,
      usage: generation.usage,
      outputMatched: generation.content.trim() === 'LANGFUSE_SMOKE_OK',
      startedAt,
      finishedAt: new Date().toISOString(),
    };

    root.update({
      output: {
        ok: evidence.ok,
        generationObservationId: generation.observability.observationId,
        outputMatched: generation.content.trim() === 'LANGFUSE_SMOKE_OK',
      },
    });
  } catch (error) {
    evidence = {
      ok: false,
      version: 'sagebot-langfuse-smoke-v1',
      generatedAt: new Date().toISOString(),
      configured: langfuseConfigured(),
      mode: aiObservabilityMode(),
      baseUrlConfigured: Boolean(baseUrl),
      rootTraceId: root.traceId,
      rootObservationId: root.observationId,
      error: error instanceof Error ? error.message : String(error),
      startedAt,
      finishedAt: new Date().toISOString(),
    };

    root.update({
      output: {
        ok: false,
        error: evidence.error,
      },
    });
  } finally {
    root.end();
    await flushAiObservability();
  }

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    version: 'sagebot-langfuse-smoke-v1',
    generatedAt: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});

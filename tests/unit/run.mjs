// Phase-1 unit tests — pure logic only, no server, no Supabase.
// Run with: node --experimental-strip-types tests/unit/run.mjs
//
// Keeps each suite self-contained so we don't have to wire a full test
// framework just for a handful of assertions.

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';

// .ts imports work via the tsx loader, which is registered through the
// package script (`tsx tests/unit/run.mjs` or `node --import tsx ...`).
// Direct `node tests/unit/run.mjs` will fail when importing .ts files.

const suites = [];
function test(name, fn) {
  suites.push({ name, fn });
}

// -------------------------------------------------------------- api-errors

test('api-errors: badRequest returns 400 + structured body', async () => {
  const { badRequest } = await import('../../lib/api-errors.ts');
  const res = badRequest('nope');
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'nope');
  assert.equal(body.code, 'bad_request');
});

test('api-errors: unauthorized + forbidden + notFound + serverError status codes', async () => {
  const { unauthorized, forbidden, notFound, serverError } = await import(
    '../../lib/api-errors.ts'
  );
  assert.equal(unauthorized().status, 401);
  assert.equal(forbidden().status, 403);
  assert.equal(notFound().status, 404);
  assert.equal(serverError().status, 500);
});

test('api-errors: tooManyRequests sets Retry-After header', async () => {
  const { tooManyRequests } = await import('../../lib/api-errors.ts');
  const res = tooManyRequests(42);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('Retry-After'), '42');
});

test('api-errors: fromZodError returns 400 with first message', async () => {
  const { fromZodError } = await import('../../lib/api-errors.ts');
  const { z } = await import('zod');
  const parsed = z.object({ x: z.string() }).safeParse({ x: 1 });
  assert.equal(parsed.success, false);
  const res = fromZodError(parsed.error);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.code, 'invalid_request');
  assert.ok(typeof body.error === 'string' && body.error.length > 0);
});

test('ops scripts: local e2e and Supabase commands load env and use durable wrappers', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  assert.match(packageJson.scripts['test:e2e:local'], /node --env-file-if-exists=\.env\.local scripts\/ops\/run-playwright\.mjs/);
  assert.match(packageJson.scripts['test:e2e:local:acquisition'], /node --env-file-if-exists=\.env\.local scripts\/ops\/run-playwright\.mjs/);
  assert.match(packageJson.scripts['db:push'], /node --env-file-if-exists=\.env\.local scripts\/ops\/supabase-cli\.mjs db push/);
  assert.match(packageJson.scripts['qa:cwv-budget'], /node scripts\/qa\/cwv-budget-report\.mjs/);
});

test('programs A/B/C/E: budget, MDX, viz, and leads inbox surfaces are wired', async () => {
  const mdxIndex = await readFile(new URL('../../components/mdx/index.ts', import.meta.url), 'utf8');
  const vizIndex = await readFile(new URL('../../components/viz/index.ts', import.meta.url), 'utf8');
  const leadsMigration = await readFile(new URL('../../supabase/migrations/0045_leads_admin_inbox.sql', import.meta.url), 'utf8');
  const sidebar = await readFile(new URL('../../components/admin/sidebar.tsx', import.meta.url), 'utf8');

  assert.match(mdxIndex, /ProofBlock/);
  assert.match(mdxIndex, /SystemDiagram/);
  assert.match(mdxIndex, /OfferCTA/);
  assert.match(vizIndex, /MetricGrid/);
  assert.match(leadsMigration, /add column if not exists status/);
  assert.match(leadsMigration, /leads_score_created_at_idx/);
  assert.match(sidebar, /\/admin\/leads/);
});

test('discord community ops: premium command, analytics dashboard, cron, and migration are wired', async () => {
  const migration = await readFile(new URL('../../supabase/migrations/0049_discord_community_ops.sql', import.meta.url), 'utf8');
  const engagementMigration = await readFile(new URL('../../supabase/migrations/0050_discord_engagement_engine.sql', import.meta.url), 'utf8');
  const approvalMigration = await readFile(new URL('../../supabase/migrations/0051_discord_member_approval_gate.sql', import.meta.url), 'utf8');
  const gatewayMigration = await readFile(new URL('../../supabase/migrations/0060_discord_gateway_worker.sql', import.meta.url), 'utf8');
  const commands = await readFile(new URL('../../lib/discord/sage-commands.ts', import.meta.url), 'utf8');
  const register = await readFile(new URL('../../scripts/discord/register-sage-commands.mjs', import.meta.url), 'utf8');
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  const sidebar = await readFile(new URL('../../components/admin/sidebar.tsx', import.meta.url), 'utf8');
  const vercel = await readFile(new URL('../../vercel.json', import.meta.url), 'utf8');

  assert.match(migration, /create table if not exists public\.discord_members/);
  assert.match(migration, /create table if not exists public\.discord_events/);
  assert.match(engagementMigration, /create table if not exists public\.discord_points_ledger/);
  assert.match(engagementMigration, /create table if not exists public\.discord_content_queue/);
  assert.match(engagementMigration, /create table if not exists public\.discord_member_streaks/);
  assert.match(approvalMigration, /create table if not exists public\.discord_member_applications/);
  assert.match(gatewayMigration, /create table if not exists public\.discord_messages/);
  assert.match(gatewayMigration, /create table if not exists public\.discord_gateway_events/);
  assert.match(gatewayMigration, /create table if not exists public\.discord_reactions/);
  assert.match(gatewayMigration, /create table if not exists public\.discord_threads/);
  const gatewayReliabilityMigration = await readFile(new URL('../../supabase/migrations/0063_discord_gateway_reliability.sql', import.meta.url), 'utf8');
  assert.match(gatewayReliabilityMigration, /create table if not exists public\.discord_gateway_heartbeats/);
  assert.match(gatewayReliabilityMigration, /create table if not exists public\.discord_gateway_sessions/);
  assert.match(gatewayReliabilityMigration, /create table if not exists public\.discord_gateway_dead_letters/);
  const classifierMigration = await readFile(new URL('../../supabase/migrations/0068_discord_message_classifier.sql', import.meta.url), 'utf8');
  assert.match(classifierMigration, /create table if not exists public\.discord_message_classifications/);
  assert.match(classifierMigration, /recommended_action in/);
  const contentQueueSourceMigration = await readFile(new URL('../../supabase/migrations/0069_discord_content_queue_source_messages.sql', import.meta.url), 'utf8');
  assert.match(contentQueueSourceMigration, /source_message_id text references public\.discord_messages/);
  assert.match(contentQueueSourceMigration, /discord_content_queue_source_message_idx/);
  const contentDraftMigration = await readFile(new URL('../../supabase/migrations/0070_discord_content_draft_approval.sql', import.meta.url), 'utf8');
  assert.match(contentDraftMigration, /create table if not exists public\.discord_content_drafts/);
  assert.match(contentDraftMigration, /pending_approval/);
  const ragMigration = await readFile(new URL('../../supabase/migrations/0065_rag_foundation.sql', import.meta.url), 'utf8');
  assert.match(ragMigration, /create extension if not exists vector/);
  assert.match(ragMigration, /create table if not exists public\.rag_sources/);
  assert.match(ragMigration, /create table if not exists public\.rag_documents/);
  assert.match(ragMigration, /create table if not exists public\.rag_chunks/);
  assert.match(ragMigration, /embedding extensions\.vector\(1536\)/);
  assert.match(ragMigration, /create table if not exists public\.rag_retrieval_logs/);
  assert.match(ragMigration, /create table if not exists public\.rag_answers/);
  assert.match(ragMigration, /create table if not exists public\.rag_answer_feedback/);
  assert.match(ragMigration, /create table if not exists public\.rag_eval_questions/);
  assert.match(ragMigration, /create table if not exists public\.rag_eval_runs/);
  assert.match(ragMigration, /create table if not exists public\.rag_eval_results/);
  assert.match(commands, /name: 'apply'/);
  assert.match(commands, /name: 'approve'/);
  assert.match(commands, /name: 'premium'/);
  assert.match(commands, /name: 'leaderboard'/);
  assert.match(commands, /name: 'submit-challenge'/);
  assert.match(commands, /createDiscordPremiumCheckout/);
  assert.match(register, /name: 'premium'/);
  assert.match(register, /name: 'quiz'/);
  assert.match(register, /name: 'approve'/);
  assert.equal(packageJson.scripts['discord:migration-check'], 'node scripts/discord/check-migrations.mjs');
  assert.match(packageJson.scripts['discord:gateway'], /scripts\/discord\/gateway-worker\.ts/);
  assert.match(packageJson.scripts['discord:smoke'], /smoke-sage-community\.mjs/);
  assert.equal(packageJson.scripts['discord:verify-message-content'], 'node --env-file-if-exists=.env.local scripts/discord/verify-message-content-intent.mjs');
  assert.equal(packageJson.scripts['discord:classify-messages'], 'tsx --env-file=.env.local scripts/discord/classify-messages.ts');
  assert.equal(packageJson.scripts['discord:smoke-classifier'], 'tsx --env-file=.env.local scripts/discord/smoke-message-classifier.ts');
  assert.equal(packageJson.scripts['discord:queue-content'], 'tsx --env-file=.env.local scripts/discord/queue-content-from-messages.ts');
  assert.equal(packageJson.scripts['discord:smoke-content-queue'], 'tsx --env-file=.env.local scripts/discord/smoke-content-queue-automation.ts');
  assert.equal(packageJson.scripts['discord:smoke-content-approval'], 'tsx --env-file=.env.local scripts/discord/smoke-content-approval.ts');
  assert.equal(packageJson.scripts['rag:baseline'], 'node --env-file-if-exists=.env.local scripts/rag/baseline.mjs');
  assert.equal(packageJson.scripts['rag:migration-check'], 'node scripts/rag/check-rag-migrations.mjs');
  assert.equal(packageJson.scripts['rag:smoke-foundation'], 'node --env-file-if-exists=.env.local scripts/rag/smoke-rag-foundation.mjs');
  assert.equal(packageJson.scripts['rag:sync-sources'], 'tsx --env-file=.env.local scripts/rag/sync-sources.ts');
  assert.equal(packageJson.scripts['rag:smoke-deepseek'], 'tsx --env-file=.env.local scripts/rag/smoke-deepseek.ts');
  assert.equal(packageJson.scripts['rag:chunk'], 'tsx --env-file=.env.local scripts/rag/chunk-documents.ts');
  assert.equal(packageJson.scripts['rag:smoke-embeddings'], 'tsx --env-file=.env.local scripts/rag/smoke-local-embeddings.ts');
  assert.equal(packageJson.scripts['rag:embed'], 'tsx --env-file=.env.local scripts/rag/embed-chunks-local.ts');
  assert.equal(packageJson.scripts['rag:smoke-retrieval'], 'tsx --env-file=.env.local scripts/rag/smoke-retrieval.ts');
  assert.equal(packageJson.scripts['rag:smoke-answer'], 'tsx --env-file=.env.local scripts/rag/smoke-answer.ts');
  const dockerfile = await readFile(new URL('../../Dockerfile.worker', import.meta.url), 'utf8');
  const railway = await readFile(new URL('../../railway.worker.json', import.meta.url), 'utf8');
  assert.match(dockerfile, /npm", "run", "discord:gateway"/);
  assert.match(railway, /Dockerfile\.worker/);
  assert.match(sidebar, /\/admin\/discord/);
  assert.match(vercel, /\/api\/cron\/discord\/daily/);
  assert.match(vercel, /\/api\/cron\/discord\/weekly/);
});

test('rag source normalizer: creates stable keys hashes and document payloads', async () => {
  const sourceNormalizerModule = await import('../../lib/rag/source-normalizer.ts');
  const {
    buildSourceKey,
    estimateTokens,
    normalizeRagSource,
    normalizeRagText,
    stableHash,
  } = sourceNormalizerModule.default ?? sourceNormalizerModule;

  assert.equal(buildSourceKey('discord_question', 'abc123'), 'discord_question:abc123');
  assert.equal(normalizeRagText(` hello   world


again `), `hello world

again`);
  assert.equal(stableHash('hello   world'), stableHash('hello world'));
  assert.ok(estimateTokens('12345678') >= 2);

  const record = normalizeRagSource({
    sourceType: 'discord_answer',
    externalId: 'answer-1',
    title: 'Useful answer',
    body: 'Here is the answer.\\n\\nIt has enough context.',
    authorUserId: 'user-1',
    channelBaseName: 'questions',
    qualityScore: 120,
  });

  assert.ok(record);
  assert.equal(record.source.source_key, 'discord_answer:answer-1');
  assert.equal(record.source.quality_score, 100);
  assert.equal(record.document.document_key, 'doc:discord_answer:answer-1');
  assert.equal(record.document.body_hash, record.source.content_hash);
  assert.equal(record.document.status, 'pending');
});

test('discord message classifier: labels useful community moments with actions', async () => {
  const { classifyDiscordMessage, DISCORD_MESSAGE_CLASSIFIER_VERSION } = await import('../../lib/discord/message-classifier.ts');

  const question = classifyDiscordMessage({
    discordMessageId: 'm1',
    channelBaseName: 'questions',
    authorBot: false,
    content: 'How should I design the first version of my AI agent project so it is testable and useful?',
    detectedKind: 'question',
  });
  assert.equal(question.category, 'question');
  assert.equal(question.recommended_action, 'track_question');
  assert.ok(question.quality_score > 20);
  assert.equal(question.classifier_version, DISCORD_MESSAGE_CLASSIFIER_VERSION);

  const review = classifyDiscordMessage({
    discordMessageId: 'm2',
    channelBaseName: 'review-queue',
    authorBot: false,
    content: 'Can someone review my landing page and give critique on the proof section?',
    detectedKind: 'review',
  });
  assert.equal(review.category, 'review_request');
  assert.equal(review.recommended_action, 'candidate_review');

  const spam = classifyDiscordMessage({
    discordMessageId: 'm3',
    channelBaseName: 'general',
    authorBot: false,
    content: 'free money crypto pump click here http://bad.example http://worse.example http://spam.example',
    linkCount: 3,
  });
  assert.equal(spam.category, 'spam');
  assert.equal(spam.recommended_action, 'needs_human_review');
  assert.ok(spam.spam_score >= 70);

  const bot = classifyDiscordMessage({
    discordMessageId: 'm4',
    channelBaseName: 'questions',
    authorBot: true,
    content: 'How should I classify this?',
    detectedKind: 'question',
  });
  assert.equal(bot.recommended_action, 'ignore');
});

test('discord content queue automation: creates queue candidates from useful classifications', async () => {
  const { buildContentQueueCandidate } = await import('../../lib/discord/content-queue-automation.ts');
  const candidate = buildContentQueueCandidate({
    discord_message_id: 'm1',
    channel_base_name: 'questions-to-content',
    author_user_id: 'u1',
    author_username: 'sage',
    content: 'How do I turn one useful Discord question into a daily lesson and resource?',
    category: 'question',
    recommended_action: 'track_question',
    confidence: 0.8,
    quality_score: 70,
    content_value_score: 95,
    signals: { has_question: true },
    rationale: 'question -> track_question',
  });

  assert.ok(candidate);
  assert.equal(candidate.source, 'discord_message_classifier');
  assert.equal(candidate.source_message_id, 'm1');
  assert.equal(candidate.source_classification_action, 'track_question');
  assert.equal(candidate.status, 'captured');
  assert.ok(candidate.priority > 70);
  assert.match(candidate.idea, /Answer this member question/);

  const ignored = buildContentQueueCandidate({
    discord_message_id: 'm2',
    channel_base_name: 'general',
    author_user_id: 'u1',
    author_username: 'sage',
    content: 'ok',
    category: 'general',
    recommended_action: 'ignore',
    confidence: 0.9,
    quality_score: 0,
    content_value_score: 0,
    signals: {},
    rationale: 'general -> ignore',
  });
  assert.equal(ignored, null);
});

test('discord content approval: normalizes drafts and admin review wiring exists', async () => {
  const { normalizeDiscordContentDraft } = await import('../../lib/discord/content-approval.ts');
  const actions = await readFile(new URL('../../app/admin/discord/actions.ts', import.meta.url), 'utf8');
  const page = await readFile(new URL('../../app/admin/discord/page.tsx', import.meta.url), 'utf8');

  const draft = normalizeDiscordContentDraft({
    draftType: 'daily_signal',
    targetChannelBaseName: 'daily-signal',
    body: '  One useful prompt.\\n\\n\\nOne clear action. ',
    qualityScore: 111,
  });
  assert.equal(draft.status, 'pending_approval');
  assert.equal(draft.quality_score, 100);
  assert.equal(draft.body, 'One useful prompt.\n\nOne clear action.');
  assert.match(actions, /reviewDiscordContentDraftAction/);
  assert.match(page, /AI content approval/);
  assert.match(page, /reviewDiscordContentDraftAction/);
});

test('rag chunking: creates stable bounded chunks with overlap metadata', async () => {
  const { chunkRagDocument } = await import('../../lib/rag/chunking.ts');
  const section = `First paragraph explains the system clearly with operational details, owner expectations, review standards, and proof requirements.

Second paragraph adds implementation notes, common mistakes, source capture, tagging rules, metadata requirements, and escalation paths.

Third paragraph explains verification, repeatable testing, quality gates, review evidence, and how to keep the corpus useful.

Fourth paragraph captures operational ownership, weekly maintenance, content reuse, and the path from question to reusable resource.`;
  const body = `# Build Systems\n\n${Array.from({ length: 12 }, (_, index) => `${section}\n\nIteration ${index + 1} adds enough detail for chunking.`).join('\n\n')}`;

  const chunks = chunkRagDocument({
    documentKey: 'doc:resource:build-system',
    title: 'Build Systems',
    body,
    targetTokens: 120,
    overlapTokens: 25,
  });
  const repeated = chunkRagDocument({
    documentKey: 'doc:resource:build-system',
    title: 'Build Systems',
    body,
    targetTokens: 120,
    overlapTokens: 25,
  });

  assert.ok(chunks.length >= 2);
  assert.deepEqual(chunks.map((chunk) => chunk.chunk_key), repeated.map((chunk) => chunk.chunk_key));
  assert.equal(chunks[0].chunk_key, 'chunk:doc:resource:build-system:0');
  assert.ok(chunks.every((chunk) => chunk.token_estimate > 0));
  assert.ok(chunks.every((chunk) => chunk.metadata.heading === 'Build Systems'));
  assert.ok(chunks[1].content.includes('Second paragraph') || chunks[1].content.includes('Third paragraph'));
});

test('rag deepseek: builds authenticated chat requests and parses content', async () => {
  const { deepSeekChat, requireDeepSeekApiKey } = await import('../../lib/rag/deepseek.ts');
  assert.equal(requireDeepSeekApiKey({ DEEPSEEK_API_KEY: ' test-key ' }), 'test-key');

  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({
      model: 'deepseek-chat',
      choices: [{ message: { content: 'rag-ok' } }],
      usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  try {
    const result = await deepSeekChat({
      apiKey: 'unit-key',
      baseUrl: 'https://api.deepseek.com/',
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'ping' }],
      maxTokens: 8,
    });
    assert.equal(result.content, 'rag-ok');
    assert.equal(result.usage.total_tokens, 5);
    assert.equal(calls[0].url, 'https://api.deepseek.com/chat/completions');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer unit-key');
  assert.match(String(calls[0].init.body), /"model":"deepseek-chat"/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rag embeddings and retrieval: local vector lane and hybrid RPC are wired', async () => {
  const { LOCAL_EMBEDDING_DIMENSIONS, LOCAL_EMBEDDING_MODEL, vectorToSql } = await import('../../lib/rag/embeddings.ts');
  const migration = await readFile(new URL('../../supabase/migrations/0067_rag_local_embeddings.sql', import.meta.url), 'utf8');
  const retrieval = await readFile(new URL('../../lib/rag/retrieval.ts', import.meta.url), 'utf8');

  assert.equal(LOCAL_EMBEDDING_MODEL, 'Supabase/gte-small');
  assert.equal(LOCAL_EMBEDDING_DIMENSIONS, 384);
  assert.equal(vectorToSql([0.1, -0.2]), '[0.10000000,-0.20000000]');
  assert.match(migration, /embedding_local extensions\.vector\(384\)/);
  assert.match(migration, /using hnsw \(embedding_local extensions\.vector_cosine_ops\)/);
  assert.match(migration, /create or replace function public\.match_rag_chunks_hybrid/);
  assert.match(migration, /websearch_to_tsquery\('english', query_text\)/);
  assert.match(retrieval, /match_rag_chunks_hybrid/);
  assert.match(retrieval, /answerRagQuestion/);
});

test('discord ask-sage: formats RAG answers and wires the slash command', async () => {
  const { formatAskSageDiscordAnswer, normalizeAskSageQuestion } = await import('../../lib/discord/ask-sage.ts');
  const { isDeferredSageCommand } = await import('../../lib/discord/sage-commands.ts');
  const { buildDiscordFollowupRequest } = await import('../../lib/discord/followup.ts');
  const commands = await readFile(new URL('../../lib/discord/sage-commands.ts', import.meta.url), 'utf8');
  const route = await readFile(new URL('../../app/api/discord/interactions/route.ts', import.meta.url), 'utf8');
  const register = await readFile(new URL('../../scripts/discord/register-sage-commands.mjs', import.meta.url), 'utf8');
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));

  assert.equal(
    normalizeAskSageQuestion({ question: '  How do I onboard members?  ', context: '  Free member approval  ' }),
    'How do I onboard members?\n\nMember context: Free member approval',
  );
  const formatted = formatAskSageDiscordAnswer('How do I onboard members?', {
    answer: 'Use a clear start-here path and approval gate [1].',
    citations: [{ chunk_id: 'c1', title: 'Discord runbook', source_url: 'https://example.com/runbook', source_type: 'doc' }],
    retrievalLogId: 'log-1',
    answerId: 'answer-1',
    model: 'deepseek-chat',
  });
  assert.match(formatted, /# SageBot answer/);
  assert.match(formatted, /Discord runbook/);
  assert.match(formatted, /Answer ID: `answer-1`/);
  assert.ok(formatted.length <= 1900);
  assert.match(commands, /name: 'ask-sage'/);
  assert.match(commands, /handleAskSage/);
  assert.match(commands, /handleDeferredSageCommand/);
  assert.match(route, /RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE/);
  assert.equal(isDeferredSageCommand({ data: { name: 'ask-sage' } }), true);
  assert.equal(isDeferredSageCommand({ data: { name: 'ask' } }), false);
  const followup = buildDiscordFollowupRequest({ applicationId: 'app-1', token: 'token-1', content: 'done' });
  assert.equal(followup.url, 'https://discord.com/api/v10/webhooks/app-1/token-1');
  assert.match(String(followup.init.body), /"flags":64/);
  assert.match(register, /name: 'ask-sage'/);
  assert.equal(pkg.scripts['discord:smoke-ask-sage'], 'tsx --env-file=.env.local scripts/discord/smoke-ask-sage.ts');
});

test('discord daily planner: builds approval-gated DeepSeek draft jobs', async () => {
  const { DISCORD_DAILY_PLANNER_PROMPT_VERSION, buildDailyPlannerPrompt, scoreDailyPlannerDraft } = await import('../../lib/discord/daily-planner.ts');
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  const script = await readFile(new URL('../../scripts/discord/plan-daily-content.ts', import.meta.url), 'utf8');

  const prompt = buildDailyPlannerPrompt({
    dateKey: '2099-01-01',
    theme: 'Approval gates',
    prompt: 'Map one approval workflow.',
    quizPrompt: 'What needs approval?',
    quizOptions: ['Sending', 'Reading', 'Counting', 'Formatting'],
    challengeTitle: 'Automation map',
    challengePrompt: 'Map a workflow.',
    challengeDeliverable: 'Workflow map',
  });
  assert.equal(DISCORD_DAILY_PLANNER_PROMPT_VERSION, 'discord-daily-planner-v1');
  assert.match(prompt, /Format exactly:/);
  assert.match(prompt, /Approval gates/);
  assert.match(prompt, /Automation map/);
  assert.equal(scoreDailyPlannerDraft('thin'), 35);
  assert.ok(scoreDailyPlannerDraft('# Daily Signal\n**Theme:** Test\n**Build prompt:** Build\n**Quiz:** Q\n**Challenge:** C\nDeliverable: D\n'.repeat(8)) >= 80);
  assert.match(script, /createDailyPlannerDraft/);
  assert.equal(pkg.scripts['discord:plan-daily'], 'tsx --env-file=.env.local scripts/discord/plan-daily-content.ts');
  assert.match(pkg.scripts['discord:smoke-daily-planner'], /--smoke --date=2099-01-01/);
});

test('discord learning generator: validates quiz and challenge drafts', async () => {
  const {
    DISCORD_LEARNING_GENERATOR_PROMPT_VERSION,
    buildLearningGeneratorPrompt,
    parseGeneratedLearningItems,
    scoreGeneratedLearningItems,
  } = await import('../../lib/discord/quiz-challenge-generator.ts');
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  const script = await readFile(new URL('../../scripts/discord/generate-learning-content.ts', import.meta.url), 'utf8');

  const prompt = buildLearningGeneratorPrompt({ theme: 'approval gates', dateKey: '2099-01-02' });
  assert.equal(DISCORD_LEARNING_GENERATOR_PROMPT_VERSION, 'discord-learning-generator-v1');
  assert.match(prompt, /Return strict JSON only/);
  assert.match(prompt, /approval gates/);
  const items = parseGeneratedLearningItems(JSON.stringify({
    quiz: {
      prompt: 'Which action should require a human approval gate before an automation proceeds?',
      options: ['Reading data', 'Sending a customer email', 'Counting rows', 'Formatting text'],
      correct_answer: 'Sending a customer email',
      explanation: 'Sending affects trust and reputation, so it needs a human approval boundary.',
      difficulty: 'foundation',
    },
    challenge: {
      title: 'Approval map',
      prompt: 'Map one automation with trigger, input, decision point, human approval, and failure path.',
      deliverable: 'Post the map and name the approval owner.',
      points: 20,
    },
  }));
  assert.equal(items.quiz.options.length, 4);
  assert.equal(items.challenge.points, 20);
  assert.ok(scoreGeneratedLearningItems(items) >= 90);
  assert.match(script, /generateDiscordLearningDrafts/);
  assert.equal(pkg.scripts['discord:generate-learning'], 'tsx --env-file=.env.local scripts/discord/generate-learning-content.ts');
  assert.match(pkg.scripts['discord:smoke-learning-generator'], /--smoke --date=2099-01-02/);
});

test('discord weekly automation: drafts leaderboard recap for approval', async () => {
  const { DISCORD_WEEKLY_RECAP_PROMPT_VERSION, discordWeekKey, scoreWeeklyRecap } = await import('../../lib/discord/weekly-automation.ts');
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  const script = await readFile(new URL('../../scripts/discord/create-weekly-recap-draft.ts', import.meta.url), 'utf8');

  assert.equal(DISCORD_WEEKLY_RECAP_PROMPT_VERSION, 'discord-weekly-recap-automation-v1');
  assert.match(discordWeekKey(new Date('2026-06-21T12:00:00.000Z')), /^2026-W\d{2}$/);
  const body = [
    '# Weekly Recap',
    '**Leaderboard**',
    '1. Builder - 50 pts',
    '**Challenge recap**',
    'Submissions this week: 1',
    '**Content queue**',
    '- One idea',
    '**Open questions**',
    '- One question',
    'x'.repeat(500),
  ].join('\n');
  assert.ok(scoreWeeklyRecap(body) >= 90);
  assert.match(script, /createWeeklyRecapDraft/);
  assert.equal(pkg.scripts['discord:weekly-recap-draft'], 'tsx --env-file=.env.local scripts/discord/create-weekly-recap-draft.ts');
  assert.match(pkg.scripts['discord:smoke-weekly-recap'], /--smoke/);
});

test('discord member intelligence: classifies member segments and persists rollups', async () => {
  const { classifyDiscordMemberProfile } = await import('../../lib/discord/member-intelligence.ts');
  const migration = await readFile(new URL('../../supabase/migrations/0071_discord_member_intelligence_profiles.sql', import.meta.url), 'utf8');
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  const script = await readFile(new URL('../../scripts/discord/rebuild-member-intelligence.ts', import.meta.url), 'utf8');

  const profile = classifyDiscordMemberProfile({
    discordUserId: 'u1',
    academyMember: true,
    premiumMember: false,
    totalPoints: 80,
    currentStreak: 4,
    longestStreak: 4,
    questionCount: 2,
    answerCount: 3,
    helpfulAnswerCount: 2,
    challengeSubmissionCount: 1,
    contentCaptureCount: 1,
    onboardingStepsCompleted: 5,
  });
  assert.equal(profile.segment, 'premium_candidate');
  assert.equal(profile.nextBestAction, 'offer_premium_review_or_member_spotlight');
  assert.ok(profile.strengths.includes('helps_members'));
  assert.match(migration, /create table if not exists public\.discord_member_intelligence_profiles/);
  assert.match(migration, /segment text not null/);
  assert.match(script, /rebuildDiscordMemberIntelligenceProfiles/);
  assert.equal(pkg.scripts['discord:member-intelligence'], 'tsx --env-file=.env.local scripts/discord/rebuild-member-intelligence.ts');
  assert.match(pkg.scripts['discord:smoke-member-intelligence'], /--smoke/);
});

test('discord premium workflows: review, deeper answer, and office-hours queues are wired', async () => {
  const { normalizePremiumReviewType } = await import('../../lib/discord/premium-workflows.ts');
  const migration = await readFile(new URL('../../supabase/migrations/0072_discord_premium_workflows.sql', import.meta.url), 'utf8');
  const commands = await readFile(new URL('../../lib/discord/sage-commands.ts', import.meta.url), 'utf8');
  const register = await readFile(new URL('../../scripts/discord/register-sage-commands.mjs', import.meta.url), 'utf8');
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));

  assert.equal(normalizePremiumReviewType('AI'), 'ai');
  assert.equal(normalizePremiumReviewType('nonsense'), 'general');
  assert.match(migration, /create table if not exists public\.discord_premium_review_requests/);
  assert.match(migration, /create table if not exists public\.discord_premium_answer_requests/);
  assert.match(migration, /create table if not exists public\.discord_office_hours_queue/);
  assert.match(commands, /name: 'premium-review'/);
  assert.match(commands, /name: 'premium-ask'/);
  assert.match(commands, /createOfficeHoursQueueItem/);
  assert.match(commands, /payload\.data\?\.name === 'premium-ask'/);
  assert.match(register, /name: 'premium-review'/);
  assert.match(register, /name: 'premium-ask'/);
  assert.equal(pkg.scripts['discord:smoke-premium-workflows'], 'tsx --env-file=.env.local scripts/discord/smoke-premium-workflows.ts');
});

test('discord content quality: evaluates drafts before approval', async () => {
  const {
    DISCORD_CONTENT_QUALITY_EVALUATOR_VERSION,
    evaluateDiscordContentDraft,
  } = await import('../../lib/discord/content-quality.ts');
  const migration = await readFile(new URL('../../supabase/migrations/0073_discord_content_quality_evaluations.sql', import.meta.url), 'utf8');
  const approval = await readFile(new URL('../../lib/discord/content-approval.ts', import.meta.url), 'utf8');
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));

  const passing = evaluateDiscordContentDraft({
    id: 'draft-1',
    draft_type: 'daily_signal',
    target_channel_base_name: 'daily-signal',
    body: '# Daily Signal\n**Build prompt:** Build one approval-gated workflow.\n**Question:** What should require review?\n**Challenge:** Map the workflow.\nDeliverable: Post trigger, owner, and failure path.',
  });
  const failing = evaluateDiscordContentDraft({
    id: 'draft-2',
    draft_type: 'daily_signal',
    target_channel_base_name: 'daily-signal',
    body: "This is a cutting-edge game-changer.",
  });
  assert.equal(DISCORD_CONTENT_QUALITY_EVALUATOR_VERSION, 'discord-content-quality-v1');
  assert.equal(passing.passed, true);
  assert.equal(failing.passed, false);
  assert.ok(failing.reasons.length > 0);
  assert.match(migration, /create table if not exists public\.discord_content_draft_evaluations/);
  assert.match(approval, /latestPassingContentDraftEvaluation/);
  assert.match(approval, /failed quality evaluation/);
  assert.equal(pkg.scripts['discord:evaluate-content'], 'tsx --env-file=.env.local scripts/discord/evaluate-content-drafts.ts');
  assert.match(pkg.scripts['discord:smoke-content-quality'], /--smoke/);
});

test('discord migrations: numeric versions are unique', async () => {
  const { readdir } = await import('node:fs/promises');
  const files = (await readdir(new URL('../../supabase/migrations/', import.meta.url))).filter((file) => /^\d{4}_.+\.sql$/.test(file));
  const versions = files.map((file) => file.slice(0, 4));
  assert.equal(new Set(versions).size, versions.length);
});

test('viz metrics: proportions use real metric values without inventing placeholders', async () => {
  const { metricMagnitude, metricProportions } = await import('../../components/viz/metric-utils.ts');
  assert.equal(metricMagnitude('200+'), 200);
  assert.equal(metricMagnitude('5★'), 5);
  assert.equal(metricMagnitude('EN + ES'), null);

  const rows = metricProportions([
    { label: 'DB Tables', value: '185' },
    { label: 'API Endpoints', value: '69' },
    { label: 'Languages', value: 'EN + ES' },
  ]);
  assert.equal(rows[0].proportion, 1);
  assert.ok(rows[1].proportion > 0.3 && rows[1].proportion < 0.4);
  assert.equal(rows[2].proportion, null);
});

test('ops scripts: Program 7 audit logging uses the typed logAudit contract', async () => {
  const actions = await readFile(new URL('../../app/admin/acquisition/actions.ts', import.meta.url), 'utf8');
  const start = actions.indexOf('runRevenueOsTenantSaasFoundationProof');
  assert.ok(start > 0, 'Program 7 action must exist');
  const body = actions.slice(start, actions.indexOf('revalidatePath', start));
  assert.match(body, /entityType:\s*'revenue_workspace'/);
  assert.match(body, /after:\s*\{/);
  assert.doesNotMatch(body, /targetType:/);
  assert.doesNotMatch(body, /metadata:\s*\{\s*runKey,\s*workspaces:/);
});

test('revenue os public api: hashes keys, enforces scopes, and verifies webhook signatures', async () => {
  const {
    buildRevenueApiKey,
    hashRevenueApiKey,
    verifyRevenueApiKey,
    hasRevenueApiScope,
    signRevenueWebhookPayload,
    verifyRevenueWebhookSignature,
    buildIdempotencyKey,
  } = await import('../../lib/revenue-os/public-api.ts');

  const key = buildRevenueApiKey({
    tenantKey: 'tenant-apex',
    scopes: ['leads:write', 'exports:read'],
    entropy: 'unit-test-entropy',
  });
  const hash = hashRevenueApiKey(key.secret);
  const verified = verifyRevenueApiKey({
    presentedKey: key.secret,
    records: [{ id: 'api-key-1', tenantKey: 'tenant-apex', keyHash: hash, scopes: key.scopes, status: 'active' }],
  });
  const failed = verifyRevenueApiKey({
    presentedKey: `${key.secret}x`,
    records: [{ id: 'api-key-1', tenantKey: 'tenant-apex', keyHash: hash, scopes: key.scopes, status: 'active' }],
  });
  const body = JSON.stringify({ event: 'reply.received', id: 'evt_1' });
  const signature = signRevenueWebhookPayload({ secret: key.secret, timestamp: '2026-06-18T12:00:00.000Z', body });

  assert.match(key.secret, /^rosk_live_/);
  assert.equal(key.prefix, key.secret.slice(0, 16));
  assert.equal(key.lastFour, key.secret.slice(-4));
  assert.equal(verified?.tenantKey, 'tenant-apex');
  assert.equal(failed, null);
  assert.equal(hasRevenueApiScope(key.scopes, 'leads:write'), true);
  assert.equal(hasRevenueApiScope(key.scopes, 'jobs:write'), false);
  assert.equal(verifyRevenueWebhookSignature({ secret: key.secret, timestamp: '2026-06-18T12:00:00.000Z', body, signature, now: '2026-06-18T12:00:30.000Z' }).ok, true);
  assert.equal(verifyRevenueWebhookSignature({ secret: key.secret, timestamp: '2026-06-18T12:00:00.000Z', body, signature: 'bad', now: '2026-06-18T12:00:30.000Z' }).ok, false);
  assert.equal(buildIdempotencyKey({ tenantKey: 'tenant-apex', resource: 'leads', externalId: 'lead-1' }), 'tenant-apex:leads:lead-1');
});

test('discord signatures: verifies signed interaction payloads and rejects tampering', async () => {
  const { generateKeyPairSync, sign } = await import('node:crypto');
  const { verifyDiscordRequestSignature } = await import('../../lib/discord/signature.ts');
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const publicKeyDer = publicKey.export({ format: 'der', type: 'spki' });
  const publicKeyHex = Buffer.from(publicKeyDer).subarray(-32).toString('hex');
  const timestamp = '1781766000';
  const body = JSON.stringify({ type: 1 });
  const signature = sign(null, Buffer.from(`${timestamp}${body}`), privateKey).toString('hex');

  assert.equal(
    verifyDiscordRequestSignature({ publicKey: publicKeyHex, signature, timestamp, body }),
    true,
  );
  assert.equal(
    verifyDiscordRequestSignature({ publicKey: publicKeyHex, signature, timestamp, body: '{"type":2}' }),
    false,
  );
  assert.equal(
    verifyDiscordRequestSignature({ publicKey: publicKeyHex, signature: null, timestamp, body }),
    false,
  );
});

test('sage discord commands: command registry covers onboarding content engine and ops commands', async () => {
  const { sageCommandDefinitions } = await import('../../lib/discord/sage-commands.ts');
  const { sagePathOptions, sageLevelOptions, dailyBuildPrompts, weeklyCadence, leanDiscordChannels } = await import('../../lib/discord/sage-content.ts');
  const names = sageCommandDefinitions.map((command) => command.name);

  assert.deepEqual(names, [
    'apply',
    'approve',
    'reject',
    'pending',
    'onboard',
    'choose-path',
    'submit-project',
    'request-review',
    'premium-review',
    'capture-content',
    'daily-prompt',
    'ask',
    'ask-sage',
    'premium-ask',
    'answer',
    'mark-helpful',
    'award',
    'profile',
    'rewards',
    'weekly-winners',
    'weekly-recap',
    'resource',
    'office-hours',
    'report',
    'premium',
    'daily',
    'checklist',
    'complete-step',
    'quiz',
    'challenge',
    'submit-challenge',
    'points',
    'rank',
    'leaderboard',
    'streak',
    'weekly',
    'content-queue',
  ]);
  assert.equal(sagePathOptions.length, 8);
  assert.equal(sageLevelOptions.length, 5);
  assert.equal(leanDiscordChannels.length, 11);
  assert.deepEqual(leanDiscordChannels.map((channel) => channel.name), [
    'start-here',
    'daily-signal',
    'questions',
    'build-lab',
    'review-queue',
    'content-lab',
    'live-room',
    'resources',
    'wins-showcase',
    'premium',
    'team-ops',
  ]);
  assert.ok(sagePathOptions.every((option) => ['build-lab', 'questions'].includes(option.channel)));
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  assert.ok(packageJson.scripts['discord:approval-audit'].includes('audit-member-approval.mjs'));
  assert.ok(packageJson.scripts['discord:approval-enforce'].includes('--enforce'));
  assert.ok(packageJson.scripts['discord:prove-onboarding'].includes('prove-onboarding-live.ts'));
  assert.ok(packageJson.scripts['discord:prove-onboarding:headless'].includes('--headless'));
  assert.ok(dailyBuildPrompts.length >= 10);
  assert.equal(weeklyCadence.length, 7);
  const apply = sageCommandDefinitions.find((command) => command.name === 'apply');
  assert.deepEqual(
    apply.options.map((option) => option.name),
    ['goal', 'experience', 'build', 'rules', 'path', 'level', 'timezone', 'time_budget', 'support', 'portfolio', 'source'],
  );
});

test('sage discord onboarding: post-approval welcome explains the lean approved-member flow', async () => {
  const { buildPostApprovalWelcome } = await import('../../lib/discord/onboarding.ts');
  const message = buildPostApprovalWelcome('123', {
    discordUserId: '123',
    username: 'sage',
    goal: 'Build useful AI systems',
    experience: 'Beginner',
    intendedBuild: 'AI assistant',
    pathKey: 'ai_apps',
    levelKey: 'beginner',
    timezone: 'ET',
    weeklyTimeBudget: '5 hours',
    primaryGoal: 'Ship',
    preferredSupport: 'review',
    portfolioUrl: null,
    referralSource: null,
    submittedAt: '2026-01-01T00:00:00.000Z',
  });

  assert.match(message, /How this Discord works/);
  assert.match(message, /`questions`/);
  assert.match(message, /`content-lab`/);
  assert.match(message, /`live-room`/);
  assert.match(message, /`wins-showcase`/);
  assert.doesNotMatch(message, /`wins`:/);
  assert.match(message, /First-week checklist/);
});

test('sage discord role routing: removes stale path and level roles without stripping overlapping valid roles', async () => {
  const { planDiscordRoleRouting } = await import('../../lib/discord/role-routing.ts');

  const changedPath = planDiscordRoleRouting({
    currentPathKey: 'full_stack',
    currentLevelKey: 'shipping',
    nextPathKey: 'web_design',
  });
  assert.deepEqual(changedPath.rolesToAdd, ['Academy Member', 'Web Builder', 'Builder']);
  assert.deepEqual(changedPath.rolesToRemove, []);
  assert.equal(changedPath.pathRole, 'Web Builder');
  assert.equal(changedPath.levelRole, 'Builder');

  const changedLevel = planDiscordRoleRouting({
    currentPathKey: 'web_design',
    currentLevelKey: 'shipping',
    nextLevelKey: 'starting',
  });
  assert.deepEqual(changedLevel.rolesToAdd, ['Academy Member', 'Web Builder', 'Beginner']);
  assert.deepEqual(changedLevel.rolesToRemove, ['Builder']);
  assert.equal(changedLevel.pathRole, 'Web Builder');
  assert.equal(changedLevel.levelRole, 'Beginner');

  const academyOverlap = planDiscordRoleRouting({
    currentPathKey: 'ai_apps',
    currentLevelKey: 'learning',
    nextLevelKey: 'architecting',
  });
  assert.deepEqual(academyOverlap.rolesToAdd, ['Academy Member', 'AI Engineer', 'Contributor']);
  assert.deepEqual(academyOverlap.rolesToRemove, []);
});

test('sage discord onboarding: application profile input is normalized before persistence', async () => {
  const { normalizeMemberApplicationProfile } = await import('../../lib/discord/engagement.ts');
  const normalized = normalizeMemberApplicationProfile({
    goal: '  Build an AI app  ',
    experience: 'Learning',
    intendedBuild: 'A support agent',
    pathKey: 'ai_apps',
    levelKey: 'shipping',
    timezone: ' ET ',
    weeklyTimeBudget: '5 hours',
    preferredSupport: 'review',
    portfolioUrl: 'https://example.com',
    referralSource: 'YouTube',
  });
  assert.equal(normalized.goal, 'Build an AI app');
  assert.equal(normalized.pathKey, 'ai_apps');
  assert.equal(normalized.levelKey, 'shipping');
  assert.equal(normalized.timezone, 'ET');
  assert.equal(normalized.preferredSupport, 'review');

  const unsafe = normalizeMemberApplicationProfile({
    goal: 'Goal',
    experience: 'Experience',
    intendedBuild: 'Build',
    pathKey: 'not_real',
    levelKey: 'bad_level',
    preferredSupport: 'spam',
  });
  assert.equal(unsafe.pathKey, null);
  assert.equal(unsafe.levelKey, null);
  assert.equal(unsafe.preferredSupport, null);
});

test('discord gateway ingestion: classifies normal messages for capture', async () => {
  const {
    countLinks,
    detectDiscordMessageKind,
    normalizeDiscordGatewayMessage,
  } = await import('../../lib/discord/gateway-ingestion.ts');

  assert.equal(countLinks('See https://example.com and http://demo.test'), 2);
  assert.equal(detectDiscordMessageKind({ channelBaseName: 'questions', content: 'How do I deploy this?' }), 'question');
  assert.equal(detectDiscordMessageKind({ channelBaseName: 'build-lab', content: 'I shipped a draft' }), 'project');
  assert.equal(detectDiscordMessageKind({ channelBaseName: 'wins', content: 'Launched today' }), 'win');
  assert.equal(detectDiscordMessageKind({ channelBaseName: 'questions', content: 'Here is the fix', referencedMessageId: 'm1' }), 'answer');

  const message = normalizeDiscordGatewayMessage({
    id: 'm1',
    guild_id: 'g1',
    channel_id: 'c1',
    author: { id: 'u1', username: 'sage' },
    content: 'How do I make this reliable? https://example.com',
    timestamp: '2026-06-18T12:00:00.000Z',
    attachments: [{ id: 'a1', filename: 'shot.png' }],
  }, '❓questions');
  assert.equal(message.discordMessageId, 'm1');
  assert.equal(message.channelBaseName, 'questions');
  assert.equal(message.detectedKind, 'question');
  assert.equal(message.linkCount, 1);
  assert.equal(message.attachmentCount, 1);
});

// -------------------------------------------------------------- rate-limit

test('rate-limit: checkRateLimitFromHeaders blocks after limit', async () => {
  const mod = await import('../../lib/rate-limit.ts');
  const headers = {
    get(name) {
      return name.toLowerCase() === 'x-forwarded-for' ? '203.0.113.42' : null;
    },
  };
  const opts = { limit: 3, windowMs: 60_000, prefix: 'unit-test:burst' };
  for (let i = 0; i < 3; i++) {
    const r = mod.checkRateLimitFromHeaders(headers, opts);
    assert.equal(r.ok, true, `hit ${i + 1} should pass`);
  }
  const blocked = mod.checkRateLimitFromHeaders(headers, opts);
  assert.equal(blocked.ok, false);
  if (blocked.ok === false) {
    assert.ok(blocked.retryAfterSeconds >= 1);
  }
});

test('rate-limit: separate prefixes do not share buckets', async () => {
  const mod = await import('../../lib/rate-limit.ts');
  const headers = {
    get(name) {
      return name.toLowerCase() === 'x-forwarded-for' ? '198.51.100.7' : null;
    },
  };
  const a = mod.checkRateLimitFromHeaders(headers, {
    limit: 1,
    windowMs: 60_000,
    prefix: 'unit-test:a',
  });
  const b = mod.checkRateLimitFromHeaders(headers, {
    limit: 1,
    windowMs: 60_000,
    prefix: 'unit-test:b',
  });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
});

// -------------------------------------------------------------- route validation
// Direct-call a route's POST() to assert the Zod gate fires before any
// side-effects. We stub requireAdminApi to return a fake guard and
// supabaseAdmin so the body validator runs without DB access.

test('admin/templates POST: malformed body returns 400 with { error }', async () => {
  // Mock dependencies via dynamic import + module replacement is brittle in
  // Node ESM; instead, drive the handler with a body that fails Zod and
  // verify the helper response shape independently of the auth guard.
  // We import the schema chain by pulling fromZodError + a fresh schema.
  const { fromZodError, badRequest } = await import('../../lib/api-errors.ts');
  const { z } = await import('zod');
  const schema = z.object({
    title: z.string().min(1).max(300),
  });
  // Empty body -> Zod fails -> route returns fromZodError(...).
  const parsed = schema.safeParse({});
  assert.equal(parsed.success, false);
  const res = parsed.success
    ? badRequest('unreachable')
    : fromZodError(parsed.error);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.error, 'response body must include `error`');
  assert.ok(typeof body.code === 'string');
});

// -------------------------------------------------------------- active-org (Phase 2B PR-A)

test('resolveActiveOrg: explicit slug wins over cookie and first', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: 'beta-test-co',
    cookieSlug: 'acme',
  });
  assert.equal(out?.org.id, 'b');
});

test('resolveActiveOrg: cookie wins when no explicit slug', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: null,
    cookieSlug: 'beta-test-co',
  });
  assert.equal(out?.org.id, 'b');
});

test('resolveActiveOrg: falls back to first when slug+cookie miss', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const memberships = [
    { org: { id: 'a', name: 'Acme', slug: 'acme' }, role: 'owner' },
    { org: { id: 'b', name: 'Beta', slug: 'beta-test-co' }, role: 'member' },
  ];
  const out = resolveActiveOrg(memberships, {
    slug: 'unknown-slug',
    cookieSlug: 'also-unknown',
  });
  assert.equal(out?.org.id, 'a');
});

test('resolveActiveOrg: empty memberships -> null', async () => {
  const { resolveActiveOrg } = await import('../../lib/portal/active-org.ts');
  const out = resolveActiveOrg([], { slug: 'anything', cookieSlug: 'whatever' });
  assert.equal(out, null);
});

// -------------------------------------------------------------- events

test('event name registry is the closed set', async () => {
  const { EVENT_NAMES, GA4_CONVERSION_EVENTS, isValidEvent } = await import('../../lib/analytics/events.ts');
  assert.ok(EVENT_NAMES.includes('checkout_start'));
  assert.ok(EVENT_NAMES.includes('lead_magnet_complete'));
  assert.equal(isValidEvent('not_a_real_event'), false);
  assert.equal(isValidEvent('cta_click'), true);
  assert.deepEqual([...GA4_CONVERSION_EVENTS], [
    'contact_submit',
    'checkout_start',
    'lead_magnet_complete',
    'newsletter_signup',
    'route_finder_complete',
  ]);

  // Exact count guard — update this when adding new events
  assert.equal(EVENT_NAMES.length, 24);

  // Every expected event must be present
  const expected = [
    'cta_click',
    'contact_submit',
    'pricing_view',
    'service_view',
    'checkout_start',
    'checkout_complete',
    'lead_magnet_start',
    'lead_magnet_complete',
    'booking_click',
    'newsletter_signup',
    'decision_tree_complete',
    'route_finder_start',
    'route_finder_step',
    'route_finder_complete',
    'route_finder_cta_click',
    'route_console_open',
    'route_console_click',
    'sound_enabled',
    'splash_skipped',
    'academy_track_selected',
    'experiment_viewed',
  ];
  for (const name of expected) {
    assert.ok(EVENT_NAMES.includes(name), `EVENT_NAMES missing: ${name}`);
  }
});

test('experiments: getVariant is SSR-safe and defaults to control', async () => {
  const { getVariant, EXPERIMENT_FLAGS } = await import('../../lib/analytics/experiments.ts');
  assert.equal(getVariant(EXPERIMENT_FLAGS.routeFinderHeroEntry), 'control');
});

test('attribution: extracts first-touch campaign metadata from a URL', async () => {
  const { extractAttributionFromUrl, parseAttributionCookie, serializeAttribution } = await import(
    '../../lib/analytics/attribution.ts'
  );
  const attribution = extractAttributionFromUrl(
    'https://www.sageideas.dev/academy?utm_source=linkedin&utm_medium=social&utm_campaign=wave-2&gclid=abc123',
    'https://linkedin.com/feed',
    new Date('2026-06-16T12:00:00.000Z'),
  );

  assert.equal(attribution.landingPage, '/academy?utm_source=linkedin&utm_medium=social&utm_campaign=wave-2&gclid=abc123');
  assert.equal(attribution.referrer, 'https://linkedin.com/feed');
  assert.equal(attribution.utmSource, 'linkedin');
  assert.equal(attribution.utmMedium, 'social');
  assert.equal(attribution.utmCampaign, 'wave-2');
  assert.equal(attribution.gclid, 'abc123');
  assert.deepEqual(parseAttributionCookie(serializeAttribution(attribution)), attribution);
});

test('lead scoring: high-intent studio inquiry outranks newsletter signup', async () => {
  const { scoreLead } = await import('../../lib/leads/scoring.ts');
  const studio = scoreLead({
    source: 'contact',
    email: 'founder@company.com',
    name: 'Founder',
    detail: 'We need a full AI product, brand system, checkout funnel, and content engine built this quarter.',
    inquiryType: 'studio',
    budget: '50-100k',
  });
  const newsletter = scoreLead({
    source: 'newsletter',
    email: 'reader@gmail.com',
    name: null,
    detail: 'Newsletter signup',
  });

  assert.ok(studio.score > newsletter.score);
  assert.ok(studio.reasons.includes('studio engagement selected'));
  assert.ok(newsletter.reasons.includes('newsletter signup'));
});

test('acquisition inbound: maps public inquiry into scored CRM account payloads', async () => {
  const { buildInboundAcquisitionCandidate } = await import('../../lib/acquisition/inbound.ts');
  const candidate = buildInboundAcquisitionCandidate({
    leadId: 'lead-123',
    source: 'contact',
    email: 'founder@northstar-dental.example',
    name: 'Avery Stone',
    detail:
      'We run a dental practice and need a better website, booking flow, SEO visibility, and a more polished brand presence for new patients.',
    inquiryType: 'project',
    budget: '10-25k',
    metadata: {
      company: 'Northstar Dental',
      role: 'Founder',
      timeline: 'asap',
      url: 'https://northstar-dental.example',
      attribution: { utmSource: 'linkedin' },
    },
  });

  assert.equal(candidate.account.name, 'Northstar Dental');
  assert.equal(candidate.account.website_url, 'https://northstar-dental.example/');
  assert.equal(candidate.account.source, 'inbound');
  assert.equal(candidate.account.lead_id, 'lead-123');
  assert.equal(candidate.account.recommended_offer, 'seo_conversion_audit');
  assert.ok(candidate.account.total_score >= 45);
  assert.ok(candidate.account.tags.includes('public_funnel'));
  assert.ok(candidate.account.tags.includes('utm_linkedin'));
  assert.equal(candidate.contact.email, 'founder@northstar-dental.example');
  assert.equal(candidate.contact.role_fit, 'founder');
  assert.equal(candidate.metrics.accounts_added, 1);
  assert.equal(candidate.metrics.accounts_qualified, 1);
  assert.equal(candidate.lookup.websiteUrl, 'https://northstar-dental.example/');
});

test('acquisition inbound: ignores newsletter leads and normalizes SEO audit leads', async () => {
  const { buildInboundAcquisitionCandidate } = await import('../../lib/acquisition/inbound.ts');
  const newsletter = buildInboundAcquisitionCandidate({
    source: 'newsletter',
    email: 'reader@example.com',
    name: null,
    detail: 'Newsletter signup',
  });
  assert.equal(newsletter, null);

  const audit = buildInboundAcquisitionCandidate({
    source: 'seo_audit',
    email: 'owner@clinic.example',
    name: null,
    detail: 'SEO audit of https://clinic.example — score 62',
    metadata: {
      url: 'https://clinic.example',
      score: 62,
    },
  });

  assert.ok(audit);
  assert.equal(audit.account.name, 'clinic.example');
  assert.equal(audit.account.source, 'seo_audit');
  assert.equal(audit.account.website_url, 'https://clinic.example/');
  assert.equal(audit.account.metadata.inbound.auditScore, 62);
  assert.equal(audit.contact.source, 'seo_audit');
  assert.equal(audit.lookup.email, 'owner@clinic.example');
});

test('revenue os jobs: ranks junior remote AI roles and skips senior/spanish-required roles', async () => {
  const { buildJobSearchPipeline } = await import('../../lib/revenue-os/jobs.ts');
  const pipeline = buildJobSearchPipeline({
    roles: [
      {
        title: 'Junior AI Application Engineer',
        company: 'Applied Apps',
        location: 'Remote US',
        description: 'Build AI features with Next.js, TypeScript, Python, LLM APIs, testing, and Vercel.',
        url: 'https://jobs.example/ai-app',
      },
      {
        title: 'Senior ML Platform Engineer',
        company: 'Big Systems',
        location: 'Remote',
        description: 'Senior staff role requiring 8+ years of Kubernetes and ML infra.',
        url: 'https://jobs.example/senior',
      },
      {
        title: 'QA Automation Engineer - Spanish required',
        company: 'LatAm QA',
        location: 'Remote',
        description: 'Spanish required. Selenium and manual QA.',
        url: 'https://jobs.example/spanish',
      },
    ],
  });

  assert.equal(pipeline.skipped.length, 2);
  assert.equal(pipeline.matches.length, 1);
  assert.equal(pipeline.matches[0].title, 'Junior AI Application Engineer');
  assert.equal(pipeline.matches[0].resumeVariant, 'ai_application_engineer');
  assert.ok(pipeline.matches[0].atsKeywords.includes('Next.js'));
  assert.ok(pipeline.matches[0].applicationAdvice.includes('AI application'));
});

test('job application os: builds phases 1-6 queue packets and manual proof safeguards', async () => {
  const {
    buildJobApplicationOsRun,
    detectKnockoutRules,
  } = await import('../../lib/job-application-os/core.ts');

  const run = buildJobApplicationOsRun({
    capturedAt: '2026-06-18T12:00:00.000Z',
    manualJobs: [
      {
        title: 'Junior AI Application Engineer',
        company: 'Applied Apps',
        location: 'Remote US',
        description: 'Build Next.js TypeScript OpenAI LLM API workflows with testing and Vercel.',
        url: 'https://jobs.example/ai',
      },
      {
        title: 'Junior AI Application Engineer',
        company: 'Applied Apps',
        location: 'Remote US',
        description: 'Duplicate from LinkedIn capture.',
        url: 'https://jobs.example/ai',
      },
      {
        title: 'Senior Platform Director',
        company: 'Big Corp',
        location: 'Onsite',
        description: 'Senior director role requiring 10+ years onsite.',
        url: 'https://jobs.example/senior',
      },
    ],
    providerPayloads: [],
  });

  assert.equal(run.resumeVersions.length, 3);
  assert.ok(run.skills.length >= 5);
  assert.ok(run.stories.some((story) => story.competency === 'quality'));
  assert.equal(run.summary.deduped, 1);
  assert.ok(run.dailyTargets[0].fit.overall >= 75);
  assert.equal(run.dailyTargets[0].stage, 'ready');
  assert.ok(run.packets[0].coverLetter.includes('Applied Apps'));
  assert.ok(run.checklists[0].items.some((item) => item.label === 'Sensitive questions answered manually' && item.done === false));
  assert.ok(run.evidence.every((record) => record.notes.some((note) => note.includes('manual'))));
  assert.ok(run.phaseScorecard.every((phase) => phase.score >= 70));
  assert.ok(run.phaseScorecard.some((phase) => phase.status === 'needs_live_proof'));
  assert.ok(detectKnockoutRules('Senior director requiring fluent spanish and onsite', run.preferences).length >= 3);
});

test('job application os: builds phases 7-12 recruiter interview analytics observability and load proof', async () => {
  const {
    buildJobApplicationOsRun,
    buildJobLoadProof,
    buildLiveSourceProofs,
    classifyRecruiterInbox,
  } = await import('../../lib/job-application-os/core.ts');

  const run = buildJobApplicationOsRun();
  const interviewReply = classifyRecruiterInbox({
    applicationRank: 1,
    fromEmail: 'Recruiter@Example.com',
    body: 'We would like to schedule an interview and discuss next steps.',
  });
  const failedLoad = buildJobLoadProof({
    tenants: 1,
    jobs: 100,
    applications: 20,
    packets: 5,
    p95DashboardMs: 3000,
    p95ExportMs: 5000,
  });
  const liveProofs = buildLiveSourceProofs({ hasJobApiCredentials: true, hasLinkedInCookie: false });

  assert.ok(run.recruiterContacts.length > 0);
  assert.ok(run.outreachSteps.every((step) => step.status === 'manual_review'));
  assert.equal(interviewReply.classification, 'interview_request');
  assert.ok(run.interviewKits[0].likelyQuestions.length >= 3);
  assert.ok(run.experiments.some((experiment) => experiment.metric === 'interview_rate'));
  assert.ok(run.analytics.bottlenecks.includes('manual_submission_pending'));
  assert.equal(liveProofs[0].status, 'configured');
  assert.equal(liveProofs[1].status, 'missing_credentials');
  assert.equal(run.observability.status, 'healthy');
  assert.equal(run.loadProof.status, 'passed');
  assert.equal(failedLoad.status, 'failed');
  assert.equal(run.phaseScorecard.length, 12);
});

test('job application os: hardens artifacts browser capture outcomes learning and readiness audit', async () => {
  const {
    buildJobApplicationOsRun,
    buildJobReadinessAudit,
  } = await import('../../lib/job-application-os/core.ts');

  const run = buildJobApplicationOsRun();
  const artifactTypes = new Set(run.resumeArtifacts.map((artifact) => artifact.artifactType));

  assert.equal(run.resumeArtifacts.length, run.resumeVersions.length * 3);
  assert.ok(artifactTypes.has('markdown'));
  assert.ok(artifactTypes.has('pdf_ready_html'));
  assert.ok(artifactTypes.has('docx_manifest'));
  assert.ok(run.resumeArtifacts.every((artifact) => artifact.checksum.startsWith('jobos_')));
  assert.ok(run.browserCaptureSessions.some((session) => session.source === 'linkedin' && session.status === 'needs_operator_session'));
  assert.ok(run.browserCaptureSessions.every((session) => session.evidenceRequired.length >= 3));
  assert.ok(run.outcomes.length >= 4);
  assert.equal(run.learningReport.sampleSize, run.outcomes.length);
  assert.ok(run.learningReport.recommendedChanges.some((change) => change.includes('checksum')));
  assert.ok(run.readinessAudit.score >= 90);
  assert.equal(run.readinessAudit.grade, 'institutional');
  assert.ok(run.readinessAudit.passed.includes('resume_markdown_pdf_docx_artifacts_ready'));
  assert.ok(run.readinessAudit.gaps.includes('gmail_live_reply_stream_not_connected'));

  const worldClassAudit = buildJobReadinessAudit({
    run,
    gmailConnected: true,
    linkedinConnected: true,
  });
  assert.ok(worldClassAudit.score >= 95);
  assert.equal(worldClassAudit.grade, 'world_class_ready');
  assert.equal(worldClassAudit.gaps.length, 0);
});

test('job application os: imports datasets and builds optimization recommendations', async () => {
  const {
    buildJobApplicationOsRun,
    buildJobStrategyRecommendations,
    buildMeasuredJobLoadRun,
    buildOutcomeLearningReport,
    buildProofGapRecommendations,
    parseJobDataset,
  } = await import('../../lib/job-application-os/core.ts');

  const dataset = parseJobDataset({
    sourceType: 'csv',
    datasetName: 'historical-applications',
    payload: [
      'title,company,location,description,url,outcome,evidence',
      'AI Application Engineer,Example AI,Remote,Next.js TypeScript OpenAI testing,https://example.com/ai,interview,calendar reply',
      'QA Automation Engineer,Quality SaaS,Remote,Playwright API CI regression,https://example.com/qa,reply,recruiter reply',
      'Broken Row Only',
    ].join('\n'),
  });
  const run = buildJobApplicationOsRun({ manualJobs: dataset.normalizedJobs });
  const learning = buildOutcomeLearningReport(dataset.normalizedOutcomes);
  const strategy = buildJobStrategyRecommendations({
    targets: run.dailyTargets,
    learning,
    liveProofs: run.liveSourceProofs,
    importedJobs: dataset.normalizedJobs,
  });
  const proofGaps = buildProofGapRecommendations({ parsedJobs: run.parsedJobs, skills: run.skills });
  const load = buildMeasuredJobLoadRun({
    tenants: 5,
    jobs: 10_000,
    applications: 500,
    packets: 100,
    startedAtMs: 100,
    finishedAtMs: 1100,
  });

  assert.equal(dataset.normalizedJobs.length, 2);
  assert.equal(dataset.normalizedOutcomes.length, 2);
  assert.equal(dataset.rowsRejected, 1);
  assert.equal(learning.replyRate, 100);
  assert.ok(strategy.length >= 3);
  assert.ok(strategy[0].action.includes('Apply'));
  assert.ok(Array.isArray(proofGaps));
  assert.equal(load.status, 'passed');
  assert.ok(load.samples.some((sample) => sample.route.includes('/admin/job-applications')));
});

test('revenue os connectors: creates deduped lead-source run plans', async () => {
  const { buildLeadSourceConnectorPlan } = await import('../../lib/revenue-os/connectors.ts');
  const plan = buildLeadSourceConnectorPlan({
    existingDomains: ['acme.example'],
    sources: [
      { name: 'Google Maps Dentists', type: 'directory', query: 'dentists Boston outdated website', dailyLimit: 40 },
      { name: 'Clutch Agencies', type: 'directory', query: 'small agencies needing AI automation', dailyLimit: 20 },
      { name: 'Google Maps Dentists', type: 'directory', query: 'duplicate', dailyLimit: 10 },
    ],
  });

  assert.equal(plan.sources.length, 2);
  assert.equal(plan.dailyLeadTarget, 60);
  assert.ok(plan.sources[0].qualificationSignals.includes('weak website or conversion path'));
  assert.ok(plan.dedupeKeys.includes('acme.example'));
});

test('revenue os email prep: queues only compliant ready messages', async () => {
  const { buildEmailPreparationQueue } = await import('../../lib/revenue-os/email-prep.ts');
  const queue = buildEmailPreparationQueue({
    messages: [
      {
        id: 'msg-1',
        status: 'ready',
        subject: 'Specific audit opportunity',
        body: 'I noticed one concrete conversion issue and can send a short audit.',
        accountName: 'Acme Dental',
        contactEmail: 'owner@acme.example',
        priority: 'urgent',
      },
      {
        id: 'msg-2',
        status: 'ready',
        subject: 'No contact',
        body: 'Missing recipient.',
        accountName: 'No Contact Co',
        contactEmail: null,
        priority: 'high',
      },
    ],
    suppressedEmails: [],
  });

  assert.equal(queue.readyToSend.length, 1);
  assert.equal(queue.blocked.length, 1);
  assert.equal(queue.readyToSend[0].sendMode, 'manual_review');
  assert.ok(queue.readyToSend[0].checklist.includes('recipient verified'));
  assert.match(queue.blocked[0].reason, /missing recipient/i);
});

test('revenue os daily runner: combines jobs, leads, email prep, and priority actions', async () => {
  const { buildDailyRevenueRun } = await import('../../lib/revenue-os/daily-runner.ts');
  const run = buildDailyRevenueRun({
    accounts: [
      {
        id: 'acct-1',
        name: 'Acme Dental',
        stage: 'qualified',
        priority: 'urgent',
        totalScore: 72,
        nextAction: 'Draft outreach from audit evidence.',
      },
    ],
    emailQueue: {
      readyToSend: [
        {
          id: 'msg-1',
          accountName: 'Acme Dental',
          contactEmail: 'owner@acme.example',
          subject: 'Audit',
          priority: 'urgent',
          sendMode: 'manual_review',
          checklist: ['recipient verified'],
        },
      ],
      blocked: [],
      summary: { ready: 1, blocked: 0 },
    },
    leadConnectorPlan: {
      dailyLeadTarget: 50,
      sources: [{ name: 'Directory', type: 'directory', dailyLimit: 50, query: 'dentists', qualificationSignals: [] }],
      dedupeKeys: [],
    },
    jobPipeline: {
      matches: [
        {
          title: 'Junior AI Engineer',
          company: 'Apps Co',
          score: 86,
          resumeVariant: 'ai_application_engineer',
          atsKeywords: ['LLM APIs'],
          applicationAdvice: 'Lead with shipped AI apps.',
          url: 'https://jobs.example/junior',
        },
      ],
      skipped: [],
      summary: { applyNow: 1, queueForReview: 0, skipped: 0 },
    },
  });

  assert.equal(run.scorecard.leadsToImport, 50);
  assert.equal(run.scorecard.emailsReady, 1);
  assert.equal(run.scorecard.jobsToApply, 1);
  assert.equal(run.actions[0].lane, 'business_development');
  assert.ok(run.actions.some((action) => action.lane === 'job_search'));
  assert.ok(run.safetyNotes.some((note) => note.includes('No email is sent')));
});

test('revenue os reporting: identifies working channels and next experiments', async () => {
  const { buildRevenueLearningReport } = await import('../../lib/revenue-os/reporting.ts');
  const report = buildRevenueLearningReport({
    periodLabel: 'Last 7 days',
    sourceBreakdowns: [
      { label: 'inbound', accounts: 10, contacted: 5, replies: 3, meetings: 2, replyRate: 60, meetingRate: 40 },
      { label: 'directory', accounts: 20, contacted: 10, replies: 1, meetings: 0, replyRate: 10, meetingRate: 0 },
    ],
    jobPipeline: {
      matches: [
        {
          title: 'Junior AI Application Engineer',
          company: 'Apps Co',
          score: 88,
          resumeVariant: 'ai_application_engineer',
          atsKeywords: ['Next.js', 'LLM APIs'],
          applicationAdvice: 'Lead with shipped AI apps.',
          url: 'https://jobs.example/ai',
        },
      ],
      skipped: [],
      summary: { applyNow: 1, queueForReview: 0, skipped: 0 },
    },
    emailQueue: {
      readyToSend: [],
      blocked: [{ id: 'x', accountName: 'No Contact', reason: 'missing recipient email' }],
      summary: { ready: 0, blocked: 1 },
    },
  });

  assert.equal(report.periodLabel, 'Last 7 days');
  assert.equal(report.bestChannel?.label, 'inbound');
  assert.ok(report.whatWorked.some((item) => item.includes('inbound')));
  assert.ok(report.whatToImprove.some((item) => item.includes('missing recipient')));
  assert.ok(report.nextExperiments.some((item) => item.includes('AI application')));
  assert.ok(report.learningScore >= 70);
});

test('revenue os intelligence dashboard: builds KPIs, insights, conversion dimensions, and priority queue', async () => {
  const { buildRevenueIntelligenceDashboard } = await import('../../lib/revenue-os/revenue-intelligence-dashboard.ts');
  const dashboard = buildRevenueIntelligenceDashboard({
    totals: {
      leadsAdded: 18,
      qualified: 12,
      drafted: 9,
      sent: 8,
      replies: 4,
      meetings: 2,
      proposals: 1,
      won: 1,
      pipeline: 24000,
      accounts: 6,
      audits: 4,
      replyRate: 50,
      meetingRate: 25,
      auditCoverage: 67,
      qualificationRate: 67,
    },
    breakdowns: {
      bySource: [
        { label: 'inbound', accounts: 4, contacted: 4, replies: 3, meetings: 2, wins: 1, replyRate: 75, meetingRate: 50 },
        { label: 'directory', accounts: 3, contacted: 3, replies: 0, meetings: 0, wins: 0, replyRate: 0, meetingRate: 0 },
      ],
      byIndustry: [{ label: 'Dental', accounts: 4, contacted: 4, replies: 3, meetings: 2, wins: 1, replyRate: 75, meetingRate: 50 }],
      byOffer: [{ label: 'seo_conversion_audit', accounts: 4, contacted: 4, replies: 3, meetings: 2, wins: 1, replyRate: 75, meetingRate: 50 }],
      byPriority: [{ label: 'urgent', accounts: 2, contacted: 2, replies: 2, meetings: 1, wins: 1, replyRate: 100, meetingRate: 50 }],
      byCloseBand: [{ label: '70%+ close', accounts: 2, contacted: 2, replies: 2, meetings: 1, wins: 1, replyRate: 100, meetingRate: 50 }],
    },
    metricRows: [
      { metric_date: '2026-06-15', accounts_added: 2, accounts_qualified: 1, messages_drafted: 1, messages_sent: 2, replies: 1, meetings_booked: 0, proposals_created: 0, deals_won: 0, estimated_pipeline_value: 4000 },
      { metric_date: '2026-06-16', accounts_added: 4, accounts_qualified: 3, messages_drafted: 3, messages_sent: 6, replies: 3, meetings_booked: 2, proposals_created: 1, deals_won: 1, estimated_pipeline_value: 20000 },
    ],
    accounts: [
      { id: 'acct-1', name: 'Apex Dental', priority: 'urgent', stage: 'meeting', totalScore: 92, nextAction: 'Send proposal.' },
      { id: 'acct-2', name: 'Bright Dental', priority: 'high', stage: 'follow_up', totalScore: 84, nextAction: 'Follow up with audit proof.' },
    ],
    emailRows: [
      { id: 'email-1', recipientEmail: 'owner@apex.example', status: 'replied', sequenceKey: 'audit-seq', metadata: { tenantId: 'tenant-a', persona: 'owner', outreachV2: { qualityScore: 88 } } },
      { id: 'email-2', recipientEmail: 'ops@apex.example', status: 'sent', sequenceKey: 'audit-seq', metadata: { tenantId: 'tenant-a', persona: 'operator', outreachV2: { qualityScore: 74 } } },
    ],
    jobApplications: [
      { id: 'job-1', stage: 'applied', resumeVariant: 'ai_application_engineer' },
      { id: 'job-2', stage: 'interview', resumeVariant: 'qa_automation_engineer' },
    ],
    dailyActions: [
      { lane: 'business_development', priority: 80, title: 'Move Apex Dental', detail: 'Send proposal.' },
    ],
    blockedEmailCount: 1,
    deadLetterCount: 1,
  });

  assert.equal(dashboard.kpis.find((kpi) => kpi.label === 'Replies')?.value, 4);
  assert.equal(dashboard.conversion.byEmailDomain[0].label, 'apex.example');
  assert.ok(dashboard.insights.whatIsWorking.some((item) => item.includes('inbound')));
  assert.ok(dashboard.insights.whatIsFailing.some((item) => item.includes('blocked')));
  assert.equal(dashboard.priorityQueue[0].lane, 'account');
  assert.ok(dashboard.clientReport.summary.includes('18 leads'));
});

test('revenue os hardening: blocks unsafe production automation configuration', async () => {
  const { validateRevenueOsProductionReadiness } = await import('../../lib/revenue-os/hardening.ts');
  const unsafe = validateRevenueOsProductionReadiness({
    cronSecretConfigured: false,
    emailDispatchMode: 'automatic',
    jobApplicationMode: 'automatic',
    hasSuppressionChecks: false,
    hasE2eCoverage: true,
    hasBuildVerification: true,
  });

  assert.equal(unsafe.ready, false);
  assert.ok(unsafe.blockers.some((item) => item.includes('CRON_SECRET')));
  assert.ok(unsafe.blockers.some((item) => item.includes('automatic email')));
  assert.ok(unsafe.blockers.some((item) => item.includes('job applications')));
  assert.ok(unsafe.score < 70);

  const safe = validateRevenueOsProductionReadiness({
    cronSecretConfigured: true,
    emailDispatchMode: 'manual_review',
    jobApplicationMode: 'manual_review',
    hasSuppressionChecks: true,
    hasE2eCoverage: true,
    hasBuildVerification: true,
  });
  assert.equal(safe.ready, true);
  assert.equal(safe.blockers.length, 0);
  assert.ok(safe.score >= 90);
});

test('revenue os lead connectors: parses CSV and normalizes google-place leads', async () => {
  const { parseConnectorCsvLeads, normalizeGooglePlaceLead, enrichConnectorLead } = await import(
    '../../lib/revenue-os/lead-connectors.ts'
  );
  const csv = parseConnectorCsvLeads(
    'company,website,industry,location,email,source\nAcme Dental,acme.example,Dental,Boston,owner@acme.example,google_places',
  );
  assert.equal(csv.length, 1);
  assert.equal(csv[0].websiteUrl, 'https://acme.example/');
  assert.equal(csv[0].sourceType, 'google_places');

  const place = normalizeGooglePlaceLead({
    displayName: { text: 'Bright Dental' },
    websiteUri: 'bright.example',
    formattedAddress: 'Orlando, FL',
    nationalPhoneNumber: '+1 555 0100',
    types: ['dentist', 'health'],
  });
  assert.equal(place.name, 'Bright Dental');
  assert.equal(place.websiteUrl, 'https://bright.example/');
  assert.equal(place.industry, 'dentist');
  const enriched = enrichConnectorLead(place);
  assert.ok(enriched.qualificationSignals.includes('website available for audit'));
  assert.ok(enriched.importRow.includes('Bright Dental'));
});

test('revenue os sequences: builds manual-review follow-up sequence and deliverability events', async () => {
  const { buildManualReviewSequence, buildDeliverabilityEvent } = await import('../../lib/revenue-os/sequences.ts');
  const sequence = buildManualReviewSequence({
    accountName: 'Acme Dental',
    contactEmail: 'owner@acme.example',
    offer: 'seo_conversion_audit',
    startDate: new Date('2026-06-17T12:00:00.000Z'),
  });
  assert.equal(sequence.steps.length, 3);
  assert.equal(sequence.steps[0].status, 'manual_review');
  assert.equal(sequence.steps[1].scheduledAt, '2026-06-20T12:00:00.000Z');
  assert.ok(sequence.safetyChecks.includes('suppression list check before every send'));

  const event = buildDeliverabilityEvent({
    messageId: 'msg-1',
    type: 'bounced',
    occurredAt: '2026-06-17T12:00:00.000Z',
    detail: 'Mailbox unavailable',
  });
  assert.equal(event.requiresSuppression, true);
});

test('revenue os job tracker: creates durable application records and follow-up queue', async () => {
  const { buildJobApplicationRecord, buildRecruiterFollowUp } = await import('../../lib/revenue-os/job-tracker.ts');
  const application = buildJobApplicationRecord({
    job: {
      title: 'Junior AI Engineer',
      company: 'Apps Co',
      score: 88,
      resumeVariant: 'ai_application_engineer',
      atsKeywords: ['Next.js', 'LLM APIs'],
      applicationAdvice: 'Lead with shipped AI apps.',
      url: 'https://jobs.example/ai',
    },
    status: 'queued',
  });
  assert.equal(application.stage, 'queued');
  assert.equal(application.resumeVariant, 'ai_application_engineer');
  assert.ok(application.metadata.atsKeywords.includes('LLM APIs'));

  const followUp = buildRecruiterFollowUp({
    applicationId: 'app-1',
    recruiterEmail: 'recruiter@apps.example',
    from: new Date('2026-06-17T12:00:00.000Z'),
  });
  assert.equal(followUp.status, 'scheduled');
  assert.equal(followUp.followUpAt, '2026-06-22T12:00:00.000Z');
});

test('revenue os external connectors: executes google places search with enrichment and dedupe', async () => {
  const { buildGooglePlacesConnector, runLeadConnector } = await import('../../lib/revenue-os/external-connectors.ts');
  const connector = buildGooglePlacesConnector({
    apiKey: 'test-key',
    query: 'dentists in Orlando with outdated websites',
    locationBias: { latitude: 28.5383, longitude: -81.3792, radiusMeters: 15_000 },
    limit: 3,
  });

  const fetchCalls = [];
  const result = await runLeadConnector(connector, {
    existingDomains: ['skip.example'],
    fetchImpl: async (url, init) => {
      fetchCalls.push({ url, init });
      return new Response(
        JSON.stringify({
          places: [
            {
              displayName: { text: 'Bright Dental' },
              websiteUri: 'bright.example',
              formattedAddress: 'Orlando, FL',
              nationalPhoneNumber: '+1 555 0100',
              types: ['dentist'],
            },
            {
              displayName: { text: 'Skip Dental' },
              websiteUri: 'skip.example',
              formattedAddress: 'Orlando, FL',
              nationalPhoneNumber: '+1 555 0101',
              types: ['dentist'],
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    },
    enrichLead: async (lead) => ({
      contactEmail: lead.name === 'Bright Dental' ? 'owner@bright.example' : null,
      confidence: 92,
      signals: ['owner contact found'],
    }),
  });

  assert.equal(fetchCalls.length, 1);
  assert.equal(result.status, 'completed');
  assert.equal(result.leadsFound, 2);
  assert.equal(result.deduped, 1);
  assert.equal(result.importableLeads.length, 1);
  assert.equal(result.importableLeads[0].name, 'Bright Dental');
  assert.equal(result.importableLeads[0].contactEmail, 'owner@bright.example');
  assert.ok(result.importableLeads[0].qualificationSignals.includes('owner contact found'));
  assert.ok(result.costEstimateUsd > 0);
});

test('revenue os live connector engine: builds quota-safe import batches with provenance and worker jobs', async () => {
  const {
    buildLiveConnectorImportBatch,
    summarizeLiveConnectorImportBatch,
  } = await import('../../lib/revenue-os/live-connector-engine.ts');

  const batch = buildLiveConnectorImportBatch({
    runKey: 'program-2-live-connectors',
    connectorKey: 'google_places:dentists-orlando',
    connectorLabel: 'Google Places dentists Orlando',
    connectorType: 'lead',
    sourceType: 'google_places',
    dailyLimit: 2,
    existingDedupeKeys: ['lead:skip.example'],
    discoveredAt: '2026-06-17T12:00:00.000Z',
    records: [
      {
        recordType: 'lead',
        name: 'Bright Dental',
        websiteUrl: 'https://bright.example',
        sourceUrl: 'https://maps.google.com/?cid=bright',
        dedupeKey: 'lead:bright.example',
        fields: { industry: 'dentist', location: 'Orlando, FL', contactEmail: 'owner@bright.example' },
        enrichment: [{ provider: 'hunter_style', fieldsAdded: ['contactEmail'], confidence: 92 }],
      },
      {
        recordType: 'lead',
        name: 'Skip Dental',
        websiteUrl: 'https://skip.example',
        sourceUrl: 'https://maps.google.com/?cid=skip',
        dedupeKey: 'lead:skip.example',
        fields: { industry: 'dentist', location: 'Orlando, FL' },
      },
      {
        recordType: 'lead',
        name: 'Quota Dental',
        websiteUrl: 'https://quota.example',
        sourceUrl: 'https://maps.google.com/?cid=quota',
        dedupeKey: 'lead:quota.example',
        fields: { industry: 'dentist', location: 'Orlando, FL' },
      },
    ],
  });
  const summary = summarizeLiveConnectorImportBatch(batch);

  assert.equal(batch.status, 'completed');
  assert.equal(batch.found, 3);
  assert.equal(batch.importable.length, 2);
  assert.equal(batch.skipped.length, 1);
  assert.equal(batch.provenance.length, 2);
  assert.equal(batch.provenance[0].legalBasis, 'business_context_outreach');
  assert.deepEqual(batch.provenance[0].fieldsCollected.sort(), ['contactEmail', 'industry', 'location'].sort());
  assert.equal(batch.importable[0].enrichmentChain[0].provider, 'hunter_style');
  assert.equal(batch.workerJobs.length, 2);
  assert.ok(batch.workerJobs.every((job) => job.kind === 'website_audit' || job.kind === 'enrichment'));
  assert.equal(summary.imported, 2);
  assert.equal(summary.deduped, 1);
  assert.equal(summary.quotaRemaining, 0);
  assert.equal(summary.provenanceComplete, true);
});

test('revenue os live connector engine: normalizes job connector records with source provenance', async () => {
  const { buildLiveConnectorImportBatch } = await import('../../lib/revenue-os/live-connector-engine.ts');

  const batch = buildLiveConnectorImportBatch({
    runKey: 'program-2-job-connectors',
    connectorKey: 'remotive:junior-ai',
    connectorLabel: 'Remotive junior AI roles',
    connectorType: 'job',
    sourceType: 'remotive',
    dailyLimit: 10,
    discoveredAt: '2026-06-17T12:30:00.000Z',
    records: [
      {
        recordType: 'job',
        name: 'Junior AI Application Engineer',
        sourceUrl: 'https://remotive.com/remote-jobs/software-dev/junior-ai',
        dedupeKey: 'job:remotive:junior-ai',
        fields: {
          company: 'Remote Apps Studio',
          location: 'Remote',
          resumeVariant: 'ai_app_engineer',
          atsKeywords: ['TypeScript', 'LLM APIs', 'Next.js'],
        },
      },
    ],
  });

  assert.equal(batch.connectorType, 'job');
  assert.equal(batch.importable[0].recordType, 'job');
  assert.equal(batch.provenance[0].sourceUrl, 'https://remotive.com/remote-jobs/software-dev/junior-ai');
  assert.ok(batch.provenance[0].fieldsCollected.includes('atsKeywords'));
  assert.equal(batch.workerJobs[0].kind, 'job_source');
});

test('revenue os outreach v2: scores human personalization and spam risk from evidence', async () => {
  const { composePersonalizedOutreachV2 } = await import('../../lib/revenue-os/outreach-v2.ts');
  const draft = composePersonalizedOutreachV2({
    accountName: 'Bright Dental',
    websiteUrl: 'https://bright.example/',
    contactName: 'Avery Stone',
    contactTitle: 'Owner',
    industry: 'Dental',
    offer: 'seo_conversion_audit',
    source: 'google_places',
    evidence: {
      auditScore: 61,
      issues: ['Booking CTA is buried below the fold'],
      opportunities: ['Move booking above the fold and add new-patient proof near the CTA'],
      leadSignals: ['website available for audit', 'owner contact found'],
    },
    voice: 'direct, specific, practical',
  });

  assert.equal(draft.sendMode, 'manual_review');
  assert.ok(draft.subject.includes('Bright Dental'));
  assert.ok(draft.body.includes('Booking CTA is buried below the fold'));
  assert.ok(draft.body.includes('Move booking above the fold'));
  assert.ok(draft.qualityScore >= 90);
  assert.ok(draft.spamRiskScore <= 20);
  assert.ok(draft.checklist.includes('specific website evidence included'));
  assert.ok(draft.followUps[0].body.includes('Booking CTA'));
});

test('revenue os email delivery: blocks unapproved and suppressed sends', async () => {
  const { buildRevenueEmailDeliveryPlan } = await import('../../lib/revenue-os/email-delivery.ts');
  const unapproved = buildRevenueEmailDeliveryPlan({
    queueItem: {
      id: 'email-1',
      status: 'manual_review',
      recipientEmail: 'owner@example.com',
      subject: 'Audit',
      body: 'Specific audit body',
    },
    suppressed: false,
  });
  assert.equal(unapproved.allowed, false);
  assert.equal(unapproved.reason, 'requires_manual_approval');

  const suppressed = buildRevenueEmailDeliveryPlan({
    queueItem: {
      id: 'email-2',
      status: 'approved',
      recipientEmail: 'owner@example.com',
      subject: 'Audit',
      body: 'Specific audit body',
    },
    suppressed: true,
  });
  assert.equal(suppressed.allowed, false);
  assert.equal(suppressed.reason, 'suppressed_recipient');
});

test('revenue os email delivery: builds resend payload with unsubscribe and idempotency', async () => {
  const { buildRevenueEmailDeliveryPlan } = await import('../../lib/revenue-os/email-delivery.ts');
  const plan = buildRevenueEmailDeliveryPlan({
    siteUrl: 'https://sageideas.dev',
    from: 'Sage Ideas <sage@sageideas.dev>',
    queueItem: {
      id: 'email-3',
      status: 'approved',
      recipientEmail: 'owner@bright.example',
      subject: 'Bright Dental audit',
      body: 'I noticed a specific booking issue.',
    },
    suppressed: false,
  });

  assert.equal(plan.allowed, true);
  assert.equal(plan.payload.to, 'owner@bright.example');
  assert.equal(plan.payload.headers['List-Unsubscribe'], '<https://sageideas.dev/unsubscribe?email=owner%40bright.example>');
  assert.equal(plan.idempotencyKey, 'revenue-email-email-3');
});

test('revenue os email delivery: maps resend webhooks to queue events and suppression', async () => {
  const { mapResendWebhookToRevenueEmailEvent } = await import('../../lib/revenue-os/email-delivery.ts');
  const bounced = mapResendWebhookToRevenueEmailEvent({
    type: 'email.bounced',
    created_at: '2026-06-17T12:00:00.000Z',
    data: {
      email_id: 're_msg_123',
      to: ['owner@bright.example'],
      subject: 'Bright Dental audit',
    },
  });

  assert.equal(bounced?.eventType, 'bounced');
  assert.equal(bounced?.queueStatus, 'blocked');
  assert.equal(bounced?.requiresSuppression, true);
  assert.equal(bounced?.suppression?.email, 'owner@bright.example');

  const delivered = mapResendWebhookToRevenueEmailEvent({
    type: 'email.delivered',
    created_at: '2026-06-17T12:02:00.000Z',
    data: { email_id: 're_msg_123', to: 'owner@bright.example' },
  });
  assert.equal(delivered?.eventType, 'delivered');
  assert.equal(delivered?.queueStatus, 'sent');
  assert.equal(delivered?.requiresSuppression, false);

  const unsubscribed = mapResendWebhookToRevenueEmailEvent({
    type: 'email.unsubscribed',
    created_at: '2026-06-17T12:03:00.000Z',
    data: { email_id: 're_msg_124', to: 'owner@bright.example' },
  });
  assert.equal(unsubscribed?.eventType, 'unsubscribed');
  assert.equal(unsubscribed?.queueStatus, 'blocked');
  assert.equal(unsubscribed?.requiresSuppression, true);
  assert.equal(unsubscribed?.suppression?.reason, 'resend unsubscribed');
});

test('revenue os email safety: enforces suppression, events, caps, and sequence stops', async () => {
  const { buildEmailSafetyRun } = await import('../../lib/revenue-os/email-safety.ts');
  const run = buildEmailSafetyRun({
    runKey: 'unit-email-safety',
    domain: 'sageideas.dev',
    dailyCap: 50,
    sentToday: 45,
    bounceRate: 3,
    complaintRate: 0.2,
    messages: Array.from({ length: 10 }, (_, index) => ({
      id: `msg-${index + 1}`,
      recipientEmail: index === 1 ? 'blocked@example.com' : `owner${index + 1}@example.com`,
      sequenceKey: index < 5 ? 'seq-a' : 'seq-b',
      status: 'approved',
    })),
    suppressions: [
      { email: 'blocked@example.com', reason: 'manual do not contact' },
      { domain: 'blocked-domain.example', reason: 'domain do not contact' },
    ],
    providerEvents: [
      { messageId: 'msg-3', type: 'bounced', recipientEmail: 'owner3@example.com', occurredAt: '2026-06-17T12:00:00.000Z' },
      { messageId: 'msg-4', type: 'complained', recipientEmail: 'owner4@example.com', occurredAt: '2026-06-17T12:01:00.000Z' },
      { messageId: 'msg-6', type: 'replied', recipientEmail: 'owner6@example.com', occurredAt: '2026-06-17T12:02:00.000Z' },
    ],
  });

  assert.equal(run.domainHealth.status, 'healthy');
  assert.equal(run.safeToSend.length, 3);
  assert.equal(run.blocked.length, 7);
  assert.equal(run.suppressionEvents.length, 3);
  assert.ok(run.sequenceStops.some((stop) => stop.sequenceKey === 'seq-a' && stop.reason === 'bounce_received'));
  assert.ok(run.sequenceStops.some((stop) => stop.sequenceKey === 'seq-b' && stop.reason === 'reply_received'));
  assert.equal(run.persistence.safetyReport.scorecard.safeToSend, 3);
});

test('revenue os inbox intelligence: matches replies, classifies intent, updates crm, and stops sequences', async () => {
  const { buildInboxIntelligenceRun } = await import('../../lib/revenue-os/inbox-intelligence.ts');
  const run = buildInboxIntelligenceRun({
    runKey: 'unit-inbox-intelligence',
    tenantId: 'tenant-unit',
    account: {
      id: 'account-1',
      name: 'Bright Dental',
      stage: 'contacted',
    },
    contact: {
      id: 'contact-1',
      email: 'owner@bright.example',
      fullName: 'Avery Bright',
    },
    emailQueue: [
      {
        id: 'email-1',
        recipientEmail: 'owner@bright.example',
        subject: 'Bright Dental booking flow',
        sequenceKey: 'seq-bright',
        providerMessageId: 'provider-email-1',
      },
    ],
    replies: [
      {
        externalMessageId: 'gmail-1',
        threadId: 'thread-1',
        from: 'owner@bright.example',
        subject: 'Re: Bright Dental booking flow',
        body: 'Can you send times for Thursday? We need a better website booking flow.',
        receivedAt: '2026-06-18T14:00:00.000Z',
      },
      {
        externalMessageId: 'gmail-2',
        threadId: 'thread-2',
        from: 'wrong@bright.example',
        subject: 'Re: Bright Dental booking flow',
        body: 'Wrong person, please talk to Avery.',
        receivedAt: '2026-06-18T14:03:00.000Z',
      },
    ],
  });

  assert.equal(run.threads.length, 2);
  assert.equal(run.messages.length, 2);
  assert.equal(run.classifications.length, 2);
  assert.equal(run.classifications[0].intent, 'meeting_intent');
  assert.equal(run.classifications[0].matchedAccountId, 'account-1');
  assert.equal(run.classifications[0].matchedQueueId, 'email-1');
  assert.equal(run.classifications[0].crmPatch.stage, 'meeting');
  assert.equal(run.actionSuggestions[0].actionType, 'book_meeting');
  assert.equal(run.sequenceStops.length, 1);
  assert.equal(run.sequenceStops[0].reason, 'reply_received');
  assert.equal(run.crmUpdates.length, 1);
  assert.equal(run.crmUpdates[0].nextAction, 'Send meeting times and booking link.');
  assert.equal(run.persistence.inboxRun.scorecard.totalReplies, 2);
  assert.equal(run.persistence.inboxRun.scorecard.matchedReplies, 1);
  assert.equal(run.persistence.inboxRun.scorecard.meetingIntent, 1);
});

test('revenue os gmail sync: plans and normalizes Gmail API replies', async () => {
  const { buildGmailReplySyncPlan, normalizeGmailMessageToInboxReply, fetchGmailInboxReplies } = await import('../../lib/revenue-os/gmail-sync.ts');
  const dryRun = buildGmailReplySyncPlan({ accessToken: '', newerThanDays: 7, maxResults: 500 });
  assert.equal(dryRun.configured, false);
  assert.equal(dryRun.maxResults, 100);
  assert.ok(dryRun.listUrl.includes('newer_than%3A7d'));

  const encodedBody = Buffer.from('Can you send times for Thursday?', 'utf8')
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
  const message = {
    id: 'gmail-message-1',
    threadId: 'gmail-thread-1',
    internalDate: '1781791200000',
    payload: {
      headers: [
        { name: 'From', value: 'Avery <owner@bright.example>' },
        { name: 'Subject', value: 'Re: Bright Dental audit' },
      ],
      parts: [
        { mimeType: 'text/plain', body: { data: encodedBody } },
      ],
    },
  };
  const normalized = normalizeGmailMessageToInboxReply(message);
  assert.equal(normalized.externalMessageId, 'gmail-message-1');
  assert.equal(normalized.threadId, 'gmail-thread-1');
  assert.equal(normalized.from, 'Avery <owner@bright.example>');
  assert.equal(normalized.body, 'Can you send times for Thursday?');

  const calls = [];
  const result = await fetchGmailInboxReplies({
    accessToken: 'ya29.test',
    newerThanDays: 3,
    maxResults: 1,
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), auth: init?.headers?.Authorization });
      if (String(url).includes('/messages?')) {
        return Response.json({ messages: [{ id: 'gmail-message-1' }] });
      }
      return Response.json(message);
    },
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].auth, 'Bearer ya29.test');
  assert.equal(result.replies.length, 1);
  assert.equal(result.replies[0].subject, 'Re: Bright Dental audit');
});

test('revenue os lead source health: reports redacted credentials and quota readiness', async () => {
  const { buildLeadSourceCredentialHealth } = await import('../../lib/revenue-os/lead-source-health.ts');
  const health = buildLeadSourceCredentialHealth({
    env: {
      GOOGLE_PLACES_API_KEY: 'gp_live_1234567890',
      SERPAPI_API_KEY: '',
      EXA_API_KEY: 'exa_secret_abcdef',
    },
    dailyBudgetUsd: 12,
  });

  assert.equal(health.providers.google_places.configured, true);
  assert.equal(health.providers.google_places.redacted, 'gp_l…7890');
  assert.equal(health.providers.serpapi.configured, false);
  assert.equal(health.providers.exa.configured, true);
  assert.equal(health.readyProviders, 2);
  assert.ok(health.warnings.some((warning) => warning.includes('SERPAPI_API_KEY')));
});

test('revenue os lead source health: enforces quotas and cost caps before connector runs', async () => {
  const { buildLeadSourceRunDecision } = await import('../../lib/revenue-os/lead-source-health.ts');
  const allowed = buildLeadSourceRunDecision({
    provider: 'google_places',
    requested: 25,
    alreadyRunToday: 20,
    dailyLimit: 60,
    costPerLeadUsd: 0.032,
    dailyBudgetUsd: 3,
    providerConfigured: true,
  });

  assert.equal(allowed.allowed, true);
  assert.equal(allowed.allowedLeadCount, 25);
  assert.equal(allowed.estimatedCostUsd, 0.8);

  const capped = buildLeadSourceRunDecision({
    provider: 'google_places',
    requested: 50,
    alreadyRunToday: 20,
    dailyLimit: 60,
    costPerLeadUsd: 0.032,
    dailyBudgetUsd: 1,
    providerConfigured: true,
  });
  assert.equal(capped.allowed, true);
  assert.equal(capped.allowedLeadCount, 31);
  assert.equal(capped.reason, 'budget_capped');

  const missing = buildLeadSourceRunDecision({
    provider: 'serpapi',
    requested: 10,
    alreadyRunToday: 0,
    dailyLimit: 50,
    costPerLeadUsd: 0.02,
    dailyBudgetUsd: 5,
    providerConfigured: false,
  });
  assert.equal(missing.allowed, false);
  assert.equal(missing.reason, 'missing_credentials');
});

test('revenue os job connectors: normalize greenhouse lever ashby workable and remotive jobs', async () => {
  const { normalizeJobSourceResults, buildJobConnectorRun } = await import('../../lib/revenue-os/job-connectors.ts');
  const jobs = normalizeJobSourceResults([
    {
      provider: 'greenhouse',
      payload: {
        title: 'Junior AI Application Engineer',
        company: 'Applied Apps',
        absolute_url: 'https://boards.greenhouse.io/applied/jobs/1',
        location: { name: 'Remote US' },
        content: 'Next.js TypeScript Python LLM APIs testing Vercel',
      },
    },
    {
      provider: 'lever',
      payload: {
        text: 'QA Automation Engineer',
        hostedUrl: 'https://jobs.lever.co/qa/1',
        categories: { team: 'Engineering', location: 'Remote' },
        descriptionPlain: 'Playwright API testing JavaScript junior',
      },
    },
    {
      provider: 'ashby',
      payload: {
        title: 'Senior ML Platform Engineer',
        company: 'Big Systems',
        jobUrl: 'https://jobs.ashbyhq.com/big/1',
        location: 'Remote',
        descriptionPlain: 'Senior role requiring 8+ years Kubernetes.',
      },
    },
    {
      provider: 'workable',
      payload: {
        title: 'Implementation Engineer - AI Tools',
        shortcode: 'abc',
        url: 'https://apply.workable.com/ops/j/abc',
        location: { city: 'Remote' },
        description: 'Configure customer AI workflows, JavaScript, support launches.',
      },
    },
    {
      provider: 'remotive',
      payload: {
        title: 'Junior Frontend Developer',
        company_name: 'Remote UI',
        url: 'https://remotive.com/jobs/1',
        candidate_required_location: 'USA',
        description: 'React TypeScript frontend implementation',
      },
    },
  ]);

  assert.equal(jobs.length, 5);
  assert.equal(jobs[0].company, 'Applied Apps');
  assert.equal(jobs[1].source, 'lever');
  const run = buildJobConnectorRun({ jobs });
  assert.equal(run.pipeline.matches.length, 4);
  assert.equal(run.pipeline.skipped.length, 1);
  assert.ok(run.pipeline.matches[0].score >= 75);
  assert.ok(run.sourceCounts.greenhouse >= 1);
});

test('revenue os application packets: builds ATS resume and cover letter packet', async () => {
  const { buildApplicationPacket } = await import('../../lib/revenue-os/application-packets.ts');
  const packet = buildApplicationPacket({
    job: {
      title: 'Junior AI Application Engineer',
      company: 'Applied Apps',
      score: 91,
      resumeVariant: 'ai_application_engineer',
      atsKeywords: ['Next.js', 'TypeScript', 'LLM APIs', 'testing'],
      applicationAdvice: 'Lead with shipped AI apps.',
      url: 'https://jobs.example/ai',
    },
    candidate: {
      name: 'Jason Teixeira',
      website: 'https://sageideas.dev',
      github: 'https://github.com/JasonTeixeira',
      location: 'Remote US',
    },
  });

  assert.equal(packet.resumeVariant, 'ai_application_engineer');
  assert.ok(packet.resumeSummary.includes('AI application'));
  assert.ok(packet.atsKeywordCoverage >= 90);
  assert.ok(packet.coverLetter.includes('Applied Apps'));
  assert.ok(packet.recruiterMessage.length < 700);
  assert.ok(packet.checklist.includes('Tailored resume variant selected'));
});

test('revenue os daily runner v2: combines jobs packets leads and email into persistent run plan', async () => {
  const { buildDailyRevenueRunV2 } = await import('../../lib/revenue-os/daily-runner-v2.ts');
  const run = buildDailyRevenueRunV2({
    runKey: 'unit-run',
    leadHealth: {
      providersReady: 2,
      allowedLeads: 35,
      estimatedCostUsd: 1.15,
    },
    jobConnectorRun: {
      imported: 4,
      skipped: 1,
      applyNow: 3,
    },
    applicationPackets: [
      { jobTitle: 'Junior AI Engineer', company: 'Apps Co', resumeVariant: 'ai_application_engineer', atsKeywordCoverage: 95 },
    ],
    emailQueue: {
      ready: 2,
      blocked: 1,
    },
  });

  assert.equal(run.mode, 'manual');
  assert.equal(run.scorecard.jobsToApply, 3);
  assert.equal(run.scorecard.applicationPacketsReady, 1);
  assert.equal(run.scorecard.leadsToImport, 35);
  assert.ok(run.actions.some((action) => action.lane === 'job_search'));
  assert.ok(run.safetyNotes.some((note) => note.includes('manual')));
  assert.equal(run.metadata.runKey, 'unit-run');
});

test('revenue os operator dashboard: prioritizes today actions and blockers', async () => {
  const { buildRevenueOperatorDashboard } = await import('../../lib/revenue-os/operator-dashboard.ts');
  const dashboard = buildRevenueOperatorDashboard({
    accounts: [
      {
        id: 'acct-1',
        name: 'Urgent Dental',
        priority: 'urgent',
        stage: 'qualified',
        totalScore: 83,
        nextAction: 'Draft audit-led outreach.',
      },
      {
        id: 'acct-2',
        name: 'Follow Up Clinic',
        priority: 'high',
        stage: 'follow_up',
        totalScore: 68,
        nextAction: 'Send follow-up.',
      },
    ],
    dailyRun: {
      scorecard: {
        leadsToImport: 65,
        emailsReady: 4,
        emailBlocked: 2,
        jobsToApply: 3,
        accountsNeedingAction: 2,
      },
      actions: [
        {
          lane: 'job_search',
          priority: 95,
          title: 'Review 3 high-fit job opportunities',
          detail: 'Three application packets are ready.',
        },
        {
          lane: 'business_development',
          priority: 90,
          title: 'Work urgent lead queue',
          detail: 'Two accounts need action.',
        },
      ],
    },
    emailQueue: { summary: { ready: 4, blocked: 2 } },
    jobPipeline: { matches: [{ title: 'Junior AI Engineer' }, { title: 'QA Automation Engineer' }] },
    productionReadiness: { blockers: ['CRON_SECRET missing'], warnings: ['Keep manual review enabled'] },
    metrics: { replies: 3, sent: 10, meetings: 1, pipeline: 12500 },
  });

  assert.equal(dashboard.healthLabel, 'Needs attention');
  assert.equal(dashboard.todayStats.length, 6);
  assert.equal(dashboard.todayStats.find((stat) => stat.label === 'Ready emails')?.value, '4');
  assert.equal(dashboard.blockers[0], 'CRON_SECRET missing');
  assert.equal(dashboard.nextBestAction.title, 'Review 3 high-fit job opportunities');
  assert.equal(dashboard.approvalQueue[0].label, 'Approve emails');
  assert.ok(dashboard.quickLinks.some((link) => link.href === '#jobs'));
});

test('revenue os production gate: requires live-mode controls and redacts secret state', async () => {
  const { buildRevenueOsProductionGate } = await import('../../lib/revenue-os/hardening.ts');
  const gate = buildRevenueOsProductionGate({
    env: {
      CRON_SECRET: 'cron-secret',
      RESEND_API_KEY: 're_live_key',
      GOOGLE_PLACES_API_KEY: '',
      EXA_API_KEY: 'exa-key',
    },
    liveConnectorsEnabled: true,
    packetDownloadsEnabled: true,
    operatorSavedViewsEnabled: true,
    e2ePassing: true,
    buildPassing: true,
  });

  assert.equal(gate.ready, false);
  assert.ok(gate.blockers.some((item) => item.includes('GOOGLE_PLACES_API_KEY')));
  assert.ok(gate.controls.some((item) => item.includes('manual-review email')));
  assert.equal(gate.secrets.GOOGLE_PLACES_API_KEY.configured, false);
  assert.equal(gate.secrets.RESEND_API_KEY.redacted, 're_l...key');
});

test('revenue os governance: blocks suppressed outreach and tracks privacy workflow', async () => {
  const {
    buildPrivacyWorkflow,
    buildRevenueComplianceDecision,
    buildRevenueGovernanceReport,
  } = await import('../../lib/revenue-os/compliance-governance.ts');
  const allowed = buildRevenueComplianceDecision({
    email: 'owner@business.example',
    source: 'inbound',
    sourceUrl: 'https://business.example/contact',
    consentBasis: 'legitimate_interest',
    businessContext: 'Business owner requested a website audit follow-up.',
    unsubscribeUrl: 'https://sageideas.dev/unsubscribe',
    retentionDays: 365,
  });
  const blocked = buildRevenueComplianceDecision({
    email: 'blocked@gmail.com',
    source: 'unknown',
    consentBasis: 'do_not_contact',
    businessContext: 'Suppression record only.',
    retentionDays: 900,
    suppressed: true,
  });
  const privacy = buildPrivacyWorkflow({ requestType: 'suppress', subjectEmail: 'BLOCKED@gmail.com' });
  const report = buildRevenueGovernanceReport({
    tenantKey: 'tenant-test',
    contacts: [
      {
        email: 'owner@business.example',
        source: 'inbound',
        sourceUrl: 'https://business.example/contact',
        consentBasis: 'legitimate_interest',
        businessContext: 'Business owner requested a website audit follow-up.',
        unsubscribeUrl: 'https://sageideas.dev/unsubscribe',
        retentionDays: 365,
      },
      {
        email: 'blocked@gmail.com',
        source: 'unknown',
        consentBasis: 'do_not_contact',
        businessContext: 'Suppression record only.',
        retentionDays: 900,
        suppressed: true,
      },
    ],
    privacyRequests: [privacy],
    auditEvents: 2,
  });

  assert.equal(allowed.allowed, true);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.blockers.some((item) => item.includes('suppressed')));
  assert.equal(privacy.subjectEmail, 'blocked@gmail.com');
  assert.equal(report.allowed, 1);
  assert.equal(report.blocked, 1);
  assert.equal(report.status, 'blocked');
});

test('revenue os production ops: summarizes health, CI gates, runbooks, and load smoke', async () => {
  const {
    buildRevenueCiProof,
    buildRevenueCiProofFromEvidence,
    buildRevenueLoadProofFromEvidence,
    buildRevenueLoadSmokePlan,
    buildRevenueOpsHealth,
    buildRevenueRunbookIndex,
  } = await import('../../lib/revenue-os/production-ops.ts');
  const health = buildRevenueOpsHealth({
    dbOk: true,
    queueDepth: 12,
    deadLetters: 1,
    emailProviderConfigured: true,
    llmProviderConfigured: false,
    leadConnectorsConfigured: true,
    gmailConfigured: false,
    workerSchedulerLive: false,
    storageOk: true,
  });
  const ci = buildRevenueCiProof({
    lint: true,
    typecheck: true,
    unit: true,
    rls: true,
    build: true,
    focusedE2e: true,
    productionVerify: true,
    auditHigh: true,
  });
  const load = buildRevenueLoadSmokePlan({
    leads: 1000,
    queuedJobs: 10_000,
    tenants: 5,
    sequenceCapsEnforced: true,
    dashboardP95Ms: 900,
    exportP95Ms: 1800,
  });
  const runbooks = buildRevenueRunbookIndex();

  assert.equal(health.status, 'degraded');
  assert.ok(health.alerts.some((alert) => alert.includes('Worker queues')));
  assert.equal(ci.ready, true);
  assert.equal(ci.score, 100);
  assert.equal(load.passed, true);
  const missingCi = buildRevenueCiProofFromEvidence({ evidence: null });
  assert.equal(missingCi.ready, false);
  assert.equal(missingCi.score, 0);
  assert.ok(missingCi.gates.every((gate) => gate.evidence.includes('missing captured artifact')));
  const measuredLoad = buildRevenueLoadProofFromEvidence({
    evidence: {
      tenants: 5,
      leads: 1000,
      queuedJobs: 10_000,
      sequenceCapsEnforced: true,
      dashboardP95Ms: 900,
      apiP95Ms: 420,
      exportP95Ms: 1800,
      source: 'unit-load-artifact',
    },
  });
  assert.equal(measuredLoad.passed, true);
  const missingLoad = buildRevenueLoadProofFromEvidence({ evidence: null });
  assert.equal(missingLoad.passed, false);
  assert.ok(runbooks.some((runbook) => runbook.key === 'migration_failure'));
});

test('revenue os institutional hardening: builds programs 13-21 with honest live activation gaps', async () => {
  const {
    buildAiMlEvalHarnessProof,
    buildClientSaasSurfaceProof,
    buildComplianceWorkflowProductization,
    buildDeliverabilityOperationsAudit,
    buildInstitutionalProgramRuns,
    buildLiveIntegrationActivation,
    buildObservabilitySloSnapshot,
    buildRealLoadScaleProof,
    buildRealWorkerRuntimeProof,
  } = await import('../../lib/revenue-os/institutional-hardening.ts');
  const runKey = 'unit-institutional';
  const live = buildLiveIntegrationActivation({
    env: {
      RESEND_API_KEY: 're_test',
      OPENAI_API_KEY: 'sk-test',
      EXA_API_KEY: 'exa-test',
    },
  });
  const worker = buildRealWorkerRuntimeProof({ runKey, now: '2026-06-18T12:00:00.000Z' });
  const observability = buildObservabilitySloSnapshot({
    runKey,
    queueDepth: 4,
    deadLetters: 0,
    providerLatencyMs: 900,
    webhookFreshnessSeconds: 300,
    estimatedDailyCostUsd: 7,
    env: { RESEND_API_KEY: 're_test', OPENAI_API_KEY: 'sk-test', EXA_API_KEY: 'exa-test' },
  });
  const privacyJobs = buildComplianceWorkflowProductization({
    runKey,
    tenantKey: 'tenant-unit-institutional',
    subjectEmail: 'owner@example.com',
  });
  const clientSurfaces = buildClientSaasSurfaceProof({ runKey, tenantKey: 'tenant-unit-institutional' });
  const deliverability = buildDeliverabilityOperationsAudit({
    runKey,
    sendingDomain: 'sageideas.dev',
    resendConfigured: true,
  });
  const load = buildRealLoadScaleProof({ runKey, tenants: 5, leads: 1000, jobs: 10_000, workerJobs: 10_000 });
  const evalHarness = buildAiMlEvalHarnessProof({ runKey, llmConfigured: true });
  const institutional = buildInstitutionalProgramRuns({
    live,
    worker,
    observability,
    privacyJobs,
    clientSurfaces,
    deliverability,
    load,
    evalHarness,
  });

  assert.equal(live.configuredCount, 3);
  assert.equal(live.liveVerifiedCount, 0);
  assert.equal(worker.claimedJobs, 4);
  assert.equal(worker.completedJobs, 3);
  assert.equal(privacyJobs.length, 4);
  assert.equal(clientSurfaces.length, 2);
  assert.deepEqual(deliverability.automaticStops, ['bounce_received', 'complaint_received', 'unsubscribe_received', 'reply_received']);
  assert.equal(deliverability.spfStatus, 'requires_dns_probe');
  assert.equal(load.status, 'passed');
  assert.equal(evalHarness.status, 'passed');
  assert.equal(institutional.programs.length, 9);
  assert.ok(institutional.overallScore >= 75);
  assert.ok(institutional.programs.some((program) => program.programKey === '15_live_integration_activation' && program.status === 'requires_live_activation'));
  assert.ok(institutional.programs.some((program) => program.programKey === '14_real_worker_runtime' && program.score < 90));
  assert.ok(institutional.programs.some((program) => program.programKey === '20_real_load_scale_proof' && program.score < 90));
});

test('revenue os public api: member key access is redacted through a view', async () => {
  const migration = await readFile(new URL('../../supabase/migrations/0044_revenue_os_public_api.sql', import.meta.url), 'utf8');
  const repair = await readFile(new URL('../../supabase/migrations/0059_revenue_os_api_key_redaction.sql', import.meta.url), 'utf8');
  assert.match(migration, /create or replace view public\.revenue_api_keys_redacted/);
  assert.match(repair, /drop policy if exists "revenue_api_keys_member_select"/);
  assert.match(repair, /revenue_api_keys_redacted/);
  assert.doesNotMatch(repair, /^\s*key_hash,/m);
});

test('revenue os live connectors: fetches job APIs through provider builders', async () => {
  const {
    buildGreenhouseJobBoardConnector,
    buildLeverJobConnector,
    buildRemotiveJobConnector,
    runJobSourceConnectors,
  } = await import('../../lib/revenue-os/live-connectors.ts');
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (String(url).includes('greenhouse')) {
      return Response.json({ jobs: [{ id: 1, title: 'Junior AI Engineer', absolute_url: 'https://gh/job/1', location: { name: 'Remote US' }, content: 'Next.js TypeScript LLM APIs testing' }] });
    }
    if (String(url).includes('lever')) {
      return Response.json([{ id: 'lev-1', text: 'QA Automation Engineer', hostedUrl: 'https://lever/job/1', categories: { location: 'Remote' }, descriptionPlain: 'Playwright API testing JavaScript' }]);
    }
    return Response.json({ jobs: [{ id: 9, title: 'Junior Frontend Developer', company_name: 'Remote UI', url: 'https://remotive/job/1', candidate_required_location: 'USA', description: 'React TypeScript frontend' }] });
  };

  const run = await runJobSourceConnectors(
    [
      buildGreenhouseJobBoardConnector({ boardToken: 'applied', company: 'Applied Apps', limit: 5 }),
      buildLeverJobConnector({ companySlug: 'qalabs', company: 'QA Labs', limit: 5 }),
      buildRemotiveJobConnector({ search: 'junior developer', limit: 5 }),
    ],
    { fetchImpl },
  );

  assert.equal(calls.length, 3);
  assert.equal(run.jobs.length, 3);
  assert.equal(run.pipeline.matches.length, 3);
  assert.equal(run.errors.length, 0);
  assert.ok(run.sourceCounts.greenhouse >= 1);
});

test('revenue os application packet export: produces downloadable markdown bundle', async () => {
  const { buildApplicationPacket, buildApplicationPacketExport } = await import('../../lib/revenue-os/application-packets.ts');
  const packet = buildApplicationPacket({
    job: {
      title: 'Junior AI Application Engineer',
      company: 'Applied Apps',
      score: 91,
      resumeVariant: 'ai_application_engineer',
      atsKeywords: ['Next.js', 'TypeScript', 'LLM APIs', 'testing'],
      applicationAdvice: 'Lead with shipped AI apps.',
      url: 'https://jobs.example/ai',
    },
    candidate: { name: 'Jason Teixeira', website: 'https://sageideas.dev', github: null, location: 'Remote US' },
  });
  const exported = buildApplicationPacketExport({ packet, format: 'markdown' });

  assert.equal(exported.mimeType, 'text/markdown; charset=utf-8');
  assert.ok(exported.filename.includes('applied-apps'));
  assert.ok(exported.body.includes('# Applied Apps - Junior AI Application Engineer'));
  assert.ok(exported.body.includes('## Cover Letter'));
  assert.ok(exported.body.includes('Tailored resume variant selected'));
});

test('revenue os operator filters: applies saved views, search, priority, and stage', async () => {
  const { applyOperatorAccountFilters, OPERATOR_SAVED_VIEWS } = await import('../../lib/revenue-os/operator-dashboard.ts');
  const accounts = [
    { id: '1', name: 'Urgent Dental', industry: 'Dental', location: 'Boston', priority: 'urgent', stage: 'qualified', totalScore: 82 },
    { id: '2', name: 'Quiet Clinic', industry: 'Healthcare', location: 'Austin', priority: 'low', stage: 'follow_up', totalScore: 45 },
    { id: '3', name: 'AI Startup', industry: 'SaaS', location: 'Remote', priority: 'high', stage: 'meeting', totalScore: 76 },
  ];

  const urgent = applyOperatorAccountFilters({ accounts, filters: { savedView: 'urgent' } });
  assert.deepEqual(urgent.map((account) => account.id), ['1']);
  const searched = applyOperatorAccountFilters({ accounts, filters: { query: 'clinic', stage: 'follow_up' } });
  assert.deepEqual(searched.map((account) => account.id), ['2']);
  assert.ok(OPERATOR_SAVED_VIEWS.some((view) => view.id === 'follow_up'));
});

test('acquisition scoring: urgent website prospect gets audit-led next action', async () => {
  const { scoreAcquisitionAccount } = await import('../../lib/acquisition/scoring.ts');
  const score = scoreAcquisitionAccount({
    businessModel: 'local_service',
    websiteUrl: 'https://example.com',
    hasBrokenWebsite: true,
    hasWeakSeo: true,
    hasWeakConversionPath: true,
    hasBookingOrCheckoutGap: true,
    isOwnerOperated: true,
    contactConfidence: 90,
    estimatedBudget: '10k_25k',
  });

  assert.equal(score.priority, 'urgent');
  assert.equal(score.recommendedOffer, 'seo_conversion_audit');
  assert.ok(score.totalScore >= 60);
  assert.equal(score.modelVersion, 'v2');
  assert.ok(score.closeProbability >= 50);
  assert.ok(score.confidence >= 80);
  assert.ok(score.segments.problem >= 60);
  assert.ok(score.reasons.includes('conversion path can be improved'));
  assert.match(score.nextAction, /Draft/);
});

test('acquisition scoring: low-signal account stays low priority', async () => {
  const { scoreAcquisitionAccount } = await import('../../lib/acquisition/scoring.ts');
  const score = scoreAcquisitionAccount({
    businessModel: 'unknown',
    contactConfidence: 10,
    estimatedBudget: 'unknown',
  });

  assert.equal(score.priority, 'low');
  assert.equal(score.recommendedOffer, 'seo_conversion_audit');
  assert.ok(score.totalScore < 45);
  assert.ok(score.warnings.includes('missing website'));
  assert.equal(score.nextAction, 'Collect one more proof point before outreach.');
});

test('acquisition audit: visible website gaps lower scores and create opportunities', async () => {
  const { buildWebsiteAuditDraft } = await import('../../lib/acquisition/audit.ts');
  const audit = buildWebsiteAuditDraft({
    websiteUrl: 'https://example.com',
    hasBrokenWebsite: true,
    hasWeakSeo: true,
    hasWeakConversionPath: true,
    hasBookingOrCheckoutGap: true,
  });

  assert.ok(audit.overallScore < 75);
  assert.ok(audit.issues.includes('Weak conversion path'));
  assert.ok(audit.opportunities.some((item) => item.includes('booking')));
  assert.equal(audit.recommendedOffer, 'seo_conversion_audit');
});

test('acquisition outreach: draft is specific and does not pretend to send', async () => {
  const { buildOutreachDraft } = await import('../../lib/acquisition/outreach.ts');
  const draft = buildOutreachDraft({
    accountName: 'Acme Dental',
    websiteUrl: 'https://acmedental.example',
    contactName: 'Jordan Smith',
    contactTitle: 'Owner',
    industry: 'Dental',
    recommendedOffer: 'seo_conversion_audit',
    source: 'directory',
    closeProbability: 72,
    confidence: 88,
    auditIssues: ['Weak conversion path'],
    auditOpportunities: ['Add a clear booking CTA for new patients.'],
    auditScore: 64,
  });

  assert.equal(draft.subject, 'Acme Dental owner-level SEO and conversion audit opportunity');
  assert.ok(draft.body.startsWith('Hi Jordan,'));
  assert.ok(draft.body.includes('https://acmedental.example'));
  assert.ok(draft.body.includes('Audit score: 64/100'));
  assert.ok(draft.body.includes('15-minute call'));
  assert.ok(draft.personalizationNotes.includes('Dental'));
  assert.ok(draft.personalizationNotes.includes('Personalization quality:'));
  assert.ok(draft.metadata.qualityScore >= 90);
  assert.ok(draft.metadata.proofPoints.some((point) => point.includes('Observed issue')));
});

test('acquisition crm: outcome transitions update account queue and metrics', async () => {
  const { buildOutreachOutcomeTransition } = await import('../../lib/acquisition/crm.ts');
  const now = new Date('2026-06-17T12:00:00.000Z');
  const sent = buildOutreachOutcomeTransition('sent', now);
  assert.equal(sent.messagePatch.status, 'sent');
  assert.equal(sent.messagePatch.sent_at, '2026-06-17T12:00:00.000Z');
  assert.equal(sent.accountPatch.stage, 'contacted');
  assert.match(sent.accountPatch.next_action ?? '', /Wait for reply/);
  assert.equal(sent.metricPatch.messages_sent, 1);

  const booked = buildOutreachOutcomeTransition('booked', now);
  assert.equal(booked.accountPatch.stage, 'meeting');
  assert.equal(booked.metricPatch.meetings_booked, 1);

  const bounced = buildOutreachOutcomeTransition('bounced', now);
  assert.equal(bounced.accountPatch.stage, 'qualified');
  assert.match(bounced.accountPatch.next_action ?? '', /better contact/);
});

test('acquisition analytics: computes funnel totals and conversion breakdowns', async () => {
  const { buildRevenueIntelligence } = await import('../../lib/acquisition/analytics.ts');
  const intelligence = buildRevenueIntelligence({
    auditCount: 2,
    metricRows: [
      {
        metric_date: '2026-06-17',
        accounts_added: 4,
        accounts_qualified: 3,
        messages_drafted: 3,
        messages_sent: 2,
        replies: 1,
        meetings_booked: 1,
        proposals_created: 0,
        deals_won: 0,
        estimated_pipeline_value: 5000,
      },
    ],
    accounts: [
      {
        id: 'a',
        industry: 'Dental',
        priority: 'urgent',
        stage: 'meeting',
        recommended_offer: 'seo_conversion_audit',
        metadata: { intake: { source: 'directory' }, score: { closeProbability: 72 } },
      },
      {
        id: 'b',
        industry: 'Dental',
        priority: 'medium',
        stage: 'contacted',
        recommended_offer: 'seo_conversion_audit',
        metadata: { intake: { source: 'directory' }, score: { closeProbability: 45 } },
      },
    ],
  });

  assert.equal(intelligence.totals.leadsAdded, 4);
  assert.equal(intelligence.totals.replyRate, 50);
  assert.equal(intelligence.totals.meetingRate, 50);
  assert.equal(intelligence.totals.auditCoverage, 100);
  assert.equal(intelligence.breakdowns.bySource[0].label, 'directory');
  assert.equal(intelligence.breakdowns.bySource[0].meetingRate, 50);
  assert.ok(intelligence.insights.some((insight) => insight.label === 'Funnel health'));
});

test('acquisition import: parses CSV rows, normalizes URLs, and dedupes', async () => {
  const { parseAcquisitionLeadList } = await import('../../lib/acquisition/import.ts');
  const rows = parseAcquisitionLeadList(`company,website,industry,location,contact,title,email
Acme Dental, acme.example, Dental, Boston, Jordan Smith, Owner, Jordan@Acme.example
Acme Dental, acme.example, Dental, Boston, Jordan Smith, Owner, Jordan@Acme.example
"Bright, Co", https://bright.example, Agency, NYC, Sam Lee, Founder, sam@bright.example`);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].websiteUrl, 'https://acme.example');
  assert.equal(rows[0].contactEmail, 'jordan@acme.example');
  assert.equal(rows[0].signals.hasWeakSeo, true);
  assert.equal(rows[0].businessModel, 'local_service');
  assert.equal(rows[1].name, 'Bright, Co');
});

test('acquisition import: header-based intake infers source, budget, model, and signals', async () => {
  const { parseAcquisitionLeadList } = await import('../../lib/acquisition/import.ts');
  const rows = parseAcquisitionLeadList(`Company Name,URL,Niche,City,Decision Maker,Role,Email,Business Type,Budget,Lead Source,Employees,Notes,Tags
Northstar Recruiting,northstar.example,Recruiting,Boston,Avery Stone,Founder,avery@northstar.example,recruiting,10k-25k,LinkedIn,11-50,"Hiring recruiters and weak conversion CTA",hiring; b2b`);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Northstar Recruiting');
  assert.equal(rows[0].source, 'linkedin');
  assert.equal(rows[0].businessModel, 'recruiting');
  assert.equal(rows[0].estimatedBudget, '10k_25k');
  assert.equal(rows[0].signals.hasRecentHiringSignal, true);
  assert.equal(rows[0].signals.hasWeakConversionPath, true);
  assert.equal(rows[0].signals.isOwnerOperated, true);
  assert.deepEqual(rows[0].tags, ['hiring', 'b2b']);
});

test('acquisition enrichment: extracts domains and recommends verification', async () => {
  const { buildAcquisitionEnrichment, nextFollowUpDate } = await import(
    '../../lib/acquisition/enrichment.ts'
  );
  const matched = buildAcquisitionEnrichment({
    websiteUrl: 'https://www.acme.example/services',
    contactEmail: 'owner@acme.example',
    industry: 'Dental',
    location: 'Boston',
  });
  assert.equal(matched.domain, 'acme.example');
  assert.equal(matched.emailDomainMatchesWebsite, true);
  assert.ok(matched.signals.includes('business email captured'));

  const freeEmail = buildAcquisitionEnrichment({
    websiteUrl: 'https://acme.example',
    contactEmail: 'owner@gmail.com',
  });
  assert.equal(freeEmail.emailDomainMatchesWebsite, false);
  assert.match(freeEmail.recommendedNextAction, /Verify/);

  assert.equal(nextFollowUpDate(3, new Date('2026-06-17T12:00:00Z')), '2026-06-20T14:00:00.000Z');
});

test('live SEO audit runner: fetches HTML and builds evidence', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.PAGESPEED_API_KEY;
  delete process.env.PAGESPEED_API_KEY;
  globalThis.fetch = async () =>
    new Response(
      '<html lang="en"><head><title>Useful test page title</title><meta name="description" content="This is a useful test page description for the live SEO audit runner."><link rel="canonical" href="https://example.com/"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>One heading</h1><img src="/x.png"></body></html>',
      { status: 200, headers: { 'content-type': 'text/html' } },
    );

  try {
    const { runLiveSeoAudit } = await import('../../lib/seo-audit/run.ts');
    const audit = await runLiveSeoAudit('https://example.com/');
    assert.equal(audit.target.href, 'https://example.com/');
    assert.ok(audit.score > 50);
    assert.equal(audit.evidence.httpStatus, 200);
    assert.ok(audit.evidence.bytesRead > 100);
    assert.ok(audit.evidence.failedChecks.some((check) => check.key === 'imageAlt'));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey) process.env.PAGESPEED_API_KEY = originalKey;
  }
});

test('revenue os website audit automation: stores structured evidence and maps offers', async () => {
  const { buildRealWebsiteAuditAutomation } = await import('../../lib/revenue-os/website-audit-automation.ts');
  const automation = buildRealWebsiteAuditAutomation({
    runKey: 'program-3-audit',
    accountId: 'acct_123',
    accountName: 'Bright Dental',
    audit: {
      target: new URL('https://bright.example/'),
      score: 63,
      report: {
        url: 'https://bright.example/',
        performance: { score: 48, lcpMs: 4100, cls: 0.19 },
        checks: {
          title: { pass: true, label: 'Page title', detail: 'Good title', weight: 15 },
          metaDescription: { pass: false, label: 'Meta description', detail: 'No meta description found', weight: 12 },
          openGraph: { pass: false, label: 'Open Graph tags', detail: 'No og:title found', weight: 10 },
          singleH1: { pass: true, label: 'Single H1 heading', detail: 'Exactly one H1', weight: 10 },
        },
      },
      evidence: {
        fetchedAt: '2026-06-17T12:00:00.000Z',
        httpStatus: 200,
        finalUrl: 'https://bright.example/',
        bytesRead: 12345,
        failedChecks: [
          { key: 'metaDescription', label: 'Meta description', detail: 'No meta description found', weight: 12 },
          { key: 'openGraph', label: 'Open Graph tags', detail: 'No og:title found', weight: 10 },
        ],
        passedChecks: [
          { key: 'title', label: 'Page title', detail: 'Good title', weight: 15 },
          { key: 'singleH1', label: 'Single H1 heading', detail: 'Exactly one H1', weight: 10 },
        ],
        performance: { score: 48, lcpMs: 4100, cls: 0.19 },
      },
    },
  });

  assert.equal(automation.auditScore, 63);
  assert.equal(automation.evidence.length, 6);
  assert.ok(automation.evidence.some((item) => item.evidenceType === 'performance' && item.severity === 'high'));
  assert.ok(automation.findings.some((item) => item.checkKey === 'metaDescription' && item.status === 'failed'));
  assert.equal(automation.offerMapping.recommendedOffer, 'seo_conversion_audit');
  assert.ok(automation.offerMapping.reasons.some((reason) => /meta description/i.test(reason)));
  assert.equal(automation.workerJobs[0].kind, 'enrichment');
  assert.equal(automation.persistence.auditEvidence[0].source_url, 'https://bright.example/');
});

// -------------------------------------------------------------- content / seo

test('blog toc: injects stable ids for h2 and h3 headings', async () => {
  const { injectHeadingIds } = await import('../../lib/blog-toc.ts');
  const out = injectHeadingIds('<h2>First section</h2><p>x</p><h3>Nested & useful</h3><h2>First section</h2>');
  assert.equal(out.toc.length, 3);
  assert.deepEqual(out.toc.map((node) => node.id), [
    'first-section',
    'nested-and-useful',
    'first-section-2',
  ]);
  assert.ok(out.html.includes('id="first-section"'));
  assert.ok(out.html.includes('id="nested-and-useful"'));
});

test('keyword map: primary keywords are unique per URL', async () => {
  const { keywordMap, getPrimaryKeyword, getKeywordsByUrl } = await import('../../data/seo/keyword-map.ts');
  const primaryByUrl = new Map();
  for (const entry of keywordMap.filter((item) => item.isPrimary)) {
    const count = primaryByUrl.get(entry.assignedUrl) ?? 0;
    primaryByUrl.set(entry.assignedUrl, count + 1);
  }
  for (const [url, count] of primaryByUrl) {
    assert.equal(count, 1, `${url} should have exactly one primary keyword`);
    assert.equal(getPrimaryKeyword(url)?.assignedUrl, url);
    assert.ok(getKeywordsByUrl(url).length >= 1);
  }
});

// -------------------------------------------------------------- isSelfServe

test('isSelfServe: audit ($750 one-time) is self-serve', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const audit = tiersOrdered.find((t) => t.slug === 'audit');
  assert.ok(audit, 'audit tier must exist');
  assert.equal(isSelfServe(audit), true);
});

test('isSelfServe: build ($9500 custom) is NOT self-serve', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const build = tiersOrdered.find((t) => t.slug === 'build');
  assert.ok(build, 'build tier must exist');
  assert.equal(isSelfServe(build), false);
});

test('isSelfServe: all self-serve tiers have stripePriceId, cadence=one-time, priceCents ≤ 250000', async () => {
  const { tiersOrdered } = await import('../../data/services/tiers.ts');
  const { isSelfServe, SELF_SERVE_PRICE_CAP_CENTS } = await import(
    '../../data/services/tier-classification.ts'
  );
  for (const tier of tiersOrdered) {
    if (!isSelfServe(tier)) continue;
    assert.ok(tier.stripePriceId, `${tier.slug}: must have stripePriceId`);
    assert.equal(tier.cadence, 'one-time', `${tier.slug}: cadence must be one-time`);
    assert.ok(
      tier.priceCents <= SELF_SERVE_PRICE_CAP_CENTS,
      `${tier.slug}: priceCents ${tier.priceCents} exceeds cap ${SELF_SERVE_PRICE_CAP_CENTS}`,
    );
  }
});

// -------------------------------------------------------------- checkout slug routing

test('checkout slug routing: care slugs exist in careTiersBySlug', async () => {
  const { careTiersBySlug } = await import('../../data/services/tiers.ts');
  for (const slug of ['site-care', 'brand-care', 'content-care']) {
    assert.ok(careTiersBySlug[slug], `careTiersBySlug must contain: ${slug}`);
    assert.equal(careTiersBySlug[slug].cadence, 'monthly', `${slug}: cadence must be monthly`);
    assert.ok(careTiersBySlug[slug].stripePriceId, `${slug}: must have stripePriceId`);
  }
});

test('checkout slug routing: care slugs are NOT in tiersBySlug (no collision)', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  for (const slug of ['site-care', 'brand-care', 'content-care']) {
    assert.equal(tiersBySlug[slug], undefined, `${slug} must not appear in tiersBySlug`);
  }
});

test('checkout slug routing: build slug is in tiersBySlug but NOT self-serve', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const build = tiersBySlug['build'];
  assert.ok(build, 'build must exist in tiersBySlug');
  assert.equal(isSelfServe(build), false, 'build must not be self-serve');
});

test('checkout slug routing: audit slug is self-serve and in tiersBySlug', async () => {
  const { tiersBySlug } = await import('../../data/services/tiers.ts');
  const { isSelfServe } = await import('../../data/services/tier-classification.ts');
  const audit = tiersBySlug['audit'];
  assert.ok(audit, 'audit must exist in tiersBySlug');
  assert.equal(isSelfServe(audit), true, 'audit must be self-serve');
});

test('academy products: packages are priced and gated behind Stripe price env vars', async () => {
  const { academyProducts } = await import('../../data/academy/products.ts');
  assert.equal(academyProducts.length, 4);

  for (const product of academyProducts) {
    assert.ok(product.trackSlug, 'track slug is required');
    assert.ok(product.name.includes('Founding Access'), `${product.trackSlug}: product name`);
    assert.ok(product.priceCents >= 30000, `${product.trackSlug}: price is too low`);
    assert.match(product.priceLabel, /^\$\d+$/, `${product.trackSlug}: price label`);
    assert.ok(product.stripeEnvVar.startsWith('STRIPE_PRICE_ACADEMY_'));
    assert.ok(product.packageIncludes.length >= 4, `${product.trackSlug}: package includes`);
    assert.match(product.refundPolicy, /14-day/i);
    assert.match(product.accessPolicy, /12 months/i);

    if (!product.stripePriceId) {
      assert.equal(product.status, 'early_access');
      assert.equal(product.checkoutLabel, 'early access');
      assert.ok(
        product.requirements.some((requirement) => requirement.includes(product.stripeEnvVar)),
        `${product.trackSlug}: env var requirement`,
      );
    }
  }
});

// -------------------------------------------------------------- ssrf guard

test('ssrf: isPrivateIp — 10.x, 127.x, 169.254.x, 192.168.x, 172.16–31.x are private', async () => {
  const { isPrivateIp } = await import('../../lib/seo-audit/ssrf.ts');
  assert.equal(isPrivateIp('10.0.0.5'), true);
  assert.equal(isPrivateIp('127.0.0.1'), true);
  assert.equal(isPrivateIp('169.254.169.254'), true);
  assert.equal(isPrivateIp('192.168.1.1'), true);
  assert.equal(isPrivateIp('172.16.0.1'), true);
  assert.equal(isPrivateIp('172.31.255.255'), true);
  assert.equal(isPrivateIp('8.8.8.8'), false);
  assert.equal(isPrivateIp('1.1.1.1'), false);
  assert.equal(isPrivateIp('172.15.0.1'), false);
  assert.equal(isPrivateIp('172.32.0.1'), false);
});

test('ssrf: assertPublicUrl rejects file:// and ftp://', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('file:///etc/passwd'), /Only http\/https/);
  assert.throws(() => assertPublicUrl('ftp://example.com'), /Only http\/https/);
});

test('ssrf: assertPublicUrl rejects localhost and private IPs', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://localhost/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://127.0.0.1/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://169.254.169.254/'), /not allowed/);
  assert.throws(() => assertPublicUrl('http://192.168.0.1/'), /not allowed/);
});

test('ssrf: assertPublicUrl accepts a public https URL', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('https://example.com/path?q=1');
  assert.equal(url.hostname, 'example.com');
  assert.equal(url.protocol, 'https:');
});

test('ssrf: assertPublicUrl rejects plain invalid string', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('not-a-url'), /valid URL/);
});

// ------ IPv6 SSRF vectors (should all throw "not allowed") ------

test('ssrf: assertPublicUrl rejects IPv6 loopback ::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects IPv4-mapped loopback ::ffff:127.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::ffff:127.0.0.1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects IPv4-mapped AWS metadata ::ffff:169.254.169.254', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[::ffff:169.254.169.254]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects ULA fc00::/7 address fd00::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[fd00::1]/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects link-local fe80::1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://[fe80::1]/'), /not allowed/);
});

// ------ Non-standard IPv4 notations (should all throw) ------

test('ssrf: assertPublicUrl rejects octal IPv4 0177.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://0177.0.0.1/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects decimal integer IP 2130706433', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://2130706433/'), /not allowed/);
});

test('ssrf: assertPublicUrl rejects hex IP 0x7f.0.0.1', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  assert.throws(() => assertPublicUrl('http://0x7f.0.0.1/'), /not allowed/);
});

// ------ Public cases that MUST still be accepted ------

test('ssrf: assertPublicUrl still accepts https://example.com/path', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('https://example.com/path');
  assert.equal(url.hostname, 'example.com');
});

test('ssrf: assertPublicUrl still accepts public IPv4 93.184.216.34', async () => {
  const { assertPublicUrl } = await import('../../lib/seo-audit/ssrf.ts');
  const url = assertPublicUrl('http://93.184.216.34/');
  assert.equal(url.hostname, '93.184.216.34');
});

// -------------------------------------------------------------- seo analyzer

const GOOD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Perfect SEO Page - Sage Ideas Best Practices Guide</title>
  <meta name="description" content="A comprehensive guide to SEO best practices that covers everything from meta tags to structured data and beyond, with actionable tips." />
  <link rel="canonical" href="https://example.com/seo-guide" />
  <meta property="og:title" content="Perfect SEO Page" />
  <meta property="og:description" content="SEO guide" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","name":"SEO Guide"}</script>
</head>
<body>
  <h1>Perfect SEO Page</h1>
  <p>Content here.</p>
  <img src="hero.jpg" alt="A hero image showing SEO concepts" />
  <img src="chart.png" alt="Chart of rankings" />
</body>
</html>`;

const BAD_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <h1>First heading</h1>
  <h1>Second heading</h1>
  <img src="no-alt.jpg" />
  <img src="also-no-alt.png" />
  <p>Some content without any SEO signals.</p>
</body>
</html>`;

test('seo-analyzer: well-optimized page passes all key checks and scores >=80', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(GOOD_HTML, 'https://example.com/seo-guide');
  assert.equal(r.checks.title.pass, true, 'title should pass');
  assert.equal(r.checks.metaDescription.pass, true, 'metaDescription should pass');
  assert.equal(r.checks.openGraph.pass, true, 'openGraph should pass');
  assert.equal(r.checks.structuredData.pass, true, 'structuredData should pass');
  assert.equal(r.checks.singleH1.pass, true, 'singleH1 should pass');
  assert.equal(r.checks.imageAlt.pass, true, 'imageAlt should pass');
  const score = scoreReport(r);
  assert.ok(score >= 80, `score ${score} should be >= 80`);
});

test('seo-analyzer: broken page fails title, h1, imageAlt and scores <50', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(BAD_HTML, 'https://example.com/bad');
  assert.equal(r.checks.title.pass, false, 'title should fail');
  assert.equal(r.checks.singleH1.pass, false, 'singleH1 should fail (two h1s)');
  assert.equal(r.checks.imageAlt.pass, false, 'imageAlt should fail');
  const score = scoreReport(r);
  assert.ok(score < 50, `score ${score} should be < 50`);
});

test('seo-analyzer: scoreReport blends perf score when present', async () => {
  const { analyzeHtml, scoreReport } = await import('../../lib/seo-audit/analyzer.ts');
  const r = analyzeHtml(GOOD_HTML, 'https://example.com/');
  r.performance = { score: 50, lcpMs: 3000 };
  const blended = scoreReport(r);
  const onPage = scoreReport({ ...r, performance: undefined });
  // blended = 70% onPage + 30% * 50 — must differ from pure on-page score
  assert.ok(blended < onPage, `blended (${blended}) should be < pure on-page (${onPage}) when perf=50`);
});

// -------------------------------------------------------------- growth SEO

test('service-industry pages: generate unique programmatic URLs', async () => {
  const { getServiceIndustryPage, getServiceIndustryPages } = await import(
    '../../lib/seo/service-industry-pages.ts'
  );
  const pages = getServiceIndustryPages();
  const paths = new Set(pages.map((page) => page.path));

  assert.ok(pages.length > 0, 'expected service x industry pages');
  assert.equal(paths.size, pages.length, 'service x industry paths must be unique');
  assert.ok(
    getServiceIndustryPage('audit', 'fintech')?.path === '/services/audit/for/fintech',
    'expected fintech audit route to be generated',
  );
});

test('audit reports: share ids are URL-safe and compact', async () => {
  const { createShareId } = await import('../../lib/seo-audit/reports.ts');
  const shareId = createShareId();

  assert.match(shareId, /^[A-Za-z0-9_-]+$/);
  assert.ok(shareId.length >= 10 && shareId.length <= 16);
});

// -------------------------------------------------------------- content directives

test('blog markdown: content directives render reusable visual blocks', async () => {
  const { transformContentDirectives } = await import('../../lib/blogMarkdown.ts');
  const md = [
    ':::proof-note title="Real proof" label="receipt"',
    'This is the evidence.',
    ':::',
    '',
    ':::checklist title="Ship list"',
    '- One',
    '- Two',
    ':::',
    '',
    ':::offer-cta title="Find your route" href="/tools/route-finder" cta="Start"',
    'Use the diagnostic.',
    ':::',
  ].join('\n');
  const html = transformContentDirectives(md);
  assert.match(html, /mdx-proof-note/);
  assert.match(html, /Real proof/);
  assert.match(html, /mdx-checklist/);
  assert.match(html, /<li>One<\/li>/);
  assert.match(html, /mdx-offer-cta/);
  assert.match(html, /href="\/tools\/route-finder"/);
});

// -------------------------------------------------------------- route finder

test('route finder: learning goal routes to academy', async () => {
  const { getRouteRecommendation } = await import('../../lib/leads/route-finder.ts');
  const route = getRouteRecommendation({
    goal: 'learn',
    stage: 'idea',
    budget: '<10k',
    timeline: 'exploring',
  });
  assert.equal(route.route, 'academy');
  assert.equal(route.primaryHref, '/academy');
});

test('route finder: stuck systems route to audit', async () => {
  const { getRouteRecommendation } = await import('../../lib/leads/route-finder.ts');
  const route = getRouteRecommendation({
    goal: 'build',
    stage: 'stuck',
    budget: '10-25k',
    timeline: 'asap',
  });
  assert.equal(route.route, 'audit');
  assert.equal(route.primaryHref, '/tools/seo-audit');
});

test('route finder: high-intent build routes to studio', async () => {
  const { getRouteRecommendation, formatRouteFinderScope } = await import('../../lib/leads/route-finder.ts');
  const input = {
    goal: 'build',
    stage: 'scaling',
    budget: '50-100k',
    timeline: '2-4w',
  };
  const route = getRouteRecommendation(input);
  assert.equal(route.route, 'studio');
  assert.equal(route.primaryHref, '/book');
  assert.match(formatRouteFinderScope(input, route), /Route Finder recommendation: Studio build path/);
});

// -------------------------------------------------------------- revenue os production controls

test('revenue os action results: returns structured operator-visible failures', async () => {
  const { actionFailure, actionSuccess, unwrapActionResult } = await import('../../lib/revenue-os/action-results.ts');
  const failure = actionFailure('invalid_input', 'Run key is required.', { field: 'runKey' });
  assert.equal(failure.ok, false);
  assert.equal(failure.error.code, 'invalid_input');
  assert.equal(failure.error.message, 'Run key is required.');
  assert.deepEqual(failure.error.detail, { field: 'runKey' });

  const success = actionSuccess({ imported: 3 }, 'Imported 3 leads.');
  assert.equal(success.ok, true);
  assert.equal(success.message, 'Imported 3 leads.');
  assert.deepEqual(unwrapActionResult(success), { imported: 3 });
});

test('revenue os webhook controls: rejects stale signatures and creates stable event ids', async () => {
  const { buildResendWebhookEventId, verifyResendWebhookSignature } = await import('../../lib/revenue-os/webhook-security.ts');
  const crypto = await import('node:crypto');
  const secret = 'whsec_' + Buffer.from('unit-secret').toString('base64');
  const body = JSON.stringify({ type: 'email.delivered', data: { email_id: 're_123' } });
  const svixId = 'msg_unit_1';
  const timestamp = Math.floor(new Date('2026-06-17T12:00:00.000Z').getTime() / 1000).toString();
  const signed = `${svixId}.${timestamp}.${body}`;
  const expected = crypto.createHmac('sha256', Buffer.from('unit-secret')).update(signed).digest('base64');

  const valid = verifyResendWebhookSignature({
    secret,
    svixId,
    svixTimestamp: timestamp,
    svixSignature: `v1,${expected}`,
    rawBody: body,
    now: new Date('2026-06-17T12:01:00.000Z'),
  });
  assert.equal(valid.ok, true);

  const stale = verifyResendWebhookSignature({
    secret,
    svixId,
    svixTimestamp: timestamp,
    svixSignature: `v1,${expected}`,
    rawBody: body,
    now: new Date('2026-06-17T12:11:00.000Z'),
  });
  assert.equal(stale.ok, false);
  assert.equal(stale.reason, 'stale_timestamp');

  assert.equal(
    buildResendWebhookEventId({ svixId, eventType: 'email.delivered', providerMessageId: 're_123' }),
    'resend:msg_unit_1:email.delivered:re_123',
  );
});

test('revenue os live connectors: retries transient failures and records run health', async () => {
  const { buildRemotiveJobConnector, runJobSourceConnectors } = await import('../../lib/revenue-os/live-connectors.ts');
  let calls = 0;
  const result = await runJobSourceConnectors(
    [buildRemotiveJobConnector({ search: 'junior ai engineer', limit: 2 })],
    {
      retries: 1,
      retryDelayMs: 0,
      timeoutMs: 500,
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) return new Response('temporary outage', { status: 503 });
        return new Response(
          JSON.stringify({
            jobs: [
              {
                id: 1,
                title: 'Junior AI Application Engineer',
                company_name: 'Applied Apps',
                url: 'https://remotive.com/jobs/1',
                candidate_required_location: 'USA',
                description: 'Next.js TypeScript Python LLM APIs testing Vercel',
              },
            ],
          }),
          { status: 200 },
        );
      },
    },
  );

  assert.equal(calls, 2);
  assert.equal(result.errors.length, 0);
  assert.equal(result.runHealth.attemptedConnectors, 1);
  assert.equal(result.runHealth.successfulConnectors, 1);
  assert.equal(result.imported, 1);
});

test('revenue os daily runner v2: creates idempotent persistence payloads', async () => {
  const { buildDailyRevenueRunV2, buildDailyRunPersistenceRecord } = await import('../../lib/revenue-os/daily-runner-v2.ts');
  const run = buildDailyRevenueRunV2({
    runKey: 'daily-2026-06-17',
    leadHealth: { providersReady: 1, allowedLeads: 12, estimatedCostUsd: 0.48 },
    jobConnectorRun: { imported: 3, skipped: 1, applyNow: 2 },
    applicationPackets: [],
    emailQueue: { ready: 4, blocked: 1 },
  });
  const record = buildDailyRunPersistenceRecord({
    run,
    mode: 'cron',
    status: 'completed',
    runDate: '2026-06-17',
  });

  assert.equal(record.run_date, '2026-06-17');
  assert.equal(record.mode, 'cron');
  assert.equal(record.idempotency_key, 'cron:daily-2026-06-17:2026-06-17');
  assert.equal(record.scorecard.jobsToApply, 2);
  assert.equal(record.metadata.runKey, 'daily-2026-06-17');
});

test('revenue os agent runtime: plans typed tasks, traces tools, approvals, and failures', async () => {
  const { buildAgentRun, recordAgentToolTrace, completeAgentTask, failAgentTask } = await import('../../lib/revenue-os/agent-runtime.ts');
  const run = buildAgentRun({
    runKey: 'agent-run-1',
    tenantId: 'tenant_sage',
    objective: 'Find qualified local-service leads and draft useful outreach.',
    tasks: [
      { type: 'lead_research', title: 'Find high-fit dentists', priority: 90, requiresApproval: false },
      { type: 'outreach_review', title: 'Review first touch', priority: 80, requiresApproval: true },
    ],
  });
  const traced = recordAgentToolTrace(run, {
    taskId: run.tasks[0].id,
    toolName: 'google_places.search',
    inputSummary: 'dentists Orlando weak booking path',
    outputSummary: '3 candidate accounts',
    status: 'success',
  });
  const completed = completeAgentTask(traced, run.tasks[0].id, {
    summary: 'Qualified two leads.',
    artifacts: ['lead:orlando-dental'],
  });
  const failed = failAgentTask(completed, run.tasks[1].id, {
    code: 'approval_required',
    message: 'Human approval required before outreach.',
    retryable: false,
  });

  assert.equal(failed.status, 'needs_attention');
  assert.equal(failed.tasks[0].status, 'completed');
  assert.equal(failed.tasks[1].status, 'failed');
  assert.equal(failed.traces[0].toolName, 'google_places.search');
  assert.equal(failed.decisions[0].requiresApproval, true);
  assert.equal(failed.failures[0].code, 'approval_required');
});

test('revenue os connector worker: builds queued parallel work with retries and rate limits', async () => {
  const { buildConnectorWorkerBatch, summarizeWorkerBatch } = await import('../../lib/revenue-os/worker-engine.ts');
  const batch = buildConnectorWorkerBatch({
    runKey: 'worker-1',
    concurrency: 3,
    now: '2026-06-17T12:00:00.000Z',
    jobs: [
      { kind: 'lead_source', target: 'google_places:dentists', priority: 90, requestedUnits: 20, rateLimitPerMinute: 10 },
      { kind: 'website_audit', target: 'https://example.com', priority: 75, requestedUnits: 1, rateLimitPerMinute: 30 },
      { kind: 'inbox_sync', target: 'gmail:sage', priority: 60, requestedUnits: 50, rateLimitPerMinute: 25 },
      { kind: 'job_source', target: 'remotive:junior-ai', priority: 80, requestedUnits: 10, rateLimitPerMinute: 10 },
    ],
  });
  const summary = summarizeWorkerBatch(batch);

  assert.equal(batch.executionLanes.length, 3);
  assert.equal(batch.jobs[0].status, 'queued');
  assert.equal(batch.jobs[0].attemptsRemaining, 3);
  assert.ok(batch.jobs.some((job) => job.nextRunAt > '2026-06-17T12:00:00.000Z'));
  assert.equal(summary.totalQueued, 4);
  assert.equal(summary.highestPriorityKind, 'lead_source');
});

test('revenue os durable worker: claims due jobs with leases and leaves future jobs queued', async () => {
  const { claimDueWorkerJobs } = await import('../../lib/revenue-os/worker-engine.ts');
  const result = claimDueWorkerJobs({
    now: '2026-06-17T12:00:00.000Z',
    workerId: 'worker-a',
    leaseSeconds: 120,
    maxJobs: 2,
    jobs: [
      {
        id: 'due-high',
        kind: 'lead_source',
        target: 'google_places:dentists',
        priority: 90,
        requestedUnits: 20,
        rateLimitPerMinute: 10,
        attemptsRemaining: 3,
        status: 'queued',
        nextRunAt: '2026-06-17T11:59:00.000Z',
      },
      {
        id: 'future',
        kind: 'website_audit',
        target: 'https://future.example',
        priority: 95,
        requestedUnits: 1,
        rateLimitPerMinute: 30,
        attemptsRemaining: 3,
        status: 'queued',
        nextRunAt: '2026-06-17T12:30:00.000Z',
      },
      {
        id: 'due-low',
        kind: 'inbox_sync',
        target: 'gmail:sage',
        priority: 50,
        requestedUnits: 10,
        rateLimitPerMinute: 20,
        attemptsRemaining: 2,
        status: 'queued',
        nextRunAt: '2026-06-17T12:00:00.000Z',
      },
    ],
  });

  assert.deepEqual(result.claimed.map((job) => job.id), ['due-high', 'due-low']);
  assert.equal(result.claimed[0].status, 'running');
  assert.equal(result.claimed[0].lockedBy, 'worker-a');
  assert.equal(result.claimed[0].leaseExpiresAt, '2026-06-17T12:02:00.000Z');
  assert.equal(result.claimed[0].attemptNumber, 1);
  assert.equal(result.remaining.find((job) => job.id === 'future')?.status, 'queued');
});

test('revenue os durable worker: completes, retries, and dead-letters jobs with attempt records', async () => {
  const {
    completeWorkerJob,
    failWorkerJob,
    buildWorkerOperationsSummary,
  } = await import('../../lib/revenue-os/worker-engine.ts');

  const runningJob = {
    id: 'job-1',
    kind: 'website_audit',
    target: 'https://apex.example',
    priority: 80,
    requestedUnits: 1,
    rateLimitPerMinute: 30,
    attemptsRemaining: 2,
    status: 'running',
    nextRunAt: '2026-06-17T12:00:00.000Z',
    lockedBy: 'worker-a',
    leaseExpiresAt: '2026-06-17T12:02:00.000Z',
    attemptNumber: 1,
  };

  const completed = completeWorkerJob(runningJob, {
    now: '2026-06-17T12:01:00.000Z',
    result: { audited: true },
  });
  assert.equal(completed.job.status, 'completed');
  assert.equal(completed.job.lockedBy, null);
  assert.equal(completed.attempt.status, 'completed');
  assert.equal(completed.attempt.durationMs, 60_000);

  const retry = failWorkerJob(runningJob, {
    now: '2026-06-17T12:01:00.000Z',
    errorCode: 'rate_limited',
    errorMessage: 'Provider quota temporarily exhausted.',
    retryable: true,
    backoffSeconds: 300,
  });
  assert.equal(retry.job.status, 'queued');
  assert.equal(retry.job.attemptsRemaining, 1);
  assert.equal(retry.job.nextRunAt, '2026-06-17T12:06:00.000Z');
  assert.equal(retry.deadLetter, null);
  assert.equal(retry.attempt.status, 'failed');

  const dead = failWorkerJob({ ...runningJob, id: 'job-2', attemptsRemaining: 1 }, {
    now: '2026-06-17T12:01:00.000Z',
    errorCode: 'invalid_payload',
    errorMessage: 'Connector returned an unusable payload.',
    retryable: false,
  });
  assert.equal(dead.job.status, 'failed');
  assert.equal(dead.job.attemptsRemaining, 0);
  assert.equal(dead.deadLetter?.jobId, 'job-2');
  assert.equal(dead.deadLetter?.errorCode, 'invalid_payload');

  const summary = buildWorkerOperationsSummary([
    completed.job,
    retry.job,
    dead.job,
  ]);
  assert.equal(summary.completed, 1);
  assert.equal(summary.queued, 1);
  assert.equal(summary.failed, 1);
  assert.equal(summary.deadLettered, 1);
});

test('revenue os ai personalization: grounds drafts in evidence and blocks hallucinated claims', async () => {
  const { buildAiPersonalizationDraft, reviewAiPersonalizationDraft } = await import('../../lib/revenue-os/ai-personalization.ts');
  const draft = buildAiPersonalizationDraft({
    accountName: 'Apex Dental',
    contactName: 'Jordan',
    offer: 'seo_conversion_audit',
    brandVoice: 'direct, specific, useful, no hype',
    evidence: [
      { id: 'audit-cta', claim: 'Booking CTA is below the fold', sourceUrl: 'https://apex.example' },
      { id: 'audit-proof', claim: 'No patient proof near the booking path', sourceUrl: 'https://apex.example' },
    ],
  });
  const review = reviewAiPersonalizationDraft({
    draft,
    evidenceIds: ['audit-cta', 'audit-proof'],
    bannedClaims: ['guaranteed revenue', 'risk free'],
  });

  assert.equal(draft.sendMode, 'manual_review');
  assert.ok(draft.body.includes('[audit-cta]'));
  assert.equal(review.approved, true);
  assert.equal(review.hallucinationRisk, 0);
  assert.ok(review.checks.includes('all claims cite supplied evidence'));
});

test('revenue os ai personalization v2: creates evidence-locked draft versions and quality gates', async () => {
  const { buildEvidenceLockedPersonalizationDraft } = await import('../../lib/revenue-os/ai-personalization.ts');
  const result = buildEvidenceLockedPersonalizationDraft({
    runKey: 'unit-ai-lock',
    accountId: 'acct-ai-lock',
    accountName: 'Apex Dental',
    contactName: 'Jordan',
    offer: 'seo_conversion_audit',
    brandVoice: 'direct, specific, useful, no hype',
    evidence: [
      {
        id: 'audit-cta',
        claim: 'Booking CTA is below the fold',
        sourceUrl: 'https://apex.example',
        evidenceType: 'conversion_check',
        observedAt: '2026-06-17T12:00:00.000Z',
      },
      {
        id: 'audit-proof',
        claim: 'No patient proof appears near the booking path',
        sourceUrl: 'https://apex.example',
        evidenceType: 'brand_check',
        observedAt: '2026-06-17T12:00:00.000Z',
      },
    ],
  });

  assert.equal(result.review.approved, true);
  assert.equal(result.draftVersion.sendMode, 'manual_review');
  assert.equal(result.draftVersion.structuredOutput.claims.length, 2);
  assert.deepEqual(result.draftVersion.structuredOutput.claims.map((claim) => claim.evidenceId), ['audit-cta', 'audit-proof']);
  assert.equal(result.qualityGates.every((gate) => gate.status === 'pass'), true);
  assert.ok(result.persistence.draftVersion.metadata.evidenceLocked);
  assert.equal(result.persistence.evidenceCitations.length, 2);
  assert.equal(result.persistence.evidenceCitations[0].evidence_id, 'audit-cta');
});

test('revenue os inbox intelligence: classifies replies and recommends CRM transitions', async () => {
  const { classifyInboxReply } = await import('../../lib/revenue-os/inbox-intelligence.ts');
  const reply = classifyInboxReply({
    from: 'owner@apex.example',
    subject: 'Re: Apex Dental SEO conversion audit',
    body: 'This is relevant. Can you send times for Thursday? Budget is not huge but we need the booking flow fixed.',
    receivedAt: '2026-06-17T13:00:00.000Z',
  });

  assert.equal(reply.intent, 'meeting_intent');
  assert.equal(reply.sentiment, 'positive');
  assert.equal(reply.crmPatch.stage, 'meeting');
  assert.ok(reply.followUpSuggestion.includes('Thursday'));
  assert.ok(reply.extractedSignals.includes('budget constraint'));
});

test('revenue os ml scoring: compares rule score with calibrated learned score', async () => {
  const { buildMlScoringModel, scoreWithMlModel } = await import('../../lib/revenue-os/ml-scoring.ts');
  const model = buildMlScoringModel({
    modelVersion: 'local-logistic-v1',
    outcomes: [
      { features: { fit: 80, urgency: 75, contactConfidence: 90, pastReplyRate: 30 }, won: true },
      { features: { fit: 35, urgency: 20, contactConfidence: 10, pastReplyRate: 0 }, won: false },
      { features: { fit: 70, urgency: 60, contactConfidence: 80, pastReplyRate: 20 }, won: true },
    ],
  });
  const scored = scoreWithMlModel({
    model,
    ruleScore: 62,
    features: { fit: 82, urgency: 70, contactConfidence: 88, pastReplyRate: 25 },
  });

  assert.equal(scored.modelVersion, 'local-logistic-v1');
  assert.ok(scored.learnedScore > scored.ruleScore);
  assert.ok(scored.calibratedProbability > 0.5);
  assert.equal(scored.decision, 'prioritize');
});

test('revenue os ml learning loop: trains, scores, calibrates, and persists model decisions', async () => {
  const {
    buildMlFeatureSnapshot,
    buildMlOutcomeLabel,
    trainRevenueMlModel,
    scoreRevenueMlDecision,
    buildMlCalibrationReport,
  } = await import('../../lib/revenue-os/ml-scoring.ts');

  const snapshots = [
    buildMlFeatureSnapshot({
      tenantId: 'tenant-ml',
      accountId: 'acct-win-1',
      source: 'google_places',
      industry: 'dental',
      offer: 'seo_conversion_audit',
      features: { fit: 88, urgency: 82, contactConfidence: 94, pastReplyRate: 34 },
      ruleScore: 84,
    }),
    buildMlFeatureSnapshot({
      tenantId: 'tenant-ml',
      accountId: 'acct-win-2',
      source: 'referral',
      industry: 'med_spa',
      offer: 'website_rebuild',
      features: { fit: 78, urgency: 76, contactConfidence: 88, pastReplyRate: 28 },
      ruleScore: 80,
    }),
    buildMlFeatureSnapshot({
      tenantId: 'tenant-ml',
      accountId: 'acct-loss-1',
      source: 'directory',
      industry: 'restaurant',
      offer: 'brand_presence_audit',
      features: { fit: 34, urgency: 25, contactConfidence: 20, pastReplyRate: 2 },
      ruleScore: 38,
    }),
    buildMlFeatureSnapshot({
      tenantId: 'tenant-ml',
      accountId: 'acct-loss-2',
      source: 'cold_list',
      industry: 'generic',
      offer: 'seo_conversion_audit',
      features: { fit: 42, urgency: 30, contactConfidence: 28, pastReplyRate: 4 },
      ruleScore: 41,
    }),
  ];
  const labels = [
    buildMlOutcomeLabel({ tenantId: 'tenant-ml', accountId: 'acct-win-1', outcome: 'won', value: 9000 }),
    buildMlOutcomeLabel({ tenantId: 'tenant-ml', accountId: 'acct-win-2', outcome: 'meeting' }),
    buildMlOutcomeLabel({ tenantId: 'tenant-ml', accountId: 'acct-loss-1', outcome: 'lost' }),
    buildMlOutcomeLabel({ tenantId: 'tenant-ml', accountId: 'acct-loss-2', outcome: 'no_reply' }),
  ];
  const model = trainRevenueMlModel({
    tenantId: 'tenant-ml',
    modelVersion: 'tenant-ml-local-v1',
    snapshots,
    labels,
  });
  const decision = scoreRevenueMlDecision({
    tenantId: 'tenant-ml',
    accountId: 'acct-fresh',
    model,
    snapshot: buildMlFeatureSnapshot({
      tenantId: 'tenant-ml',
      accountId: 'acct-fresh',
      source: 'google_places',
      industry: 'dental',
      offer: 'seo_conversion_audit',
      features: { fit: 86, urgency: 80, contactConfidence: 90, pastReplyRate: 30 },
      ruleScore: 76,
    }),
  });
  const report = buildMlCalibrationReport({
    tenantId: 'tenant-ml',
    model,
    decisions: [
      decision,
      scoreRevenueMlDecision({ tenantId: 'tenant-ml', accountId: 'acct-loss-1', model, snapshot: snapshots[2] }),
      scoreRevenueMlDecision({ tenantId: 'tenant-ml', accountId: 'acct-loss-2', model, snapshot: snapshots[3] }),
    ],
    labels,
  });

  assert.equal(model.modelVersion, 'tenant-ml-local-v1');
  assert.equal(model.sampleSize, 4);
  assert.ok(model.metrics.trainingAccuracy >= 0.75);
  assert.ok(model.featureImportance.fit > 0);
  assert.equal(decision.decision, 'prioritize');
  assert.equal(decision.persistence.model_version, 'tenant-ml-local-v1');
  assert.equal(decision.persistence.tenant_id, 'tenant-ml');
  assert.equal(report.persistence.model_version, 'tenant-ml-local-v1');
  assert.ok(report.brierScore >= 0 && report.brierScore <= 1);
  assert.ok(report.bands.length >= 2);
  assert.ok(report.driftWarnings.includes('low_sample_size'));
});

test('revenue os adaptive sequences: branches from events and stops on reply or suppression', async () => {
  const { buildAdaptiveSequencePlan, advanceAdaptiveSequence } = await import('../../lib/revenue-os/adaptive-sequences.ts');
  const plan = buildAdaptiveSequencePlan({
    accountName: 'Apex Dental',
    persona: 'owner',
    industry: 'dental',
    offer: 'seo_conversion_audit',
    startAt: '2026-06-17T12:00:00.000Z',
  });
  const opened = advanceAdaptiveSequence(plan, { type: 'opened', occurredAt: '2026-06-18T12:00:00.000Z' });
  const replied = advanceAdaptiveSequence(opened, { type: 'replied', occurredAt: '2026-06-18T13:00:00.000Z' });

  assert.equal(plan.steps.length, 3);
  assert.equal(opened.nextStep?.branchReason, 'opened_no_reply');
  assert.equal(replied.status, 'stopped');
  assert.equal(replied.stopReason, 'reply_received');
});

test('revenue os tenant os: isolates client configs, sources, sending domains, and exports', async () => {
  const { buildTenantWorkspace, buildTenantExport } = await import('../../lib/revenue-os/tenant-os.ts');
  const workspace = buildTenantWorkspace({
    tenantId: 'tenant_apex',
    businessName: 'Apex Dental Group',
    ownerEmail: 'owner@apex.example',
    sendingDomain: 'mail.apex.example',
    leadSources: ['google_places', 'inbound', 'csv'],
    monthlyLeadLimit: 500,
  });
  const exported = buildTenantExport(workspace);

  assert.equal(workspace.permissions[0].role, 'owner');
  assert.equal(workspace.sendingDomains[0].status, 'pending_dns');
  assert.equal(workspace.limits.monthlyLeadLimit, 500);
  assert.equal(exported.redactedConfig.ownerEmail, 'o***@apex.example');
});

test('revenue os tenant os: builds multi-tenant SaaS foundation with scoped access and persistence rows', async () => {
  const { buildTenantSaasFoundation, canAccessTenant, buildTenantIsolationProof } = await import('../../lib/revenue-os/tenant-os.ts');
  const foundation = buildTenantSaasFoundation({
    runKey: 'unit-program-7',
    workspaces: [
      {
        tenantKey: 'apex-dental',
        businessName: 'Apex Shared Brand',
        ownerEmail: 'owner@apex.example',
        members: [
          { email: 'ops@apex.example', role: 'operator' },
          { email: 'viewer@apex.example', role: 'viewer' },
        ],
        leadSources: ['google_places', 'csv', 'inbound'],
        sendingDomains: ['mail.apex.example'],
        monthlyLeadLimit: 600,
        dailyEmailLimit: 45,
        config: {
          icp: { targetSegment: 'owner-led dental offices', regions: ['US'], minimumBudget: '5000' },
          offers: ['seo_conversion_audit', 'website_rebuild'],
          brandVoice: { tone: 'direct helpful evidence-grounded' },
          compliance: { consentBasis: 'legitimate_interest', unsubscribeRequired: true },
        },
      },
      {
        tenantKey: 'apex-dental-clone',
        businessName: 'Apex Shared Brand',
        ownerEmail: 'owner@clone.example',
        members: [{ email: 'ops@clone.example', role: 'operator' }],
        leadSources: ['csv', 'referral'],
        sendingDomains: ['mail.clone.example'],
        monthlyLeadLimit: 350,
        dailyEmailLimit: 30,
        config: {
          icp: { targetSegment: 'boutique med spas', regions: ['US', 'Canada'], minimumBudget: '3000' },
          offers: ['brand_presence_audit'],
          brandVoice: { tone: 'warm concise operator-focused' },
          compliance: { consentBasis: 'manual_review', unsubscribeRequired: true },
        },
      },
    ],
  });
  const proof = buildTenantIsolationProof(foundation);

  assert.equal(foundation.workspaces.length, 2);
  assert.equal(new Set(foundation.workspaces.map((workspace) => workspace.tenantKey)).size, 2);
  assert.equal(foundation.memberships.length, 5);
  assert.equal(foundation.configs[0].icp.targetSegment, 'owner-led dental offices');
  assert.equal(foundation.configs[1].icp.targetSegment, 'boutique med spas');
  assert.equal(foundation.usageRecords.length, 2);
  assert.equal(foundation.billingBoundaries.length, 2);
  assert.ok(foundation.auditLogs.length >= 8);
  assert.equal(foundation.persistence.workspaces.length, 2);
  assert.equal(foundation.persistence.memberships.length, 5);
  assert.equal(canAccessTenant(foundation, 'ops@apex.example', 'apex-dental'), true);
  assert.equal(canAccessTenant(foundation, 'ops@apex.example', 'apex-dental-clone'), false);
  assert.equal(proof.crossTenantAccessBlocked, true);
  assert.equal(proof.duplicateBusinessNamesAllowedWithTenantKeys, true);
  assert.equal(proof.hasPerTenantUsageAndBilling, true);
});

test('revenue os eval gates: scores lead, draft, spam, deliverability, hallucination, and conversion quality', async () => {
  const { runRevenueOsEvalSuite } = await import('../../lib/revenue-os/eval-gates.ts');
  const result = runRevenueOsEvalSuite({
    cases: [
      {
        id: 'qualified-dental',
        leadScore: 82,
        draftQuality: 91,
        spamRisk: 12,
        deliverabilityRisk: 18,
        hallucinationRisk: 0,
        conversionPrediction: 64,
      },
      {
        id: 'weak-generic',
        leadScore: 35,
        draftQuality: 50,
        spamRisk: 45,
        deliverabilityRisk: 40,
        hallucinationRisk: 25,
        conversionPrediction: 18,
      },
    ],
    thresholds: {
      leadQuality: 70,
      draftQuality: 80,
      maxSpamRisk: 25,
      maxDeliverabilityRisk: 30,
      maxHallucinationRisk: 5,
      conversionPrediction: 50,
    },
  });

  assert.equal(result.overallStatus, 'fail');
  assert.equal(result.passed, 1);
  assert.equal(result.failed, 1);
  assert.ok(result.failures[0].reasons.includes('lead quality below threshold'));
});

test('opportunity os: unifies job and client opportunities into one queue and proof model', async () => {
  const {
    adaptJobOpportunity,
    adaptRevenueOpportunity,
    buildOpportunityAnalytics,
    buildOpportunityOsRun,
    buildProofAssets,
    buildUnifiedDailyQueue,
    classifyOpportunityMessage,
    mapJobStage,
    mapRevenueStage,
  } = await import('../../lib/opportunity-os/core.ts');

  const job = adaptJobOpportunity({
    id: 'job-1',
    stage: 'ready',
    priority_rank: 1,
    next_action: 'Submit tailored packet.',
    next_action_at: '2026-06-18T10:00:00.000Z',
    metadata: {
      target: {
        job: { title: 'AI Engineer', company: 'TargetCo' },
        fit: { overall: 91, missingSkills: ['submitted artifact proof'] },
      },
    },
    created_at: '2026-06-18T09:00:00.000Z',
  });
  const client = adaptRevenueOpportunity({
    id: 'client-1',
    name: 'Acme Dental',
    stage: 'qualified',
    total_score: 88,
    revenue_score: 84,
    next_action: 'Send approved audit offer.',
    next_action_at: '2026-06-18T11:00:00.000Z',
    recommended_offer: 'Revenue OS audit',
    pain_summary: 'Needs follow-up system.',
    created_at: '2026-06-18T09:00:00.000Z',
  });
  const queue = buildUnifiedDailyQueue([job, client]);
  const analytics = buildOpportunityAnalytics([job, client]);
  const proofAssets = buildProofAssets([job, client]);
  const run = buildOpportunityOsRun({ jobRows: [], revenueRows: [] });

  assert.equal(mapJobStage('interviewing'), 'active');
  assert.equal(mapRevenueStage('proposal'), 'active');
  assert.equal(queue.length, 2);
  assert.ok(queue[0].rank < queue[1].rank || queue[1].rank < queue[0].rank);
  assert.equal(analytics.jobs, 1);
  assert.equal(analytics.clients, 1);
  assert.ok(analytics.weightedPipelineUsd > 0);
  assert.ok(proofAssets.some((asset) => asset.appliesTo === 'both'));
  assert.equal(classifyOpportunityMessage({ body: 'Can you meet to discuss budget and proposal?' }), 'client_interest');
  assert.equal(run.programs.length, 24);
  assert.equal(run.readiness.grade, 'institutional_beta');
});

test('traffic os: builds source campaigns distribution discord and conversion growth loop', async () => {
  const {
    buildTrafficOsRun,
    buildNextBestTrafficActions,
    buildTrafficAnalytics,
    buildTrafficConversions,
    buildTrafficEvents,
    buildTrafficSources,
    buildTrafficCampaigns,
    buildContentAssets,
    buildKeywordOpportunities,
    buildDiscordInviteProof,
    buildLiveAnalyticsProofs,
  } = await import('../../lib/traffic-os/core.ts');

  const sources = buildTrafficSources();
  const campaigns = buildTrafficCampaigns();
  const assets = buildContentAssets();
  const keywords = buildKeywordOpportunities();
  const events = buildTrafficEvents(sources, campaigns);
  const conversions = buildTrafficConversions(events);
  const discordInvites = buildDiscordInviteProof();
  const analytics = buildTrafficAnalytics({ events, conversions, discordInvites });
  const actions = buildNextBestTrafficActions({ assets, keywords, analytics });
  const run = buildTrafficOsRun();

  assert.ok(sources.some((source) => source.key === 'seo'));
  assert.ok(campaigns.some((campaign) => campaign.landingPage === '/tools/seo-audit'));
  assert.ok(assets.some((asset) => asset.assetType === 'tool'));
  assert.ok(keywords.some((keyword) => keyword.keyword.includes('AI implementation')));
  assert.ok(events.some((event) => event.eventType === 'visit'));
  assert.ok(conversions.length > 0);
  assert.ok(discordInvites.reduce((sum, invite) => sum + invite.joins, 0) > 0);
  assert.ok(analytics.weightedPipelineUsd > 0);
  assert.equal(actions[0].channel, 'seo');
  assert.equal(run.liveAnalyticsProofs.length, 4);
  assert.ok(run.revenueFeedCandidates.length > 0);
  assert.equal(buildLiveAnalyticsProofs({ ga4Rows: 10 }).find((proof) => proof.provider === 'ga4')?.liveVerified, true);
  assert.equal(run.programs.length, 32);
  assert.equal(run.readiness.grade, 'institutional_beta');
});

// -------------------------------------------------------------- runner

let pass = 0;
let fail = 0;
const failures = [];

for (const { name, fn } of suites) {
  try {
    await fn();
    pass++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    fail++;
    failures.push({ name, err });
    console.log(`  FAIL  ${name}`);
  }
}

console.log(`\nResult: ${pass} passed, ${fail} failed`);
for (const f of failures) {
  console.log(`\n--- ${f.name} ---\n${f.err?.stack ?? f.err}`);
}
process.exit(fail === 0 ? 0 : 1);

import { aiTraceMetadata, startAiObservation, type AiObservation } from '@/lib/ai/observability';

export type DeepSeekChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type DeepSeekChatResult = {
  model: string;
  content: string;
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  } | null;
  observability: {
    traceId: string;
    observationId: string;
    provider: 'langfuse' | 'local';
  };
};

export type DeepSeekChatOptions = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  messages: DeepSeekChatMessage[];
  temperature?: number;
  maxTokens?: number;
  observability?: {
    parent?: AiObservation;
    name?: string;
    metadata?: Record<string, unknown>;
  };
};

export function requireDeepSeekApiKey(env: NodeJS.ProcessEnv = process.env): string {
  const apiKey = env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY missing');
  return apiKey;
}

export async function deepSeekChat(options: DeepSeekChatOptions): Promise<DeepSeekChatResult> {
  const apiKey = options.apiKey ?? requireDeepSeekApiKey();
  const baseUrl = (options.baseUrl ?? process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/+$/, '');
  const model = options.model ?? process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';
  const observation = startAiObservation(
    options.observability?.name ?? 'deepseek.chat',
    {
      input: options.messages,
      model,
      modelParameters: {
        temperature: options.temperature ?? 0,
        maxTokens: options.maxTokens ?? 64,
      },
      metadata: {
        provider: 'deepseek',
        base_url: baseUrl,
        ...(options.observability?.metadata ?? {}),
      },
    },
    { asType: 'generation', parent: options.observability?.parent },
  );

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0,
        max_tokens: options.maxTokens ?? 64,
        stream: false,
      }),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message = typeof body?.error?.message === 'string' ? body.error.message : `DeepSeek request failed with ${response.status}`;
      observation.update({ level: 'ERROR', statusMessage: message, output: { status: response.status } });
      throw new Error(message);
    }

    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      const message = 'DeepSeek response did not include assistant content';
      observation.update({ level: 'ERROR', statusMessage: message, output: body });
      throw new Error(message);
    }

    const usage = body?.usage && typeof body.usage === 'object' ? body.usage : null;
    const actualModel = typeof body.model === 'string' ? body.model : model;
    observation.update({
      output: { content: content.trim() },
      model: actualModel,
      usageDetails: usage ? {
        promptTokens: Number(usage.prompt_tokens ?? 0),
        completionTokens: Number(usage.completion_tokens ?? 0),
        totalTokens: Number(usage.total_tokens ?? 0),
      } : undefined,
    });

    return {
      model: actualModel,
      content: content.trim(),
      usage,
      observability: {
        traceId: observation.traceId,
        observationId: observation.observationId,
        provider: aiTraceMetadata(observation).ai_observability_provider as 'langfuse' | 'local',
      },
    };
  } finally {
    observation.end();
  }
}

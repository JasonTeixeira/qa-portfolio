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

export type DeepSeekStreamOptions = Omit<DeepSeekChatOptions, 'observability'> & {
  /** Abort signal so a closed client tab cancels the upstream request. */
  signal?: AbortSignal;
  observability?: DeepSeekChatOptions['observability'];
};

/**
 * Streaming variant of {@link deepSeekChat}. Opens DeepSeek's `stream:true` SSE
 * channel and yields assistant content deltas as they arrive. The caller pipes
 * these to the client (real token streaming — NOT a client-side typewriter).
 *
 * Errors throw BEFORE the first yield (bad key, non-2xx, network) so the caller
 * can fall back to non-streaming. Once tokens have started flowing, a mid-stream
 * fault ends the generator; the caller keeps whatever was already streamed.
 *
 * Observability mirrors deepSeekChat: one generation observation, finalized with
 * the assembled output + best-effort usage on `[DONE]`.
 */
export async function* deepSeekChatStream(
  options: DeepSeekStreamOptions,
): AsyncGenerator<string, void, unknown> {
  const apiKey = options.apiKey ?? requireDeepSeekApiKey();
  const baseUrl = (options.baseUrl ?? process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/+$/, '');
  const model = options.model ?? process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';

  const observation = startAiObservation(
    options.observability?.name ?? 'deepseek.chat.stream',
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
        streaming: true,
        ...(options.observability?.metadata ?? {}),
      },
    },
    { asType: 'generation', parent: options.observability?.parent },
  );

  let assembled = '';
  let usage: Record<string, unknown> | null = null;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0,
        max_tokens: options.maxTokens ?? 64,
        stream: true,
        stream_options: { include_usage: true },
      }),
      signal: options.signal,
    });

    if (!response.ok || !response.body) {
      let detail = `DeepSeek stream failed with ${response.status}`;
      try {
        const body = await response.json();
        if (typeof body?.error?.message === 'string') detail = body.error.message;
      } catch {
        // non-JSON error body; keep the status-based message
      }
      observation.update({ level: 'ERROR', statusMessage: detail, output: { status: response.status } });
      throw new Error(detail);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by blank lines; each frame has `data:` lines.
      let nl: number;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const rawLine = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!rawLine.startsWith('data:')) continue;
        const data = rawLine.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) {
            assembled += delta;
            yield delta;
          }
          if (json?.usage && typeof json.usage === 'object') usage = json.usage;
        } catch {
          // Partial/garbled frame — ignore; the next read completes it.
        }
      }
    }

    observation.update({
      output: { content: assembled },
      model,
      usageDetails: usage
        ? {
            promptTokens: Number(usage.prompt_tokens ?? 0),
            completionTokens: Number(usage.completion_tokens ?? 0),
            totalTokens: Number(usage.total_tokens ?? 0),
          }
        : undefined,
    });
  } catch (err) {
    observation.update({
      level: 'ERROR',
      statusMessage: err instanceof Error ? err.message : 'deepseek stream error',
      output: { content: assembled },
    });
    throw err;
  } finally {
    observation.end();
  }
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

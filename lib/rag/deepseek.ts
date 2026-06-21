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
};

export type DeepSeekChatOptions = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  messages: DeepSeekChatMessage[];
  temperature?: number;
  maxTokens?: number;
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
    throw new Error(message);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('DeepSeek response did not include assistant content');
  }

  return {
    model: typeof body.model === 'string' ? body.model : model,
    content: content.trim(),
    usage: body?.usage && typeof body.usage === 'object' ? body.usage : null,
  };
}

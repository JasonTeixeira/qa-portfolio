import { randomBytes } from 'node:crypto';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import {
  setLangfuseTracerProvider,
  startObservation,
  type LangfuseObservation,
  type LangfuseObservationAttributes,
  type LangfuseObservationType,
} from '@langfuse/tracing';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

type Json = Record<string, unknown>;

export type AiObservationKind = LangfuseObservationType;

export type AiObservation = {
  enabled: boolean;
  traceId: string;
  observationId: string;
  type: AiObservationKind;
  update: (attributes: AiObservationAttributes) => void;
  end: () => void;
  startChild: (
    name: string,
    attributes?: AiObservationAttributes,
    options?: { asType?: AiObservationKind },
  ) => AiObservation;
};

export type AiObservationAttributes = {
  input?: unknown;
  output?: unknown;
  metadata?: Json;
  level?: 'DEBUG' | 'DEFAULT' | 'WARNING' | 'ERROR';
  statusMessage?: string;
  model?: string;
  modelParameters?: Record<string, string | number>;
  usageDetails?: Record<string, number | undefined>;
};

let provider: NodeTracerProvider | null = null;
let initialized = false;

function cleanEnv(value: string | undefined): string {
  return value?.replace(/\\n/g, '').trim() ?? '';
}

export function langfuseConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(cleanEnv(env.LANGFUSE_PUBLIC_KEY) && cleanEnv(env.LANGFUSE_SECRET_KEY));
}

export function aiObservabilityMode(env: NodeJS.ProcessEnv = process.env): 'langfuse' | 'local' {
  return langfuseConfigured(env) ? 'langfuse' : 'local';
}

export function redactAiPayload<T>(value: T): T {
  return redactValue(value) as T;
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redactValue(item));
  if (!value || typeof value !== 'object') return value;

  const redacted: Json = {};
  for (const [key, nested] of Object.entries(value as Json)) {
    if (isSensitiveKey(key)) {
      redacted[key] = '[redacted]';
    } else {
      redacted[key] = redactValue(nested);
    }
  }
  return redacted;
}

function isSensitiveKey(key: string): boolean {
  return /api[_-]?key|secret|token|password|authorization|cookie|stripe|supabase.*key/i.test(key);
}

function ensureLangfuseProvider(): boolean {
  if (!langfuseConfigured()) return false;
  if (initialized) return true;

  provider = new NodeTracerProvider({
    spanProcessors: [
      new LangfuseSpanProcessor({
        publicKey: cleanEnv(process.env.LANGFUSE_PUBLIC_KEY),
        secretKey: cleanEnv(process.env.LANGFUSE_SECRET_KEY),
        baseUrl: cleanEnv(process.env.LANGFUSE_BASE_URL) || cleanEnv(process.env.LANGFUSE_BASEURL) || undefined,
        environment: cleanEnv(process.env.LANGFUSE_TRACING_ENVIRONMENT) || process.env.NODE_ENV || 'development',
        release: cleanEnv(process.env.VERCEL_GIT_COMMIT_SHA) || undefined,
        exportMode: 'immediate',
        mask: ({ data }) => redactAiPayload(data),
      }),
    ],
  });
  provider.register();
  setLangfuseTracerProvider(provider);
  initialized = true;
  return true;
}

export async function flushAiObservability(): Promise<void> {
  if (!provider) return;
  await provider.forceFlush().catch(() => undefined);
}

export function startAiObservation(
  name: string,
  attributes: AiObservationAttributes = {},
  options: { asType?: AiObservationKind; parent?: AiObservation } = {},
): AiObservation {
  if (options.parent) return options.parent.startChild(name, attributes, { asType: options.asType });

  if (!ensureLangfuseProvider()) {
    return createLocalObservation(options.asType ?? 'span');
  }

  const observation = startObservation(
    name,
    toLangfuseAttributes(attributes),
    options.asType ? { asType: options.asType as never } : undefined,
  ) as LangfuseObservation;
  return wrapLangfuseObservation(observation);
}

function wrapLangfuseObservation(observation: LangfuseObservation): AiObservation {
  return {
    enabled: true,
    traceId: observation.traceId,
    observationId: observation.id,
    type: observation.type,
    update: (attributes) => {
      const updatable = observation as LangfuseObservation & {
        update?: (attributes: LangfuseObservationAttributes) => unknown;
      };
      updatable.update?.(toLangfuseAttributes(attributes));
    },
    end: () => observation.end(),
    startChild: (name, attributes = {}, options = {}) => {
      const child = observation.startObservation(
        name,
        toLangfuseAttributes(attributes),
        options.asType ? { asType: options.asType as never } : undefined,
      ) as LangfuseObservation;
      return wrapLangfuseObservation(child);
    },
  };
}

function createLocalObservation(type: AiObservationKind, traceId = randomBytes(16).toString('hex')): AiObservation {
  const observationId = randomBytes(8).toString('hex');
  return {
    enabled: false,
    traceId,
    observationId,
    type,
    update: () => undefined,
    end: () => undefined,
    startChild: (_name, _attributes = {}, options = {}) => createLocalObservation(options.asType ?? 'span', traceId),
  };
}

function toLangfuseAttributes(attributes: AiObservationAttributes): LangfuseObservationAttributes {
  return {
    ...attributes,
    input: attributes.input === undefined ? undefined : redactAiPayload(attributes.input),
    output: attributes.output === undefined ? undefined : redactAiPayload(attributes.output),
    metadata: attributes.metadata ? redactAiPayload(attributes.metadata) : undefined,
  } as LangfuseObservationAttributes;
}

export function aiTraceMetadata(observation: AiObservation | null | undefined): Json {
  if (!observation) return {};
  return {
    ai_trace_id: observation.traceId,
    ai_observation_id: observation.observationId,
    ai_observability_provider: observation.enabled ? 'langfuse' : 'local',
    langfuse_trace_id: observation.enabled ? observation.traceId : null,
  };
}

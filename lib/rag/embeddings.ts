export const LOCAL_EMBEDDING_MODEL = 'Supabase/gte-small';
export const LOCAL_EMBEDDING_DIMENSIONS = 384;

type FeatureExtractionPipeline = (text: string, options: { pooling: 'mean'; normalize: boolean }) => Promise<{
  data: Float32Array | number[];
}>;

let pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

export type EmbeddingResult = {
  model: string;
  dimensions: number;
  vector: number[];
};

export async function embedTextLocal(text: string): Promise<EmbeddingResult> {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) throw new Error('Cannot embed empty text');
  const extractor = await getLocalPipeline();
  const output = await extractor(normalized, { pooling: 'mean', normalize: true });
  const vector = Array.from(output.data, (value) => Number(value));
  if (vector.length !== LOCAL_EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected ${LOCAL_EMBEDDING_DIMENSIONS} dimensions, received ${vector.length}`);
  }
  return {
    model: LOCAL_EMBEDDING_MODEL,
    dimensions: vector.length,
    vector,
  };
}

export function vectorToSql(vector: number[]): string {
  if (!vector.length) throw new Error('Cannot serialize empty vector');
  return `[${vector.map((value) => finiteVectorValue(value).toFixed(8)).join(',')}]`;
}

function finiteVectorValue(value: number): number {
  if (!Number.isFinite(value)) throw new Error('Embedding vector contains a non-finite value');
  return value;
}

async function getLocalPipeline(): Promise<FeatureExtractionPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = import('@huggingface/transformers').then(async ({ pipeline }) => {
      const extractor = await pipeline('feature-extraction', LOCAL_EMBEDDING_MODEL);
      return extractor as FeatureExtractionPipeline;
    });
  }
  return pipelinePromise;
}

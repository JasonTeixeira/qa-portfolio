import { estimateTokens, stableHash } from './source-normalizer';

export type RagChunkInput = {
  documentKey: string;
  title?: string | null;
  body: string;
  targetTokens?: number;
  overlapTokens?: number;
};

export type RagChunk = {
  chunk_key: string;
  chunk_index: number;
  content: string;
  content_hash: string;
  token_estimate: number;
  metadata: {
    document_key: string;
    title: string | null;
    heading: string | null;
    char_start: number;
    char_end: number;
  };
};

type Segment = {
  text: string;
  heading: string | null;
  charStart: number;
  charEnd: number;
};

const DEFAULT_TARGET_TOKENS = 700;
const DEFAULT_OVERLAP_TOKENS = 120;

export function chunkRagDocument(input: RagChunkInput): RagChunk[] {
  const targetTokens = input.targetTokens ?? DEFAULT_TARGET_TOKENS;
  const overlapTokens = input.overlapTokens ?? DEFAULT_OVERLAP_TOKENS;
  if (targetTokens < 100) throw new Error('targetTokens must be at least 100');
  if (overlapTokens < 0 || overlapTokens >= targetTokens) throw new Error('overlapTokens must be lower than targetTokens');

  const segments = segmentMarkdown(input.body);
  const chunks: RagChunk[] = [];
  let buffer: Segment[] = [];
  let bufferTokens = 0;

  for (const segment of segments) {
    const segmentTokens = estimateTokens(segment.text);
    if (buffer.length && bufferTokens + segmentTokens > targetTokens) {
      chunks.push(buildChunk(input, chunks.length, buffer));
      buffer = overlapSegments(buffer, overlapTokens);
      bufferTokens = buffer.reduce((total, item) => total + estimateTokens(item.text), 0);
    }

    if (segmentTokens > targetTokens) {
      if (buffer.length) {
        chunks.push(buildChunk(input, chunks.length, buffer));
        buffer = overlapSegments(buffer, overlapTokens);
        bufferTokens = buffer.reduce((total, item) => total + estimateTokens(item.text), 0);
      }
      for (const split of splitLargeSegment(segment, targetTokens, overlapTokens)) {
        chunks.push(buildChunk(input, chunks.length, [split]));
      }
      buffer = [];
      bufferTokens = 0;
      continue;
    }

    buffer.push(segment);
    bufferTokens += segmentTokens;
  }

  if (buffer.length) chunks.push(buildChunk(input, chunks.length, buffer));
  return chunks;
}

function segmentMarkdown(body: string): Segment[] {
  const segments: Segment[] = [];
  let heading: string | null = null;
  let cursor = 0;
  const blocks = body.split(/(\n{2,})/);

  for (const block of blocks) {
    const charStart = cursor;
    cursor += block.length;
    if (!block.trim()) continue;

    const trimmed = block.trim();
    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/m);
    if (headingMatch) heading = headingMatch[1].trim();

    const parts = trimmed.startsWith('```') ? [trimmed] : trimmed.split(/(?<=[.!?])\s+(?=[A-Z0-9#])/);
    for (const part of parts) {
      const text = part.trim();
      if (!text) continue;
      const offset = block.indexOf(part);
      segments.push({
        text,
        heading,
        charStart: offset >= 0 ? charStart + offset : charStart,
        charEnd: offset >= 0 ? charStart + offset + part.length : charStart + block.length,
      });
    }
  }

  return segments;
}

function overlapSegments(segments: Segment[], overlapTokens: number): Segment[] {
  if (!overlapTokens) return [];
  const selected: Segment[] = [];
  let tokens = 0;
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    const segmentTokens = estimateTokens(segment.text);
    if (selected.length && tokens + segmentTokens > overlapTokens) break;
    selected.unshift(segment);
    tokens += segmentTokens;
  }
  return selected;
}

function splitLargeSegment(segment: Segment, targetTokens: number, overlapTokens: number): Segment[] {
  const targetChars = targetTokens * 4;
  const overlapChars = overlapTokens * 4;
  const result: Segment[] = [];
  let start = 0;
  while (start < segment.text.length) {
    const end = Math.min(segment.text.length, start + targetChars);
    const text = segment.text.slice(start, end).trim();
    if (text) {
      result.push({
        text,
        heading: segment.heading,
        charStart: segment.charStart + start,
        charEnd: segment.charStart + end,
      });
    }
    if (end === segment.text.length) break;
    start = Math.max(end - overlapChars, start + 1);
  }
  return result;
}

function buildChunk(input: RagChunkInput, index: number, segments: Segment[]): RagChunk {
  const content = segments.map((segment) => segment.text).join('\n\n').trim();
  return {
    chunk_key: `chunk:${input.documentKey}:${index}`,
    chunk_index: index,
    content,
    content_hash: stableHash(content),
    token_estimate: estimateTokens(content),
    metadata: {
      document_key: input.documentKey,
      title: input.title?.trim() || null,
      heading: segments.findLast((segment) => segment.heading)?.heading ?? null,
      char_start: Math.min(...segments.map((segment) => segment.charStart)),
      char_end: Math.max(...segments.map((segment) => segment.charEnd)),
    },
  };
}

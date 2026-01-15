import type { QualityMetricsSnapshot } from '@/lib/qualityMetrics';
import type { Readable } from 'node:stream';

// Minimal AWS read path.
// For local/dev and cost reasons, we keep this optional and use best-effort fallback.
//
// Environment variables:
// - QUALITY_AWS_BUCKET: S3 bucket name
// - QUALITY_AWS_PREFIX: prefix (default: metrics)
// - QUALITY_AWS_OWNER: GitHub owner (default: QUALITY_GITHUB_OWNER)
// - QUALITY_AWS_REGION: region (optional; AWS SDK can infer)

export async function tryFetchAwsMetricsLatest(): Promise<
  | { ok: true; snapshot: QualityMetricsSnapshot; notes?: string }
  | { ok: false; notes: string }
> {
  const bucket = process.env.QUALITY_AWS_BUCKET;
  const prefix = process.env.QUALITY_AWS_PREFIX || 'metrics';

  if (!bucket) {
    return { ok: false, notes: 'AWS mode not configured (QUALITY_AWS_BUCKET missing).' };
  }

  try {
    // Lazy import so the AWS SDK is only required when AWS mode is used.
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');

    const client = new S3Client({});

    // We read the latest generated snapshot object written by CI.
    // Convention: metrics/qa-portfolio/latest.json
    const latestKey = `${prefix}/qa-portfolio/latest.json`;

    const obj = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: latestKey,
      })
    );

    const body = obj.Body;
    if (!body) return { ok: false, notes: `S3 object ${latestKey} had no body.` };

    const text = await streamToString(body as unknown as Readable);
    const parsed = JSON.parse(text) as QualityMetricsSnapshot;
    return { ok: true, snapshot: parsed, notes: `Loaded from s3://${bucket}/${latestKey}` };
  } catch (e) {
    return { ok: false, notes: e instanceof Error ? e.message : String(e) };
  }
}

async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);
  });
}

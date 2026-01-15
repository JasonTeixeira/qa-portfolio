import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let cached: DynamoDBDocumentClient | null = null;

export function getDynamoDocClient(): DynamoDBDocumentClient {
  if (cached) return cached;

  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
  const client = new DynamoDBClient({ region });
  cached = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
  return cached;
}

import { NextResponse, type NextRequest } from 'next/server';
import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDocClient } from '@/lib/awsDynamo';
import { nowIso, sha256, subscriberPk, subscriberSk, normalizeEmail } from '@/lib/newsletter';

export const dynamic = 'force-static';

const TABLE = process.env.NEWSLETTER_TABLE_NAME;

function redirect(url: string) {
  // NextResponse.redirect requires an absolute URL.
  const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3040';
  return NextResponse.redirect(new URL(url, base), { status: 302 });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const emailRaw = url.searchParams.get('email') ?? '';
  const token = url.searchParams.get('token') ?? '';

  const okRedirect = url.searchParams.get('ok') ?? '/blog';
  const errRedirect = url.searchParams.get('err') ?? '/blog';

  const email = normalizeEmail(emailRaw);
  if (!email || !token) return redirect(errRedirect);
  if (!TABLE) return redirect(okRedirect);

  const db = getDynamoDocClient();
  const existing = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: {
        ':pk': subscriberPk(email),
        ':sk': subscriberSk,
      },
      Limit: 1,
    })
  );

  const item = existing.Items?.[0] as Record<string, unknown> | undefined;
  if (!item) return redirect(errRedirect);
  const currentHash = (item.confirmTokenHash as string | undefined) ?? '';
  const currentStatus = (item.status as string | undefined) ?? '';
  if (currentStatus === 'active') return redirect(okRedirect);
  if (!currentHash || currentHash !== sha256(token)) return redirect(errRedirect);

  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { pk: subscriberPk(email), sk: subscriberSk },
      UpdateExpression: 'SET #status = :active, updatedAt = :now, confirmedAt = :now REMOVE confirmTokenHash',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':active': 'active',
        ':now': nowIso(),
      },
    })
  );

  return redirect(okRedirect);
}

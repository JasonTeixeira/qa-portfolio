import { NextResponse, type NextRequest } from 'next/server';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDocClient } from '@/lib/awsDynamo';
import { nowIso, subscriberPk, subscriberSk, normalizeEmail } from '@/lib/newsletter';

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
  const okRedirect = url.searchParams.get('ok') ?? '/blog';

  const email = normalizeEmail(emailRaw);
  if (!email) return redirect(okRedirect);
  if (!TABLE) return redirect(okRedirect);

  const db = getDynamoDocClient();
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { pk: subscriberPk(email), sk: subscriberSk },
      UpdateExpression: 'SET #status = :u, updatedAt = :now, unsubscribedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':u': 'unsubscribed',
        ':now': nowIso(),
      },
    })
  );

  return redirect(okRedirect);
}

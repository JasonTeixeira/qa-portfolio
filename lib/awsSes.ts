import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

let cached: SESv2Client | null = null;

function getSesClient(): SESv2Client {
  if (cached) return cached;
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
  cached = new SESv2Client({ region });
  return cached;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const from = process.env.SES_FROM_EMAIL;
  if (!from) {
    // Dev-safe fallback: do not throw; log the email so local dev works.
    console.log('[email:dev-fallback] SES_FROM_EMAIL not set. Would send:', {
      to: params.to,
      subject: params.subject,
    });
    return;
  }

  const client = getSesClient();
  const cmd = new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [params.to] },
    Content: {
      Simple: {
        Subject: { Data: params.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: params.html, Charset: 'UTF-8' },
          ...(params.text ? { Text: { Data: params.text, Charset: 'UTF-8' } } : {}),
        },
      },
    },
  });
  await client.send(cmd);
}

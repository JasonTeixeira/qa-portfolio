const crypto = require('crypto');
const {
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const {
  SESv2Client,
  SendEmailCommand,
} = require('@aws-sdk/client-sesv2');

const {
  S3Client,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');

const NEWSLETTER_TABLE_NAME = process.env.NEWSLETTER_TABLE_NAME;
const SITE_URL = process.env.SITE_URL || 'https://sageideas.dev';
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;

// Optional: metrics proxy (no AWS creds in Vercel)
const METRICS_BUCKET = process.env.METRICS_BUCKET;
const METRICS_KEY = process.env.METRICS_KEY || 'metrics/qa-portfolio/latest.json';
const METRICS_SHARED_TOKEN = process.env.METRICS_SHARED_TOKEN; // optional

const s3 = new S3Client({});

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESv2Client({});

function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

function log(level, msg, extra = {}) {
  // Structured JSON logging for CloudWatch Logs Insights
  console.log(
    JSON.stringify({
      level,
      msg,
      ...extra,
      ts: new Date().toISOString(),
    })
  );
}

function redirect(location) {
  return {
    statusCode: 302,
    headers: {
      Location: location,
      'cache-control': 'no-store',
    },
    body: '',
  };
}

function normalizeEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  return e;
}

function subscriberPk(email) {
  return `SUB#${email}`;
}

function subscriberSk() {
  return 'PROFILE';
}

function sha256(s) {
  return crypto.createHash('sha256').update(String(s || ''), 'utf8').digest('hex');
}

function randomToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function sendEmail({ to, subject, html, text }) {
  if (!SES_FROM_EMAIL) throw new Error('SES_FROM_EMAIL not configured');
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: SES_FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: {
            Html: { Data: html },
            Text: { Data: text },
          },
        },
      },
    })
  );
}

function getBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);
  });
}

function forbidden(message = 'Forbidden') {
  return json(403, { error: message });
}

async function handleMetricsLatest(event) {
  if (!METRICS_BUCKET) return json(500, { error: 'METRICS_BUCKET not configured' });

  // Optional shared token (simple protection against casual scraping).
  if (METRICS_SHARED_TOKEN) {
    const token = event?.headers?.['x-metrics-token'] || event?.headers?.['X-Metrics-Token'];
    if (!token || token !== METRICS_SHARED_TOKEN) return forbidden('Missing or invalid metrics token');
  }

  const obj = await s3.send(
    new GetObjectCommand({
      Bucket: METRICS_BUCKET,
      Key: METRICS_KEY,
    })
  );

  if (!obj.Body) return json(404, { error: 'Metrics object had no body' });
  const raw = await streamToString(obj.Body);

  // Validate JSON quickly (avoid sending invalid responses)
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json(500, { error: 'Metrics object is not valid JSON' });
  }

  return json(200, {
    ...parsed,
    summary: {
      ...(parsed.summary || {}),
      notes: `Loaded via AWS proxy API from s3://${METRICS_BUCKET}/${METRICS_KEY}`,
    },
  }, {
    'cache-control': 'no-store',
  });
}

function badRequest(message, details) {
  return json(400, { error: message, ...(details ? { details } : {}) });
}

function validateString(name, value, { required = false, max = 0 } = {}) {
  const v = value == null ? '' : String(value);
  if (required && !v.trim()) return `${name} is required`;
  if (max && v.length > max) return `${name} is too long (max ${max})`;
  return null;
}

function validateEmail(email) {
  const e = normalizeEmail(email);
  if (!e) return 'email is required';
  if (e.length > 320) return 'email is too long';
  // intentionally simple (avoid complex regex)
  if (!e.includes('@') || e.startsWith('@') || e.endsWith('@')) return 'email is invalid';
  return null;
}

function routeKey(event) {
  // HTTP API v2
  const method = event?.requestContext?.http?.method;
  const pathRaw = event?.requestContext?.http?.path || '';
  // When using custom domains + stages, some requests include '/<stage>' in the path.
  // Normalize so our routing works regardless.
  const path = pathRaw.replace(/^\/prod\b/, '') || '/';
  return `${method} ${path}`;
}

async function handleContact(event) {
  const body = getBody(event);
  const name = String(body.name || '');
  const email = String(body.email || '');
  const company = String(body.company || '');
  const website = String(body.website || '');
  const subject = String(body.subject || '');
  const message = String(body.message || '');
  const honey = String(body.honey || '');

  if (honey) return json(200, { success: true });

  const errors = [
    validateString('name', name, { required: true, max: 120 }),
    validateEmail(email),
    validateString('message', message, { required: true, max: 5000 }),
    validateString('company', company, { required: false, max: 120 }),
    validateString('website', website, { required: false, max: 200 }),
    validateString('subject', subject, { required: false, max: 200 }),
  ].filter(Boolean);
  if (errors.length) return badRequest('Invalid request', errors);
  if (!CONTACT_TO_EMAIL) return json(500, { error: 'CONTACT_TO_EMAIL not configured' });

  const subj = subject ? `Portfolio: ${subject}` : `Portfolio Contact from ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    website ? `Website: ${website}` : null,
    '',
    message,
  ].filter(Boolean).join('\n');

  await sendEmail({
    to: CONTACT_TO_EMAIL,
    subject: subj,
    html: `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${text.replace(/</g, '&lt;')}</pre>`,
    text,
  });

  return json(200, { success: true });
}

async function handleNewsletterSubscribe(event) {
  if (!NEWSLETTER_TABLE_NAME) return json(500, { error: 'NEWSLETTER_TABLE_NAME not configured' });
  const body = getBody(event);
  const emailRaw = String(body.email || '');
  const source = body.source ? String(body.source) : undefined;
  const honey = String(body.honey || '');
  if (honey) return json(200, { ok: true });

  const eErr = validateEmail(emailRaw);
  const sErr = validateString('source', source || '', { required: false, max: 50 });
  const errs = [eErr, sErr].filter(Boolean);
  if (errs.length) return badRequest('Invalid request', errs);

  const email = normalizeEmail(emailRaw);

  const pk = subscriberPk(email);
  const sk = subscriberSk();

  const existing = await ddb.send(
    new QueryCommand({
      TableName: NEWSLETTER_TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
      Limit: 1,
    })
  );

  const item = (existing.Items || [])[0];
  const status = item?.status;
  if (status === 'active') return json(200, { ok: true });

  const token = randomToken();
  const tokenHash = sha256(token);
  const now = new Date().toISOString();

  if (!item) {
    await ddb.send(
      new PutCommand({
        TableName: NEWSLETTER_TABLE_NAME,
        Item: { pk, sk, email, status: 'pending', source: source || 'unknown', createdAt: now, updatedAt: now, confirmTokenHash: tokenHash },
        ConditionExpression: 'attribute_not_exists(pk)',
      })
    );
  } else {
    await ddb.send(
      new UpdateCommand({
        TableName: NEWSLETTER_TABLE_NAME,
        Key: { pk, sk },
        UpdateExpression: 'SET #status = :pending, updatedAt = :now, confirmTokenHash = :h, source = if_not_exists(source, :source)',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':pending': 'pending', ':now': now, ':h': tokenHash, ':source': source || 'unknown' },
      })
    );
  }

  const confirmUrl = new URL('/newsletter/confirm', SITE_URL.replace('https://sageideas.dev', 'https://api.sageideas.dev'));
  // For safety, build based on API domain if SITE_URL is the site.
  confirmUrl.searchParams.set('email', email);
  confirmUrl.searchParams.set('token', token);
  confirmUrl.searchParams.set('ok', '/blog');
  confirmUrl.searchParams.set('err', '/blog');

  await sendEmail({
    to: email,
    subject: 'Confirm your subscription',
    html: `<div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
      <h2>Confirm your subscription</h2>
      <p>Click the link below to confirm:</p>
      <p><a href="${confirmUrl.toString()}">${confirmUrl.toString()}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>`,
    text: `Confirm your subscription: ${confirmUrl.toString()}`,
  });

  return json(200, { ok: true });
}

async function handleNewsletterConfirm(event) {
  if (!NEWSLETTER_TABLE_NAME) return redirect(new URL('/blog', SITE_URL).toString());

  const qs = event.queryStringParameters || {};
  const email = normalizeEmail(qs.email || '');
  const token = String(qs.token || '');
  const ok = String(qs.ok || '/blog');
  const err = String(qs.err || '/blog');

  const okUrl = new URL(ok, SITE_URL).toString();
  const errUrl = new URL(err, SITE_URL).toString();
  if (!email || !token) return redirect(errUrl);

  const pk = subscriberPk(email);
  const sk = subscriberSk();
  const existing = await ddb.send(
    new QueryCommand({
      TableName: NEWSLETTER_TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
      Limit: 1,
    })
  );
  const item = (existing.Items || [])[0];
  if (!item) return redirect(errUrl);
  if (item.status === 'active') return redirect(okUrl);
  if (!item.confirmTokenHash || item.confirmTokenHash !== sha256(token)) return redirect(errUrl);

  const now = new Date().toISOString();
  await ddb.send(
    new UpdateCommand({
      TableName: NEWSLETTER_TABLE_NAME,
      Key: { pk, sk },
      UpdateExpression: 'SET #status = :active, updatedAt = :now, confirmedAt = :now REMOVE confirmTokenHash',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':active': 'active', ':now': now },
    })
  );
  return redirect(okUrl);
}

async function handleNewsletterUnsubscribe(event) {
  if (!NEWSLETTER_TABLE_NAME) return redirect(new URL('/blog', SITE_URL).toString());
  const qs = event.queryStringParameters || {};
  const email = normalizeEmail(qs.email || '');
  const ok = String(qs.ok || '/blog');
  const okUrl = new URL(ok, SITE_URL).toString();
  if (!email) return redirect(okUrl);

  const pk = subscriberPk(email);
  const sk = subscriberSk();
  const now = new Date().toISOString();
  await ddb.send(
    new UpdateCommand({
      TableName: NEWSLETTER_TABLE_NAME,
      Key: { pk, sk },
      UpdateExpression: 'SET #status = :u, updatedAt = :now, unsubscribedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':u': 'unsubscribed', ':now': now },
    })
  );

  return redirect(okUrl);
}

async function handleHealth(event) {
  return json(200, {
    ok: true,
    service: 'qa-portfolio-api',
    region: process.env.AWS_REGION,
    now: new Date().toISOString(),
  });
}

async function handleApiRoot(event) {
  return json(200, {
    ok: true,
    service: 'qa-portfolio-api',
    endpoints: [
      'GET /health',
      'GET /metrics/latest',
      'POST /contact',
      'POST /newsletter/subscribe',
      'GET /newsletter/confirm',
      'GET /newsletter/unsubscribe',
    ],
    now: new Date().toISOString(),
  });
}

exports.handler = async (event) => {
  const key = routeKey(event);

  log('info', 'request', {
    routeKey: key,
    requestId: event?.requestContext?.requestId,
    sourceIp: event?.requestContext?.http?.sourceIp,
    userAgent: event?.requestContext?.http?.userAgent,
  });

  try {
    if (key === 'GET /') return await handleApiRoot(event);
    if (key === 'GET /metrics/latest') return await handleMetricsLatest(event);
    if (key === 'POST /contact') return await handleContact(event);
    if (key === 'POST /newsletter/subscribe') return await handleNewsletterSubscribe(event);
    if (key === 'GET /newsletter/confirm') return await handleNewsletterConfirm(event);
    if (key === 'GET /newsletter/unsubscribe') return await handleNewsletterUnsubscribe(event);
    if (key === 'GET /health') return await handleHealth(event);

    return json(404, { error: 'Not found', routeKey: key });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    log('error', 'handler_error', { routeKey: key, error: msg });
    return json(500, { error: msg });
  }
};

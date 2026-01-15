import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

// Web3Forms - 100% FREE (no credit card needed!)
// Get your access key at: https://web3forms.com
// IMPORTANT: Keep the key server-side (do not expose it as NEXT_PUBLIC_*).
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

// Very lightweight in-memory rate limit (sufficient for a small portfolio).
// For higher-traffic: use Vercel KV/Upstash or a dedicated rate-limit middleware.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const hits = new Map<string, number[]>();

function rateLimitKey(req: NextRequest) {
  // Prefer x-forwarded-for (Vercel) and fall back to request.ip.
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  // NextRequest doesn't type `ip` consistently across runtimes.
  // We rely on x-forwarded-for, otherwise group as 'unknown'.
  return fwd || 'unknown';
}

function isRateLimited(key: string) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  return list.length > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  try {
    if (!WEB3FORMS_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Contact form is not configured' },
        { status: 500 }
      );
    }

    const key = rateLimitKey(request);
    if (isRateLimited(key)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, company, website, honey } = body;

    // Honeypot field (bots tend to fill hidden inputs)
    if (honey) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Minimal sanitization (avoid huge payloads)
    if (String(message).length > 5000) {
      return NextResponse.json(
        { error: 'Message too long' },
        { status: 400 }
      );
    }

    // Send to Web3Forms (FREE service)
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        name,
        email,
        subject: subject ? `Portfolio: ${subject}` : `Portfolio Contact from ${name}`,
        message,
        // Optional metadata
        company,
        website,
        from_name: 'Portfolio Contact Form',
        to: 'sage@sageideas.org',
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ success: true, data }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: data.message || 'Failed to send message' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

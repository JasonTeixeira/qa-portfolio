import type { NextRequest } from 'next/server';
import { ingestRevenueWebhook } from '@/lib/revenue-os/public-api-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return ingestRevenueWebhook(req);
}

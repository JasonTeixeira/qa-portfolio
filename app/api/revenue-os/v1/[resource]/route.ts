import type { NextRequest } from 'next/server';
import {
  exportRevenueResource,
  ingestRevenueResource,
} from '@/lib/revenue-os/public-api-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ resource: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const { resource } = await context.params;
  return ingestRevenueResource(req, resource);
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { resource } = await context.params;
  if (resource === 'exports') return exportRevenueResource(req);
  return Response.json({ error: 'method_not_allowed' }, { status: 405 });
}

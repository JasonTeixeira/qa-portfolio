import { GET as learningLabGET } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  url.searchParams.set('cadence', 'weekly');
  return learningLabGET(new Request(url, req));
}

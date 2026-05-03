import { createClient } from '@supabase/supabase-js';

// Service-role client for server-side operations.
// Used inside API routes and server components after Clerk auth has gated access.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

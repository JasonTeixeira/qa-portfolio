'use client';
import { createClient } from '@supabase/supabase-js';

// Anon client for browser use (realtime subscriptions only).
let browserClient: ReturnType<typeof createClient> | null = null;
export function supabaseBrowser() {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
  }
  return browserClient;
}

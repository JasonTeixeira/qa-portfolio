import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('app_role, approval_status')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.app_role === 'admin') return NextResponse.redirect(`${origin}/admin`);
  if (profile?.approval_status === 'approved')
    return NextResponse.redirect(`${origin}/portal`);
  return NextResponse.redirect(`${origin}/pending-approval`);
}

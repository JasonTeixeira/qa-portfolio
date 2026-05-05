import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/auth/redirect';
  const errorParam = searchParams.get('error_description') ?? searchParams.get('error');

  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorParam)}`);
  }

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'magiclink' | 'recovery' | 'invite' | 'signup',
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

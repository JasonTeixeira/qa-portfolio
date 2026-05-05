'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server';

type Provider = 'google' | 'github' | 'linkedin_oidc';

function siteOrigin(reqHeaders: Awaited<ReturnType<typeof headers>>) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const host = reqHeaders.get('x-forwarded-host') ?? reqHeaders.get('host');
  const proto = reqHeaders.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function signInWithMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = String(formData.get('next') ?? '/auth/redirect');
  if (!email) redirect('/login?error=missing_email');

  const supabase = await createSupabaseServerClient();
  const h = await headers();
  const origin = siteOrigin(h);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function signInWithProvider(formData: FormData): Promise<void> {
  const provider = String(formData.get('provider') ?? '') as Provider;
  const next = String(formData.get('next') ?? '/auth/redirect');
  if (!['google', 'github', 'linkedin_oidc'].includes(provider)) {
    redirect('/login?error=invalid_provider');
  }

  const supabase = await createSupabaseServerClient();
  const h = await headers();
  const origin = siteOrigin(h);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data?.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? 'oauth_failed')}`);
  }

  redirect(data.url);
}

export async function signUpWithMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const roleInCompany = String(formData.get('role_in_company') ?? '').trim();
  if (!email) redirect('/signup?error=missing_email');

  const supabase = await createSupabaseServerClient();
  const h = await headers();
  const origin = siteOrigin(h);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/auth/redirect`,
      shouldCreateUser: true,
      data: {
        full_name: fullName,
        company,
        role_in_company: roleInCompany,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Stash company/role into profiles via admin client once the auth row exists
  // (the trigger creates the profile; we patch with intake fields now).
  try {
    const sb = supabaseAdmin();
    await sb
      .from('profiles')
      .update({ full_name: fullName, company, role_in_company: roleInCompany })
      .eq('email', email);
  } catch {
    // Non-fatal — the next callback can still complete sign-in.
  }

  redirect(`/signup?step=3&email=${encodeURIComponent(email)}`);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function approveProfile(formData: FormData): Promise<void> {
  const targetId = String(formData.get('id') ?? '');
  if (!targetId) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify caller is admin via service-role lookup (bypasses RLS recursion concerns).
  const sb = supabaseAdmin();
  const { data: caller } = await sb
    .from('profiles')
    .select('app_role')
    .eq('id', user.id)
    .maybeSingle();
  if (caller?.app_role !== 'admin') redirect('/portal/home');

  await sb
    .from('profiles')
    .update({
      approval_status: 'approved',
      app_role: 'client',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq('id', targetId);

  redirect('/admin');
}

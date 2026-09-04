'use server';

import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server';
import { attributeReferral } from '@/lib/academy/referrals';
import { logAudit } from '@/lib/admin-guard';
import { sendWelcomeEmail } from '@/lib/welcomeEmail';
import { checkRateLimitFromHeaders } from '@/lib/rate-limit';
import { safeRelativeRedirect } from '@/lib/security/safe-redirect';

type Provider = 'google' | 'github' | 'linkedin_oidc';

const AUTH_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 } as const;

function siteOrigin(reqHeaders: Awaited<ReturnType<typeof headers>>) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const host = reqHeaders.get('x-forwarded-host') ?? reqHeaders.get('host');
  const proto = reqHeaders.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

export async function signInWithMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = safeRelativeRedirect(formData.get('next'), '/auth/redirect');
  if (!email) redirect('/login?error=missing_email');

  const h = await headers();
  const rl = await checkRateLimitFromHeaders(h, { ...AUTH_LIMIT, prefix: 'auth:magic' });
  if (!rl.ok) {
    redirect(`/login?error=${encodeURIComponent(rateLimitMessage(rl.retryAfterSeconds))}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createSupabaseServerClient();
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

export async function signInWithPassword(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = safeRelativeRedirect(formData.get('next'), '/auth/redirect');
  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent('Email and password are required.')}&next=${encodeURIComponent(next)}`,
    );
  }

  const h = await headers();
  const rl = await checkRateLimitFromHeaders(h, { ...AUTH_LIMIT, prefix: 'auth:signin' });
  if (!rl.ok) {
    redirect(
      `/login?error=${encodeURIComponent(rateLimitMessage(rl.retryAfterSeconds))}&next=${encodeURIComponent(next)}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent('Invalid email or password.')}&next=${encodeURIComponent(next)}`,
    );
  }

  if (data.user) {
    await logAudit({
      actorId: data.user.id,
      actorEmail: data.user.email ?? email,
      action: 'auth.login',
      entityType: 'session',
      entityId: data.user.id,
      after: { method: 'password' },
    });
  }

  redirect(next);
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) redirect('/auth/forgot-password?error=missing_email');

  const h = await headers();
  const rl = await checkRateLimitFromHeaders(h, { ...AUTH_LIMIT, prefix: 'auth:reset' });
  if (!rl.ok) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent(rateLimitMessage(rl.retryAfterSeconds))}`);
  }

  const supabase = await createSupabaseServerClient();
  const origin = siteOrigin(h);

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset`,
  });

  redirect(`/auth/forgot-password?sent=1&email=${encodeURIComponent(email)}`);
}

export async function updatePassword(formData: FormData): Promise<void> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm_password') ?? '');

  if (!password || password.length < 8) {
    redirect(
      `/auth/reset?error=${encodeURIComponent('Password must be at least 8 characters.')}`,
    );
  }
  if (password !== confirm) {
    redirect(`/auth/reset?error=${encodeURIComponent('Passwords do not match.')}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/auth/reset?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/auth/redirect');
}

export async function signInWithProvider(formData: FormData): Promise<void> {
  const provider = String(formData.get('provider') ?? '') as Provider;
  const next = safeRelativeRedirect(formData.get('next'), '/auth/redirect');
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
  const goals = formData.getAll('goals').map((g) => String(g)).filter(Boolean);
  if (!email) redirect('/signup?error=missing_email');

  const h = await headers();
  const rl = await checkRateLimitFromHeaders(h, { ...AUTH_LIMIT, prefix: 'auth:signup-magic' });
  if (!rl.ok) {
    redirect(`/signup?error=${encodeURIComponent(rateLimitMessage(rl.retryAfterSeconds))}`);
  }

  const supabase = await createSupabaseServerClient();
  const origin = siteOrigin(h);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      shouldCreateUser: true,
      data: {
        full_name: fullName,
        company,
        role_in_company: roleInCompany,
        goals,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  try {
    const sb = supabaseAdmin();
    await sb
      .from('profiles')
      .update({ full_name: fullName, company, role_in_company: roleInCompany })
      .eq('email', email);
  } catch {
    // Non-fatal — the next callback can still complete sign-in.
  }

  // Fire-and-forget welcome email; never block signup on send failures.
  void sendWelcomeEmail({ to: email, fullName }).catch(() => undefined);

  redirect(`/onboarding?email=${encodeURIComponent(email)}&pending=1`);
}

export async function signUpWithPassword(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const roleInCompany = String(formData.get('role_in_company') ?? '').trim();
  const goals = formData.getAll('goals').map((g) => String(g)).filter(Boolean);

  if (!email) redirect('/signup?error=missing_email');
  if (!password || password.length < 8) {
    redirect(`/signup?step=1&email=${encodeURIComponent(email)}&error=${encodeURIComponent('Password must be at least 8 characters.')}`);
  }

  const h = await headers();
  const rl = await checkRateLimitFromHeaders(h, { ...AUTH_LIMIT, prefix: 'auth:signup' });
  if (!rl.ok) {
    redirect(`/signup?error=${encodeURIComponent(rateLimitMessage(rl.retryAfterSeconds))}`);
  }

  const supabase = await createSupabaseServerClient();
  const origin = siteOrigin(h);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      data: {
        full_name: fullName,
        company,
        role_in_company: roleInCompany,
        goals,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  try {
    const sb = supabaseAdmin();
    await sb
      .from('profiles')
      .update({ full_name: fullName, company, role_in_company: roleInCompany })
      .eq('email', email);
  } catch {
    // Non-fatal.
  }

  void sendWelcomeEmail({ to: email, fullName }).catch(() => undefined);

  redirect(`/onboarding?email=${encodeURIComponent(email)}&pending=1`);
}

export async function resendVerification(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) redirect('/onboarding?error=missing_email');

  const h = await headers();
  const rl = await checkRateLimitFromHeaders(h, { ...AUTH_LIMIT, prefix: 'auth:resend' });
  if (!rl.ok) {
    redirect(`/onboarding?email=${encodeURIComponent(email)}&error=${encodeURIComponent(rateLimitMessage(rl.retryAfterSeconds))}`);
  }

  const supabase = await createSupabaseServerClient();
  const origin = siteOrigin(h);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      shouldCreateUser: false,
    },
  });

  if (error) {
    redirect(`/onboarding?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/onboarding?email=${encodeURIComponent(email)}&resent=1`);
}

/**
 * Self-serve ACADEMY signup — the customer path (distinct from the studio "request access"
 * flow). Creates a CONFIRMED account via the admin API so there's no email round-trip to
 * break (instant access), tags audience='academy' so the post-login router sends them to the
 * learning area, then signs them in. Doubles as a sign-in if the email already exists.
 */
export async function signUpAcademy(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim().slice(0, 200);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`/academy/signup?error=${encodeURIComponent('Enter a valid email address.')}`);
  }
  if (!password || password.length < 8 || password.length > 128) {
    redirect(
      `/academy/signup?email=${encodeURIComponent(email)}&error=${encodeURIComponent('Password must be 8–128 characters.')}`,
    );
  }

  const h = await headers();
  const rl = await checkRateLimitFromHeaders(h, { ...AUTH_LIMIT, prefix: 'auth:academy-signup' });
  if (!rl.ok) {
    redirect(`/academy/signup?error=${encodeURIComponent(rateLimitMessage(rl.retryAfterSeconds))}`);
  }

  const admin = supabaseAdmin();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, audience: 'academy' },
  });
  const alreadyExists = createError != null && /already|exists|registered/i.test(createError.message);
  if (createError && !alreadyExists) {
    console.error('[auth] academy createUser failed', createError);
    redirect(
      `/academy/signup?email=${encodeURIComponent(email)}&error=${encodeURIComponent('Could not create your account. Please try again.')}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    if (alreadyExists) {
      redirect(
        `/login?audience=academy&next=/academy/dashboard&error=${encodeURIComponent('That email already has an account — sign in below.')}`,
      );
    }
    redirect(`/academy/signup?email=${encodeURIComponent(email)}&error=${encodeURIComponent('Could not sign you in. Try again.')}`);
  }

  if (data.user) {
    await logAudit({
      actorId: data.user.id,
      actorEmail: data.user.email ?? email,
      action: alreadyExists ? 'auth.login' : 'auth.signup',
      entityType: 'session',
      entityId: data.user.id,
      after: { method: 'academy_password', audience: 'academy' },
    });
  }
  if (!alreadyExists) void sendWelcomeEmail({ to: email, fullName }).catch(() => undefined);

  // Referral attribution: a new learner who arrived via a ?ref code (captured to
  // the `sage_ref` cookie) is credited to their referrer + paid the welcome bonus.
  if (!alreadyExists && data.user) {
    const cookieStore = await cookies();
    const ref = cookieStore.get('sage_ref')?.value;
    if (ref) {
      try {
        await attributeReferral(data.user.id, ref);
      } catch (err) {
        console.error('[auth] referral attribution failed', err);
      }
      cookieStore.delete('sage_ref');
    }
  }

  // New academy learners go through onboarding (the "understand the game" first run);
  // returning learners go straight to their dashboard.
  redirect(alreadyExists ? '/academy/dashboard' : '/academy/onboarding');
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function adminInviteUser(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') ?? '').trim();
  const appRole = String(formData.get('app_role') ?? 'client');

  if (!email) redirect('/admin/users?error=missing_email');
  if (!['client', 'admin'].includes(appRole)) {
    redirect('/admin/users?error=invalid_role');
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const sb = supabaseAdmin();
  const { data: caller } = await sb
    .from('profiles')
    .select('app_role')
    .eq('id', user.id)
    .maybeSingle();
  if (caller?.app_role !== 'admin') redirect('/portal');

  const h = await headers();
  const origin = siteOrigin(h);

  const { data: invited, error } = await sb.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/reset`,
    data: { full_name: fullName, invited_by: user.id },
  });

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  if (invited?.user) {
    await sb.from('profiles').upsert({
      id: invited.user.id,
      email,
      full_name: fullName || null,
      app_role: appRole,
      approval_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    });

    await logAudit({
      actorId: user.id,
      actorEmail: user.email ?? '',
      action: 'user.invite',
      entityType: 'profile',
      entityId: invited.user.id,
      after: { email, full_name: fullName || null, app_role: appRole },
    });
  }

  redirect(`/admin/users?invited=${encodeURIComponent(email)}`);
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

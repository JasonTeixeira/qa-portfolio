import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface PortalUser {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'client';
}

export interface PortalContext {
  user: PortalUser;
  organizationId: string | null;
  organizationName: string | null;
  isAdmin: boolean;
}

const ADMIN_EMAILS = ['sage@sageideas.dev', 'sage@sageideas.org'];

/**
 * Resolves the Clerk-authenticated user, upserts them into Supabase, and
 * returns their portal context (org membership, role).
 * Use in every server component / route handler that requires auth.
 */
export async function getPortalContext(): Promise<PortalContext> {
  const { userId } = await auth();
  if (!userId) redirect('/login');
  const cu = await currentUser();
  if (!cu) redirect('/login');

  const email =
    cu.primaryEmailAddress?.emailAddress ?? cu.emailAddresses?.[0]?.emailAddress ?? '';
  const fullName =
    [cu.firstName, cu.lastName].filter(Boolean).join(' ').trim() || cu.username || email;
  const avatar = cu.imageUrl ?? null;
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

  const sb = supabaseAdmin();

  // Upsert user
  const { data: upsertedUser, error: userErr } = await sb
    .from('app_users')
    .upsert(
      {
        clerk_id: userId,
        email,
        full_name: fullName,
        avatar_url: avatar,
        role: isAdmin ? 'admin' : 'client',
      },
      { onConflict: 'clerk_id' },
    )
    .select()
    .single();

  if (userErr || !upsertedUser) {
    console.error('user upsert failed', userErr);
    throw new Error('Failed to provision user');
  }

  // Find their org membership
  const { data: memberships } = await sb
    .from('org_memberships')
    .select('organization_id, organizations(id, name, slug)')
    .eq('user_id', upsertedUser.id)
    .limit(1);

  let organizationId: string | null = null;
  let organizationName: string | null = null;

  if (memberships && memberships.length > 0) {
    const m = memberships[0] as any;
    organizationId = m.organization_id;
    organizationName = m.organizations?.name ?? null;
  } else if (!isAdmin) {
    // First-time client login: auto-provision a stub org named after them.
    const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
    const { data: newOrg } = await sb
      .from('organizations')
      .insert({
        name: `${fullName.split(' ')[0]}'s Workspace`,
        slug,
        primary_contact_email: email,
        status: 'prospect',
      })
      .select()
      .single();

    if (newOrg) {
      await sb.from('org_memberships').insert({
        user_id: upsertedUser.id,
        organization_id: newOrg.id,
        role: 'owner',
      });
      organizationId = newOrg.id;
      organizationName = newOrg.name;
    }
  }

  return {
    user: upsertedUser as PortalUser,
    organizationId,
    organizationName,
    isAdmin,
  };
}

export async function requireAdmin(): Promise<PortalContext> {
  const ctx = await getPortalContext();
  if (!ctx.isAdmin) redirect('/portal/home');
  return ctx;
}

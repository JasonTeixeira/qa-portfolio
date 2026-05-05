import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type AppRole = 'pending' | 'client' | 'collaborator' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role_in_company: string | null;
  avatar_url: string | null;
  app_role: AppRole;
  approval_status: ApprovalStatus;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserWithProfile(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>;
  profile: ProfileRow;
} | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile) return null;
  return { user, profile: profile as ProfileRow };
}

export async function requireAuth() {
  const result = await getUserWithProfile();
  if (!result) redirect('/login');
  return result;
}

export async function requireApprovedUser() {
  const result = await requireAuth();
  if (result.profile.app_role === 'admin') return result;
  if (result.profile.approval_status !== 'approved') redirect('/pending-approval');
  return result;
}

export async function requireAdmin() {
  const result = await requireAuth();
  if (result.profile.app_role !== 'admin') redirect('/portal/home');
  return result;
}

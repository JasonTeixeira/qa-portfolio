import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAcademyAccess } from '@/lib/academy/access';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Signing you in · Sage Ideas',
  robots: { index: false, follow: false },
};

export default async function AuthRedirectPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('app_role, approval_status')
    .eq('id', user.id)
    .maybeSingle();

  // Route by audience. Admins → admin; approved studio CLIENTS → the project portal;
  // academy CUSTOMERS → their learning dashboard — NOT the studio "pending approval"
  // waiting room. Clients are preferred on a tie (dual identity).
  if (profile?.app_role === 'admin') redirect('/admin');
  if (profile?.approval_status === 'approved') redirect('/portal');

  // Academy customer = signed up via the academy door (metadata flag) OR has paid access.
  const isAcademyCustomer =
    user.user_metadata?.audience === 'academy' || (await getAcademyAccess()).hasFullAccess;
  if (isAcademyCustomer) redirect('/academy/dashboard');

  redirect('/pending-approval');
}

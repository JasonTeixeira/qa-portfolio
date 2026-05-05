// Auth pages depend on cookies + Supabase server actions — never statically render.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Sign in · Sage Ideas',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

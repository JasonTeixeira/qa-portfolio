// Login uses Clerk's SignIn component which needs runtime env/context.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Sign in · Sage Ideas',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

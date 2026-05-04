'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Briefcase,
  FileSignature,
  MessageSquare,
  Receipt,
  Sparkles,
  Settings2,
  ShieldCheck,
  Users,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const clientNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/portal/home', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/engagements', label: 'Engagements', icon: Briefcase },
  { href: '/portal/documents', label: 'Documents', icon: FileSignature },
  { href: '/portal/messages', label: 'Messages', icon: MessageSquare },
  { href: '/portal/billing', label: 'Billing', icon: Receipt },
  { href: '/portal/catalog', label: 'Add Services', icon: Sparkles },
];

const adminNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/portal/admin', label: 'Admin · Pipeline', icon: ShieldCheck },
  { href: '/portal/admin/clients', label: 'Clients', icon: Users },
  { href: '/portal/admin/activity', label: 'Activity', icon: Activity },
  { href: '/portal/admin/settings', label: 'Settings', icon: Settings2 },
];

function SageLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-7 h-7" fill="none" aria-label="Sage Ideas">
      <rect x="2" y="2" width="60" height="60" rx="14" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 22 L32 22 M20 32 L44 32 M20 42 L36 42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="44" cy="22" r="3" fill="currentColor" />
    </svg>
  );
}

export function Sidebar({ isAdmin = false, orgName }: { isAdmin?: boolean; orgName?: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[#27272a] bg-[#0a0a0c] sticky top-0 h-screen">
      <div className="p-5 flex items-center gap-2.5 border-b border-[#27272a]">
        <div className="text-[#06b6d4]">
          <SageLogo />
        </div>
        <div className="min-w-0">
          <div className="font-semibold tracking-tight text-[#fafafa] text-sm">The Studio</div>
          <div className="text-[10px] text-[#71717a] truncate uppercase tracking-wider">
            {orgName ?? 'Sage Ideas'}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#52525b]">
          Workspace
        </div>
        {clientNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-[#18181b] text-[#fafafa] shadow-[inset_2px_0_0_#06b6d4]'
                  : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="px-2 pt-5 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#52525b]">
              Admin
            </div>
            {adminNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname?.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                    active
                      ? 'bg-[#18181b] text-[#fafafa] shadow-[inset_2px_0_0_#8b5cf6]'
                      : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-[#27272a] flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9 ring-1 ring-[#3f3f46]',
            },
          }}
        />
        <div className="min-w-0">
          <div className="text-xs text-[#a1a1aa]">Signed in</div>
          <Link href="/portal/home" className="text-xs text-[#06b6d4] hover:text-[#22d3ee]">
            Account
          </Link>
        </div>
      </div>
    </aside>
  );
}

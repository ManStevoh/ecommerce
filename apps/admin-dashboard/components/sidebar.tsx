'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Store,
  FileText,
  Megaphone,
  Ticket,
  Image,
  Users,
  Palette,
  Shield,
  LifeBuoy,
  MessageSquare,
  LogOut,
  Menu,
  X,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { Button, cn } from '@nexora/ui';
import { clearSession, getStoredUser } from '@/lib/auth';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/support', label: 'Support', icon: LifeBuoy },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/products', label: 'Products', icon: Package },
      { href: '/reviews', label: 'Reviews', icon: MessageSquare },
      { href: '/media', label: 'Media', icon: Image },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/marketing', label: 'Overview', icon: Sparkles },
      { href: '/marketing/campaigns', label: 'Campaigns', icon: Megaphone },
      { href: '/marketing/coupons', label: 'Coupons', icon: Ticket },
      { href: '/marketing/segments', label: 'Segments', icon: Users },
    ],
  },
  {
    label: 'Content',
    items: [{ href: '/cms/pages', label: 'Landing Pages', icon: FileText }],
  },
  {
    label: 'Settings',
    items: [
      { href: '/settings', label: 'General', icon: Settings },
      { href: '/settings/branding', label: 'Theme Customize', icon: Palette },
      { href: '/settings/billing', label: 'Billing', icon: CreditCard },
      { href: '/settings/security', label: 'Security', icon: Shield },
    ],
  },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {navGroups.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active =
                href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export function Sidebar() {
  const router = useRouter();
  const user = getStoredUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  function signOut() {
    clearSession();
    router.replace('/login');
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-indigo-600" />
          <span className="font-semibold">Nexora Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold tracking-tight">Nexora Admin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 pt-6">
          <NavContent onNavigate={() => setMobileOpen(false)} />
        </nav>

        <div className="border-t border-zinc-200 p-4">
          {user?.email && (
            <p className="mb-2 truncate px-3 text-xs text-zinc-500">{user.email}</p>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-zinc-600"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}

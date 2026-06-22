'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { AuthGuard } from '@/components/auth-guard';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/reviews': 'Reviews',
  '/orders': 'Orders',
  '/support': 'Support',
  '/media': 'Media',
  '/settings': 'Settings',
  '/settings/branding': 'Theme Customize',
  '/settings/security': 'Security',
  '/cms/pages': 'Landing Pages',
  '/marketing': 'Marketing',
  '/marketing/campaigns': 'Campaigns',
  '/marketing/coupons': 'Coupons',
  '/marketing/segments': 'Segments',
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/products/')) return 'Edit Product';
  const match = Object.entries(PAGE_TITLES).find(([path]) =>
    path !== '/' && pathname.startsWith(path),
  );
  return match?.[1] ?? 'Admin';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <AuthGuard>
      {isLogin ? (
        children
      ) : (
        <div className="flex min-h-screen bg-zinc-50">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col lg:pt-0 pt-14">
            <header className="sticky top-14 z-30 hidden border-b border-zinc-200/80 bg-white/90 px-8 py-4 backdrop-blur lg:top-0 lg:block">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
                Store admin
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                {resolveTitle(pathname)}
              </h2>
            </header>
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { AuthGuard } from '@/components/auth-guard';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <AuthGuard>
      {isLogin ? (
        children
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-slate-950">{children}</main>
        </div>
      )}
    </AuthGuard>
  );
}

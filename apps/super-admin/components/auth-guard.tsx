'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(pathname === '/login');

  useEffect(() => {
    if (pathname === '/login') {
      setReady(true);
      return;
    }
    const token = localStorage.getItem('nexora_access_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (pathname === '/login') return <>{children}</>;
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}

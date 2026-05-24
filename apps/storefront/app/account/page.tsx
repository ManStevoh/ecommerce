'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nexora/ui';
import { fetchMyOrders, parseOrderTotal } from '@/lib/api';
import { clearSession, getAccessToken, getStoredUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';
import { EmptyState, LoadingBlock, PageHeader } from '@/components/page-shell';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export default function AccountPage() {
  const router = useRouter();
  const user = getStoredUser();

  useEffect(() => {
    if (!getAccessToken()) router.replace('/login');
  }, [router]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => fetchMyOrders(TENANT_ID),
    enabled: !!getAccessToken() && !!TENANT_ID,
  });

  function handleSignOut() {
    clearSession();
    router.push('/');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="My account"
        description={user?.email ?? 'Manage your orders and preferences'}
        action={
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/wishlist"
          className="rounded-xl border border-zinc-200/60 bg-white/70 p-4 text-sm backdrop-blur-xl transition hover:border-amber-500/40 dark:border-zinc-800 dark:bg-zinc-950/70"
        >
          <p className="font-medium">Wishlist</p>
          <p className="mt-1 text-zinc-500">Saved products</p>
        </Link>
        <Link
          href="/support"
          className="rounded-xl border border-zinc-200/60 bg-white/70 p-4 text-sm backdrop-blur-xl transition hover:border-amber-500/40 dark:border-zinc-800 dark:bg-zinc-950/70"
        >
          <p className="font-medium">Support</p>
          <p className="mt-1 text-zinc-500">Get help with orders</p>
        </Link>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Order history</CardTitle>
          <CardDescription>Recent purchases from this store</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingBlock rows={4} />
          ) : !orders?.length ? (
            <EmptyState
              title="No orders yet"
              description="When you place an order, it will show up here."
              actionLabel="Start shopping"
              actionHref="/"
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(parseOrderTotal(order.totalAmount))}
                    </p>
                    <Badge variant="secondary">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

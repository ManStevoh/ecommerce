'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { DollarSign, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from '@nexora/ui';
import { StatCard } from '@/components/stat-card';
import {
  fetchAnalyticsConversion,
  fetchAnalyticsFunnel,
  fetchDashboardStats,
  fetchOrders,
} from '@/lib/api';

function statusVariant(status: string) {
  const s = status.toLowerCase();
  if (s === 'delivered' || s === 'completed') return 'success' as const;
  if (s === 'pending') return 'warning' as const;
  return 'secondary' as const;
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: fetchOrders,
  });

  const { data: conversion, isLoading: conversionLoading } = useQuery({
    queryKey: ['analytics-conversion'],
    queryFn: fetchAnalyticsConversion,
  });

  const { data: funnel, isLoading: funnelLoading } = useQuery({
    queryKey: ['analytics-funnel'],
    queryFn: fetchAnalyticsFunnel,
  });

  const funnelLabels: Record<string, string> = {
    visit: 'Store visits',
    product_view: 'Product views',
    add_to_cart: 'Add to cart',
    checkout: 'Checkout started',
    purchase: 'Purchases',
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Dashboard"
        description="Live data from your Nexora store"
        action={
          <Link href="/orders">
            <Button variant="outline">View all orders</Button>
          </Link>
        }
      />

      {/* GitHub Actions Test Banner */}
      <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4 text-center text-sm text-purple-900 shadow-sm dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-300">
        🚀 <strong>GitHub Actions Deploy Test:</strong> If you see this message in the Admin Dashboard, the automated deployment pipeline is working successfully!
      </div>

      <div className="fixed bottom-4 right-4 z-50 rounded bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
        GitHub Actions Test: Active (Admin)
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue"
          value={`KES ${(stats?.revenue ?? 0).toLocaleString()}`}
          change="From completed orders"
          icon={DollarSign}
          loading={statsLoading}
        />
        <StatCard
          title="Orders"
          value={String(stats?.orders ?? 0)}
          icon={ShoppingCart}
          loading={statsLoading}
        />
        <StatCard
          title="Products"
          value={String(stats?.products ?? 0)}
          icon={Package}
          loading={statsLoading}
        />
        <StatCard
          title="Customers"
          value={String(stats?.customers ?? 0)}
          change="Unique emails"
          icon={Users}
          loading={statsLoading}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-zinc-500" />
              Conversion (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conversionLoading ? (
              <p className="text-sm text-zinc-500">Loading analytics…</p>
            ) : conversion ? (
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-zinc-500">Conversion rate</dt>
                  <dd className="text-lg font-semibold">
                    {(conversion.conversionRate * 100).toFixed(1)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Cart abandonment</dt>
                  <dd className="text-lg font-semibold">
                    {(conversion.cartAbandonmentRate * 100).toFixed(0)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Purchases</dt>
                  <dd className="font-medium">{conversion.purchases}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Checkouts started</dt>
                  <dd className="font-medium">{conversion.checkoutStarted}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-zinc-500">Analytics unavailable.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Sales funnel (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <p className="text-sm text-zinc-500">Loading funnel…</p>
            ) : funnel?.steps?.length ? (
              <ul className="space-y-3">
                {funnel.steps.map((step) => {
                  const max = funnel.steps[0]?.count ?? 1;
                  const width = Math.max(8, Math.round((step.count / max) * 100));
                  return (
                    <li key={step.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{funnelLabels[step.name] ?? step.name}</span>
                        <span className="text-zinc-500">{step.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No funnel data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <TableSkeleton rows={4} />
          ) : !orders?.length ? (
            <p className="text-sm text-zinc-500">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>KES {order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

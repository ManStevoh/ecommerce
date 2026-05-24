"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { PlatformStat } from "@/components/platform-stat";
import { Card, CardContent, CardHeader, CardTitle } from "@nexora/ui";
import {
  fetchPlatformStats,
  fetchPlatformSubscriptions,
  fetchTenants,
} from "@/lib/api";

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["platform-subscriptions"],
    queryFn: fetchPlatformSubscriptions,
  });

  const { data: tenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
  });

  const planDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tenant of tenants ?? []) {
      const plan = tenant.plan?.name ?? "No plan";
      counts.set(plan, (counts.get(plan) ?? 0) + 1);
    }
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(counts.entries())
      .map(([plan, count]) => ({
        plan,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [tenants]);

  const activeSubs = subscriptions?.filter((s) => s.status === "ACTIVE").length ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Global Analytics</h1>
        <p className="text-slate-400">Platform-wide performance metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlatformStat
          title="Total Tenants"
          value={isLoading ? "—" : String(stats?.totalTenants ?? 0)}
          subtitle={`${stats?.activeTenants ?? 0} active`}
          icon={Building2}
        />
        <PlatformStat
          title="Platform MRR"
          value={
            isLoading ? "—" : `$${(stats?.totalMrr ?? 0).toLocaleString()}`
          }
          subtitle={`${activeSubs} active subscriptions`}
          icon={DollarSign}
        />
        <PlatformStat
          title="Total Orders"
          value={
            isLoading ? "—" : (stats?.totalOrders ?? 0).toLocaleString()
          }
          icon={ShoppingBag}
        />
        <PlatformStat
          title="Growth Rate"
          value={isLoading ? "—" : `${stats?.growth ?? 0}%`}
          subtitle="Month over month"
          icon={TrendingUp}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-slate-50">Orders by tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(tenants ?? [])
              .slice()
              .sort(
                (a, b) => (b._count?.orders ?? 0) - (a._count?.orders ?? 0),
              )
              .slice(0, 8)
              .map((tenant) => {
                const max =
                  Math.max(...(tenants ?? []).map((t) => t._count?.orders ?? 0)) ||
                  1;
                const pct = Math.round(
                  ((tenant._count?.orders ?? 0) / max) * 100,
                );
                return (
                  <div key={tenant.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-300">{tenant.name}</span>
                      <span className="text-slate-500">
                        {tenant._count?.orders ?? 0} orders
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            {!tenants?.length && (
              <p className="text-sm text-slate-500">No tenant data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-slate-50">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planDistribution.map((item) => (
              <div key={item.plan}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-300">{item.plan}</span>
                  <span className="text-slate-500">
                    {item.count} tenant{item.count === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
            {!planDistribution.length && (
              <p className="text-sm text-slate-500">No plans assigned yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

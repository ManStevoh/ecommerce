"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@nexora/ui";
import { fetchPlatformSubscriptions } from "@/lib/api";

function formatAmount(value: number | string): number {
  return typeof value === "string" ? parseFloat(value) : value;
}

export default function SubscriptionsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: fetchPlatformSubscriptions,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-slate-400">Manage tenant billing and plans</p>
      </div>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-50">Active Subscriptions</CardTitle>
          <Button variant="outline" size="sm" className="border-slate-700">
            Billing Reports
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : isError ? (
            <p className="text-red-400">Failed to load subscriptions</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Tenant</th>
                  <th className="pb-3 pr-4 font-medium">Plan</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Renews</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-800/50">
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {sub.tenant.name}
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{sub.plan.name}</td>
                    <td className="py-3 pr-4">
                      ${formatAmount(sub.plan.priceMonthly)}/mo
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          sub.status === "ACTIVE"
                            ? "success"
                            : sub.status === "PAST_DUE"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {sub.status.toLowerCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

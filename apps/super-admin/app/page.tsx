"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  TableSkeleton,
} from "@nexora/ui";
import { Search, Plus } from "lucide-react";
import { fetchTenants, provisionTenant, updateTenantStatus } from "@/lib/api";

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [provisioning, setProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !data) return data ?? [];
    return data.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subdomain.toLowerCase().includes(q),
    );
  }, [data, search]);

  async function handleProvision(e: React.FormEvent) {
    e.preventDefault();
    setProvisioning(true);
    setError(null);
    try {
      await provisionTenant(storeName.trim());
      setStoreName("");
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: ["tenants"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Provision failed");
    } finally {
      setProvisioning(false);
    }
  }

  async function handleStatusChange(
    tenantId: string,
    status: 'ACTIVE' | 'SUSPENDED',
  ) {
    setStatusUpdating(tenantId);
    try {
      await updateTenantStatus(tenantId, status);
      await queryClient.invalidateQueries({ queryKey: ['tenants'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setStatusUpdating(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
          <p className="text-slate-400">Manage all platform stores</p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-500"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 max-w-md border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-slate-50">New store</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleProvision(e)} className="space-y-3">
              <Input
                placeholder="Store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="border-slate-700 bg-slate-950 text-slate-50"
                required
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-500"
                disabled={provisioning}
              >
                {provisioning ? "Creating…" : "Create tenant"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-slate-700 bg-slate-900 pl-10 text-slate-50"
        />
      </div>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle className="text-slate-50">All Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Store</th>
                  <th className="pb-3 pr-4 font-medium">Subdomain</th>
                  <th className="pb-3 pr-4 font-medium">Plan</th>
                  <th className="pb-3 pr-4 font-medium">MRR</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-slate-800/50">
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {tenant.name}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {tenant.subdomain}.nexora.local
                    </td>
                    <td className="py-3 pr-4 capitalize text-slate-300">
                      {tenant.plan?.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {tenant.plan
                        ? `$${Number(tenant.plan.priceMonthly)}/mo`
                        : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          tenant.status === "ACTIVE"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {tenant.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {tenant.status !== "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-700 text-slate-200"
                            disabled={statusUpdating === tenant.id}
                            onClick={() =>
                              void handleStatusChange(tenant.id, "ACTIVE")
                            }
                          >
                            Activate
                          </Button>
                        )}
                        {tenant.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-amber-400"
                            disabled={statusUpdating === tenant.id}
                            onClick={() =>
                              void handleStatusChange(tenant.id, "SUSPENDED")
                            }
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
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

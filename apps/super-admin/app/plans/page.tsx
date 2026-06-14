'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import {
  createPlan,
  deactivatePlan,
  fetchAdminPlans,
  updatePlan,
} from '@/lib/api/plans';

export default function PlansPage() {
  const queryClient = useQueryClient();
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: fetchAdminPlans,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await createPlan({
        name: String(form.get('name')),
        slug: String(form.get('slug')).toLowerCase(),
        description: String(form.get('description') || ''),
        priceMonthly: parseFloat(String(form.get('priceMonthly'))),
        priceYearly: parseFloat(String(form.get('priceYearly'))),
        maxProducts: parseInt(String(form.get('maxProducts')), 10) || 100,
        maxUsers: parseInt(String(form.get('maxUsers')), 10) || 5,
      });
      e.currentTarget.reset();
      await queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setLoading(true);
    setError(null);
    try {
      if (isActive) {
        await deactivatePlan(id);
      } else {
        await updatePlan(id, { isActive: true });
      }
      await queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-50">SaaS Plans</h1>
        <p className="text-slate-400">
          Create and manage subscription plans tenants can subscribe to.
        </p>
      </div>

      <Card className="mb-8 border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-100">Create plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input name="name" placeholder="Plan name" required />
            <Input name="slug" placeholder="slug" required />
            <Input name="description" placeholder="Description" />
            <Input name="priceMonthly" type="number" step="0.01" placeholder="Monthly USD" required />
            <Input name="priceYearly" type="number" step="0.01" placeholder="Yearly USD" required />
            <Input name="maxProducts" type="number" placeholder="Max products" defaultValue={100} />
            <Input name="maxUsers" type="number" placeholder="Max users" defaultValue={5} />
            <Button type="submit" disabled={loading} className="sm:col-span-2 lg:col-span-3">
              {loading ? 'Creating…' : 'Create plan'}
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-100">
            Plans ({plans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Slug</th>
                    <th className="py-2 pr-4">Monthly</th>
                    <th className="py-2 pr-4">Yearly</th>
                    <th className="py-2 pr-4">Limits</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-b border-slate-800/60">
                      <td className="py-3 pr-4 font-medium text-slate-100">{plan.name}</td>
                      <td className="py-3 pr-4">{plan.slug}</td>
                      <td className="py-3 pr-4">${plan.priceMonthly}</td>
                      <td className="py-3 pr-4">${plan.priceYearly}</td>
                      <td className="py-3 pr-4">
                        {plan.maxProducts} products · {plan.maxUsers} users
                      </td>
                      <td className="py-3 pr-4">
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={() => toggleActive(plan.id, plan.isActive)}
                        >
                          {plan.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

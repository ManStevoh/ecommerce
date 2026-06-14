'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@nexora/ui';
import {
  cancelSubscription,
  fetchBillingPlans,
  fetchCurrentSubscription,
  fetchTrialStatus,
  subscribeToPlan,
} from '@/lib/api/billing';

export default function BillingPage() {
  const queryClient = useQueryClient();
  const { data: plans = [] } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: fetchBillingPlans,
  });
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: fetchCurrentSubscription,
  });
  const { data: trial } = useQuery({
    queryKey: ['trial-status'],
    queryFn: fetchTrialStatus,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubscribe(slug: string) {
    setLoading(true);
    setMessage(null);
    try {
      await subscribeToPlan({ plan: slug.toUpperCase(), billingCycle: 'MONTHLY' });
      setMessage('Subscription activated.');
      await queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      await queryClient.invalidateQueries({ queryKey: ['trial-status'] });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Subscribe failed');
    } finally {
      setLoading(false);
    }
  }

  async function onCancel() {
    if (!confirm('Cancel your subscription?')) return;
    setLoading(true);
    setMessage(null);
    try {
      await cancelSubscription();
      setMessage('Subscription cancelled.');
      await queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing &amp; Plan</h1>
          <p className="text-zinc-500">Manage your Nexora SaaS subscription</p>
        </div>
        <Link href="/settings">
          <Button variant="outline">Back to settings</Button>
        </Link>
      </div>

      {trial?.isTrialing && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-900">
            Trial active — {trial.daysRemaining} day{trial.daysRemaining !== 1 ? 's' : ''} remaining.
            Subscribe below before it ends.
          </CardContent>
        </Card>
      )}

      <Card className="mb-8 max-w-2xl">
        <CardHeader>
          <CardTitle>Current subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : subscription ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">{subscription.plan.name}</span>{' '}
                · {subscription.status}
              </p>
              <p className="text-zinc-500">
                ${subscription.plan.priceMonthly}/mo · renews{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
              {subscription.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={onCancel}
                >
                  Cancel subscription
                </Button>
              )}
            </div>
          ) : (
            <p className="text-zinc-500">No active subscription — choose a plan below.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-2xl font-semibold">
                ${plan.priceMonthly}
                <span className="text-base font-normal text-zinc-500">/mo</span>
              </p>
              <p className="text-zinc-500">{plan.description}</p>
              <ul className="list-inside list-disc text-zinc-600">
                {(plan.features ?? []).slice(0, 5).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Button
                className="w-full"
                disabled={
                  loading ||
                  subscription?.plan.slug === plan.slug &&
                    subscription.status === 'ACTIVE'
                }
                onClick={() => onSubscribe(plan.slug)}
              >
                {subscription?.plan.slug === plan.slug && subscription.status === 'ACTIVE'
                  ? 'Current plan'
                  : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {message && (
        <p
          className={`mt-6 text-sm ${message.includes('failed') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

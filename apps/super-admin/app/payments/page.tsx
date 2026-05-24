'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@nexora/ui';
import { CreditCard } from 'lucide-react';
import { fetchPaymentProviders } from '@/lib/api';

export default function PaymentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['payment-providers'],
    queryFn: fetchPaymentProviders,
  });

  const providers = data?.providers ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">
          Payment Providers
        </h1>
        <p className="text-slate-400">
          Registered payment adapters on the payment-service
        </p>
      </div>

      {isLoading && <p className="text-slate-400">Loading providers…</p>}
      {error && (
        <p className="text-red-400">
          Failed to load providers. Is the API gateway running?
        </p>
      )}

      <div className="grid max-w-3xl gap-4">
        {providers.map((provider: string) => (
          <Card key={provider} className="border-slate-800 bg-slate-900/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <CreditCard className="h-5 w-5 text-violet-400" />
              <CardTitle className="text-slate-50">{provider}</CardTitle>
              <Badge variant="success" className="ml-auto">
                Registered
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Configure credentials in payment-service .env for live transactions.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && providers.length === 0 && (
        <p className="text-slate-500">No providers returned from API.</p>
      )}
    </div>
  );
}

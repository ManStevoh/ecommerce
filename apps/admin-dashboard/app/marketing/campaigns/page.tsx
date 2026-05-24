'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@nexora/ui';
import { fetchCampaigns } from '@/lib/marketing-api';

export default function CampaignsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['campaigns'], queryFn: fetchCampaigns });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-zinc-500">Email and marketing automation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : !data?.length ? (
            <p className="text-zinc-500">No campaigns yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Channel</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4 capitalize">{c.channel}</td>
                    <td className="py-3">
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {c.status}
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

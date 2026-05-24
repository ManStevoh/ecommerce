'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
} from '@nexora/ui';
import {
  createSegment,
  evaluateSegment,
  fetchSegments,
  type SegmentEvaluation,
} from '@/lib/api';

export default function SegmentsPage() {
  const queryClient = useQueryClient();
  const { data: segments, isLoading } = useQuery({
    queryKey: ['segments'],
    queryFn: fetchSegments,
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minOrderCount, setMinOrderCount] = useState('1');
  const [minTotalSpent, setMinTotalSpent] = useState('0');
  const [lastEval, setLastEval] = useState<SegmentEvaluation | null>(null);

  const createMut = useMutation({
    mutationFn: () =>
      createSegment({
        name,
        description: description || undefined,
        rules: {
          minOrderCount: Number(minOrderCount) || 0,
          minTotalSpent: Number(minTotalSpent) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      setName('');
      setDescription('');
    },
  });

  const evaluateMut = useMutation({
    mutationFn: (id: string) => evaluateSegment(id),
    onSuccess: (result) => {
      setLastEval(result);
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });

  return (
    <div className="admin-page">
      <PageHeader
        title="Customer segments"
        description="Group customers by order behavior for targeted campaigns"
      />

      <Card className="mb-6 border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>New segment</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-w-[200px] flex-1"
          />
          <Input
            type="number"
            min={0}
            placeholder="Min orders"
            value={minOrderCount}
            onChange={(e) => setMinOrderCount(e.target.value)}
            className="w-28"
          />
          <Input
            type="number"
            min={0}
            placeholder="Min spent (KES)"
            value={minTotalSpent}
            onChange={(e) => setMinTotalSpent(e.target.value)}
            className="w-36"
          />
          <Button
            onClick={() => createMut.mutate()}
            disabled={!name || createMut.isPending}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      {lastEval && (
        <Card className="mb-6 border-emerald-200/80 bg-emerald-50/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {lastEval.name} — {lastEval.memberCount} members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastEval.members.length === 0 ? (
              <p className="text-sm text-zinc-600">No customers match these rules yet.</p>
            ) : (
              <ul className="space-y-1 text-sm text-zinc-700">
                {lastEval.members.slice(0, 10).map((m) => (
                  <li key={m.email}>
                    {m.email} — {m.orderCount} orders, KES{' '}
                    {m.totalSpent.toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Segments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Members</th>
                  <th className="pb-3 pr-4">Rules</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {segments?.map((s) => {
                  const rules = s.rules as {
                    minOrderCount?: number;
                    minTotalSpent?: number;
                  } | undefined;
                  return (
                    <tr key={s.id} className="border-b border-zinc-100">
                      <td className="py-3 pr-4 font-medium">{s.name}</td>
                      <td className="py-3 pr-4">{s.memberCount}</td>
                      <td className="py-3 pr-4 text-zinc-600">
                        {rules?.minOrderCount != null || rules?.minTotalSpent != null
                          ? `≥${rules.minOrderCount ?? 0} orders, ≥KES ${rules.minTotalSpent ?? 0}`
                          : '—'}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={evaluateMut.isPending}
                          onClick={() => evaluateMut.mutate(s.id)}
                        >
                          Evaluate
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

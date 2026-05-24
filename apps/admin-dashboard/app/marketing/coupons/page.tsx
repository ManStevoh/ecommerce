'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import { useState } from 'react';
import { fetchCoupons, createCoupon } from '@/lib/marketing-api';

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const { data: coupons, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: fetchCoupons });
  const [code, setCode] = useState('');
  const [value, setValue] = useState('10');

  const createMut = useMutation({
    mutationFn: () =>
      createCoupon({
        code: code.toUpperCase(),
        type: 'PERCENTAGE',
        value: parseFloat(value),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setCode('');
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
        <p className="text-zinc-500">Discount codes for campaigns and checkout</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New coupon</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input
            type="number"
            placeholder="%"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-24"
          />
          <Button onClick={() => createMut.mutate()} disabled={!code || createMut.isPending}>
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 pr-4">Code</th>
                  <th className="pb-3 pr-4">Discount</th>
                  <th className="pb-3 pr-4">Used</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons?.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-mono font-medium">{c.code}</td>
                    <td className="py-3 pr-4">
                      {c.type === 'PERCENTAGE' ? `${c.value}%` : `$${c.value}`}
                    </td>
                    <td className="py-3 pr-4">{c.usedCount}</td>
                    <td className="py-3">
                      <Badge variant={c.isActive ? 'success' : 'secondary'}>
                        {c.isActive ? 'active' : 'inactive'}
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

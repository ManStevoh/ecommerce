'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
} from '@nexora/ui';
import { useState } from 'react';
import {
  createCoupon,
  deleteCoupon,
  fetchCoupons,
  updateCoupon,
} from '@/lib/marketing-api';

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
  });
  const [code, setCode] = useState('');
  const [value, setValue] = useState('10');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [minOrder, setMinOrder] = useState('');
  const [maxUses, setMaxUses] = useState('');

  const createMut = useMutation({
    mutationFn: () =>
      createCoupon({
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minOrderAmount: minOrder ? parseFloat(minOrder) : undefined,
        maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setCode('');
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCoupon(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  return (
    <div className="admin-page">
      <PageHeader
        title="Coupons"
        description="Discount codes for campaigns and checkout"
        action={
          <Link href="/marketing">
            <Button variant="outline" size="sm">
              Marketing hub
            </Button>
          </Link>
        }
      />

      <Card className="mb-6 border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>New coupon</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            placeholder="CODE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-36 font-mono uppercase"
          />
          <select
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')}
          >
            <option value="PERCENTAGE">Percentage %</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
          </select>
          <Input
            type="number"
            placeholder={type === 'PERCENTAGE' ? '% off' : 'Amount off'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-28"
          />
          <Input
            type="number"
            placeholder="Min order (optional)"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            className="w-36"
          />
          <Input
            type="number"
            placeholder="Max uses (optional)"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="w-36"
          />
          <Button onClick={() => createMut.mutate()} disabled={!code || createMut.isPending}>
            Create
          </Button>
        </CardContent>
      </Card>

      <Card className="border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>All coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : !coupons?.length ? (
            <p className="text-zinc-500">No coupons yet. Create one above or run db:seed.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 pr-4">Code</th>
                  <th className="pb-3 pr-4">Discount</th>
                  <th className="pb-3 pr-4">Used</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-mono font-medium">{c.code}</td>
                    <td className="py-3 pr-4">
                      {c.type === 'PERCENTAGE' ? `${c.value}%` : `KES ${c.value}`}
                      {c.minOrderAmount != null && (
                        <span className="ml-1 text-zinc-400">
                          (min {Number(c.minOrderAmount)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {c.usedCount}
                      {c.maxUses != null && ` / ${c.maxUses}`}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={c.isActive ? 'success' : 'secondary'}>
                        {c.isActive ? 'active' : 'inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={toggleMut.isPending}
                        onClick={() =>
                          toggleMut.mutate({ id: c.id, isActive: !c.isActive })
                        }
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deleteMut.isPending}
                        onClick={() => {
                          if (confirm(`Delete coupon ${c.code}?`)) {
                            deleteMut.mutate(c.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
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

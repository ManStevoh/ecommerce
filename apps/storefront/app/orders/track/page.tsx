'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@nexora/ui';
import Link from 'next/link';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;
    router.push(`/orders/${orderNumber.trim().toUpperCase()}?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="mx-auto max-w-md space-y-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Enter your order details to check the fulfillment and shipment status.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Order Lookup</CardTitle>
          <CardDescription>
            You can find your order number in your confirmation email (e.g., ORD-XXXX).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="ORD-XXXX-XXXX"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="luxury" className="w-full mt-2">
              Track Order
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link href="/account" className="text-sm font-medium text-amber-600 hover:text-amber-500">
          ← Back to Account
        </Link>
      </div>
    </div>
  );
}

'use client';

import { use, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
} from '@nexora/ui';
import Link from 'next/link';
import { fetchPublicOrder, parseOrderTotal } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Check, Clipboard, Loader2, Package, ShieldCheck, Truck } from 'lucide-react';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

const steps = [
  { 
    label: 'Order Placed', 
    desc: 'We have received your order', 
    activeStatuses: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'] 
  },
  { 
    label: 'Payment Confirmed', 
    desc: 'Your payment was approved', 
    activeStatuses: ['confirmed', 'processing', 'shipped', 'delivered', 'completed'] 
  },
  { 
    label: 'Processing', 
    desc: 'Preparing your items', 
    activeStatuses: ['processing', 'shipped', 'delivered', 'completed'] 
  },
  { 
    label: 'Shipped', 
    desc: 'On its way to you', 
    activeStatuses: ['shipped', 'delivered', 'completed'] 
  },
  { 
    label: 'Delivered', 
    desc: 'Package arrived safely', 
    activeStatuses: ['delivered', 'completed'] 
  },
];

export default function OrderTrackingPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const searchParams = useSearchParams();
  const [emailInput, setEmailInput] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['public-order', orderNumber, email],
    queryFn: () => fetchPublicOrder(TENANT_ID, orderNumber, email),
    enabled: !!email && !!orderNumber,
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setEmail(emailInput.trim());
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Unverified State (Ask for Email)
  if (!email) {
    return (
      <div className="mx-auto max-w-md py-16 space-y-6">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify Ownership</CardTitle>
            <CardDescription>
              Please enter the email address used when placing order <strong>{orderNumber}</strong> to access tracking info.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="verifyEmail">Email Address</Label>
                <Input
                  id="verifyEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="luxury" className="w-full">
                Verify & Track
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm text-zinc-500">Retrieving order status...</p>
      </div>
    );
  }

  // 3. Error/Not Found State
  if (error || !order) {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-6">
        <Card className="glass-card border-red-200/50 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-600">Order Lookup Failed</CardTitle>
            <CardDescription>
              We couldn&apos;t locate an order with number <strong>{orderNumber}</strong> matching email <strong>{email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setEmail('')} variant="outline" className="w-full">
              Try Another Email
            </Button>
          </CardContent>
        </Card>
        <Link href="/orders/track" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Go back to search
        </Link>
      </div>
    );
  }

  const currentStatus = order.status.toLowerCase();
  const bankPayment = order.payments?.find(
    (p: any) => p.provider === 'BANK_TRANSFER' && p.status === 'pending'
  );

  return (
    <div className="mx-auto max-w-3xl py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-150 dark:border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Order Tracking</span>
          <h1 className="text-3xl font-bold tracking-tight mt-1">{order.orderNumber}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs capitalize">
            Order Status: {order.status}
          </Badge>
        </div>
      </div>

      {/* Stepper Progress Timeline */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Delivery Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="relative flex flex-col gap-8 pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-3">
            {steps.map((step, index) => {
              const isCompleted = step.activeStatuses.includes(currentStatus);
              return (
                <div key={index} className="relative">
                  {/* Step node dot indicator */}
                  <span className={`absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold shadow-sm transition-colors ${
                    isCompleted 
                      ? 'bg-amber-500 border-amber-500 text-white' 
                      : 'bg-white border-zinc-200 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </span>
                  <div>
                    <h4 className={`font-semibold text-sm ${isCompleted ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400'}`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bank Transfer Payment Instructions (Manual Approval) */}
      {bankPayment && (
        <Card className="border-amber-200 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-950/10">
          <CardHeader className="flex flex-row items-start gap-3.5 pb-2">
            <ShieldCheck className="h-6 w-6 text-amber-600 mt-0.5" />
            <div>
              <CardTitle className="text-amber-800 dark:text-amber-400">Manual Payment Action Required</CardTitle>
              <CardDescription className="text-amber-700/80 dark:text-amber-500/80">
                Please complete your bank transfer payment. Once the transfer is completed, the administrator will verify the reference code and approve the order.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-white/70 p-4 border border-amber-100 dark:bg-zinc-950/40 dark:border-zinc-800 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Bank Name</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {bankPayment.metadata?.bankDetails?.bankName ?? 'Equity Bank'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Name</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {bankPayment.metadata?.bankDetails?.accountName ?? 'Nexora Commerce Ltd'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Number</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                  {bankPayment.metadata?.bankDetails?.accountNumber ?? '0000000000'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-amber-200/50 pt-2 mt-2">
                <span className="text-zinc-500 font-medium text-amber-800 dark:text-amber-500">Reference Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900 dark:text-amber-400 font-mono text-base">
                    {bankPayment.providerRef}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(bankPayment.providerRef ?? '')}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="h-4.5 w-4.5 text-emerald-500" /> : <Clipboard className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipment details */}
      {order.status.toLowerCase() === 'shipped' && order.statusReason && (
        <Card className="border-indigo-100 bg-indigo-50/10 dark:border-indigo-900/30 dark:bg-indigo-950/10">
          <CardHeader className="flex flex-row items-center gap-3.5">
            <Truck className="h-6 w-6 text-indigo-500" />
            <div>
              <CardTitle className="text-indigo-900 dark:text-indigo-400">Shipment Dispatched</CardTitle>
              <CardDescription className="text-indigo-700/80 dark:text-indigo-500/80">
                Your order is currently in transit. Use the details below for tracking.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold font-mono text-indigo-900 dark:text-indigo-400 bg-white/70 dark:bg-zinc-950/40 border border-indigo-50 dark:border-zinc-800 p-3 rounded-lg inline-block">
              {order.statusReason}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details & Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Info Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center pt-4 first:pt-0">
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</p>
                      <p className="text-xs text-zinc-500">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm">
                      {formatCurrency(parseOrderTotal(item.totalPrice))}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Shipping Destination</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Summary Column */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal</span>
                <span>{formatCurrency(parseOrderTotal(order.subtotal))}</span>
              </div>
              {parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>- {formatCurrency(parseOrderTotal(order.discountAmount))}</span>
                </div>
              )}
              {parseFloat(order.taxAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tax</span>
                  <span>{formatCurrency(parseOrderTotal(order.taxAmount))}</span>
                </div>
              )}
              {parseFloat(order.shippingAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shipping</span>
                  <span>{formatCurrency(parseOrderTotal(order.shippingAmount))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-zinc-150 dark:border-zinc-800 pt-3 text-base">
                <span>Total</span>
                <span className="text-amber-600">{formatCurrency(parseOrderTotal(order.totalAmount))}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center">
        <Link href="/orders/track" className="text-sm text-amber-600 hover:text-amber-500">
          Track Another Order
        </Link>
      </div>
    </div>
  );
}

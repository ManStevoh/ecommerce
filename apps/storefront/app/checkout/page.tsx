'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@nexora/ui';
import { useCartStore, useCartTotal } from '@/store/cart';
import {
  createOrder,
  mpesaStkPush,
  initiateStripePayment,
  initiatePaystackPayment,
  initiateFlutterwavePayment,
  initiatePayPalPayment,
  initiateBankTransferPayment,
  parseOrderTotal,
  formatMpesaPaymentMessage,
  formatStripePaymentMessage,
  formatPaystackPaymentMessage,
  formatRedirectPaymentMessage,
  fetchStoreSettings,
  computeCheckoutTotals,
  validateCoupon,
  redeemCoupon,
  upsertAbandonedCart,
  type PaymentMethod,
} from '@/lib/api';
import { StripePaymentForm } from '@/components/stripe-payment-form';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartTotal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<Awaited<
    ReturnType<typeof fetchStoreSettings>
  >>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [success, setSuccess] = useState<{
    orderNumber: string;
    paymentMessage?: string;
    paystackUrl?: string;
    redirectUrl?: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [stripeSession, setStripeSession] = useState<{
    orderNumber: string;
    clientSecret: string;
    stub: boolean;
  } | null>(null);

  useEffect(() => {
    if (!TENANT_ID || items.length === 0) return;
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const email = emailInput?.value?.trim();
    if (!email || !email.includes('@')) return;

    const timer = window.setTimeout(() => {
      void upsertAbandonedCart(TENANT_ID, {
        customerEmail: email,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal,
        currency: storeSettings?.currency ?? 'KES',
      });
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [items, subtotal, storeSettings?.currency]);

  useEffect(() => {
    if (!TENANT_ID) return;
    void fetchStoreSettings(TENANT_ID).then(setStoreSettings);
  }, []);

  const totals = useMemo(
    () =>
      computeCheckoutTotals(
        subtotal,
        storeSettings,
        appliedCoupon?.discountAmount ?? 0,
      ),
    [subtotal, storeSettings, appliedCoupon],
  );

  async function applyCoupon() {
    if (!TENANT_ID || !couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(TENANT_ID, couponCode, subtotal);
      setAppliedCoupon({
        code: result.code,
        discountAmount: result.discountAmount,
      });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!TENANT_ID) {
      setError(
        'Set NEXT_PUBLIC_TENANT_ID in .env.local (run db:seed for tenant id)',
      );
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const customerEmail = form.get('email') as string;

    try {
      const order = await createOrder(
        {
          customerEmail,
          currency: storeSettings?.currency ?? 'KES',
          taxAmount: totals.taxAmount,
          shippingAmount: totals.shippingAmount,
          discountAmount: totals.discountAmount,
          notes: appliedCoupon ? `Coupon: ${appliedCoupon.code}` : undefined,
          shippingAddress: {
            firstName: form.get('firstName') as string,
            lastName: form.get('lastName') as string,
            street: form.get('street') as string,
            city: form.get('city') as string,
            postalCode: form.get('postalCode') as string,
          },
          items: items.map((item) => ({
            productId: item.id,
            sku: item.slug,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
        TENANT_ID,
      );

      if (appliedCoupon) {
        await redeemCoupon(TENANT_ID, appliedCoupon.code);
      }

      const orderTotal = parseOrderTotal(order.totalAmount);
      let paymentMessage: string | undefined;
      let redirectUrl: string | undefined;

      if (paymentMethod === 'mpesa') {
        const phone = (form.get('phone') as string) || '254700000000';
        const payResult = await mpesaStkPush(TENANT_ID, {
          phoneNumber: phone.replace(/\s/g, ''),
          amount: orderTotal,
          orderId: order.id,
        });
        paymentMessage = formatMpesaPaymentMessage(payResult);
      } else if (paymentMethod === 'stripe') {
        const payResult = await initiateStripePayment(
          TENANT_ID,
          order.id,
          orderTotal,
          storeSettings?.currency ?? 'KES',
        );
        const clientSecret = payResult.providerResult?.clientSecret;
        const raw = payResult.providerResult?.raw as { stub?: boolean } | undefined;
        if (clientSecret) {
          setStripeSession({
            orderNumber: order.orderNumber ?? order.id,
            clientSecret,
            stub: Boolean(raw?.stub) || clientSecret.includes('stub'),
          });
          return;
        }
        paymentMessage = formatStripePaymentMessage(payResult);
      } else if (paymentMethod === 'paystack') {
        const payResult = await initiatePaystackPayment(
          TENANT_ID,
          order.id,
          orderTotal,
          'KES',
          customerEmail,
        );
        paymentMessage = formatPaystackPaymentMessage(payResult);
        if (
          payResult.providerResult?.redirectUrl &&
          !payResult.providerResult.redirectUrl.includes('stub')
        ) {
          redirectUrl = payResult.providerResult.redirectUrl;
        }
      } else if (paymentMethod === 'flutterwave') {
        const payResult = await initiateFlutterwavePayment(
          TENANT_ID,
          order.id,
          orderTotal,
          'KES',
          customerEmail,
        );
        paymentMessage = formatRedirectPaymentMessage(payResult, 'Flutterwave');
        if (
          payResult.providerResult?.redirectUrl &&
          !payResult.providerResult.redirectUrl.includes('stub')
        ) {
          redirectUrl = payResult.providerResult.redirectUrl;
        }
      } else if (paymentMethod === 'paypal') {
        const payResult = await initiatePayPalPayment(
          TENANT_ID,
          order.id,
          orderTotal,
          'KES',
        );
        paymentMessage = formatRedirectPaymentMessage(payResult, 'PayPal');
        if (
          payResult.providerResult?.redirectUrl &&
          !payResult.providerResult.redirectUrl.includes('stub')
        ) {
          redirectUrl = payResult.providerResult.redirectUrl;
        }
      } else if (paymentMethod === 'bank_transfer') {
        const payResult = await initiateBankTransferPayment(
          TENANT_ID,
          order.id,
          orderTotal,
          'KES',
        );
        paymentMessage = formatRedirectPaymentMessage(payResult, 'Bank transfer');
      }

      clearCart();
      setSuccess({
        orderNumber: order.orderNumber ?? order.id,
        paymentMessage,
        paystackUrl: redirectUrl,
        redirectUrl,
      });
      if (!redirectUrl) {
        setTimeout(() => router.push('/'), 8000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  if (stripeSession) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Complete card payment</h1>
        <p className="text-sm text-zinc-500">
          Order <strong>{stripeSession.orderNumber}</strong>
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <StripePaymentForm
          clientSecret={stripeSession.clientSecret}
          orderNumber={stripeSession.orderNumber}
          stub={stripeSession.stub}
          onSuccess={() => {
            clearCart();
            setSuccess({
              orderNumber: stripeSession.orderNumber,
              paymentMessage: 'Card payment submitted successfully.',
            });
            setStripeSession(null);
          }}
          onError={(message) => setError(message)}
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-emerald-600">
          Order placed
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Order <strong>{success.orderNumber}</strong> confirmed.
        </p>
        {success.paymentMessage && (
          <p className="mt-4 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            {success.paymentMessage}
          </p>
        )}
        {(success.redirectUrl ?? success.paystackUrl) ? (
          <a
            href={success.redirectUrl ?? success.paystackUrl}
            className="inline-block"
          >
            <Button variant="luxury" size="lg">
              Complete payment
            </Button>
          </a>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">Redirecting to shop…</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Pay with M-Pesa, Stripe, Paystack, Flutterwave, PayPal, or bank transfer
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="firstName" placeholder="First name" required />
              <Input name="lastName" placeholder="Last name" required />
            </div>
            <Input
              name="email"
              placeholder="Email address"
              type="email"
              required
            />
            <Input name="street" placeholder="Street address" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="city" placeholder="City" required />
              <Input name="postalCode" placeholder="Postal code" required />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle>Discount code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void applyCoupon()}
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? 'Checking…' : 'Apply'}
              </Button>
            </div>
            {couponError && (
              <p className="text-sm text-red-500">{couponError}</p>
            )}
            {appliedCoupon && (
              <p className="text-sm text-emerald-600">
                Coupon {appliedCoupon.code} applied — save KES{' '}
                {appliedCoupon.discountAmount.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'mpesa' as const, label: 'M-Pesa' },
                  { id: 'stripe' as const, label: 'Card' },
                  { id: 'paystack' as const, label: 'Paystack' },
                  { id: 'flutterwave' as const, label: 'Flutterwave' },
                  { id: 'paypal' as const, label: 'PayPal' },
                  { id: 'bank_transfer' as const, label: 'Bank' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    paymentMethod === id
                      ? 'bg-amber-500 text-white'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {paymentMethod === 'mpesa' && (
              <div>
                <Label htmlFor="phone">M-Pesa phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="2547XXXXXXXX"
                  defaultValue="254700000000"
                  required
                  className="mt-1.5"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card mt-6">
          <CardContent className="space-y-3 p-6">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span>KES {totals.subtotal.toLocaleString()}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>- KES {totals.discountAmount.toLocaleString()}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tax</span>
                <span>KES {totals.taxAmount.toLocaleString()}</span>
              </div>
            )}
            {totals.shippingAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Shipping</span>
                <span>KES {totals.shippingAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-200 pt-3 font-semibold dark:border-zinc-700">
              <span>Total</span>
              <span>KES {totals.total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-zinc-500">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              variant="luxury"
              className="mt-2 w-full"
              disabled={loading || items.length === 0}
            >
              {loading ? 'Processing…' : 'Place Order & Pay'}
            </Button>
          </CardContent>
        </Card>
      </form>

      <Link href="/cart">
        <Button variant="ghost">← Back to cart</Button>
      </Link>
    </div>
  );
}

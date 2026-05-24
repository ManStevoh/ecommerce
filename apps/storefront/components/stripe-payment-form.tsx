'use client';

import { useMemo, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Button } from '@nexora/ui';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

function StripeConfirmForm({
  orderNumber,
  onSuccess,
  onError,
}: {
  orderNumber: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return;
    setLoading(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?paid=${orderNumber}`,
      },
      redirect: 'if_required',
    });
    setLoading(false);
    if (result.error) {
      onError(result.error.message ?? 'Payment failed');
      return;
    }
    onSuccess();
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button
        type="button"
        variant="luxury"
        className="w-full"
        disabled={!stripe || loading}
        onClick={() => void handlePay()}
      >
        {loading ? 'Processing…' : 'Pay now'}
      </Button>
    </div>
  );
}

export function StripePaymentForm({
  clientSecret,
  orderNumber,
  stub,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  orderNumber: string;
  stub?: boolean;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [],
  );

  const options: StripeElementsOptions = useMemo(
    () => ({ clientSecret, appearance: { theme: 'stripe' } }),
    [clientSecret],
  );

  if (stub || !publishableKey || clientSecret.includes('stub')) {
    return (
      <div className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
        Card payments run in dev stub mode. Set STRIPE_SECRET_KEY on payment-service
        and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY here for live Stripe Elements.
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={onSuccess}
        >
          Continue (stub payment)
        </Button>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <p className="text-sm text-red-500">
        Stripe publishable key missing — add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeConfirmForm
        orderNumber={orderNumber}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

import { API_URL } from './client';

export type PaymentMethod =
  | 'mpesa'
  | 'stripe'
  | 'paystack'
  | 'flutterwave'
  | 'paypal'
  | 'bank_transfer';

export type PaymentApiResult = {
  providerResult?: {
    status?: string;
    clientSecret?: string;
    redirectUrl?: string;
    raw?: Record<string, unknown>;
  };
};

async function initiatePayment(
  tenantId: string,
  provider: string,
  orderId: string,
  amount: number,
  currency: string,
  metadata?: Record<string, unknown>,
): Promise<PaymentApiResult & { payment?: unknown }> {
  const res = await fetch(`${API_URL}/api/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({ provider, orderId, amount, currency, metadata }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `Payment initiation failed`,
    );
  }
  return res.json();
}

export async function mpesaStkPush(
  tenantId: string,
  payload: { phoneNumber: string; amount: number; orderId: string },
) {
  const res = await fetch(`${API_URL}/api/v1/payments/mpesa/stk-push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({
      phoneNumber: payload.phoneNumber,
      amount: payload.amount,
      accountReference: payload.orderId,
      transactionDesc: 'Nexora order payment',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'M-Pesa payment failed',
    );
  }
  return res.json() as Promise<PaymentApiResult & { payment?: unknown }>;
}

export async function initiateStripePayment(
  tenantId: string,
  orderId: string,
  amount: number,
  currency: string,
) {
  return initiatePayment(tenantId, 'STRIPE', orderId, amount, currency);
}

export async function initiatePaystackPayment(
  tenantId: string,
  orderId: string,
  amount: number,
  currency: string,
  email: string,
) {
  return initiatePayment(tenantId, 'PAYSTACK', orderId, amount, currency, {
    email,
  });
}

export async function initiateFlutterwavePayment(
  tenantId: string,
  orderId: string,
  amount: number,
  currency: string,
  email: string,
) {
  return initiatePayment(tenantId, 'FLUTTERWAVE', orderId, amount, currency, {
    email,
  });
}

export async function initiatePayPalPayment(
  tenantId: string,
  orderId: string,
  amount: number,
  currency: string,
) {
  return initiatePayment(tenantId, 'PAYPAL', orderId, amount, currency);
}

export async function initiateBankTransferPayment(
  tenantId: string,
  orderId: string,
  amount: number,
  currency: string,
) {
  return initiatePayment(tenantId, 'BANK_TRANSFER', orderId, amount, currency);
}

export async function initiateWisePayment(
  tenantId: string,
  orderId: string,
  amount: number,
  currency: string,
) {
  return initiatePayment(tenantId, 'WISE', orderId, amount, currency);
}

export function formatMpesaPaymentMessage(result: PaymentApiResult): string {
  const raw = result.providerResult?.raw;
  if (raw?.customerMessage && typeof raw.customerMessage === 'string') {
    return raw.customerMessage;
  }
  if (raw?.stub) {
    return 'M-Pesa sandbox mode — set MPESA_* env vars on payment-service for live STK push';
  }
  if (raw?.message && typeof raw.message === 'string') {
    return raw.message;
  }
  return 'STK Push sent — check your phone to approve the payment';
}

export function formatStripePaymentMessage(result: PaymentApiResult): string {
  const raw = result.providerResult?.raw;
  if (raw?.stub) {
    return 'Card payments in dev mode — set STRIPE_SECRET_KEY on payment-service';
  }
  if (result.providerResult?.clientSecret) {
    return 'Card payment initialized. Complete checkout with your payment provider.';
  }
  return 'Payment initiated';
}

export function formatPaystackPaymentMessage(result: PaymentApiResult): string {
  if (result.providerResult?.redirectUrl?.includes('stub')) {
    return 'Paystack sandbox mode — set PAYSTACK_SECRET_KEY on payment-service';
  }
  if (result.providerResult?.redirectUrl) {
    return result.providerResult.redirectUrl;
  }
  return 'Redirect to Paystack to complete payment';
}

export function formatRedirectPaymentMessage(
  result: PaymentApiResult,
  providerName: string,
): string {
  const raw = result.providerResult?.raw as
    | {
        stub?: boolean;
        message?: string;
        bankDetails?: {
          reference?: string;
          accountNumber?: string;
          bankName?: string;
        };
      }
    | undefined;
  if (raw?.stub) {
    return `${providerName} sandbox mode — configure payment-service env vars`;
  }
  if (raw?.bankDetails) {
    const b = raw.bankDetails;
    return `Bank transfer: ${b.bankName} acc ${b.accountNumber}, ref ${b.reference}`;
  }
  if (result.providerResult?.redirectUrl) {
    return `Complete payment at ${providerName}`;
  }
  return raw?.message ?? 'Payment initiated';
}

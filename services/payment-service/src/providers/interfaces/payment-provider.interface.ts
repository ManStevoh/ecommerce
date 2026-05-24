import { PaymentProvider } from '@nexora/shared-types';

export interface InitiatePaymentInput {
  tenantId: string;
  orderId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface InitiatePaymentResult {
  provider: PaymentProvider;
  externalReference: string;
  status: 'PENDING' | 'REQUIRES_ACTION' | 'SUCCEEDED' | 'FAILED';
  redirectUrl?: string;
  clientSecret?: string;
  raw?: unknown;
}

export interface RefundPaymentInput {
  tenantId: string;
  paymentId: string;
  amount?: number;
}

export interface WebhookVerifyInput {
  signature: string;
  rawBody: Buffer | string;
}

export interface IPaymentProviderAdapter {
  readonly provider: PaymentProvider;
  initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  refund?(input: RefundPaymentInput): Promise<InitiatePaymentResult>;
  verifyWebhook?(input: WebhookVerifyInput): boolean;
  handleWebhook?(payload: unknown, tenantId: string): Promise<{
    event: string;
    paymentId?: string;
    paymentStatus?: 'COMPLETED' | 'FAILED' | 'PENDING';
  }>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

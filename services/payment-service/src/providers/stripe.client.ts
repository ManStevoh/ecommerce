import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class StripeClient {
  private readonly logger = new Logger(StripeClient.name);

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get<string>('STRIPE_SECRET_KEY')?.startsWith('sk_'));
  }

  private secretKey(): string {
    return this.config.get<string>('STRIPE_SECRET_KEY') ?? '';
  }

  private webhookSecret(): string {
    return this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    tenantId: string;
  }): Promise<{ id: string; client_secret: string; status: string }> {
    const amountCents = Math.round(params.amount * 100);
    const body = new URLSearchParams({
      amount: String(amountCents),
      currency: params.currency.toLowerCase(),
      'metadata[orderId]': params.orderId,
      'metadata[tenantId]': params.tenantId,
      automatic_payment_methods: '[object Object]',
    });
    body.set('automatic_payment_methods[enabled]', 'true');

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = (await res.json()) as {
      id?: string;
      client_secret?: string;
      status?: string;
      error?: { message: string };
    };

    if (!res.ok || !data.id) {
      throw new Error(data.error?.message ?? `Stripe error ${res.status}`);
    }

    return {
      id: data.id,
      client_secret: data.client_secret!,
      status: data.status ?? 'requires_payment_method',
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = this.webhookSecret();
    if (!secret) return false;

    const parts = signature.split(',').reduce(
      (acc, part) => {
        const [k, v] = part.split('=');
        if (k === 't') acc.timestamp = v;
        if (k === 'v1') acc.signatures.push(v);
        return acc;
      },
      { timestamp: '', signatures: [] as string[] },
    );

    const payload = `${parts.timestamp}.${rawBody}`;
    const expected = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return parts.signatures.some((s) => s === expected);
  }
}

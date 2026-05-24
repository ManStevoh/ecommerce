import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class PaystackClient {
  private readonly logger = new Logger(PaystackClient.name);

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get<string>('PAYSTACK_SECRET_KEY')?.startsWith('sk_'));
  }

  private secretKey(): string {
    return this.config.get<string>('PAYSTACK_SECRET_KEY') ?? '';
  }

  async initializeTransaction(params: {
    email: string;
    amount: number;
    currency: string;
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, string>;
  }): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    const amountKobo = Math.round(params.amount * 100);

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountKobo,
        currency: params.currency,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });

    const data = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    };

    if (!res.ok || !data.status || !data.data) {
      this.logger.error(`Paystack init failed: ${JSON.stringify(data)}`);
      throw new Error(data.message ?? `Paystack error ${res.status}`);
    }

    return data.data;
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.isConfigured) return true;
    const hash = createHmac('sha512', this.secretKey())
      .update(rawBody)
      .digest('hex');
    return hash === signature;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FlutterwaveClient {
  private readonly logger = new Logger(FlutterwaveClient.name);

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get<string>('FLUTTERWAVE_SECRET_KEY'));
  }

  private secretKey(): string {
    return this.config.get<string>('FLUTTERWAVE_SECRET_KEY') ?? '';
  }

  async createPaymentLink(params: {
    email: string;
    amount: number;
    currency: string;
    txRef: string;
    redirectUrl?: string;
    meta?: Record<string, string>;
  }): Promise<{ link: string; id: number }> {
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: params.txRef,
        amount: params.amount,
        currency: params.currency,
        redirect_url: params.redirectUrl,
        customer: { email: params.email },
        meta: params.meta,
      }),
    });

    const data = (await res.json()) as {
      status?: string;
      message?: string;
      data?: { link: string; id: number };
    };

    if (!res.ok || data.status !== 'success' || !data.data?.link) {
      this.logger.error(`Flutterwave failed: ${JSON.stringify(data)}`);
      throw new Error(data.message ?? 'Flutterwave payment failed');
    }

    return data.data;
  }

  verifyWebhookHash(hash: string): boolean {
    const expected =
      this.config.get<string>('FLUTTERWAVE_WEBHOOK_HASH') ??
      this.config.get<string>('FLUTTERWAVE_SECRET_KEY');
    if (!expected) return true;
    return hash === expected;
  }
}

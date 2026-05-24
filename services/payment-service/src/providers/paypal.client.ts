import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayPalClient {
  private readonly logger = new Logger(PayPalClient.name);
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(
      this.config.get('PAYPAL_CLIENT_ID') && this.config.get('PAYPAL_CLIENT_SECRET'),
    );
  }

  private baseUrl(): string {
    return (
      this.config.get<string>('PAYPAL_BASE_URL') ??
      'https://api-m.sandbox.paypal.com'
    );
  }

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.token;
    }

    const clientId = this.config.get<string>('PAYPAL_CLIENT_ID')!;
    const secret = this.config.get<string>('PAYPAL_CLIENT_SECRET')!;
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

    const res = await fetch(`${this.baseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error('PayPal OAuth failed');

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000 - 60000,
    };
    return data.access_token;
  }

  async createOrder(params: {
    amount: number;
    currency: string;
    reference: string;
    returnUrl?: string;
    cancelUrl?: string;
  }): Promise<{ id: string; approvalUrl: string }> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.baseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: params.reference,
            amount: {
              currency_code: params.currency,
              value: params.amount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
          brand_name: 'Nexora Commerce',
        },
      }),
    });

    const data = (await res.json()) as {
      id?: string;
      links?: { rel: string; href: string }[];
      message?: string;
    };

    const approval = data.links?.find((l) => l.rel === 'approve');
    if (!res.ok || !data.id || !approval) {
      this.logger.error(`PayPal order failed: ${JSON.stringify(data)}`);
      throw new Error(data.message ?? 'PayPal order creation failed');
    }

    return { id: data.id, approvalUrl: approval.href };
  }
}

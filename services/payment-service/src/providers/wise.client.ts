import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WiseClient {
  private readonly logger = new Logger(WiseClient.name);

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get('WISE_API_TOKEN') && this.config.get('WISE_PROFILE_ID'));
  }

  private token(): string {
    return this.config.get<string>('WISE_API_TOKEN') ?? '';
  }

  async createTransferQuote(params: {
    amount: number;
    currency: string;
    targetCurrency?: string;
  }): Promise<{ id: string; rate: number }> {
    const profileId = this.config.get<string>('WISE_PROFILE_ID')!;
    const res = await fetch('https://api.wise.com/v3/profiles/' + profileId + '/quotes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceCurrency: params.currency,
        targetCurrency: params.targetCurrency ?? params.currency,
        sourceAmount: params.amount,
      }),
    });
    const data = (await res.json()) as { id?: string; rate?: number; message?: string };
    if (!res.ok || !data.id) {
      this.logger.error(`Wise quote failed: ${JSON.stringify(data)}`);
      throw new Error(data.message ?? 'Wise quote failed');
    }
    return { id: data.id, rate: data.rate ?? 1 };
  }
}

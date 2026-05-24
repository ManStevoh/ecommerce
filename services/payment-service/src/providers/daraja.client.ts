import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DarajaStkResult {
  checkoutRequestId: string;
  merchantRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

@Injectable()
export class DarajaClient {
  private readonly logger = new Logger(DarajaClient.name);
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(
      this.config.get('MPESA_CONSUMER_KEY') &&
        this.config.get('MPESA_CONSUMER_SECRET') &&
        this.config.get('MPESA_PASSKEY') &&
        this.config.get('MPESA_SHORTCODE'),
    );
  }

  private baseUrl(): string {
    return (
      this.config.get<string>('MPESA_BASE_URL') ??
      'https://sandbox.safaricom.co.ke'
    );
  }

  private authHeader(): string {
    const key = this.config.get<string>('MPESA_CONSUMER_KEY') ?? '';
    const secret = this.config.get<string>('MPESA_CONSUMER_SECRET') ?? '';
    return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
  }

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.token;
    }

    const res = await fetch(
      `${this.baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: this.authHeader() } },
    );

    if (!res.ok) {
      throw new Error(`Daraja OAuth failed: ${res.status}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: string };
    this.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + parseInt(data.expires_in, 10) * 1000 - 60000,
    };
    return data.access_token;
  }

  async stkPush(params: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
  }): Promise<DarajaStkResult> {
    const token = await this.getAccessToken();
    const shortcode = this.config.get<string>('MPESA_SHORTCODE')!;
    const passkey = this.config.get<string>('MPESA_PASSKEY')!;
    const callbackUrl =
      this.config.get<string>('MPESA_CALLBACK_URL') ??
      'https://example.com/mpesa/callback';

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
      'base64',
    );

    let phone = params.phoneNumber.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = `254${phone.slice(1)}`;
    if (phone.startsWith('7')) phone = `254${phone}`;

    const body = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(params.amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: params.accountReference.slice(0, 12),
      TransactionDesc: params.transactionDesc.slice(0, 13),
    };

    const res = await fetch(
      `${this.baseUrl()}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const data = (await res.json()) as DarajaStkResult & { errorMessage?: string };

    if (!res.ok) {
      this.logger.error(`STK Push failed: ${JSON.stringify(data)}`);
      throw new Error(data.errorMessage ?? `STK Push failed (${res.status})`);
    }

    return data;
  }

  async b2cPayment(params: {
    phoneNumber: string;
    amount: number;
    remarks: string;
    occasion: string;
  }): Promise<{
    ConversationID?: string;
    ResponseCode?: string;
    ResponseDescription?: string;
  }> {
    const token = await this.getAccessToken();
    const shortcode = this.config.get<string>('MPESA_SHORTCODE')!;
    const initiator = this.config.get<string>('MPESA_INITIATOR_NAME') ?? 'testapi';
    const credential = this.config.get<string>('MPESA_SECURITY_CREDENTIAL') ?? '';
    const callbackUrl =
      this.config.get<string>('MPESA_B2C_CALLBACK_URL') ??
      'https://example.com/mpesa/b2c/callback';

    let phone = params.phoneNumber.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = `254${phone.slice(1)}`;
    if (phone.startsWith('7')) phone = `254${phone}`;

    const res = await fetch(
      `${this.baseUrl()}/mpesa/b2c/v1/paymentrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          InitiatorName: initiator,
          SecurityCredential: credential,
          CommandID: 'BusinessPayment',
          Amount: Math.ceil(params.amount),
          PartyA: shortcode,
          PartyB: phone,
          Remarks: params.remarks.slice(0, 100),
          QueueTimeOutURL: callbackUrl,
          ResultURL: callbackUrl,
          Occasion: params.occasion.slice(0, 100),
        }),
      },
    );

    const data = (await res.json()) as {
      ConversationID?: string;
      ResponseCode?: string;
      ResponseDescription?: string;
    };

    if (!res.ok) {
      this.logger.error(`B2C failed: ${JSON.stringify(data)}`);
      throw new Error(data.ResponseDescription ?? `B2C failed (${res.status})`);
    }

    return data;
  }
}

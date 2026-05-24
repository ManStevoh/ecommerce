import { httpJson } from '../http/http-client';

export type SendNotificationInput = {
  to: string;
  templateId: string;
  variables?: Record<string, string>;
};

export type SendNotificationResult = {
  sent: boolean;
  provider: string;
  messageId?: string;
};

export class NotificationServiceClient {
  constructor(private readonly baseUrl: string) {}

  private headers(tenantId: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    };
  }

  async sendEmail(
    tenantId: string,
    input: SendNotificationInput,
  ): Promise<SendNotificationResult> {
    const result = await httpJson<SendNotificationResult>(
      `${this.baseUrl}/api/v1/notifications/email`,
      {
        method: 'POST',
        headers: this.headers(tenantId),
        body: JSON.stringify({
          tenantId,
          templateId: input.templateId,
          toEmail: input.to,
          variables: input.variables ?? {},
        }),
      },
    );
    return result;
  }
}

export function createNotificationServiceClient(
  baseUrl?: string,
): NotificationServiceClient {
  return new NotificationServiceClient(
    baseUrl ??
      process.env.NOTIFICATION_SERVICE_URL ??
      process.env.API_GATEWAY_URL ??
      'http://localhost:3008',
  );
}

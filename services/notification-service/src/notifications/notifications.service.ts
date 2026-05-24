import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendNotificationDto } from './dto/send-notification.dto';
import { EmailChannel, renderTemplate } from './email.channel';

type Channel = 'email' | 'sms' | 'whatsapp' | 'push';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailChannel: EmailChannel,
    private readonly config: ConfigService,
  ) {}

  async sendEmail(dto: SendNotificationDto) {
    const to = dto.toEmail ?? 'noreply@tenant.local';
    const rendered = renderTemplate(dto.templateId, dto.variables ?? {});

    const result = await this.emailChannel.send({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    return {
      channel: 'email' as const,
      tenantId: dto.tenantId,
      templateId: dto.templateId,
      to,
      status: result.sent ? 'sent' : 'failed',
      messageId: result.messageId,
      provider: result.provider,
    };
  }

  async sendSms(dto: SendNotificationDto) {
    const to = dto.toPhone ?? '';
    const body =
      dto.body ??
      renderTemplate(dto.templateId, dto.variables ?? {}).text;

    const sid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const from = this.config.get<string>('TWILIO_FROM_NUMBER');

    if (sid && token && from && to) {
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const params = new URLSearchParams({ To: to, From: from, Body: body });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        },
      );
      if (res.ok) {
        const data = (await res.json()) as { sid?: string };
        return {
          channel: 'sms' as const,
          tenantId: dto.tenantId,
          to,
          status: 'sent',
          messageId: data.sid,
          provider: 'twilio',
        };
      }
    }

    this.logger.log(`[Dev SMS] To: ${to} | ${body}`);
    return {
      channel: 'sms' as const,
      tenantId: dto.tenantId,
      to,
      status: 'sent',
      messageId: `sms-dev-${Date.now()}`,
      provider: 'console',
    };
  }

  sendWhatsApp(dto: SendNotificationDto) {
    const to = dto.toPhone ?? '';
    const body = dto.body ?? `WhatsApp: ${dto.templateId}`;
    this.logger.log(`[WhatsApp] To: ${to} | ${body}`);
    return {
      channel: 'whatsapp' as const,
      tenantId: dto.tenantId,
      templateId: dto.templateId,
      to,
      status: 'sent',
      messageId: `wa-${Date.now()}`,
      provider: 'console',
    };
  }

  sendPush(dto: SendNotificationDto) {
    const body = dto.body ?? dto.templateId;
    this.logger.log(
      `[Push] Token: ${dto.deviceToken ? '***' : 'missing'} | ${body}`,
    );
    return {
      channel: 'push' as const,
      tenantId: dto.tenantId,
      templateId: dto.templateId,
      status: dto.deviceToken ? 'sent' : 'skipped',
      messageId: `push-${Date.now()}`,
      provider: 'console',
      deviceToken: dto.deviceToken ? '***redacted***' : undefined,
    };
  }
}

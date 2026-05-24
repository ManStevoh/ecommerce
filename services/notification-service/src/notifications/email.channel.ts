import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  sent: boolean;
  provider: 'resend' | 'smtp' | 'console';
  messageId?: string;
}

@Injectable()
export class EmailChannel {
  private readonly logger = new Logger(EmailChannel.name);

  constructor(private readonly config: ConfigService) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const resendKey = this.config.get<string>('RESEND_API_KEY');
    const from =
      this.config.get<string>('EMAIL_FROM') ?? 'Nexora <noreply@nexora.local>';

    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`Resend failed: ${err}`);
        throw new Error('Email delivery failed');
      }

      const data = (await res.json()) as { id?: string };
      return { sent: true, provider: 'resend', messageId: data.id };
    }

    const smtpHost = this.config.get<string>('SMTP_HOST');
    if (smtpHost) {
      this.logger.warn(
        `SMTP_HOST set but SMTP requires nodemailer — use RESEND_API_KEY or install nodemailer. Logging email to console.`,
      );
    }

    this.logger.log(
      `[Dev email] To: ${input.to} | Subject: ${input.subject}\n${input.text ?? input.html}`,
    );
    return { sent: true, provider: 'console', messageId: `dev-${Date.now()}` };
  }
}

function renderOrderConfirmation(vars: Record<string, string>): {
  subject: string;
  html: string;
  text: string;
} {
  const orderNumber = vars.orderNumber ?? '—';
  const total = vars.total ?? '—';
  return {
    subject: `Order confirmed — ${orderNumber}`,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif">
      <h2>Thank you for your order</h2>
      <p>Your order <strong>${orderNumber}</strong> has been received.</p>
      <p>Total: <strong>${total}</strong></p>
      <p>We will notify you when it ships.</p>
      <hr><p style="color:#666;font-size:12px">Nexora Commerce</p>
    </body></html>`,
    text: `Order ${orderNumber} confirmed. Total: ${total}. Thank you for shopping with us.`,
  };
}

function renderOrderStatusUpdate(vars: Record<string, string>): {
  subject: string;
  html: string;
  text: string;
} {
  const orderNumber = vars.orderNumber ?? '—';
  const fromStatus = vars.fromStatus ?? '—';
  const toStatus = vars.toStatus ?? '—';
  const reason = vars.reason?.trim();
  const reasonLine = reason
    ? `<p>Note: ${reason}</p>`
    : '';
  const reasonText = reason ? ` Note: ${reason}` : '';
  return {
    subject: `Order ${orderNumber} — ${toStatus}`,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif">
      <h2>Order status update</h2>
      <p>Your order <strong>${orderNumber}</strong> has been updated.</p>
      <p>Status: <strong>${fromStatus}</strong> → <strong>${toStatus}</strong></p>
      ${reasonLine}
      <hr><p style="color:#666;font-size:12px">Nexora Commerce</p>
    </body></html>`,
    text: `Order ${orderNumber} status: ${fromStatus} → ${toStatus}.${reasonText}`,
  };
}

export function renderTemplate(
  templateId: string,
  variables: Record<string, string> = {},
): { subject: string; html: string; text: string } {
  if (templateId === 'order-confirmation') {
    return renderOrderConfirmation(variables);
  }
  if (templateId === 'order-status-update') {
    return renderOrderStatusUpdate(variables);
  }
  const body = variables.body ?? `Notification: ${templateId}`;
  return {
    subject: variables.subject ?? templateId,
    html: `<p>${body}</p>`,
    text: body,
  };
}

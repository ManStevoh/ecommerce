import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '@nexora/database';
import { PaymentProvider } from '@nexora/shared-types';
import { PaymentProviderRegistry } from '../providers/payment-provider.registry';
import { PrismaService } from '../database/prisma.service';
import { PaymentEventsPublisher } from '../events/payment-events.publisher';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly registry: PaymentProviderRegistry,
    private readonly prisma: PrismaService,
    private readonly paymentEvents: PaymentEventsPublisher,
  ) {}

  async handle(
    provider: PaymentProvider,
    tenantId: string,
    signature: string | undefined,
    rawBody: Buffer,
    payload: unknown,
  ) {
    const adapter = this.registry.get(provider);
    if (adapter.verifyWebhook && signature) {
      const valid = adapter.verifyWebhook({ signature, rawBody });
      if (!valid) throw new BadRequestException('Invalid webhook signature');
    }

    const result = adapter.handleWebhook
      ? await adapter.handleWebhook(payload, tenantId)
      : { event: 'unknown' };

    await this.prisma.webhookEvent.create({
      data: {
        tenantId,
        provider,
        event: result.event,
        payload: payload as object,
      },
    });

    if (result.paymentId && result.paymentStatus) {
      const statusMap: Record<string, PaymentStatus> = {
        COMPLETED: PaymentStatus.COMPLETED,
        FAILED: PaymentStatus.FAILED,
        PENDING: PaymentStatus.PENDING,
      };
      const status = statusMap[result.paymentStatus];
      if (status) {
        const updated = await this.prisma.payment.updateMany({
          where: { tenantId, providerRef: result.paymentId },
          data: {
            status,
            paidAt: status === PaymentStatus.COMPLETED ? new Date() : undefined,
          },
        });

        if (updated.count > 0) {
          const payments = await this.prisma.payment.findMany({
            where: { tenantId, providerRef: result.paymentId },
            select: { id: true, orderId: true, amount: true },
          });
          const orderIds = [
            ...new Set(
              payments
                .map((p) => p.orderId)
                .filter((id): id is string => Boolean(id)),
            ),
          ];
          const paymentId = payments[0]?.id ?? result.paymentId;

          if (status === PaymentStatus.COMPLETED && orderIds.length > 0) {
            await this.paymentEvents.paymentCompleted(tenantId, {
              paymentId,
              orderIds,
              provider,
              amount: payments[0]?.amount
                ? Number(payments[0].amount)
                : undefined,
            });
          } else if (status === PaymentStatus.FAILED && orderIds.length > 0) {
            await this.paymentEvents.paymentFailed(tenantId, {
              paymentId,
              orderIds,
              provider,
            });
          }
        }
      }
    }

    return { received: true, ...result };
  }
}

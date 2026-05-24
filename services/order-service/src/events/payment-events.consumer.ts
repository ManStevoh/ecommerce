import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OrderStatus } from '@nexora/database';
import {
  EventBusService,
  EventTopics,
  type DomainEvent,
} from '@nexora/event-bus';
import type { PaymentCompletedPayload } from '@nexora/shared-types';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PaymentEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentEventsConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<PaymentCompletedPayload>(
      EventTopics.PAYMENT_COMPLETED,
      async (event: DomainEvent<PaymentCompletedPayload>) => {
        if (!event.tenantId) return;
        for (const orderId of event.payload.orderIds) {
          const updated = await this.prisma.order.updateMany({
            where: {
              id: orderId,
              tenantId: event.tenantId,
              status: OrderStatus.PENDING,
            },
            data: { status: OrderStatus.CONFIRMED },
          });
          if (updated.count > 0) {
            this.logger.log(`Order ${orderId} confirmed via payment event`);
          }
        }
      },
    );
  }
}

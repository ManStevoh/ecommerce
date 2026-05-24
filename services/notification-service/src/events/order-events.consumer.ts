import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  EventBusService,
  EventTopics,
  type DomainEvent,
} from '@nexora/event-bus';
import type {
  OrderCreatedPayload,
  OrderStatusChangedPayload,
} from '@nexora/shared-types';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrderEventsConsumer implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<OrderCreatedPayload>(
      EventTopics.ORDER_CREATED,
      async (event: DomainEvent<OrderCreatedPayload>) => {
        if (!event.tenantId) return;
        await this.notifications.sendEmail({
          tenantId: event.tenantId,
          templateId: 'order-confirmation',
          toEmail: event.payload.customerEmail,
          variables: {
            orderNumber: event.payload.orderNumber,
            total: String(event.payload.totalAmount),
          },
        });
      },
    );

    this.eventBus.subscribe<OrderStatusChangedPayload>(
      EventTopics.ORDER_STATUS_CHANGED,
      async (event: DomainEvent<OrderStatusChangedPayload>) => {
        if (!event.tenantId || !event.payload.customerEmail) return;
        await this.notifications.sendEmail({
          tenantId: event.tenantId,
          templateId: 'order-status-update',
          toEmail: event.payload.customerEmail,
          variables: {
            orderNumber: event.payload.orderNumber,
            fromStatus: event.payload.fromStatus,
            toStatus: event.payload.toStatus,
            reason: event.payload.reason ?? '',
          },
        });
      },
    );
  }
}

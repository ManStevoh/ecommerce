import { Injectable } from '@nestjs/common';
import {
  EventBusService,
  EventTopics,
  type DomainEvent,
} from '@nexora/event-bus';
import type {
  PaymentCompletedPayload,
  PaymentFailedPayload,
} from '@nexora/shared-types';

@Injectable()
export class PaymentEventsPublisher {
  constructor(private readonly eventBus: EventBusService) {}

  async paymentCompleted(
    tenantId: string,
    payload: PaymentCompletedPayload,
  ): Promise<void> {
    await this.eventBus.publish(EventTopics.PAYMENT_COMPLETED, payload, {
      tenantId,
    });
  }

  async paymentFailed(
    tenantId: string,
    payload: PaymentFailedPayload,
  ): Promise<void> {
    await this.eventBus.publish(EventTopics.PAYMENT_FAILED, payload, {
      tenantId,
    });
  }
}

export type { DomainEvent };

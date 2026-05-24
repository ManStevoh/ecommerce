import { Injectable } from '@nestjs/common';
import { EventBusService, EventTopics } from '@nexora/event-bus';
import type { ProductDeletedPayload, ProductIndexPayload } from '@nexora/shared-types';

@Injectable()
export class ProductEventsPublisher {
  constructor(private readonly eventBus: EventBusService) {}

  async created(tenantId: string, payload: ProductIndexPayload): Promise<void> {
    await this.eventBus.publish(EventTopics.PRODUCT_CREATED, payload, {
      tenantId,
    });
  }

  async updated(tenantId: string, payload: ProductIndexPayload): Promise<void> {
    await this.eventBus.publish(EventTopics.PRODUCT_UPDATED, payload, {
      tenantId,
    });
  }

  async deleted(
    tenantId: string,
    payload: ProductDeletedPayload,
  ): Promise<void> {
    await this.eventBus.publish(EventTopics.PRODUCT_DELETED, payload, {
      tenantId,
    });
  }
}

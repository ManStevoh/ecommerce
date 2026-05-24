import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  EventBusService,
  EventTopics,
  type DomainEvent,
} from '@nexora/event-bus';
import type {
  ProductDeletedPayload,
  ProductIndexPayload,
} from '@nexora/shared-types';
import { SearchService } from '../search/search.service';

@Injectable()
export class ProductEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProductEventsConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly search: SearchService,
  ) {}

  onModuleInit(): void {
    const index = async (
      event: DomainEvent<ProductIndexPayload>,
    ): Promise<void> => {
      if (!event.tenantId) return;
      await this.search.indexProduct(event.tenantId, event.payload);
      this.logger.debug(`Indexed product ${event.payload.id}`);
    };

    this.eventBus.subscribe(EventTopics.PRODUCT_CREATED, index);
    this.eventBus.subscribe(EventTopics.PRODUCT_UPDATED, index);

    this.eventBus.subscribe<ProductDeletedPayload>(
      EventTopics.PRODUCT_DELETED,
      async (event) => {
        if (!event.tenantId) return;
        await this.search.deleteProduct(
          event.tenantId,
          event.payload.productId,
        );
      },
    );
  }
}

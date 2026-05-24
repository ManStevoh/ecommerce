import { Module } from '@nestjs/common';
import { ProductEventsPublisher } from './product-events.publisher';

@Module({
  providers: [ProductEventsPublisher],
  exports: [ProductEventsPublisher],
})
export class ProductEventsModule {}

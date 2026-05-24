import { Module } from '@nestjs/common';
import { PaymentEventsPublisher } from './payment-events.publisher';

@Module({
  providers: [PaymentEventsPublisher],
  exports: [PaymentEventsPublisher],
})
export class PaymentEventsModule {}

import { Module } from '@nestjs/common';
import { PaymentEventsConsumer } from './payment-events.consumer';

@Module({
  providers: [PaymentEventsConsumer],
})
export class PaymentEventsModule {}

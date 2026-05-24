import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { PaymentEventsModule } from '../events/payment-events.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ProvidersModule, PaymentEventsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}

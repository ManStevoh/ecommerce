import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventBusModule } from '@nexora/event-bus';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './common/tenant/tenant.module';
import { ProvidersModule } from './providers/providers.module';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { PaymentEventsModule } from './events/payment-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventBusModule.forRoot({ queueName: 'nexora.events' }),
    DatabaseModule,
    TenantModule,
    ProvidersModule,
    PaymentsModule,
    WebhooksModule,
    ReconciliationModule,
    PaymentEventsModule,
  ],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventBusModule } from '@nexora/event-bus';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './common/tenant/tenant.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { AbandonedCartsModule } from './abandoned-carts/abandoned-carts.module';
import { InvoicesModule } from './invoices/invoices.module';
import { FulfillmentModule } from './fulfillment/fulfillment.module';
import { ReturnsModule } from './returns/returns.module';
import { RefundsModule } from './refunds/refunds.module';
import { CartConversionModule } from './cart-conversion/cart-conversion.module';
import { PaymentEventsModule } from './events/payment-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventBusModule.forRoot({ queueName: 'nexora.events' }),
    DatabaseModule,
    TenantModule,
    IntegrationsModule,
    InventoryModule,
    OrdersModule,
    InvoicesModule,
    FulfillmentModule,
    ReturnsModule,
    RefundsModule,
    CartConversionModule,
    AbandonedCartsModule,
    PaymentEventsModule,
  ],
})
export class AppModule {}

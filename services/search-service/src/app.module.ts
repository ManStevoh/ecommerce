import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventBusModule } from "@nexora/event-bus";
import { HealthModule } from "./health/health.module";
import { SearchModule } from "./search/search.module";
import { ProductEventsModule } from "./events/product-events.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventBusModule.forRoot({ queueName: 'nexora.events' }),
    HealthModule,
    SearchModule,
    ProductEventsModule,
  ],
})
export class AppModule {}

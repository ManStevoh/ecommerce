import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventBusModule } from "@nexora/event-bus";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { OrderEventsConsumer } from "./order-events.consumer";

@Module({
  imports: [EventBusModule.forRoot({ queueName: "nexora.events" })],
  controllers: [EventsController],
  providers: [EventsService, OrderEventsConsumer],
})
export class EventsModule {}
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventBusModule } from "@nexora/event-bus";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { OrderEventsConsumer } from "./order-events.consumer";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    EventBusModule.forRoot({ queueName: "nexora.events" }),
    NotificationsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, OrderEventsConsumer],
})
export class EventsModule {}
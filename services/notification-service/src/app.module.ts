import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    EventsModule,
    NotificationsModule,
  ],
})
export class AppModule {}

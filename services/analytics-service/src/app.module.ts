import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalyticsModule } from "./analytics/analytics.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule, AnalyticsModule],
})
export class AppModule {}

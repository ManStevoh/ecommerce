import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OpenAiModule } from "./lib/openai.module";
import { FraudModule } from "./fraud/fraud.module";
import { HealthModule } from "./health/health.module";
import { ProductDescriptionModule } from "./product-description/product-description.module";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { SeoModule } from "./seo/seo.module";
import { TicketClassificationModule } from "./tickets/ticket-classification.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OpenAiModule,
    HealthModule,
    ProductDescriptionModule,
    SeoModule,
    RecommendationsModule,
    FraudModule,
    TicketClassificationModule,
  ],
})
export class AppModule {}

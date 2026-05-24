import { Module } from "@nestjs/common";
import { ProductDescriptionController } from "./product-description.controller";
import { ProductDescriptionService } from "./product-description.service";

@Module({
  controllers: [ProductDescriptionController],
  providers: [ProductDescriptionService],
  exports: [ProductDescriptionService],
})
export class ProductDescriptionModule {}

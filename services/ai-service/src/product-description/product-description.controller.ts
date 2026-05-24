import { Body, Controller, Post } from "@nestjs/common";
import { GenerateProductDescriptionDto } from "./dto/generate-product-description.dto";
import { ProductDescriptionService } from "./product-description.service";

@Controller("ai/product-descriptions")
export class ProductDescriptionController {
  constructor(private readonly productDescriptionService: ProductDescriptionService) {}

  /**
   * OpenAI-compatible chat completion stub for product copy generation.
   * Production: proxy to OpenAI / Azure OpenAI with tenant-scoped API keys.
   */
  @Post()
  generate(@Body() dto: GenerateProductDescriptionDto) {
    return this.productDescriptionService.generate(dto);
  }
}

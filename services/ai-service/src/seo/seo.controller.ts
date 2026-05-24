import { Body, Controller, Post } from "@nestjs/common";
import { OptimizeSeoDto } from "./dto/optimize-seo.dto";
import { SeoService } from "./seo.service";

@Controller("ai/seo")
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Post("optimize")
  optimize(@Body() dto: OptimizeSeoDto) {
    return this.seoService.optimize(dto);
  }
}

import { Body, Controller, Post } from "@nestjs/common";
import { GetRecommendationsDto } from "./dto/get-recommendations.dto";
import { RecommendationsService } from "./recommendations.service";

@Controller("ai/recommendations")
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post()
  getRecommendations(@Body() dto: GetRecommendationsDto) {
    return this.recommendationsService.getRecommendations(dto);
  }
}

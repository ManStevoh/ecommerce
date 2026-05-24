import { Body, Controller, Post } from "@nestjs/common";
import { DetectFraudDto } from "./dto/detect-fraud.dto";
import { FraudService } from "./fraud.service";

@Controller("ai/fraud")
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Post("detect")
  detect(@Body() dto: DetectFraudDto) {
    return this.fraudService.detect(dto);
  }
}

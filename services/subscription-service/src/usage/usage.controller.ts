import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsageService } from './usage.service';
import { RecordUsageDto } from './dto/record-usage.dto';

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Post()
  record(@Body() dto: RecordUsageDto) {
    return this.usageService.record(dto);
  }

  @Get('summary')
  summary() {
    return this.usageService.summary();
  }
}

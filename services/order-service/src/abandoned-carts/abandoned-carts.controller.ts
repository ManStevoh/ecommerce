import { Body, Controller, Post } from '@nestjs/common';
import { AbandonedCartsService } from './abandoned-carts.service';
import { UpsertAbandonedCartDto } from './dto/upsert-abandoned-cart.dto';

@Controller('abandoned-carts')
export class AbandonedCartsController {
  constructor(private readonly abandonedCartsService: AbandonedCartsService) {}

  @Post()
  upsert(@Body() dto: UpsertAbandonedCartDto) {
    return this.abandonedCartsService.upsert(dto);
  }

  @Post('process')
  process(@Body() body: { storeUrl?: string }) {
    return this.abandonedCartsService.processReminders(body.storeUrl);
  }

  @Post('process-all')
  processAll(@Body() body: { storeUrl?: string }) {
    return this.abandonedCartsService.processAllTenants(body.storeUrl);
  }
}

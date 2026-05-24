import { Body, Controller, Param, Post } from '@nestjs/common';
import { RefundsService } from './refunds.service';

@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post('orders/:orderId')
  initiate(@Param('orderId') orderId: string, @Body('amount') amount?: number) {
    return this.refundsService.initiate(orderId, amount);
  }
}

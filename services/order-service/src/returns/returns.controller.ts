import { Body, Controller, Param, Post } from '@nestjs/common';
import { ReturnsService } from './returns.service';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post('orders/:orderId')
  initiate(@Param('orderId') orderId: string, @Body('reason') reason?: string) {
    return this.returnsService.initiate(orderId, reason);
  }
}

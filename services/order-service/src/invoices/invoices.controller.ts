import { Controller, Get, Param, Post } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('orders/:orderId')
  generate(@Param('orderId') orderId: string) {
    return this.invoicesService.generateForOrder(orderId);
  }

  @Get('orders/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.invoicesService.findByOrder(orderId);
  }
}

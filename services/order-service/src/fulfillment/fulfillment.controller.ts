import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FulfillmentService } from './fulfillment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@Controller('fulfillment')
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Post('orders/:orderId')
  createShipment(
    @Param('orderId') orderId: string,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.fulfillmentService.createShipment(orderId, dto);
  }

  @Get('orders/:orderId')
  getByOrder(@Param('orderId') orderId: string) {
    return this.fulfillmentService.getByOrder(orderId);
  }
}

import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ConvertCartDto } from './dto/convert-cart.dto';

@Injectable()
export class CartConversionService {
  constructor(private readonly ordersService: OrdersService) {}

  async convertFromCart(dto: ConvertCartDto) {
    const order = await this.ordersService.create(dto);
    const orderRecord = order as { id: string; orderNumber: string };

    return {
      cartId: dto.cartId ?? null,
      orderId: orderRecord.id,
      orderNumber: orderRecord.orderNumber,
      converted: true,
    };
  }
}

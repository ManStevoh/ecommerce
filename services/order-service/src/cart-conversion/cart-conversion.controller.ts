import { Body, Controller, Post } from '@nestjs/common';
import { CartConversionService } from './cart-conversion.service';
import { ConvertCartDto } from './dto/convert-cart.dto';

@Controller('cart-conversion')
export class CartConversionController {
  constructor(private readonly cartConversionService: CartConversionService) {}

  @Post()
  convert(@Body() dto: ConvertCartDto) {
    return this.cartConversionService.convertFromCart(dto);
  }
}

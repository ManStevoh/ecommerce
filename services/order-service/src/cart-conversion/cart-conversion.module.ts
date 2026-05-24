import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { CartConversionController } from './cart-conversion.controller';
import { CartConversionService } from './cart-conversion.service';

@Module({
  imports: [OrdersModule],
  controllers: [CartConversionController],
  providers: [CartConversionService],
})
export class CartConversionModule {}

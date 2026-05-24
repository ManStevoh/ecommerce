import { IsOptional, IsUUID } from 'class-validator';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';

export class ConvertCartDto extends CreateOrderDto {
  @IsOptional()
  @IsUUID()
  cartId?: string;
}

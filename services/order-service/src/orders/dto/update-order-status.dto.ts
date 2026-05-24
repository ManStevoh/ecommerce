import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@nexora/database';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

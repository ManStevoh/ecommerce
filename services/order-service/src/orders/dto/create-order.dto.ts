import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderLineItemDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsEmail()
  customerEmail!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineItemDto)
  items!: OrderLineItemDto[];

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  billingAddress?: Record<string, unknown>;
}

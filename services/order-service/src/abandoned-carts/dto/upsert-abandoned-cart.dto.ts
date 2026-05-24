import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AbandonedCartItemDto {
  @IsString()
  productId!: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class UpsertAbandonedCartDto {
  @IsEmail()
  customerEmail!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbandonedCartItemDto)
  items!: AbandonedCartItemDto[];

  @IsNumber()
  @Min(0)
  subtotal!: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

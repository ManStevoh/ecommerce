import { IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateVariantDto {
  @IsUUID()
  productId!: string;

  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsObject()
  attributeValues?: Record<string, string | number | boolean>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightGrams?: number;
}

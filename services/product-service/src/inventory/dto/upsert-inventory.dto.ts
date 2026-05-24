import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpsertInventoryDto {
  @IsUUID()
  variantId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsInt()
  @Min(0)
  quantityOnHand!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantityReserved?: number;
}

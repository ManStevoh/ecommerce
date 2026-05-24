import { IsInt, IsString, IsOptional } from 'class-validator';

export class AdjustInventoryDto {
  @IsInt()
  delta!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

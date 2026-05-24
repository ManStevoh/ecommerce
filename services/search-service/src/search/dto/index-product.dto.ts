import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class IndexProductDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

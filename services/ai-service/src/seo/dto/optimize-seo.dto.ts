import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class OptimizeSeoDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  targetKeywords?: string;
}

import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class GetRecommendationsDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  context?: "homepage" | "pdp" | "cart" | "checkout";

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

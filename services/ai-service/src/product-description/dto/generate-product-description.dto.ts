import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class GenerateProductDescriptionDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @MaxLength(200)
  productName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  brief?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attributes?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;

  @IsOptional()
  @IsString()
  tone?: "professional" | "casual" | "luxury" | "playful";
}

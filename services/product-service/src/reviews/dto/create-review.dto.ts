import { IsEmail, IsInt, IsOptional, IsString, IsUUID, Max, Min, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MaxLength(200)
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMediaDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsUrl()
  url!: string;

  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}

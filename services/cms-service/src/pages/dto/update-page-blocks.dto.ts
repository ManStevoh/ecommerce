import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { ContentBlockType } from '@nexora/database';

export class PageBlockDto {
  @IsEnum(ContentBlockType)
  type!: ContentBlockType;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class UpdatePageBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageBlockDto)
  blocks!: PageBlockDto[];
}

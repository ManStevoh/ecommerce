import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum AttributeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
}

export class CreateAttributeDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsEnum(AttributeType)
  type!: AttributeType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

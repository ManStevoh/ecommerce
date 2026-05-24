import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  PORT?: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  BASE_DOMAIN?: string;

  @IsOptional()
  @IsString()
  INTERNAL_API_KEY?: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('\n')}`,
    );
  }
  return validated;
}

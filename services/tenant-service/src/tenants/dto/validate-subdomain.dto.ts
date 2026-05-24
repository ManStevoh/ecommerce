import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ValidateSubdomainDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
    message: 'Subdomain must be lowercase alphanumeric with optional hyphens',
  })
  subdomain!: string;
}

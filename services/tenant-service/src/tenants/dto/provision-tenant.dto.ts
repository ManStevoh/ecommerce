import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ProvisionTenantDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  storeName!: string;
}

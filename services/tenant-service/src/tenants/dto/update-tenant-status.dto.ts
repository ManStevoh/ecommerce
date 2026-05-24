import { IsEnum } from 'class-validator';
import { TenantStatus } from '@nexora/database';

export class UpdateTenantStatusDto {
  @IsEnum(TenantStatus)
  status!: TenantStatus;
}

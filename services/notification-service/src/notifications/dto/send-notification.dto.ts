import { IsEmail, IsObject, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class SendNotificationDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  templateId!: string;

  @IsOptional()
  @IsEmail()
  toEmail?: string;

  @IsOptional()
  @IsString()
  toPhone?: string;

  @IsOptional()
  @IsString()
  deviceToken?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  body?: string;
}

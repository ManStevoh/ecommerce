import { IsNumber, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class DetectFraudDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  orderId!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsObject()
  customerSignals?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  deviceFingerprint?: Record<string, unknown>;
}

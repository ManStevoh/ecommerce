import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentProvider } from '@nexora/shared-types';

export class InitiatePaymentDto {
  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @IsUUID()
  orderId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

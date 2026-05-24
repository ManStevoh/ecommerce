import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class MpesaStkPushDto {
  @IsString()
  phoneNumber!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  accountReference!: string;

  @IsOptional()
  @IsString()
  transactionDesc?: string;
}

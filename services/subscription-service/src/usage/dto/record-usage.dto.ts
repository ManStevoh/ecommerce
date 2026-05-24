import { IsNumber, IsString, Min } from 'class-validator';

export class RecordUsageDto {
  @IsString()
  metric!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;
}

import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TicketPriority } from '@nexora/database';

export { TicketPriority };

export class CreateTicketDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsEmail()
  customerEmail!: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}

import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TicketPriority, TicketStatus } from '@nexora/database';

export { TicketStatus, TicketPriority };

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsBoolean()
  escalated?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}

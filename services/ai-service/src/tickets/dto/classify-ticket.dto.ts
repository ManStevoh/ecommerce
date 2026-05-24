import { IsString, MaxLength } from 'class-validator';
import { TicketPriority } from '@nexora/database';

export class ClassifyTicketDto {
  @IsString()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;
}

export type TicketClassification = {
  category: string;
  priority: TicketPriority;
  confidence: number;
  tags: string[];
};

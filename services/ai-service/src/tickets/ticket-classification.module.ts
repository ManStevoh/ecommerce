import { Module } from '@nestjs/common';
import { TicketClassificationController } from './ticket-classification.controller';
import { TicketClassificationService } from './ticket-classification.service';

@Module({
  controllers: [TicketClassificationController],
  providers: [TicketClassificationService],
})
export class TicketClassificationModule {}

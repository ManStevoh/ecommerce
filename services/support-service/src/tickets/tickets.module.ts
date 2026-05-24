import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketClassifierClient } from './ticket-classifier.client';

@Module({
  imports: [ConfigModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketClassifierClient],
})
export class TicketsModule {}

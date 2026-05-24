import { Body, Controller, Post } from '@nestjs/common';
import { ClassifyTicketDto } from './dto/classify-ticket.dto';
import { TicketClassificationService } from './ticket-classification.service';

@Controller('ai/tickets')
export class TicketClassificationController {
  constructor(private readonly classifier: TicketClassificationService) {}

  @Post('classify')
  classify(@Body() dto: ClassifyTicketDto) {
    return this.classifier.classify(dto);
  }
}

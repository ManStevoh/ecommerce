import { Controller, Post } from '@nestjs/common';
import { OutboxPublisherService } from './outbox-publisher.service';

@Controller('outbox')
export class OutboxController {
  constructor(private readonly outboxPublisher: OutboxPublisherService) {}

  @Post('publish')
  publishPending() {
    return this.outboxPublisher.publishNow();
  }
}

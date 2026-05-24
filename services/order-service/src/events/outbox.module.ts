import { Module } from '@nestjs/common';
import { OutboxPublisherService } from './outbox-publisher.service';
import { OutboxController } from './outbox.controller';

@Module({
  controllers: [OutboxController],
  providers: [OutboxPublisherService],
  exports: [OutboxPublisherService],
})
export class OutboxModule {}

import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailChannel } from './email.channel';

@Module({
  controllers: [NotificationsController],
  providers: [EmailChannel, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

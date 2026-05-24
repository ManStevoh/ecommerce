import { Module } from '@nestjs/common';
import { NotificationServiceClient, createNotificationServiceClient } from '@nexora/integrations';
import { AbandonedCartsController } from './abandoned-carts.controller';
import { AbandonedCartsService } from './abandoned-carts.service';

@Module({
  controllers: [AbandonedCartsController],
  providers: [
    AbandonedCartsService,
    {
      provide: NotificationServiceClient,
      useFactory: () =>
        createNotificationServiceClient(
          process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3008',
        ),
    },
  ],
})
export class AbandonedCartsModule {}

import { Global, Module } from '@nestjs/common';
import {
  NotificationServiceClient,
  createNotificationServiceClient,
} from '@nexora/integrations';

@Global()
@Module({
  providers: [
    {
      provide: NotificationServiceClient,
      useFactory: () =>
        createNotificationServiceClient(
          process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3008',
        ),
    },
  ],
  exports: [NotificationServiceClient],
})
export class IntegrationsModule {}

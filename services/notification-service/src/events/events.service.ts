import { Injectable } from '@nestjs/common';
import { EventBusService, EventTopics } from '@nexora/event-bus';

@Injectable()
export class EventsService {
  constructor(private readonly eventBus: EventBusService) {}

  async enqueue(event: {
    type: string;
    tenantId: string;
    payload: Record<string, unknown>;
  }) {
    const topic =
      event.type === EventTopics.NOTIFICATION_DISPATCH
        ? EventTopics.NOTIFICATION_DISPATCH
        : EventTopics.NOTIFICATION_DISPATCH;

    const published = await this.eventBus.publish(
      topic,
      { ...event.payload, originalType: event.type },
      { tenantId: event.tenantId },
    );

    return {
      queued: true,
      queue: 'nexora.events',
      broker: 'redis-bullmq',
      eventId: published.id,
      topic: published.topic,
      tenantId: event.tenantId,
      type: event.type,
    };
  }

  getQueueInfo() {
    return {
      queue: 'nexora.events',
      pattern: 'event-driven',
      description:
        'Domain services publish events; notification workers consume and route to email/SMS/WhatsApp/push providers.',
      redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    };
  }
}

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Queue, Worker, type JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import {
  createDomainEvent,
  type DomainEvent,
  type EventTopic,
} from '../topics';

export interface EventBusOptions {
  redisUrl?: string;
  queueName?: string;
  defaultJobOptions?: JobsOptions;
}

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private connection!: IORedis;
  private queue!: Queue;
  private workers: Worker[] = [];
  private readonly queueName: string;

  constructor(private readonly options: EventBusOptions = {}) {
    this.queueName = options.queueName ?? 'nexora.events';
  }

  onModuleInit(): void {
    const redisUrl =
      this.options.redisUrl ??
      process.env.REDIS_URL ??
      'redis://localhost:6379';

    this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue(this.queueName, {
      connection: this.connection,
      defaultJobOptions: this.options.defaultJobOptions ?? {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });

    this.logger.log(`Event bus connected (${this.queueName})`);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.close()));
    await this.queue?.close();
    await this.connection?.quit();
  }

  async publish<T>(
    topic: EventTopic,
    payload: T,
    options?: { tenantId?: string; metadata?: Record<string, string> },
  ): Promise<DomainEvent<T>> {
    const event = createDomainEvent(topic, payload, options);
    await this.queue.add(topic, event, {
      jobId: event.id,
    });
    this.logger.debug(`Published ${topic} (${event.id})`);
    return event;
  }

  subscribe<T>(
    topic: EventTopic,
    handler: (event: DomainEvent<T>) => Promise<void>,
  ): void {
    const worker = new Worker(
      this.queueName,
      async (job) => {
        if (job.name !== topic) return;
        await handler(job.data as DomainEvent<T>);
      },
      { connection: this.connection.duplicate(), concurrency: 5 },
    );

    worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });

    this.workers.push(worker);
    this.logger.log(`Subscribed to ${topic}`);
  }
}

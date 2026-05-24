import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OutboxStatus } from '@nexora/database';
import { EventBusService, type EventTopic } from '@nexora/event-bus';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  @Cron('*/10 * * * * *')
  async publishPending() {
    const pending = await this.prisma.eventOutbox.findMany({
      where: {
        status: OutboxStatus.PENDING,
        retryCount: { lt: 5 },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    if (pending.length === 0) return;

    let published = 0;
    for (const row of pending) {
      try {
        await this.eventBus.publish(
          row.topic as EventTopic,
          row.payload as Record<string, unknown>,
          row.tenantId ? { tenantId: row.tenantId } : undefined,
        );
        await this.prisma.eventOutbox.update({
          where: { id: row.id },
          data: {
            status: OutboxStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        });
        published += 1;
      } catch (err) {
        const retryCount = row.retryCount + 1;
        await this.prisma.eventOutbox.update({
          where: { id: row.id },
          data: {
            retryCount,
            status:
              retryCount >= 5 ? OutboxStatus.FAILED : OutboxStatus.PENDING,
          },
        });
        this.logger.warn(
          `Outbox publish failed for ${row.id} (${row.topic}): ${String(err)}`,
        );
      }
    }

    this.logger.log(`Outbox publisher: ${published}/${pending.length} events sent`);
  }

  async publishNow() {
    await this.publishPending();
    const counts = await this.prisma.eventOutbox.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    return Object.fromEntries(
      counts.map((row) => [row.status, row._count.id]),
    );
  }
}

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly sessionPrefix: string;
  private readonly sessionTtlSeconds: number;

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>('redis.url')!;
    this.sessionPrefix = this.config.get<string>('redis.sessionPrefix')!;
    this.sessionTtlSeconds = this.config.get<number>(
      'redis.sessionTtlSeconds',
    )!;

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.client.on('connect', () =>
      this.logger.log('Redis connected for session management'),
    );
    this.client.on('error', (err) =>
      this.logger.warn(`Redis connection issue: ${err.message}`),
    );

    void this.client.connect().catch((err: Error) => {
      this.logger.warn(
        `Redis unavailable; sessions will use DB only: ${err.message}`,
      );
    });
  }

  sessionKey(sessionId: string): string {
    return `${this.sessionPrefix}${sessionId}`;
  }

  async setSession(
    sessionId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (this.client.status !== 'ready') return;
    await this.client.setex(
      this.sessionKey(sessionId),
      this.sessionTtlSeconds,
      JSON.stringify(payload),
    );
  }

  async getSession(
    sessionId: string,
  ): Promise<Record<string, unknown> | null> {
    if (this.client.status !== 'ready') return null;
    const data = await this.client.get(this.sessionKey(sessionId));
    return data ? (JSON.parse(data) as Record<string, unknown>) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (this.client.status !== 'ready') return;
    await this.client.del(this.sessionKey(sessionId));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NexoraLogger } from '../index';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private readonly logger = new NexoraLogger('http');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url: string;
      correlationId?: string;
      headers: Record<string, string>;
    }>();
    const start = Date.now();
    const path = req.originalUrl ?? req.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start;
          this.logger.info('request_completed', {
            method: req.method,
            path,
            statusCode: context.switchToHttp().getResponse().statusCode,
            durationMs,
            correlationId:
              req.correlationId ?? req.headers['x-correlation-id'],
          });
        },
        error: (err: Error) => {
          const durationMs = Date.now() - start;
          this.logger.error('request_failed', {
            method: req.method,
            path,
            durationMs,
            error: err.message,
            correlationId:
              req.correlationId ?? req.headers['x-correlation-id'],
          });
        },
      }),
    );
  }
}

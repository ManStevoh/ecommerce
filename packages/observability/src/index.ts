import { randomUUID } from 'crypto';

export const CORRELATION_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

export interface LogContext {
  service?: string;
  correlationId?: string;
  tenantId?: string;
  userId?: string;
  [key: string]: unknown;
}

export class NexoraLogger {
  constructor(private readonly service: string) {}

  private write(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context?: LogContext,
  ): void {
    const entry = {
      level,
      service: this.service,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    const line = JSON.stringify(entry);
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.write('error', message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      this.write('debug', message, context);
    }
  }
}

export function generateCorrelationId(): string {
  return randomUUID();
}

export * from './nest/correlation.middleware';
export * from './nest/http-metrics.interceptor';
export * from './nest/observability.module';

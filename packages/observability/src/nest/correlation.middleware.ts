import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import {
  CORRELATION_HEADER,
  generateCorrelationId,
  REQUEST_ID_HEADER,
} from '../index';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers[CORRELATION_HEADER] as string) ??
      (req.headers[REQUEST_ID_HEADER] as string) ??
      generateCorrelationId();

    req.headers[CORRELATION_HEADER] = correlationId;
    res.setHeader(CORRELATION_HEADER, correlationId);
    (req as Request & { correlationId: string }).correlationId = correlationId;
    next();
  }
}

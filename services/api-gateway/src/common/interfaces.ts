import type { JwtPayload } from '@nexora/shared-types';
import type { Request } from 'express';

export interface NexoraRequest extends Request {
  tenantId?: string;
  tenantSlug?: string;
  user?: JwtPayload;
  isPublic?: boolean;
}

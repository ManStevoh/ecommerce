import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TenantContextService } from './tenant-context.service';
import { TenantGuard } from './tenant.guard';

@Global()
@Module({
  providers: [
    TenantContextService,
    { provide: APP_GUARD, useClass: TenantGuard },
  ],
  exports: [TenantContextService],
})
export class TenantModule {}

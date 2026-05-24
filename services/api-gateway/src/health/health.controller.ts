import { Controller, Get } from '@nestjs/common';
import { HealthService, type GatewayHealth } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<GatewayHealth> {
    return this.healthService.check();
  }

  @Get('live')
  getLiveness(): { status: string; timestamp: string } {
    return this.healthService.liveness();
  }

  @Get('ready')
  async getReadiness(): Promise<GatewayHealth> {
    return this.healthService.check();
  }
}

import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "notification-service",
      queue: process.env.REDIS_URL ? "redis-connected-stub" : "redis-not-configured",
      timestamp: new Date().toISOString(),
    };
  }
}

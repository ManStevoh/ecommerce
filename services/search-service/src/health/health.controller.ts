import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "search-service",
      meilisearch: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
      timestamp: new Date().toISOString(),
    };
  }
}

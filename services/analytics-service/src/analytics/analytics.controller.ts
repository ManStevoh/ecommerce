import { Controller, Get, Query } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("revenue")
  getRevenue(
    @Query("tenantId") tenantId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.analyticsService.getRevenue(tenantId, from, to);
  }

  @Get("conversion")
  getConversion(@Query("tenantId") tenantId: string) {
    return this.analyticsService.getConversion(tenantId);
  }

  @Get("funnel")
  getFunnel(@Query("tenantId") tenantId: string) {
    return this.analyticsService.getFunnel(tenantId);
  }
}

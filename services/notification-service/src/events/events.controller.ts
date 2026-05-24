import { Body, Controller, Get, Post } from "@nestjs/common";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("queue")
  getQueueInfo() {
    return this.eventsService.getQueueInfo();
  }

  @Post("enqueue")
  enqueue(
    @Body()
    body: { type: string; tenantId: string; payload: Record<string, unknown> },
  ) {
    return this.eventsService.enqueue(body);
  }
}

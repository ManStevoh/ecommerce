import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { TicketsService } from "./tickets.service";

@Controller("tickets")
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get()
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('customerEmail') customerEmail?: string,
  ) {
    return this.ticketsService.findAll(tenantId, customerEmail);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.ticketsService.remove(id);
  }

  @Get(":id/sla")
  getSla(@Param("id") id: string) {
    return this.ticketsService.getSla(id);
  }

  @Post(":id/escalate")
  escalate(@Param("id") id: string, @Body("reason") reason?: string) {
    return this.ticketsService.escalate(id, reason);
  }
}

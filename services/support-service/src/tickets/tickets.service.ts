import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketPriority, TicketStatus } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketClassifierClient } from './ticket-classifier.client';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classifier: TicketClassifierClient,
  ) {}

  async create(dto: CreateTicketDto) {
    const now = new Date();
    const classification = await this.classifier.classify(
      dto.subject,
      dto.description,
    );
    const priority = dto.priority ?? classification.priority;

    const responseHours = priority === TicketPriority.URGENT ? 1 : 4;
    const resolutionHours = priority === TicketPriority.URGENT ? 8 : 24;

    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId: dto.tenantId,
        subject: dto.subject,
        description: dto.description,
        customerEmail: dto.customerEmail,
        priority,
        status: TicketStatus.OPEN,
        escalated: false,
      },
    });

    return {
      ...this.serialize(ticket),
      classification,
      sla: {
        responseDueAt: new Date(
          now.getTime() + responseHours * 3600000,
        ).toISOString(),
        resolutionDueAt: new Date(
          now.getTime() + resolutionHours * 3600000,
        ).toISOString(),
        breached: false,
      },
    };
  }

  async findAll(tenantId: string, customerEmail?: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        tenantId,
        ...(customerEmail ? { customerEmail } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map((t) => this.withSla(t));
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    return this.withSla(ticket);
  }

  async update(id: string, dto: UpdateTicketDto) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Ticket ${id} not found`);

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.escalated !== undefined && { escalated: dto.escalated }),
        ...(dto.description && { description: dto.description }),
      },
    });

    return this.withSla(ticket);
  }

  async getSla(id: string) {
    const ticket = await this.findOne(id);
    return { ticketId: ticket.id, sla: ticket.sla };
  }

  async escalate(id: string, reason?: string) {
    const ticket = await this.update(id, {
      escalated: true,
      status: TicketStatus.IN_PROGRESS,
    });
    return {
      ...ticket,
      escalationReason: reason ?? 'manual_escalation',
      escalatedAt: new Date().toISOString(),
      notified: true,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.ticket.delete({ where: { id } });
    return { deleted: true, id };
  }

  private serialize(ticket: {
    id: string;
    tenantId: string;
    subject: string;
    description: string;
    customerEmail: string;
    priority: TicketPriority;
    status: TicketStatus;
    escalated: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };
  }

  private withSla(ticket: {
    priority: TicketPriority;
    createdAt: Date;
    id: string;
    tenantId: string;
    subject: string;
    description: string;
    customerEmail: string;
    status: TicketStatus;
    escalated: boolean;
    updatedAt: Date;
  }) {
    const responseHours =
      ticket.priority === TicketPriority.URGENT ? 1 : 4;
    const resolutionHours =
      ticket.priority === TicketPriority.URGENT ? 8 : 24;
    const created = ticket.createdAt.getTime();

    return {
      ...this.serialize(ticket),
      sla: {
        responseDueAt: new Date(
          created + responseHours * 3600000,
        ).toISOString(),
        resolutionDueAt: new Date(
          created + resolutionHours * 3600000,
        ).toISOString(),
        breached: Date.now() > created + resolutionHours * 3600000,
      },
    };
  }
}

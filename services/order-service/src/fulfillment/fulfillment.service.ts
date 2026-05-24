import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@nexora/database';
import { randomUUID } from 'crypto';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { PrismaService } from '../database/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';

interface ShipmentRecord {
  id: string;
  carrier: string;
  trackingNumber?: string;
  status: string;
  createdAt: string;
}

interface FulfillmentNotes {
  shipments?: ShipmentRecord[];
}

function parseFulfillmentNotes(notes: string | null): FulfillmentNotes {
  if (!notes) return { shipments: [] };
  try {
    const parsed = JSON.parse(notes) as FulfillmentNotes;
    return { shipments: parsed.shipments ?? [] };
  } catch {
    return { shipments: [] };
  }
}

@Injectable()
export class FulfillmentService {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly prisma: PrismaService,
  ) {}

  async createShipment(orderId: string, dto: CreateShipmentDto = {}) {
    const tenantId = this.tenantContext.getTenantId();
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const fulfillment = parseFulfillmentNotes(order.notes);
    const shipment: ShipmentRecord = {
      id: `ship_${randomUUID().slice(0, 8)}`,
      carrier: dto.carrier ?? 'manual',
      trackingNumber: dto.trackingNumber,
      status: dto.trackingNumber ? 'SHIPPED' : 'PROCESSING',
      createdAt: new Date().toISOString(),
    };

    fulfillment.shipments = [...(fulfillment.shipments ?? []), shipment];

    const nextStatus = dto.trackingNumber
      ? OrderStatus.SHIPPED
      : order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED
        ? OrderStatus.PROCESSING
        : order.status;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        statusReason: dto.trackingNumber
          ? `Tracking: ${dto.trackingNumber}`
          : order.statusReason,
        notes: JSON.stringify(fulfillment),
      },
    });

    return {
      tenantId,
      orderId,
      shipment,
      orderStatus: nextStatus,
    };
  }

  async getByOrder(orderId: string) {
    const tenantId = this.tenantContext.getTenantId();
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      select: { id: true, status: true, notes: true, statusReason: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const fulfillment = parseFulfillmentNotes(order.notes);
    return {
      tenantId,
      orderId: order.id,
      orderStatus: order.status,
      trackingSummary: order.statusReason,
      shipments: fulfillment.shipments ?? [],
    };
  }
}

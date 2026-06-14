import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@nexora/database';
import { PaymentProvider } from '@nexora/shared-types';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { PaymentProviderRegistry } from '../providers/payment-provider.registry';
import { MpesaAdapter } from '../providers/adapters/mpesa.adapter';
import { PaymentEventsPublisher } from '../events/payment-events.publisher';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { MpesaStkPushDto } from './dto/mpesa-stk-push.dto';
import type { InitiatePaymentResult } from '../providers/interfaces/payment-provider.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly registry: PaymentProviderRegistry,
    private readonly mpesaAdapter: MpesaAdapter,
    private readonly paymentEvents: PaymentEventsPublisher,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  private mapStatus(status: string): PaymentStatus {
    const upper = status.toUpperCase();
    if (upper === 'SUCCEEDED') return PaymentStatus.COMPLETED;
    if (upper in PaymentStatus) {
      return upper as PaymentStatus;
    }
    return PaymentStatus.PENDING;
  }

  private isStubResult(result: InitiatePaymentResult): boolean {
    const raw = result.raw as { stub?: boolean } | undefined;
    return raw?.stub === true;
  }

  private async autoCompleteStubPayment(
    tenantId: string,
    payment: {
      id: string;
      orderId: string | null;
      amount: Prisma.Decimal;
      provider: string;
    },
    providerResult: InitiatePaymentResult,
  ) {
    if (!this.isStubResult(providerResult) || !payment.orderId) {
      return payment;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
    });

    await this.paymentEvents.paymentCompleted(tenantId, {
      paymentId: payment.id,
      orderIds: [payment.orderId],
      provider: payment.provider as PaymentProvider,
      amount: Number(payment.amount),
    });

    return { ...payment, status: PaymentStatus.COMPLETED };
  }

  async initiate(dto: InitiatePaymentDto) {
    const tenantId = this.tenantContext.getTenantId();
    const adapter = this.registry.get(dto.provider);
    const result = await adapter.initiatePayment({
      tenantId,
      orderId: dto.orderId,
      amount: dto.amount,
      currency: dto.currency,
      metadata: dto.metadata,
    });

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        orderId: dto.orderId,
        provider: dto.provider,
        amount: dto.amount,
        currency: dto.currency,
        status: this.mapStatus(result.status),
        providerRef: result.externalReference,
        metadata: (result.raw ?? {}) as Prisma.InputJsonValue,
      },
    });

    const finalized = await this.autoCompleteStubPayment(
      tenantId,
      payment,
      result,
    );

    return { payment: finalized, providerResult: result };
  }

  async mpesaStkPush(dto: MpesaStkPushDto) {
    const tenantId = this.tenantContext.getTenantId();
    const result = await this.mpesaAdapter.stkPush(dto, tenantId);
    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        orderId: dto.accountReference,
        provider: PaymentProvider.MPESA,
        amount: dto.amount,
        currency: 'KES',
        status: this.mapStatus(result.status),
        providerRef: result.externalReference,
        metadata: (result.raw ?? {}) as Prisma.InputJsonValue,
      },
    });

    const finalized = await this.autoCompleteStubPayment(
      tenantId,
      payment,
      result,
    );

    return { payment: finalized, providerResult: result };
  }

  async findAll() {
    return this.prisma.payment.findMany({
      where: this.tenantWhere(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.payment.findFirst({
      where: { id, ...this.tenantWhere() },
    });
  }

  async approve(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const payment = await this.prisma.payment.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    if (payment.orderId) {
      await this.paymentEvents.paymentCompleted(tenantId, {
        paymentId: payment.id,
        orderIds: [payment.orderId],
        provider: payment.provider as PaymentProvider,
        amount: Number(payment.amount),
      });
    }

    return updated;
  }
}

import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { DetectFraudDto } from './dto/detect-fraud.dto';

@Injectable()
export class FraudService {
  constructor(private readonly prisma: PrismaService) {}

  async detect(dto: DetectFraudDto) {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const oneDayAgo = new Date(Date.now() - 86400000);

    const [recentOrders, recentPayments, order] = await Promise.all([
      this.prisma.order.count({
        where: {
          tenantId: dto.tenantId,
          createdAt: { gte: oneHourAgo },
          ...(dto.customerSignals?.email
            ? { customerEmail: String(dto.customerSignals.email) }
            : {}),
        },
      }),
      this.prisma.payment.count({
        where: {
          tenantId: dto.tenantId,
          createdAt: { gte: oneDayAgo },
          status: { in: [PaymentStatus.COMPLETED, PaymentStatus.PENDING] },
        },
      }),
      this.prisma.order.findFirst({
        where: { id: dto.orderId, tenantId: dto.tenantId },
      }),
    ]);

    let riskScore =
      dto.amount > 5000 ? 0.55 : dto.amount > 2000 ? 0.35 : 0.12;

    if (recentOrders >= 5) riskScore += 0.25;
    else if (recentOrders >= 3) riskScore += 0.12;

    if (recentPayments >= 10) riskScore += 0.15;

    if (!order) riskScore += 0.2;

    if (dto.deviceFingerprint && !dto.deviceFingerprint.trusted) {
      riskScore += 0.1;
    }

    riskScore = Math.min(Number(riskScore.toFixed(2)), 0.99);
    const decision =
      riskScore >= 0.7 ? 'review' : riskScore >= 0.4 ? 'monitor' : 'approve';

    return {
      tenantId: dto.tenantId,
      orderId: dto.orderId,
      riskScore,
      decision,
      signals: {
        amount: dto.amount,
        currency: dto.currency,
        paymentMethod: dto.paymentMethod ?? 'card',
        velocityCheck:
          recentOrders >= 5 ? 'flagged' : recentOrders >= 3 ? 'elevated' : 'pass',
        ordersLastHour: recentOrders,
        paymentsLastDay: recentPayments,
        deviceTrust: dto.deviceFingerprint ? 'evaluated' : 'unknown',
      },
    };
  }
}

import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@nexora/database';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.RETURNED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
};

export function assertValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus,
): void {
  const allowed = TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new BadRequestException(
      `Invalid status transition from ${current} to ${next}. Allowed: ${allowed.join(', ') || 'none'}`,
    );
  }
}

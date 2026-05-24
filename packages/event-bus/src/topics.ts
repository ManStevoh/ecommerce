export const EventTopics = {
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  TENANT_PROVISIONED: 'tenant.provisioned',
  NOTIFICATION_DISPATCH: 'notification.dispatch',
} as const;

export type EventTopic = (typeof EventTopics)[keyof typeof EventTopics];

export interface DomainEvent<T = Record<string, unknown>> {
  id: string;
  topic: EventTopic;
  tenantId?: string;
  timestamp: string;
  payload: T;
  metadata?: Record<string, string>;
}

export function createDomainEvent<T>(
  topic: EventTopic,
  payload: T,
  options?: { tenantId?: string; metadata?: Record<string, string> },
): DomainEvent<T> {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    topic,
    tenantId: options?.tenantId,
    timestamp: new Date().toISOString(),
    payload,
    metadata: options?.metadata,
  };
}
